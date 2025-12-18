
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Apple, HeartPulse, Zap, FileText, AlertTriangle, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// --- Mock Data and Types ---
interface HealthMetric {
  value: number;
  date: string;
  anomaly?: 'high' | 'low';
}

interface WearableData {
  hrv: HealthMetric[];
  sleep: HealthMetric[]; // hours
  activity: HealthMetric[]; // active calories
  hydration: HealthMetric[]; // in liters
}

// Generates somewhat realistic mock data with anomalies
const generateMockData = (): WearableData => {
  const data: WearableData = { hrv: [], sleep: [], activity: [], hydration: [] };
  const today = new Date();
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    let hrvValue = 50 + Math.random() * 20;
    let hrvAnomaly: HealthMetric['anomaly'] = undefined;
    if (i === 2 || i === 3) { // Anomaly days
      hrvValue -= 25;
      hrvAnomaly = 'low';
    }
    data.hrv.push({ value: Math.round(hrvValue), date: dateString, anomaly: hrvAnomaly });

    let sleepValue = 7.5 - Math.random() * 2;
    let sleepAnomaly: HealthMetric['anomaly'] = undefined;
    if (i === 2 || i === 3) { // Anomaly days
      sleepValue -= 3;
      sleepAnomaly = 'low';
    }
    data.sleep.push({ value: parseFloat(sleepValue.toFixed(1)), date: dateString, anomaly: sleepAnomaly });
    
    data.activity.push({ value: Math.round(300 + Math.random() * 200), date: dateString });

    let hydrationValue = 2.5 - Math.random() * 1;
    let hydrationAnomaly: HealthMetric['anomaly'] = undefined;
    if (i >= 2 && i <= 4) { // Anomaly days
      hydrationValue -= 1;
      hydrationAnomaly = 'low';
    }
    data.hydration.push({ value: parseFloat(hydrationValue.toFixed(1)), date: dateString, anomaly: hydrationAnomaly });
  }
  return data;
};

interface UniversalHealthSentinelProps {}

export const UniversalHealthSentinel = ({}: UniversalHealthSentinelProps) => {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [onePager, setOnePager] = useState<string | null>(null);
  const [wearableData] = useState<WearableData>(generateMockData());

  const handleAnalyze = () => {
    if (!symptoms) {
      toast.error("Please describe your symptoms first.");
      return;
    }
    setIsAnalyzing(true);
    toast.info("Analyzing your health data...");

    setTimeout(() => {
      const findings: string[] = [];
      const keywords = symptoms.toLowerCase();

      const lowSleep = wearableData.sleep.filter(s => s.anomaly === 'low');
      const lowHrv = wearableData.hrv.filter(s => s.anomaly === 'low');
      const lowHydration = wearableData.hydration.filter(s => s.anomaly === 'low');

      if ((keywords.includes('headache') || keywords.includes('fatigue') || keywords.includes('tired')) && lowSleep.length > 0) {
        findings.push(`- Poor sleep quality detected (${lowSleep.map(s => `${s.value}h`).join(', ')}) which may be contributing to fatigue.`);
      }
      if ((keywords.includes('headache') || keywords.includes('dizzy')) && lowHydration.length > 0) {
        findings.push(`- Consistently low hydration levels noted (${lowHydration.map(s => `${s.value}L`).join(', ')}) which can cause headaches.`);
      }
      if ((keywords.includes('stress') || keywords.includes('anxious') || keywords.includes('overwhelmed')) && lowHrv.length > 0) {
        findings.push(`- Heart Rate Variability (HRV) shows significant dips, suggesting high physiological stress on ${lowHrv.map(s => s.date).join(', ')}.`);
      }

      let result: string;
      if (findings.length > 0) {
        result = "Based on your symptoms and wearable data, here are some potential correlations:\n\n" + findings.join('\n');
      } else {
        result = "No strong correlations found between your symptoms and recent wearable data. It's always best to consult a doctor for a proper diagnosis.";
      }
      setAnalysis(result);

      const report = `
## Medical Summary for Consultation

**Date:** ${new Date().toLocaleDateString()}

**Patient-Reported Symptoms:**
> ${symptoms}

---

### Key Insights from Wearable Data (Last 14 Days)

**Noticeable Anomalies:**
${findings.length > 0 ? findings.join('\n') : "- No statistically significant anomalies detected that correlate with reported symptoms."}

**Data Overview:**
- **Avg. Deep Sleep:** ${((wearableData.sleep.reduce((a, b) => a + b.value, 0) / wearableData.sleep.length) * 0.3).toFixed(1)} hours
- **Avg. Heart Rate Variability (HRV):** ${Math.round(wearableData.hrv.reduce((a, b) => a + b.value, 0) / wearableData.hrv.length)} ms
- **Avg. Hydration:** ${(wearableData.hydration.reduce((a, b) => a + b.value, 0) / wearableData.hydration.length).toFixed(1)} L/day

**Disclaimer:** This is an AI-generated summary and not a medical diagnosis. It is intended to facilitate a conversation with a qualified healthcare professional.
      `;
      setOnePager(report.trim());

      setIsAnalyzing(false);
      toast.success("Analysis complete.");
    }, 2500);
  };

  const copyOnePager = () => {
    if (onePager) {
      navigator.clipboard.writeText(onePager);
      toast.success("Doctor's One-Pager copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 md:p-6 min-h-0">
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        <HeartPulse className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-xl font-semibold">Universal Health Sentinel</h1>
          <p className="text-sm text-muted-foreground">
            Your AI medical data interpreter. Connect wearables, describe symptoms, and get a data-driven summary for your doctor.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel: Inputs */}
        <div className="flex flex-col gap-6 lg:w-[450px] flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap size={18} /> Wearable Data (Simulated)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6">
                <p className='text-sm text-muted-foreground'>Apple Health data is pre-loaded.</p>
            </CardContent>
          </Card>

          <div className="space-y-2 flex-1 flex flex-col">
            <label htmlFor="symptoms" className="font-medium">Describe Your Symptoms</label>
            <Textarea
              id="symptoms"
              placeholder="e.g., 'I\'ve had a persistent headache for 3 days, especially in the afternoon. I also feel more tired than usual.'''"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="flex-1 text-base lg:text-sm"
              rows={6}
            />
          </div>

          <Button onClick={handleAnalyze} disabled={isAnalyzing} size="lg">
            {isAnalyzing ? "Analyzing..." : "Generate Health Summary"}
          </Button>
        </div>

        {/* Right Panel: Analysis & Report */}
        <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="h-full">
                <div className="flex flex-col gap-6 pb-6">
                    {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-muted-foreground rounded-lg bg-muted/50">
                        <Sparkles className="h-10 w-10 mb-4 animate-spin text-primary" />
                        <p className="font-medium">Correlating symptoms with biometric data...</p>
                        <p className="text-sm">This may take a moment.</p>
                    </div>
                    )}

                    {!isAnalyzing && !analysis && (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground rounded-lg bg-muted/50">
                            <p>Your AI-generated health analysis will appear here.</p>
                        </div>
                    )}

                    {analysis && !isAnalyzing && (
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles size={18} /> AI Analysis
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm whitespace-pre-wrap font-mono p-4">
                        {analysis}
                        </CardContent>
                    </Card>
                    )}

                    {onePager && !isAnalyzing && (
                    <Card>
                        <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText size={18} /> Doctor's One-Pager
                        </CardTitle>
                        </CardHeader>
                        <CardContent>
                        <p className="text-xs text-muted-foreground mb-4">
                            This is a concise, professional summary for you to share with your doctor.
                        </p>
                        <div className="p-4 bg-muted/50 rounded-lg text-xs whitespace-pre-wrap font-mono border">
                            {onePager}
                        </div>
                        <Button onClick={copyOnePager} className="mt-4 w-full">Copy Report</Button>
                        </CardContent>
                    </Card>
                    )}
                </div>
            </ScrollArea>
        </div>
      </div>
        
      <div className="border-t pt-4 mt-4 flex-shrink-0">
         <p className="text-xs text-muted-foreground text-center w-full flex items-center justify-center gap-2">
            <AlertTriangle size={14} /> This is not a medical diagnosis. Always consult a healthcare professional.
          </p>
      </div>
    </div>
  );
};
