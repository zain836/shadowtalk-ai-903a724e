
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { UniversalHealthSentinel } from "@/components/chat/UniversalHealthSentinel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

const HealthSentinelPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isProOrHigher, checkAccess } = useFeatureGating();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!isProOrHigher) {
      toast.error("Upgrade to Pro to access the Health Sentinel.", {
        action: {
          label: "Upgrade Now",
          onClick: () => navigate('/pricing'),
        },
        duration: 5000,
      });
      navigate('/');
    }
  }, [user, isProOrHigher, navigate]);

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-portal`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ returnUrl: window.location.href })
      });
      const { url } = await resp.json();
      window.location.href = url;
    } catch {
      toast.error("Failed to open subscription portal. Please try again later.");
    }
  };


  if (!isProOrHigher) {
    // Full-page upgrade prompt for non-Pro users who might land here.
    return (
        <div className="flex flex-col h-screen bg-background">
             <header className="flex items-center p-4 border-b flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold ml-4">Health Sentinel</h1>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                 <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Zap className="h-6 w-6 text-primary" /> Pro Feature Locked
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-muted-foreground">
                            The Universal Health Sentinel is an advanced feature that requires a Pro subscription. Upgrade your plan to gain access.
                        </p>
                        <Button size="lg" onClick={() => navigate('/pricing')}>
                            Upgrade to Pro
                        </Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center p-4 border-b flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </header>
      <main className="flex-1 overflow-hidden">
        <UniversalHealthSentinel />
      </main>
    </div>
  );
};

export default HealthSentinelPage;

