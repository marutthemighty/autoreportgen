import { Card, CardContent } from "@/components/ui/card";
import type { UserStats } from "@/types";

interface StatsCardsProps {
  stats?: UserStats;
  isLoading?: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Reports Generated",
      value: stats?.reportsGenerated || 0,
      icon: "file-alt",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      change: "+12%",
      changeText: "from last month",
      testId: "stat-reports",
    },
    {
      title: "Data Sources",
      value: stats?.dataSourcesConnected || 0,
      icon: "database",
      iconBg: "bg-chart-2/10",
      iconColor: "text-chart-2",
      change: "+2",
      changeText: "new connections",
      testId: "stat-sources",
    },
    {
      title: "AI Requests",
      value: stats?.apiRequests || 0,
      icon: "robot",
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3",
      change: "",
      changeText: "of 10,000 monthly",
      testId: "stat-requests",
    },
    {
      title: "Export Downloads",
      value: stats?.downloadsCount || 0,
      icon: "download",
      iconBg: "bg-chart-4/10",
      iconColor: "text-chart-4",
      change: "+24%",
      changeText: "from last week",
      testId: "stat-downloads",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="stats-cards">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p 
                  className="text-2xl font-semibold mt-1" 
                  data-testid={card.testId}
                >
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.iconBg}`}>
                <i className={`fas fa-${card.icon} ${card.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {card.change && (
                <span className="text-green-600">{card.change}</span>
              )}
              <span className="text-muted-foreground ml-1">{card.changeText}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
