import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ReportComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
  color: string;
  config?: any;
}

interface CanvasComponent {
  id: string;
  component: ReportComponent;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const BASIC_COMPONENTS: ReportComponent[] = [
  {
    id: "header",
    type: "basic",
    name: "Header",
    icon: "fas fa-heading",
    color: "text-indigo-600",
  },
  {
    id: "text-body",
    type: "basic",
    name: "Text Body",
    icon: "fas fa-paragraph",
    color: "text-gray-600",
  },
  {
    id: "list",
    type: "basic",
    name: "List",
    icon: "fas fa-list",
    color: "text-blue-600",
  },
  {
    id: "table",
    type: "basic",
    name: "Table",
    icon: "fas fa-table",
    color: "text-orange-600",
  },
  {
    id: "image",
    type: "basic",
    name: "Image",
    icon: "fas fa-image",
    color: "text-pink-600",
  },
  {
    id: "metric",
    type: "basic",
    name: "Metric",
    icon: "fas fa-tachometer-alt",
    color: "text-red-600",
  },
  {
    id: "separator",
    type: "basic",
    name: "Separator",
    icon: "fas fa-minus",
    color: "text-gray-400",
  },
];

const CHART_COMPONENTS: ReportComponent[] = [
  {
    id: "histogram",
    type: "chart",
    name: "Histogram",
    icon: "fas fa-chart-bar",
    color: "text-blue-600",
  },
  {
    id: "pie-chart",
    type: "chart",
    name: "Pie Chart",
    icon: "fas fa-chart-pie",
    color: "text-purple-600",
  },
  {
    id: "bubble-chart",
    type: "chart",
    name: "Bubble Chart",
    icon: "fas fa-circle",
    color: "text-cyan-600",
  },
  {
    id: "surface-chart",
    type: "chart",
    name: "Surface Chart",
    icon: "fas fa-mountain",
    color: "text-emerald-600",
  },
  {
    id: "gantt-chart",
    type: "chart",
    name: "Gantt Chart",
    icon: "fas fa-tasks",
    color: "text-amber-600",
  },
  {
    id: "area-chart",
    type: "chart",
    name: "Area Chart",
    icon: "fas fa-chart-area",
    color: "text-green-600",
  },
  {
    id: "box-plot",
    type: "chart",
    name: "Box Plot",
    icon: "fas fa-square",
    color: "text-violet-600",
  },
  {
    id: "scatter-plot",
    type: "chart",
    name: "Scatter Plot",
    icon: "fas fa-braille",
    color: "text-rose-600",
  },
  {
    id: "bar-chart",
    type: "chart",
    name: "Bar Chart",
    icon: "fas fa-chart-bar",
    color: "text-blue-700",
  },
  {
    id: "line-chart",
    type: "chart",
    name: "Line Chart",
    icon: "fas fa-chart-line",
    color: "text-green-700",
  },
  {
    id: "lollipop-chart",
    type: "chart",
    name: "Lollipop Chart",
    icon: "fas fa-grip-lines-vertical",
    color: "text-pink-600",
  },
  {
    id: "heat-map",
    type: "chart",
    name: "Heat Map",
    icon: "fas fa-th",
    color: "text-red-600",
  },
  {
    id: "pareto-chart",
    type: "chart",
    name: "Pareto Chart",
    icon: "fas fa-signal",
    color: "text-indigo-600",
  },
  {
    id: "radar-chart",
    type: "chart",
    name: "Radar Chart",
    icon: "fas fa-crosshairs",
    color: "text-teal-600",
  },
];

const GRAPH_COMPONENTS: ReportComponent[] = [
  {
    id: "bullet-graph",
    type: "graph",
    name: "Bullet Graph",
    icon: "fas fa-thermometer-half",
    color: "text-slate-600",
  },
  {
    id: "dot-plot",
    type: "graph",
    name: "Dot Plot",
    icon: "fas fa-ellipsis-h",
    color: "text-zinc-600",
  },
  {
    id: "dumbbell-plot",
    type: "graph",
    name: "Dumbbell Plot",
    icon: "fas fa-dumbbell",
    color: "text-stone-600",
  },
  {
    id: "pictogram",
    type: "graph",
    name: "Pictogram",
    icon: "fas fa-user",
    color: "text-neutral-600",
  },
  {
    id: "line-graph",
    type: "graph",
    name: "Line Graph",
    icon: "fas fa-project-diagram",
    color: "text-gray-600",
  },
  {
    id: "mosaic-plot",
    type: "graph",
    name: "Mosaic Plot",
    icon: "fas fa-border-all",
    color: "text-yellow-600",
  },
  {
    id: "box-whisker-plot",
    type: "graph",
    name: "Box & Whisker Plot",
    icon: "fas fa-rectangle-list",
    color: "text-lime-600",
  },
];

const COMPONENT_TYPES = [...BASIC_COMPONENTS, ...CHART_COMPONENTS, ...GRAPH_COMPONENTS];

function DraggableComponent({ component }: { component: ReportComponent }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "component",
    item: { component },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-2 border border-border rounded-md cursor-move hover:border-primary hover:bg-primary/5 transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="flex items-center space-x-2">
        <div className={`w-8 h-8 rounded flex items-center justify-center bg-gray-50 dark:bg-gray-800`}>
          <i className={`${component.icon} ${component.color} text-sm`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{component.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{component.type}</p>
        </div>
      </div>
    </div>
  );
}

function CanvasArea({ 
  components, 
  onDrop, 
  onRemove 
}: { 
  components: CanvasComponent[];
  onDrop: (component: ReportComponent, position: { x: number; y: number }) => void;
  onRemove: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "component",
    drop: (item: { component: ReportComponent }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const position = {
          x: clientOffset.x - canvasRect.left,
          y: clientOffset.y - canvasRect.top,
        };
        onDrop(item.component, position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  drop(canvasRef);

  return (
    <div
      ref={canvasRef}
      className={`relative min-h-[600px] border-2 border-dashed rounded-lg transition-colors ${
        isOver ? "border-primary bg-primary/5" : "border-border"
      }`}
      style={{
        background: isOver ? undefined : [
          "linear-gradient(45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%)",
          "linear-gradient(45deg, #f8f9fa 25%, transparent 25%, transparent 75%, #f8f9fa 75%)"
        ].join(", "),
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0, 10px 10px"
      }}
    >
      {components.length === 0 && !isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-plus-circle text-4xl text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Drop Components Here</p>
            <p className="text-sm text-muted-foreground">
              Drag report components from the sidebar to build your report
            </p>
          </div>
        </div>
      )}
      
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-crosshairs text-4xl text-primary mb-4" />
            <p className="text-lg font-medium text-primary">Drop to Add Component</p>
          </div>
        </div>
      )}

      {components.map((canvasComponent) => (
        <div
          key={canvasComponent.id}
          className="absolute bg-white border border-border rounded-lg shadow-sm"
          style={{
            left: canvasComponent.position.x,
            top: canvasComponent.position.y,
            width: canvasComponent.size.width,
            height: canvasComponent.size.height,
          }}
        >
          <div className="p-3 border-b border-border flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2">
              <i className={`${canvasComponent.component.icon} ${canvasComponent.component.color} text-sm`} />
              <span className="text-sm font-medium">{canvasComponent.component.name}</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRemove(canvasComponent.id)}
              className="h-6 w-6 p-0"
            >
              <i className="fas fa-times text-xs" />
            </Button>
          </div>
          <div className="p-4 h-full">
            <div className="flex items-center justify-center h-full bg-gray-100 rounded text-muted-foreground">
              <div className="text-center">
                <i className={`${canvasComponent.component.icon} text-2xl mb-2`} />
                <p className="text-sm">Preview of {canvasComponent.component.name}</p>
                <p className="text-xs mt-1">Configuration options will appear here</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ReportCanvasProps {
  onSave?: (components: CanvasComponent[]) => void;
}

export default function ReportCanvas({ onSave }: ReportCanvasProps) {
  const [canvasComponents, setCanvasComponents] = useState<CanvasComponent[]>([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDrop = (component: ReportComponent, position: { x: number; y: number }) => {
    const newComponent: CanvasComponent = {
      id: `${component.id}-${Date.now()}`,
      component,
      position,
      size: { width: 300, height: 200 },
    };
    setCanvasComponents(prev => [...prev, newComponent]);
  };

  const handleRemove = (id: string) => {
    setCanvasComponents(prev => prev.filter(comp => comp.id !== id));
  };

  const saveReportMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; components: CanvasComponent[] }) => {
      const response = await fetch('/api/reports/save-canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save report');
      }
      
      return response.json();
    },
    onSuccess: (report) => {
      setSavedReportId(report.id);
      toast({
        title: "Report Saved!",
        description: `"${report.title}" has been saved successfully.`,
      });
      setShowSaveDialog(false);
      onSave?.(canvasComponents);
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (canvasComponents.length === 0) {
      toast({
        title: "Cannot Save",
        description: "Add some components to your report before saving.",
        variant: "destructive",
      });
      return;
    }
    setShowSaveDialog(true);
  };

  const handleConfirmSave = () => {
    if (!reportTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your report.",
        variant: "destructive",
      });
      return;
    }
    
    saveReportMutation.mutate({
      title: reportTitle.trim(),
      description: reportDescription.trim(),
      components: canvasComponents,
    });
  };

  const handleDownload = async () => {
    if (!savedReportId) {
      toast({
        title: "Save First",
        description: "Please save your report before downloading.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/reports/${savedReportId}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${reportTitle.replace(/[^a-zA-Z0-9]/g, '_')}_report.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your report is being downloaded as JSON.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCanvas = () => {
    // Download canvas components as JSON without saving to database
    const canvasData = {
      title: reportTitle || 'Untitled Report',
      description: reportDescription || 'Canvas-built report',
      components: canvasComponents,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(canvasData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${(reportTitle || 'report').replace(/[^a-zA-Z0-9]/g, '_')}_canvas.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast({
      title: "Canvas Downloaded",
      description: "Your canvas layout has been downloaded as JSON.",
    });
  };

  const handleClear = () => {
    setCanvasComponents([]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Component Palette */}
        <div className="lg:col-span-1 space-y-4">
          {/* Basic Components */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Basic Components</CardTitle>
              <p className="text-xs text-muted-foreground">
                Essential elements for any report
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {BASIC_COMPONENTS.map((component) => (
                <DraggableComponent key={component.id} component={component} />
              ))}
            </CardContent>
          </Card>

          {/* Chart Components */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Chart Components</CardTitle>
              <p className="text-xs text-muted-foreground">
                Data visualization charts
              </p>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {CHART_COMPONENTS.map((component) => (
                <DraggableComponent key={component.id} component={component} />
              ))}
            </CardContent>
          </Card>

          {/* Graph Components */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Graph Components</CardTitle>
              <p className="text-xs text-muted-foreground">
                Advanced data graphs
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {GRAPH_COMPONENTS.map((component) => (
                <DraggableComponent key={component.id} component={component} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Report Canvas</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {canvasComponents.length} component(s) added
                  </p>
                </div>
                <div className="flex space-x-2">
                  {canvasComponents.length > 0 && (
                    <>
                      <Button variant="outline" onClick={handleDownloadCanvas}>
                        <i className="fas fa-download mr-2" />
                        Export Canvas
                      </Button>
                      <Button variant="outline" onClick={handleClear}>
                        <i className="fas fa-trash mr-2" />
                        Clear
                      </Button>
                    </>
                  )}
                  {savedReportId && (
                    <Button variant="outline" onClick={handleDownload}>
                      <i className="fas fa-file-download mr-2" />
                      Download Report
                    </Button>
                  )}
                  <Button onClick={handleSave} disabled={canvasComponents.length === 0}>
                    <i className="fas fa-save mr-2" />
                    Save Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-full">
              <CanvasArea 
                components={canvasComponents} 
                onDrop={handleDrop} 
                onRemove={handleRemove}
              />
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reportTitle">Report Title *</Label>
              <Input
                id="reportTitle"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reportDescription">Description (optional)</Label>
              <Input
                id="reportDescription"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Enter report description"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmSave} 
                disabled={saveReportMutation.isPending}
              >
                {saveReportMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-2" />
                    Save Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
}