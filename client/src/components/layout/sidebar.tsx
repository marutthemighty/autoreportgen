import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User, UserStats } from "@/types";

const navigation = [
  { name: "Dashboard", href: "/", icon: "tachometer-alt" },
  { name: "Report Builder", href: "/report-builder", icon: "paint-brush" },
  { name: "Reports", href: "/reports", icon: "file-alt" },
  { name: "Data Sources", href: "/data-sources", icon: "database" },
  { name: "AI Templates", href: "/ai-templates", icon: "robot" },
  { name: "Settings", href: "/settings", icon: "cog" },
];

interface SidebarProps {
  user?: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/users/stats'],
    enabled: !!user,
  });

  const getInitials = (user?: User) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };

  const usagePercentage = user ? (user.apiUsage / user.apiLimit) * 100 : 0;

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      {/* Logo & User */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-chart-line text-primary-foreground text-sm" aria-hidden="true" />
          </div>
          <span className="font-semibold text-lg">ReportAI</span>
        </div>
        {user && (
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback data-testid="avatar-initials">
                {getInitials(user)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" data-testid="user-name">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.username
                }
              </p>
              <p className="text-xs text-muted-foreground capitalize" data-testid="user-plan">
                {user.subscriptionTier} Plan
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" data-testid="navigation">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-accent text-accent-foreground"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <i className={`fas fa-${item.icon} mr-3 w-4`} aria-hidden="true" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Subscription Info */}
      {user && (
        <div className="p-4 border-t border-border">
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-secondary-foreground">
                API Usage
              </span>
              <span className="text-xs text-muted-foreground" data-testid="api-usage">
                {user.apiUsage.toLocaleString()} / {user.apiLimit.toLocaleString()}
              </span>
            </div>
            <Progress value={usagePercentage} className="mb-2" />
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs text-primary hover:underline"
              data-testid="button-upgrade"
            >
              Upgrade Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
