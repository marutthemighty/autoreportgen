import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { User, DataSource } from "@/types";

const dataSourceTypes = {
  tabular: [
    { id: 'shopify', name: 'Shopify', icon: 'fab fa-shopify', color: 'text-green-600', description: 'E-commerce platform data' },
    { id: 'google_analytics', name: 'Google Analytics', icon: 'fab fa-google', color: 'text-blue-600', description: 'Website analytics data' },
    { id: 'amazon_seller', name: 'Amazon Seller Central', icon: 'fab fa-amazon', color: 'text-orange-600', description: 'Amazon marketplace data' },
    { id: 'woocommerce', name: 'WooCommerce', icon: 'fab fa-wordpress', color: 'text-purple-600', description: 'WordPress e-commerce data' },
    { id: 'facebook_ads', name: 'Facebook Ads', icon: 'fab fa-facebook', color: 'text-blue-600', description: 'Facebook advertising data' },
    { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: 'text-pink-600', description: 'Instagram social media data' },
    { id: 'bigcommerce', name: 'BigCommerce', icon: 'fas fa-shopping-cart', color: 'text-blue-700', description: 'BigCommerce platform data' },
    { id: 'etsy', name: 'Etsy', icon: 'fab fa-etsy', color: 'text-orange-500', description: 'Etsy marketplace data' },
    { id: 'square', name: 'Square', icon: 'fab fa-square', color: 'text-gray-700', description: 'Square payment data' },
    { id: 'wix', name: 'Wix Commerce', icon: 'fab fa-wix', color: 'text-blue-500', description: 'Wix e-commerce data' },
    { id: 'adobe_commerce', name: 'Adobe Commerce', icon: 'fab fa-adobe', color: 'text-red-600', description: 'Adobe Commerce data' },
    { id: 'quickbooks', name: 'QuickBooks', icon: 'fas fa-calculator', color: 'text-blue-600', description: 'QuickBooks accounting data' },
    { id: 'tableau', name: 'Tableau', icon: 'fas fa-chart-bar', color: 'text-blue-500', description: 'Tableau visualization data' },
    { id: 'power_bi', name: 'Power BI', icon: 'fas fa-chart-line', color: 'text-yellow-600', description: 'Microsoft Power BI data' },
  ],
  event: [
    { id: 'mixpanel', name: 'Mixpanel', icon: 'fas fa-chart-pie', color: 'text-purple-600', description: 'Product analytics events' },
    { id: 'amplitude', name: 'Amplitude', icon: 'fas fa-wave-square', color: 'text-blue-600', description: 'User behavior analytics' },
    { id: 'looker', name: 'Looker', icon: 'fas fa-search', color: 'text-green-600', description: 'Business intelligence platform' },
    { id: 'segment', name: 'Segment', icon: 'fas fa-project-diagram', color: 'text-green-500', description: 'Customer data platform' },
    { id: 'hotjar', name: 'Hotjar', icon: 'fas fa-fire', color: 'text-red-500', description: 'User experience analytics' },
    { id: 'adobe_analytics', name: 'Adobe Analytics', icon: 'fab fa-adobe', color: 'text-red-600', description: 'Enterprise web analytics' },
    { id: 'ga4', name: 'Google Analytics 4', icon: 'fab fa-google', color: 'text-blue-600', description: 'Next-gen Google Analytics' },
  ],
};

export default function DataSources() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'tabular' | 'event'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: dataSources, isLoading: sourcesLoading } = useQuery<DataSource[]>({
    queryKey: ['/api/data-sources'],
    enabled: !!user,
  });

  const connectSourceMutation = useMutation({
    mutationFn: (source: any) => api.createDataSource({
      name: source.name,
      type: source.id,
      isConnected: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data-sources'] });
      setShowConnectDialog(false);
      toast({
        title: "Data Source Added",
        description: "Your data source has been configured. Complete the OAuth flow to connect.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!userLoading && !user) {
    setLocation('/login');
    return null;
  }

  if (userLoading || sourcesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const allSources = [...dataSourceTypes.tabular, ...dataSourceTypes.event];
  const filteredSources = allSources.filter(source => {
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'tabular' && dataSourceTypes.tabular.some(s => s.id === source.id)) ||
      (selectedCategory === 'event' && dataSourceTypes.event.some(s => s.id === source.id));
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedSources = dataSources || [];
  const isConnected = (sourceId: string) => connectedSources.some(ds => ds.type === sourceId);

  const handleConnect = (source: any) => {
    if (isConnected(source.id)) {
      // Handle OAuth flow for already created source
      window.location.href = `/api/oauth/${source.id}/auth`;
    } else {
      setSelectedSource(source);
      setShowConnectDialog(true);
    }
  };

  const handleFileUpload = (files: File[]) => {
    // Handle CSV upload
    toast({
      title: "Files Uploaded",
      description: `${files.length} file(s) uploaded successfully.`,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user?.user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user?.user} 
          title="Data Sources" 
          description="Connect and manage your data sources for report generation"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Connected Sources */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Data Sources ({connectedSources.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {connectedSources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <i className="fas fa-database text-4xl mb-4 opacity-50" />
                    <p>No data sources connected yet</p>
                    <p className="text-sm">Connect your first data source below</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connectedSources.map((source) => {
                      const sourceInfo = allSources.find(s => s.id === source.type);
                      return (
                        <div key={source.id} className="border rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                              <i className={`${sourceInfo?.icon || 'fas fa-database'} ${sourceInfo?.color || 'text-gray-600'}`} />
                            </div>
                            <div>
                              <p className="font-medium">{source.name}</p>
                              <p className="text-sm text-muted-foreground">Type: {sourceInfo?.name || source.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant={source.isConnected ? "default" : "secondary"}
                              className={source.isConnected ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : ""}
                            >
                              {source.isConnected ? "Connected" : "Pending"}
                            </Badge>
                            {!source.isConnected && (
                              <Button size="sm" onClick={() => handleConnect({ id: source.type, name: sourceInfo?.name || source.type })}>
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Data Files</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload CSV, Excel, JSON, or TSV files directly for analysis
                </p>
              </CardHeader>
              <CardContent>
                <FileUpload onFilesAccepted={handleFileUpload} />
              </CardContent>
            </Card>

            {/* Available Integrations */}
            <Card>
              <CardHeader>
                <CardTitle>Available Data Source Integrations</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search data sources..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory as any}>
                    <TabsList>
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="tabular">Tabular Data</TabsTrigger>
                      <TabsTrigger value="event">Event Data</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredSources.map((source) => (
                    <div key={source.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <i className={`${source.icon} ${source.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{source.name}</p>
                          <p className="text-xs text-muted-foreground">{source.description}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        variant={isConnected(source.id) ? "outline" : "default"}
                        onClick={() => handleConnect(source)}
                        disabled={connectSourceMutation.isPending}
                      >
                        {isConnected(source.id) ? "Configure" : "Connect"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedSource?.name}</DialogTitle>
            <DialogDescription>
              Configure your {selectedSource?.name} integration to start importing data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="source-name">Connection Name</Label>
              <Input
                id="source-name"
                defaultValue={`${selectedSource?.name} Integration`}
                placeholder="Enter a name for this connection"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedSource && connectSourceMutation.mutate(selectedSource)}
                disabled={connectSourceMutation.isPending}
              >
                {connectSourceMutation.isPending ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
