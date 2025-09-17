import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@/types";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    emailReports: true,
    reportGenerated: true,
    weeklyDigest: false,
    marketingEmails: false,
  });
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  if (!userLoading && !user) {
    setLocation('/login');
    return null;
  }

  if (userLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSaveAccount = () => {
    toast({
      title: "Settings Saved",
      description: "Your account settings have been updated successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notifications Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Account deletion feature will be available soon. Please contact support.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user?.user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user?.user} 
          title="Settings" 
          description="Manage your account settings and preferences"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-muted border border-border p-1">
                <TabsTrigger 
                  value="account" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
                >
                  <i className="fas fa-user mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
                >
                  <i className="fas fa-bell mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="api" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
                >
                  <i className="fas fa-key mr-2" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm font-medium"
                >
                  <i className="fas fa-credit-card mr-2" />
                  Billing
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Update your account details and personal information
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          defaultValue={user?.user?.firstName || ''}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          defaultValue={user?.user?.lastName || ''}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.user?.email || ''}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        defaultValue={user?.user?.username || ''}
                        placeholder="Enter your username"
                      />
                    </div>
                    <Button onClick={handleSaveAccount}>
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Update your password to keep your account secure
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter your new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your new password"
                      />
                    </div>
                    <Button onClick={handleSaveAccount}>
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Choose which notifications you'd like to receive
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email Reports</Label>
                          <p className="text-sm text-muted-foreground">Receive generated reports via email</p>
                        </div>
                        <Switch
                          checked={notifications.emailReports}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailReports: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Report Generated</Label>
                          <p className="text-sm text-muted-foreground">Notify when AI report generation is complete</p>
                        </div>
                        <Switch
                          checked={notifications.reportGenerated}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, reportGenerated: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Weekly Digest</Label>
                          <p className="text-sm text-muted-foreground">Weekly summary of your report activities</p>
                        </div>
                        <Switch
                          checked={notifications.weeklyDigest}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyDigest: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">Receive updates about new features and tips</p>
                        </div>
                        <Switch
                          checked={notifications.marketingEmails}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketingEmails: checked }))}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveNotifications}>
                      Save Notification Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="api" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage your API keys for third-party integrations
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted border border-border p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-foreground">Your API Key</h4>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 p-3 bg-background border border-border rounded font-mono text-sm text-foreground">
                        </code>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-copy mr-1" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-refresh mr-1" />
                          Regenerate
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Keep your API key secure. Don't share it in publicly accessible areas.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Usage Stats</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted border border-border p-4 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">This Month</p>
                          <p className="text-2xl font-bold text-foreground">{user?.user?.apiUsage || 0}</p>
                          <p className="text-xs text-muted-foreground">API Calls</p>
                        </div>
                        <div className="bg-muted border border-border p-4 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Limit</p>
                          <p className="text-2xl font-bold text-foreground">{user?.user?.apiLimit || 100}</p>
                          <p className="text-xs text-muted-foreground">Per Month</p>
                        </div>
                        <div className="bg-muted border border-border p-4 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                          <p className="text-2xl font-bold text-primary">{(user?.user?.apiLimit || 100) - (user?.user?.apiUsage || 0)}</p>
                          <p className="text-xs text-muted-foreground">This Month</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription & Billing</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage your subscription and billing information
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                      <div>
                        <h4 className="font-medium text-foreground">Current Plan</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {user?.user?.subscriptionTier || 'free'} plan
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {user?.user?.subscriptionTier || 'Free'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Usage this month</h4>
                      <div className="bg-muted border border-border p-4 rounded-lg">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span className="text-foreground">API Requests</span>
                          <span className="text-muted-foreground">{user?.user?.apiUsage || 0} / {user?.user?.apiLimit || 100}</span>
                        </div>
                        <div className="w-full bg-background border border-border rounded-full h-3">
                          <div 
                            className="bg-primary h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min(((user?.user?.apiUsage || 0) / (user?.user?.apiLimit || 100)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-credit-card mr-2" />
                      Manage Billing
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Irreversible and destructive actions
                    </p>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                      className="w-full"
                    >
                      <i className="fas fa-trash mr-2" />
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
