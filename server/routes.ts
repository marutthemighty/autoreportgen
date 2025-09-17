import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";
import csv from "csv-parser";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { generateReportStructure, generateReportContent, generateReportInsights } from "./services/gemini";
import { generateOAuthURL, exchangeCodeForTokens } from "./services/oauth";
import { insertUserSchema, insertDataSourceSchema, insertReportSchema } from "@shared/schema";
import "./services/oauth"; // Initialize passport strategies

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-08-27.basil" })
  : null;

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json', 'text/tab-separated-values'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(csv|xlsx|xls|json|tsv)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, Excel, JSON, and TSV files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed after registration" });
        res.json({ user: { ...user, password: undefined } });
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: info?.message || "Authentication failed" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ user: { ...user, password: undefined } });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: { ...req.user, password: undefined } });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // User stats
  app.get("/api/users/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const stats = await storage.getUserStats((req.user as any).id);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Data sources routes
  app.get("/api/data-sources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const dataSources = await storage.getDataSources((req.user as any).id);
      res.json(dataSources);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/data-sources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const dataSourceData = insertDataSourceSchema.parse({
        ...req.body,
        userId: (req.user as any).id,
      });
      
      const dataSource = await storage.createDataSource(dataSourceData);
      res.json(dataSource);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // OAuth integration routes
  app.get("/api/oauth/:provider/auth", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { provider } = req.params;
      const userId = (req.user as any).id;
      const redirectUrl = `${req.protocol}://${req.get('host')}/api/oauth/${provider}/callback`;
      
      const authUrl = generateOAuthURL(provider, userId, redirectUrl);
      res.redirect(authUrl);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/oauth/:provider/callback", async (req, res) => {
    try {
      const { provider } = req.params;
      const { code, state } = req.query;
      
      if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
        return res.status(400).json({ message: "Missing or invalid authorization code or state" });
      }

      const [userId] = (state as string).split(':');
      const tokens = await exchangeCodeForTokens(provider, code as string);
      
      // Create or update data source with OAuth tokens
      const existingDataSource = await storage.getDataSources(userId);
      const existing = existingDataSource.find(ds => ds.type === provider);
      
      if (existing) {
        await storage.updateDataSource(existing.id, {
          isConnected: true,
          oauthTokens: tokens,
          lastSyncAt: new Date(),
        });
      } else {
        await storage.createDataSource({
          userId,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Integration`,
          type: provider,
          isConnected: true,
          oauthTokens: tokens,
          lastSyncAt: new Date(),
        });
      }
      
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5000'}/data-sources?connected=${provider}`);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // File upload route
  app.post("/api/upload", upload.array('files', 5), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const files = req.files as Express.Multer.File[];
      const userId = (req.user as any).id;
      const processedFiles = [];
      
      for (const file of files) {
        let data: any[] = [];
        
        // Process based on file type
        if (file.originalname.endsWith('.csv') || file.originalname.endsWith('.tsv')) {
          data = await new Promise((resolve, reject) => {
            const results: any[] = [];
            const delimiter = file.originalname.endsWith('.tsv') ? '\t' : ',';
            fs.createReadStream(file.path)
              .pipe(csv({ separator: delimiter }))
              .on('data', (row) => results.push(row))
              .on('end', () => resolve(results))
              .on('error', reject);
          });
        } else if (file.originalname.match(/\.(xlsx|xls)$/)) {
          const workbook = XLSX.readFile(file.path);
          const sheetName = workbook.SheetNames[0];
          data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else if (file.originalname.endsWith('.json')) {
          const fileContent = fs.readFileSync(file.path, 'utf8');
          data = JSON.parse(fileContent);
          if (!Array.isArray(data)) {
            data = [data];
          }
        }
        
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        
        processedFiles.push({
          originalName: file.originalname,
          size: file.size,
          rowCount: data.length,
          columns: data.length > 0 ? Object.keys(data[0]) : [],
          preview: data.slice(0, 5), // First 5 rows for preview
        });
      }
      
      res.json({ files: processedFiles });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reports routes
  app.get("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const reports = await storage.getReports((req.user as any).id);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const reports = await storage.getRecentReports((req.user as any).id, 5);
      res.json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reports/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { aiPrompt, dataSourceId } = req.body;
      const userId = (req.user as any).id;
      
      // Check API usage limits
      const user = await storage.getUser(userId);
      if (!user || (user.apiUsage || 0) >= (user.apiLimit || 100)) {
        return res.status(429).json({ message: "API usage limit exceeded" });
      }

      const dataSource = dataSourceId ? await storage.getDataSource(dataSourceId) : null;
      const dataSourceType = dataSource?.type || 'general';
      
      // Generate report structure using AI
      const structure = await generateReportStructure(aiPrompt, dataSourceType);
      
      // Create report
      const report = await storage.createReport({
        userId,
        title: structure.title,
        description: `Generated from: ${aiPrompt}`,
        dataSourceId: dataSourceId || null,
        components: structure.sections,
        status: 'generated',
        aiPrompt,
        pageCount: structure.sections.length,
      });

      // Update user API usage
      await storage.updateUser(userId, { 
        apiUsage: (user.apiUsage || 0) + 1 
      });

      res.json({ report, structure });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reports/save-canvas", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { title, description, components, dataSourceId } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Report title is required" });
      }
      
      if (!components || !Array.isArray(components)) {
        return res.status(400).json({ message: "Components array is required" });
      }
      
      const report = await storage.createReport({
        userId: (req.user as any).id,
        title,
        description: description || 'Canvas-built report',
        components,
        dataSourceId: dataSourceId || null,
        status: 'draft',
        pageCount: 1
      });
      
      res.json(report);
    } catch (error: any) {
      console.error('Canvas report save error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const report = await storage.getReport(req.params.id);
      if (!report || report.userId !== (req.user as any).id) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/:id/download", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const report = await storage.getReport(req.params.id);
      if (!report || report.userId !== (req.user as any).id) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Return report data as JSON for download
      const downloadData = {
        title: report.title,
        description: report.description,
        components: report.components,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_report.json"`);
      res.json(downloadData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe subscription routes
  if (stripe) {
    app.post("/api/create-subscription", async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      try {
        let user = req.user as any;
        
        if (user.stripeSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          
          res.json({
            subscriptionId: subscription.id,
            clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
          });
          return;
        }

        if (!user.email) {
          throw new Error('No user email on file');
        }

        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}` || user.username,
        });

        user = await storage.updateUserStripeInfo(user.id, customer.id);

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{
            price: process.env.STRIPE_PRICE_ID_PREMIUM || 'price_premium',
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent'],
        });

        await storage.updateUserStripeInfo(user.id, customer.id, subscription.id);

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
      } catch (error: any) {
        res.status(400).json({ error: { message: error.message } });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
