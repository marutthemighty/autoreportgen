import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { DataSource } from "@/types";

export default function AiGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedDataSource, setSelectedDataSource] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("prompt");
  const { toast } = useToast();

  const { data: dataSources } = useQuery<DataSource[]>({
    queryKey: ['/api/data-sources'],
  });

  const generateReportMutation = useMutation({
    mutationFn: ({ aiPrompt, dataSourceId }: { aiPrompt: string; dataSourceId?: string }) =>
      api.generateReport(aiPrompt, dataSourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/stats'] });
      toast({
        title: "Report Generated!",
        description: "Your AI-powered report has been created successfully.",
      });
      setPrompt("");
      setSelectedDataSource("");
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please describe what kind of report you need.",
        variant: "destructive",
      });
      return;
    }

    generateReportMutation.mutate({
      aiPrompt: prompt,
      dataSourceId: selectedDataSource && selectedDataSource !== "none" ? selectedDataSource : undefined,
    });
  };

  const connectedSources = dataSources?.filter(ds => ds.isConnected) || [];

  const handleFilesAccepted = (files: File[]) => {
    setUploadedFiles(files);
    setActiveTab("prompt");
    toast({
      title: "Files Uploaded",
      description: `${files.length} file(s) ready for processing.`,
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <Card data-testid="ai-generator">
      <CardHeader>
        <CardTitle>AI Report Generator</CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate comprehensive reports using AI with your data sources or uploaded files
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="prompt">Configure Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div>
              <Label>Upload Your Data Files</Label>
              <div className="mt-2">
                <FileUpload onFilesAccepted={handleFilesAccepted} />
              </div>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div>
                <Label>Uploaded Files ({uploadedFiles.length})</Label>
                <div className="mt-2 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-file-alt text-blue-500" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(1)}MB</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <i className="fas fa-times" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="prompt" className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">Describe your report needs</Label>
              <Textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Generate a sales performance report with revenue trends, top products, and customer segments..."
                rows={4}
                className="resize-none mt-2"
                data-testid="textarea-prompt"
              />
            </div>
            
            <div>
              <Label htmlFor="data-source">Select Data Source</Label>
              <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                <SelectTrigger className="mt-2" data-testid="select-data-source">
                  <SelectValue placeholder="Choose data source..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific source</SelectItem>
                  {connectedSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                  {uploadedFiles.length > 0 && (
                    <SelectItem value="uploaded">Use Uploaded Files ({uploadedFiles.length})</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleGenerate}
              disabled={generateReportMutation.isPending || !prompt.trim()}
              className="w-full"
              data-testid="button-generate"
            >
              <i className="fas fa-magic mr-2" />
              {generateReportMutation.isPending ? "Generating..." : "Generate with AI"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
