import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "../storage";

// Configure Passport Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// OAuth2 Configuration Templates
export const oauthConfigs = {
  shopify: {
    authorizationURL: 'https://accounts.shopify.com/oauth/authorize',
    tokenURL: 'https://accounts.shopify.com/oauth/token',
    scope: 'read_orders,read_products,read_analytics',
  },
  google: {
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenURL: 'https://oauth2.googleapis.com/token',
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
  },
  facebook: {
    authorizationURL: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenURL: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: 'ads_read,pages_read_engagement',
  },
  woocommerce: {
    // Uses WooCommerce REST API with OAuth 1.0a
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  }
};

export function generateOAuthURL(provider: string, userId: string, redirectUrl: string): string {
  const config = oauthConfigs[provider as keyof typeof oauthConfigs];
  if (!config || !('authorizationURL' in config)) {
    throw new Error(`OAuth configuration not found for provider: ${provider}`);
  }

  const params = new URLSearchParams({
    client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || '',
    redirect_uri: redirectUrl,
    scope: config.scope,
    response_type: 'code',
    state: `${userId}:${provider}`,
  });

  return `${config.authorizationURL}?${params.toString()}`;
}

export async function exchangeCodeForTokens(provider: string, code: string): Promise<any> {
  try {
    const config = oauthConfigs[provider as keyof typeof oauthConfigs];
    if (!config || !('tokenURL' in config)) {
      throw new Error(`OAuth configuration not found for provider: ${provider}`);
    }

    const response = await fetch(config.tokenURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`] || '',
        client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`] || '',
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Failed to exchange code for tokens: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`OAuth token exchange error for ${provider}:`, error);
    throw error;
  }
}
