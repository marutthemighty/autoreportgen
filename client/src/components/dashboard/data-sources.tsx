import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import type { DataSource } from "@/types";

export default function DataSourcesList() {
  const [, setLocation] = useLocation();
  const { data: dataSources, isLoading } = useQuery<DataSource[]>({
    queryKey: ['/api/data-sources'],
  });

  const handleConnectNewSource = () => {
    setLocation('/data-sources');
  };

  const handleManageAll = () => {
    setLocation('/data-sources');
  };

  const getSourceIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      shopify: "fab fa-shopify",
      google: "fab fa-google", 
      facebook: "fab fa-facebook",
      instagram: "fab fa-instagram",
      woocommerce: "fab fa-wordpress",
      default: "fas fa-database",
    };
    return icons[type] || icons.default;
  };

  const getSourceColor = (type: string) => {
    const colors: { [key: string]: string } = {
      shopify: "text-green-600",
      google: "text-blue-600",
      facebook: "text-blue-600",
      instagram: "text-pink-600",
      woocommerce: "text-purple-600",
      default: "text-gray-600",
    };
    return colors[type] || colors.default;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-muted rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const connectedSources = dataSources?.filter(ds => ds.isConnected) || [];

  return (
    <Card data-testid="data-sources-list">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Connected Data Sources</CardTitle>
        <Button variant="link" size="sm" data-testid="link-manage-all" onClick={handleManageAll}>
          Manage All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {connectedSources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-database text-4xl mb-4 opacity-50" />
            <p>No data sources connected yet</p>
            <p className="text-sm">Connect your first data source to start generating reports</p>
          </div>
        ) : (
          connectedSources.map((source) => (
            <div 
              key={source.id} 
              className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-accent/50 transition-colors"
              data-testid={`data-source-${source.type}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <i className={`${getSourceIcon(source.type)} ${getSourceColor(source.type)} text-sm`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{source.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Connected • Last sync {source.lastSyncAt ? new Date(source.lastSyncAt).toLocaleTimeString() : 'never'}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                Connected
              </Badge>
            </div>
          ))
        )}
        
        <Button
          variant="outline"
          className="w-full border-dashed"
          data-testid="button-connect-new"
          onClick={handleConnectNewSource}
        >
          <i className="fas fa-plus mr-2" />
          Connect New Data Source
        </Button>
      </CardContent>
    </Card>
  );
}
