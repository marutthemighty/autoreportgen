import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const integrations = [
  { id: "shopify", name: "Shopify", icon: "fab fa-shopify", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" },
  { id: "google", name: "Analytics", icon: "fab fa-google", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" },
  { id: "woocommerce", name: "WooCommerce", icon: "fab fa-wordpress", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/20" },
  { id: "facebook", name: "Facebook", icon: "fab fa-facebook", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" },
  { id: "instagram", name: "Instagram", icon: "fab fa-instagram", color: "text-pink-600", bg: "bg-pink-100 dark:bg-pink-900/20" },
  { id: "csv", name: "Upload CSV", icon: "fas fa-file-csv", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/20" },
];

export default function IntegrationHub() {
  const handleIntegrationClick = (integrationId: string) => {
    if (integrationId === 'csv') {
      // Handle file upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.xlsx,.xls';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          console.log('File selected:', file.name);
          // TODO: Handle file upload
        }
      };
      input.click();
    } else {
      // Initiate OAuth flow
      window.location.href = `/api/oauth/${integrationId}/auth`;
    }
  };

  return (
    <Card className="mt-8" data-testid="integration-hub">
      <CardHeader>
        <CardTitle>Add New Data Sources</CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your business tools with one-click OAuth authentication
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {integrations.map((integration) => (
            <Button
              key={integration.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:border-primary hover:bg-accent/50 group transition-all"
              onClick={() => handleIntegrationClick(integration.id)}
              data-testid={`integration-${integration.id}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${integration.bg}`}>
                <i className={`${integration.icon} ${integration.color}`} aria-hidden="true" />
              </div>
              <span className="text-xs font-medium">{integration.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
