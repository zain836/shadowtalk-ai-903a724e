import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export type PlanTier = 'free' | 'pro' | 'elite';

export interface FeatureConfig {
  name: string;
  requiredPlan: PlanTier;
  freeLimit?: number;
  description?: string;
}

export const FEATURES: Record<string, FeatureConfig> = {
  // Free features
  basicChat: { name: "Basic Chat", requiredPlan: "free" },
  dailyMessages: { name: "Daily Messages", requiredPlan: "free", freeLimit: 50 },
  
  // Pro features
  unlimitedMessages: { name: "Unlimited Messages", requiredPlan: "pro" },
  advancedCodeGeneration: { name: "Advanced Code Generation", requiredPlan: "pro" },
  scriptAutomation: { name: "Script Automation Engine", requiredPlan: "pro" },
  chatExport: { name: "Save & Export", requiredPlan: "pro" },
  textToSpeech: { name: "Text-to-Speech", requiredPlan: "pro" },
  noAds: { name: "No Advertisements", requiredPlan: "pro" },
  imageGeneration: { name: "Image Generation", requiredPlan: "pro" },
  codeCanvas: { name: "Code Canvas", requiredPlan: "pro" },
  prioritySupport: { name: "Priority Support", requiredPlan: "pro" },
  
  // Elite features  
  offlineMode: { name: "Offline Mode", requiredPlan: "elite" },
  stealthMode: { name: "Stealth Mode & Encrypted Vault", requiredPlan: "elite" },
  aiAgents: { name: "AI Agents & Workflow Automation", requiredPlan: "elite" },
  customFineTuning: { name: "Custom Model Fine-Tuning", requiredPlan: "elite" },
  modelFineTuning: { name: "Model Fine-Tuning", requiredPlan: "elite" },
  whiteLabel: { name: "White-Label Solutions", requiredPlan: "elite" },
  whiteLabelBranding: { name: "White-Label Branding", requiredPlan: "elite" },
  analyticsDashboard: { name: "Advanced Analytics Dashboard", requiredPlan: "elite" },
  betaAccess: { name: "Early Beta Access", requiredPlan: "elite" },
  phoneSupport: { name: "24/7 Phone Support", requiredPlan: "elite" },
};

const planHierarchy: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  elite: 2,
};

// Special access email that gets all features
const SPECIAL_ACCESS_EMAIL = 'j3451500@gmail.com';

export const useFeatureGating = () => {
  const { userPlan, user } = useAuth();
  const { toast } = useToast();

  // Check if user has special access
  const hasSpecialAccess = user?.email?.toLowerCase() === SPECIAL_ACCESS_EMAIL.toLowerCase();

  const canAccess = (featureKey: string): boolean => {
    // Special access email gets all features
    if (hasSpecialAccess) return true;
    
    const feature = FEATURES[featureKey];
    if (!feature) return true;
    
    return planHierarchy[userPlan] >= planHierarchy[feature.requiredPlan];
  };

  const checkAccess = (featureKey: string): boolean => {
    // Special access email gets all features
    if (hasSpecialAccess) return true;
    
    const feature = FEATURES[featureKey];
    if (!feature) return true;
    
    const hasAccess = canAccess(featureKey);
    
    if (!hasAccess) {
      toast({
        title: `${feature.requiredPlan.charAt(0).toUpperCase() + feature.requiredPlan.slice(1)} Feature`,
        description: `${feature.name} is available for ${feature.requiredPlan.charAt(0).toUpperCase() + feature.requiredPlan.slice(1)} subscribers. Upgrade to unlock!`,
        variant: "destructive",
      });
    }
    
    return hasAccess;
  };

  const getUpgradeMessage = (featureKey: string): string => {
    if (hasSpecialAccess) return "";
    const feature = FEATURES[featureKey];
    if (!feature) return "";
    return `Upgrade to ${feature.requiredPlan.charAt(0).toUpperCase() + feature.requiredPlan.slice(1)} to unlock ${feature.name}`;
  };

  const getDailyMessageLimit = (): number => {
    if (hasSpecialAccess) return Infinity;
    if (userPlan === 'elite' || userPlan === 'pro') return Infinity;
    return FEATURES.dailyMessages.freeLimit || 50;
  };

  const effectivePlan = hasSpecialAccess ? 'elite' : userPlan;

  return {
    userPlan: effectivePlan,
    canAccess,
    checkAccess,
    getUpgradeMessage,
    getDailyMessageLimit,
    isProOrHigher: hasSpecialAccess || planHierarchy[userPlan] >= planHierarchy.pro,
    isElite: hasSpecialAccess || userPlan === 'elite',
    hasSpecialAccess,
  };
};
