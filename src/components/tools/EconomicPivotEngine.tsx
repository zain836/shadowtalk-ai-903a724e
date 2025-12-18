
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Rocket, Search, Sparkles, Briefcase, ChevronRight, CheckCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const mockIndustries = [
  { name: "Renewable Energy", trend: "hot" },
  { name: "AI Data Training", trend: "hot" },
  { name: "Cybersecurity", trend: "stable" },
  { name: "Personalized Healthcare", trend: "hot" },
  { name: "AR/VR Development", trend: "emerging" },
];

const mockCompanies = {
  "Renewable Energy": [
    { name: "NextEra Energy", url: "https://www.nexteraenergy.com/" },
    { name: "Orsted", url: "https://orsted.com/" },
    { name: "Tesla Energy", url: "https://www.tesla.com/energy" },
  ],
  "AI Data Training": [
    { name: "Scale AI", url: "https://scale.com/" },
    { name: "Appen", url: "https://appen.com/" },
    { name: "Samasource", url: "https://www.samasource.com/" },
  ],
};

export const EconomicPivotEngine = () => {
  const [pastWork, setPastWork] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hiddenSkills, setHiddenSkills] = useState<string[]>([]);
  const [bridgeProject, setBridgeProject] = useState<any>(null);
  const [marketPulse, setMarketPulse] = useState<any[]>([]);

  const handleAnalyze = () => {
    if (!pastWork) {
      toast.error("Please describe your past work experience first.");
      return;
    }
    setIsAnalyzing(true);
    toast.info("Analyzing your experience for hidden skills...");

    setTimeout(() => {
      // Mock analysis
      const skills = ["High-volume logistics", "Conflict de-escalation", "Quality control", "Inventory management", "Team coordination"];
      setHiddenSkills(skills);

      const targetIndustry = mockIndustries[0]; // Renewable Energy
      const project = {
        title: `Bridge to ${targetIndustry.name}: Operations & Logistics`,
        duration: "30 Days",
        description: "This project will demonstrate your ability to apply your existing logistics and coordination skills to the renewable energy sector. You will create a plan to manage the deployment of solar panels for a mid-sized community project.",
        steps: [
          "Research common logistical challenges in solar panel installation.",
          "Develop a phased deployment schedule.",
          "Create a quality control checklist for the installation process.",
          "Outline a communication plan for a team of 5 installers.",
        ],
        industry: targetIndustry.name
      };
      setBridgeProject(project);

      // @ts-ignore
      setMarketPulse(mockCompanies[targetIndustry.name]);
      
      setIsAnalyzing(false);
      toast.success("Analysis complete! Pivot plan generated.");
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 md:p-6 min-h-0">
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <Briefcase className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Economic Pivot Engine</h1>
          <p className="text-sm text-muted-foreground">
            Map your hidden skills to emerging industries and build a bridge to your next career.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel: Input */}
        <div className="flex flex-col gap-6 lg:w-[450px] flex-shrink-0">
          <div className="space-y-2 flex-1 flex flex-col">
            <label htmlFor="past-work" className="font-medium">Describe your past work experience</label>
            <Textarea
              id="past-work"
              placeholder="e.g., 'I was a barista at a busy downtown coffee shop for 3 years. I managed the morning rush, trained new staff, and handled inventory.'''"
              value={pastWork}
              onChange={(e) => setPastWork(e.target.value)}
              className="flex-1 text-base lg:text-sm"
              rows={8}
            />
          </div>
          <Button onClick={handleAnalyze} disabled={isAnalyzing} size="lg">
            {isAnalyzing ? "Analyzing..." : "Generate Pivot Plan"}
          </Button>
        </div>

        {/* Right Panel: Results */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-6 pb-6">
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground rounded-lg bg-muted/50">
                  <Sparkles className="h-10 w-10 mb-4 animate-spin text-primary" />
                  <p className="font-medium">Mapping your skill DNA...</p>
                  <p className="text-sm">This may take a moment.</p>
                </div>
              )}

              {!isAnalyzing && !hiddenSkills.length && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground rounded-lg bg-muted/50">
                  <p>Your personalized career pivot plan will appear here.</p>
                </div>
              )}

              {hiddenSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Search size={18} /> Hidden Skill Extraction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {hiddenSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-sm">{skill}</Badge>
                    ))}
                  </CardContent>
                </Card>
              )}

              {bridgeProject && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Rocket size={18} /> Your 30-Day Bridge Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-primary mb-1">{bridgeProject.title}</p>
                    <p className="text-sm text-muted-foreground mb-4">{bridgeProject.description}</p>
                    <div className="space-y-3">
                      {bridgeProject.steps.map((step: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                          <p className="text-sm">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {marketPulse.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb size={18} /> Real-time Market Pulse
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Companies hiring for adjacent roles in <strong>{bridgeProject.industry}</strong> right now:
                    </p>
                    <div className="space-y-2">
                      {marketPulse.map(company => (
                        <a key={company.name} href={company.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <span className="font-medium">{company.name}</span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
