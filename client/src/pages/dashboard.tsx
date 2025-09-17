import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import DataSourcesList from "@/components/dashboard/data-sources";
import RecentReports from "@/components/dashboard/recent-reports";
import IntegrationHub from "@/components/dashboard/integration-hub";
import SubscriptionManagement from "@/components/dashboard/subscription-management";
import { api } from "@/lib/api";
import type { User, UserStats } from "@/types";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/users/stats'],
    enabled: !!user,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation('/login');
    }
  }, [userLoading, user, setLocation]);

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" data-testid="dashboard">
      <Sidebar user={user?.user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user?.user} 
          title="Dashboard" 
          description="Generate AI-powered reports from your data sources"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <StatsCards stats={stats} isLoading={statsLoading} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DataSourcesList />
            <RecentReports />
          </div>
          
          <IntegrationHub />
          <SubscriptionManagement user={user?.user} />
        </main>
      </div>
    </div>
  );
}
