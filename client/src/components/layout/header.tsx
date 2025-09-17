import React from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@/types";

interface HeaderProps {
  user?: User;
  title?: string;
  description?: string;
}

export default React.memo(function Header({ user, title = "Dashboard", description }: HeaderProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.clear();
      setLocation('/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
  });

  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="page-title">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground" data-testid="page-description">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" aria-label="View notifications" data-testid="button-notifications">
            <i className="fas fa-bell text-muted-foreground" aria-hidden="true" />
          </Button>
          
          {user && (
            <>
              {/* Create Report Button */}
              <Button data-testid="button-new-report">
                <i className="fas fa-plus mr-2" />
                New Report
              </Button>
              
              {/* Logout Button */}
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
});
