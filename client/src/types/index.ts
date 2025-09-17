export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier: string;
  apiUsage: number;
  apiLimit: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  isConnected: boolean;
  lastSyncAt?: string;
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  dataSourceId?: string;
  components: ReportComponent[];
  status: 'draft' | 'generated' | 'published';
  aiPrompt?: string;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportComponent {
  id: string;
  title: string;
  type: 'text' | 'chart' | 'table';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  content?: string;
  data?: any;
}

export interface UserStats {
  reportsGenerated: number;
  dataSourcesConnected: number;
  apiRequests: number;
  downloadsCount: number;
}
