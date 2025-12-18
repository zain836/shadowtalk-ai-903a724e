import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const UsageAnalytics = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>Usage Analytics</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Track your usage and see your stats.
        </p>
      </CardContent>
    </Card>
  );
};

export default UsageAnalytics;
