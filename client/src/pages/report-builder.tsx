import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AiGenerator from "@/components/dashboard/ai-generator";
import ReportComponents from "@/components/dashboard/report-components";
import ReportCanvas from "@/components/report/report-canvas";
import { api } from "@/lib/api";
import type { User } from "@/types";

export default function ReportBuilder() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading: userLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
    retry: false,
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
    <div className="flex h-screen overflow-hidden" data-testid="report-builder">
      <Sidebar user={user?.user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user?.user} 
          title="Report Builder" 
          description="Create reports with AI generation or drag-and-drop canvas with 28+ components"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <AiGenerator />
            <ReportComponents />
          </div>
          
          {/* Report Canvas - The main drag-and-drop report builder */}
          <div className="mt-6">
            <ReportCanvas />
          </div>
        </main>
      </div>
    </div>
  );
}