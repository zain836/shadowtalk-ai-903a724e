import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

const ReferralProgram = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <CardTitle>Referral Program</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Refer a friend and earn rewards!
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralProgram;
