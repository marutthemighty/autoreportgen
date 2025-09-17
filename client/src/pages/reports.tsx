import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { User, Report } from "@/types";

export default function Reports() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ['/api/reports'],
    enabled: !!user,
  });

  if (!userLoading && !user) {
    setLocation('/login');
    return null;
  }

  if (userLoading || reportsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredReports = (reports || []).filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTab = selectedTab === 'all' || report.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'published': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return 'fas fa-check-circle';
      case 'draft': return 'fas fa-edit';
      case 'published': return 'fas fa-globe';
      default: return 'fas fa-file';
    }
  };

  const handleCreateReport = () => {
    setLocation('/');
    toast({
      title: "Redirected to Dashboard",
      description: "Use the AI Report Generator to create a new report.",
    });
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportDialog(true);
  };

  const handleExportReport = (report: Report, format: string) => {
    toast({
      title: "Export Started",
      description: `Exporting "${report.title}" as ${format.toUpperCase()}...`,
    });
    // TODO: Implement actual export functionality
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user?.user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user?.user} 
          title="Reports" 
          description="Manage and view your AI-generated reports"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateReport} className="whitespace-nowrap">
                <i className="fas fa-plus mr-2" />
                New Report
              </Button>
            </div>

            {/* Status Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">All Reports ({reports?.length || 0})</TabsTrigger>
                <TabsTrigger value="generated">Generated ({reports?.filter(r => r.status === 'generated').length || 0})</TabsTrigger>
                <TabsTrigger value="draft">Drafts ({reports?.filter(r => r.status === 'draft').length || 0})</TabsTrigger>
                <TabsTrigger value="published">Published ({reports?.filter(r => r.status === 'published').length || 0})</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Reports Grid */}
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <i className="fas fa-file-alt text-6xl text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm || selectedTab !== 'all' ? 'No Reports Found' : 'No Reports Yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || selectedTab !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'Create your first AI-powered report to get started'
                      }
                    </p>
                    {!searchTerm && selectedTab === 'all' && (
                      <Button onClick={handleCreateReport}>
                        Create Your First Report
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewReport(report)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                          {report.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {report.description}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(report.status)}
                        >
                          <i className={`${getStatusIcon(report.status)} mr-1 text-xs`} />
                          {report.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Pages: {report.pageCount || 0}</span>
                          <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewReport(report);
                            }}
                          >
                            <i className="fas fa-eye mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportReport(report, 'pdf');
                            }}
                          >
                            <i className="fas fa-download mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Report View Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              {selectedReport?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(selectedReport.status)}>
                    <i className={`${getStatusIcon(selectedReport.status)} mr-1 text-xs`} />
                    {selectedReport.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created: {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Pages: {selectedReport.pageCount || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExportReport(selectedReport, 'pdf')}>
                    <i className="fas fa-file-pdf mr-1" />
                    PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExportReport(selectedReport, 'docx')}>
                    <i className="fas fa-file-word mr-1" />
                    DOCX
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExportReport(selectedReport, 'html')}>
                    <i className="fas fa-code mr-1" />
                    HTML
                  </Button>
                </div>
              </div>
              
              {selectedReport.aiPrompt && (
                <div>
                  <h4 className="font-medium mb-2">Original AI Prompt</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedReport.aiPrompt}
                  </p>
                </div>
              )}
              
              {selectedReport.components && Array.isArray(selectedReport.components) && selectedReport.components.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Report Structure</h4>
                  <div className="space-y-2">
                    {selectedReport.components.map((component: any, index: number) => (
                      <div key={index} className="border rounded p-3">
                        <h5 className="font-medium">{component.title || `Section ${index + 1}`}</h5>
                        {component.description && (
                          <p className="text-sm text-muted-foreground mt-1">{component.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-muted p-4 rounded text-center">
                <i className="fas fa-chart-bar text-4xl text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Report preview and editing features will be available soon.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
