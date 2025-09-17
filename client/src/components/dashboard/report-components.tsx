import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reportComponents = [
  {
    id: "bar-chart",
    name: "Bar Chart",
    description: "Compare values across categories",
    icon: "fas fa-chart-bar",
    color: "text-primary",
  },
  {
    id: "line-chart", 
    name: "Line Chart",
    description: "Show trends over time",
    icon: "fas fa-chart-line",
    color: "text-chart-2",
  },
  {
    id: "pie-chart",
    name: "Pie Chart", 
    description: "Display proportions",
    icon: "fas fa-chart-pie",
    color: "text-chart-3",
  },
  {
    id: "data-table",
    name: "Data Table",
    description: "Structured data display",
    icon: "fas fa-table",
    color: "text-chart-4",
  },
  {
    id: "text-block",
    name: "Text Block",
    description: "Add descriptions and insights",
    icon: "fas fa-align-left",
    color: "text-muted-foreground",
  },
];

export default function ReportComponents() {
  return (
    <Card data-testid="report-components">
      <CardHeader>
        <CardTitle>Report Components</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag components to build custom reports
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {reportComponents.map((component) => (
          <div
            key={component.id}
            className="drag-item p-3 border border-border rounded-md cursor-move hover:border-primary transition-colors"
            draggable
            data-testid={`component-${component.id}`}
            onDragStart={() => {
              console.log(`Drag started for component: ${component.name}`);
            }}
          >
            <div className="flex items-center space-x-3">
              <i className={`${component.icon} ${component.color}`} />
              <div>
                <p className="text-sm font-medium">{component.name}</p>
                <p className="text-xs text-muted-foreground">{component.description}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
