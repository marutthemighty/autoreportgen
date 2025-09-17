import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { User } from "@/types";

const reportTemplates = [
  {
    id: "sales-overview",
    title: "Sales Performance Overview",
    description: "Comprehensive sales analysis with revenue trends, top products, and performance metrics",
    category: "sales",
    complexity: "beginner",
    estimatedTime: "5-10 minutes",
    dataTypes: ["shopify", "woocommerce", "square"],
    components: ["bar-chart", "line-chart", "kpi-card", "data-table"],
    preview: "fas fa-chart-line",
    color: "text-green-600",
  },
  {
    id: "marketing-roi",
    title: "Marketing ROI Analysis",
    description: "Track marketing campaign performance, ad spend efficiency, and customer acquisition costs",
    category: "marketing",
    complexity: "intermediate", 
    estimatedTime: "10-15 minutes",
    dataTypes: ["facebook_ads", "google_analytics", "instagram"],
    components: ["pie-chart", "bar-chart", "kpi-card", "text-block"],
    preview: "fas fa-bullhorn",
    color: "text-blue-600",
  },
  {
    id: "customer-insights",
    title: "Customer Behavior Insights",
    description: "Analyze customer journeys, retention rates, and behavioral patterns",
    category: "analytics",
    complexity: "advanced",
    estimatedTime: "15-20 minutes",
    dataTypes: ["mixpanel", "amplitude", "ga4", "hotjar"],
    components: ["line-chart", "heat-map", "funnel-chart", "data-table"],
    preview: "fas fa-users",
    color: "text-purple-600",
  },
  {
    id: "financial-summary",
    title: "Financial Summary Report",
    description: "Monthly financial overview with P&L, cash flow, and key financial metrics",
    category: "finance",
    complexity: "intermediate",
    estimatedTime: "8-12 minutes",
    dataTypes: ["quickbooks", "stripe", "square"],
    components: ["bar-chart", "kpi-card", "data-table", "text-block"],
    preview: "fas fa-dollar-sign",
    color: "text-green-700",
  },
  {
    id: "inventory-analysis",
    title: "Inventory & Stock Analysis",
    description: "Track inventory levels, turnover rates, and stock optimization opportunities",
    category: "operations",
    complexity: "beginner",
    estimatedTime: "5-8 minutes",
    dataTypes: ["shopify", "amazon_seller", "woocommerce"],
    components: ["bar-chart", "gauge-chart", "data-table", "alert-card"],
    preview: "fas fa-boxes",
    color: "text-orange-600",
  },
  {
    id: "website-performance",
    title: "Website Performance Dashboard",
    description: "Monitor website traffic, user engagement, and conversion funnel performance",
    category: "analytics",
    complexity: "intermediate",
    estimatedTime: "10-15 minutes",
    dataTypes: ["google_analytics", "ga4", "hotjar"],
    components: ["line-chart", "funnel-chart", "heatmap", "kpi-card"],
    preview: "fas fa-globe",
    color: "text-blue-500",
  },
  {
    id: "competitor-analysis",
    title: "Competitive Analysis Report",
    description: "Compare performance metrics against industry benchmarks and competitors",
    category: "strategic",
    complexity: "advanced",
    estimatedTime: "20-25 minutes",
    dataTypes: ["google_analytics", "facebook_ads", "shopify"],
    components: ["comparison-chart", "radar-chart", "data-table", "text-block"],
    preview: "fas fa-chart-bar",
    color: "text-red-600",
  },
  {
    id: "social-media",
    title: "Social Media Performance",
    description: "Track social media engagement, reach, and campaign effectiveness across platforms",
    category: "marketing",
    complexity: "beginner",
    estimatedTime: "5-10 minutes",
    dataTypes: ["instagram", "facebook_ads", "twitter"],
    components: ["pie-chart", "line-chart", "kpi-card", "image-gallery"],
    preview: "fas fa-hashtag",
    color: "text-pink-600",
  },
];

export default function AITemplates() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  if (!userLoading && !user) {
    setLocation('/login');
    return null;
  }

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredTemplates = reportTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity;
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const categories = Array.from(new Set(reportTemplates.map(t => t.category)));
  const complexityLevels = Array.from(new Set(reportTemplates.map(t => t.complexity)));

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleUseTemplate = (template: any) => {
    // Generate a report using this template
    toast({
      title: "Template Selected",
      description: `Using "${template.title}" template. Redirecting to AI Generator...`,
    });
    
    // TODO: Pass template data to the AI generator
    setLocation('/');
  };

  const handlePreviewTemplate = (template: any) => {
    toast({
      title: "Template Preview",
      description: "Template preview feature coming soon.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user?.user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user?.user} 
          title="AI Templates" 
          description="Pre-built report templates powered by AI for common business scenarios"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Find the Perfect Template</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose from our curated collection of AI-powered report templates
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search Templates</label>
                    <Input
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Complexity</label>
                    <select
                      value={selectedComplexity}
                      onChange={(e) => setSelectedComplexity(e.target.value)}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="all">All Levels</option>
                      {complexityLevels.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <i className={`${template.preview} ${template.color} text-xl`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{template.title}</CardTitle>
                          <Badge variant="secondary" className={getComplexityColor(template.complexity)}>
                            {template.complexity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {template.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <i className="fas fa-clock mr-2" />
                          {template.estimatedTime}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <i className="fas fa-puzzle-piece mr-2" />
                          {template.components.length} components
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Compatible Data Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.dataTypes.slice(0, 3).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                          {template.dataTypes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.dataTypes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handlePreviewTemplate(template)}
                        >
                          <i className="fas fa-eye mr-1" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <i className="fas fa-magic mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <i className="fas fa-search text-6xl text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or browse all templates
                    </p>
                    <Button onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedComplexity('all');
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}