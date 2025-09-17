import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface SubscriptionManagementProps {
  user?: User;
}

const subscriptionPlans = [
  {
    id: "free",
    name: "Free Plan", 
    price: 0,
    features: [
      "100 AI requests/month",
      "3 data source integrations",
      "Basic chart types",
      "HTML export only",
    ],
    isCurrent: false,
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 19,
    features: [
      "10,000 AI requests/month",
      "15+ data source integrations", 
      "Advanced chart types",
      "PDF/DOCX export",
    ],
    isCurrent: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    price: 99,
    features: [
      "Unlimited AI requests",
      "All data source integrations",
      "Custom chart types", 
      "All export formats",
      "API access",
    ],
    isCurrent: false,
  },
];

export default function SubscriptionManagement({ user }: SubscriptionManagementProps) {
  const { toast } = useToast();

  const getCurrentPlanPrice = (tier?: string) => {
    switch (tier) {
      case 'premium': return 19;
      case 'enterprise': return 99;
      default: return 0;
    }
  };

  const createSubscriptionMutation = useMutation({
    mutationFn: () => api.createSubscription(),
    onSuccess: async (response) => {
      const data = await response.json();
      const { clientSecret } = data;
      // TODO: Initialize Stripe payment flow with clientSecret
      toast({
        title: "Subscription Initiated",
        description: "Redirecting to payment...",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlanAction = (planId: string, action: 'upgrade' | 'downgrade' | 'manage') => {
    switch (action) {
      case 'upgrade':
        if (planId === 'premium') {
          createSubscriptionMutation.mutate();
        } else if (planId === 'enterprise') {
          toast({
            title: "Enterprise Plan",
            description: "Contact our sales team for Enterprise pricing and setup.",
          });
        }
        break;
      case 'manage':
        toast({
          title: "Manage Subscription",
          description: "Redirecting to billing portal...",
        });
        // TODO: Redirect to Stripe billing portal
        window.open('/settings?tab=billing', '_self');
        break;
      case 'downgrade':
        toast({
          title: "Confirm Downgrade",
          description: "Are you sure you want to downgrade? You'll lose access to premium features.",
        });
        // TODO: Implement downgrade confirmation dialog
        break;
      default:
        toast({
          title: "Feature Coming Soon",
          description: `${action} functionality will be available soon.`,
        });
    }
  };

  return (
    <Card className="mt-8" data-testid="subscription-management">
      <CardHeader>
        <CardTitle>Subscription & Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => {
            const isCurrent = user?.subscriptionTier === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 ${
                  isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                data-testid={`plan-${plan.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{plan.name}</h4>
                  {isCurrent && (
                    <Badge variant="default" data-testid="badge-current">
                      Current
                    </Badge>
                  )}
                </div>
                
                <p className="text-2xl font-bold mb-2">
                  ${plan.price}
                  <span className="text-sm font-normal">/month</span>
                </p>
                
                <ul className="text-sm space-y-2 text-muted-foreground mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-2 mt-0.5 text-xs" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  variant={isCurrent ? "outline" : plan.id === 'enterprise' ? "default" : "secondary"}
                  className="w-full"
                  onClick={() => {
                    if (isCurrent) {
                      handlePlanAction(plan.id, 'manage');
                    } else if (plan.price > (user?.subscriptionTier === 'premium' ? 19 : user?.subscriptionTier === 'free' ? 0 : 0)) {
                      handlePlanAction(plan.id, 'upgrade');
                    } else {
                      handlePlanAction(plan.id, 'downgrade');
                    }
                  }}
                  disabled={createSubscriptionMutation.isPending}
                  data-testid={`button-${plan.id}`}
                >
                  {createSubscriptionMutation.isPending && plan.id === 'premium' 
                    ? "Processing..." 
                    : isCurrent 
                    ? "Manage Plan"
                    : plan.price < getCurrentPlanPrice(user?.subscriptionTier)
                    ? "Downgrade" 
                    : "Upgrade"
                  }
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
