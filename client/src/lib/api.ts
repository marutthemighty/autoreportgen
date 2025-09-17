import { apiRequest } from "@/lib/queryClient";

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest("POST", "/api/auth/login", { email, password }),
  
  register: (userData: { username: string; email: string; password: string; firstName?: string; lastName?: string }) =>
    apiRequest("POST", "/api/auth/register", userData),
  
  logout: () =>
    apiRequest("POST", "/api/auth/logout"),
  
  me: () =>
    apiRequest("GET", "/api/auth/me"),

  // Stats
  getUserStats: () =>
    apiRequest("GET", "/api/users/stats"),

  // Data Sources
  getDataSources: () =>
    apiRequest("GET", "/api/data-sources"),
  
  createDataSource: (data: any) =>
    apiRequest("POST", "/api/data-sources", data),

  // Reports
  getReports: () =>
    apiRequest("GET", "/api/reports"),
  
  getRecentReports: () =>
    apiRequest("GET", "/api/reports/recent"),
  
  generateReport: (aiPrompt: string, dataSourceId?: string) =>
    apiRequest("POST", "/api/reports/generate", { aiPrompt, dataSourceId }),
  
  getReport: (id: string) =>
    apiRequest("GET", `/api/reports/${id}`),

  // Subscriptions
  createSubscription: () =>
    apiRequest("POST", "/api/create-subscription"),
};
