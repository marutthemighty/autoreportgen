import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Report } from "@/types";

export default function RecentReports() {
  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ['/api/reports/recent'],
  });

  const getReportIcon = (status: string) => {
    const icons = {
      draft: "fas fa-edit",
      generated: "fas fa-chart-bar",
      published: "fas fa-check-circle",
    };
    return icons[status as keyof typeof icons] || "fas fa-file-alt";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "text-yellow-600",
      generated: "text-blue-600",
      published: "text-green-600",
    };
    return colors[status as keyof typeof colors] || "text-gray-600";
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-20 bg-muted rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2" data-testid="recent-reports">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Reports</CardTitle>
        <Button variant="link" size="sm" data-testid="link-view-all">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!reports || reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-file-alt text-4xl mb-4 opacity-50" />
            <p>No reports generated yet</p>
            <p className="text-sm">Create your first AI-powered report to get started</p>
          </div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              className="flex items-center justify-between p-4 border border-border rounded-md hover:bg-accent/50 transition-colors"
              data-testid={`report-${report.id}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                  <i className={`${getReportIcon(report.status)} text-primary`} />
                </div>
                <div>
                  <p className="font-medium" data-testid={`report-title-${report.id}`}>
                    {report.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {report.pageCount} pages • Created {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="capitalize">
                  {report.status}
                </Badge>
                <Button variant="secondary" size="sm" data-testid={`button-view-${report.id}`}>
                  View
                </Button>
                <Button variant="outline" size="sm" data-testid={`button-download-${report.id}`}>
                  <i className="fas fa-download" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
