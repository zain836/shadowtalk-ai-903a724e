
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useFeatureGating } from "@/hooks/useFeatureGating";
import { EconomicPivotEngine } from "@/components/tools/EconomicPivotEngine";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EconomicPivotEnginePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isElite } = useFeatureGating();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (!isElite) {
      toast.error("Upgrade to Elite to access the Economic Pivot Engine.", {
        action: {
          label: "Upgrade Now",
          onClick: () => navigate('/pricing'),
        },
        duration: 5000,
      });
      navigate('/');
    }
  }, [user, isElite, navigate]);

  if (!isElite) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center p-4 border-b flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold ml-4">Economic Pivot Engine</h1>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Zap className="h-6 w-6 text-primary" /> Elite Feature Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                The Economic Pivot Engine is an advanced feature that requires an Elite subscription. Upgrade your plan to gain access.
              </p>
              <Button size="lg" onClick={() => navigate('/pricing')}>
                Upgrade to Elite
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
         <h1 className="text-lg font-semibold ml-4">Economic Pivot Engine</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <EconomicPivotEngine />
      </main>
    </div>
  );
};

export default EconomicPivotEnginePage;
