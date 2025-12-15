import { Bot, ArrowLeft, LogOut, Settings, Download, Lock, MessageSquare, BarChart3, Workflow, Crown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, Laugh, Briefcase, Sparkles } from "lucide-react";

type Personality = "friendly" | "sarcastic" | "professional" | "creative";
type UserPlan = 'free' | 'pro' | 'elite';

const personalities: { value: Personality; label: string; icon: React.ReactNode }[] = [
  { value: "friendly", label: "Friendly", icon: <Heart className="h-4 w-4" /> },
  { value: "sarcastic", label: "Sarcastic", icon: <Laugh className="h-4 w-4" /> },
  { value: "professional", label: "Professional", icon: <Briefcase className="h-4 w-4" /> },
  { value: "creative", label: "Creative", icon: <Sparkles className="h-4 w-4" /> },
];

interface ChatHeaderProps {
  userPlan: UserPlan;
  personality: Personality;
  onPersonalityChange: (personality: Personality) => void;
  onToggleSidebar: () => void;
  onExport: () => void;
  onManageSubscription: () => void;
  onSignOut: () => void;
  onOpenAnalytics: () => void;
  onOpenScriptAutomation: () => void;
  maxChats: string;
  dailyChats: number;
}

const getPlanBadgeStyle = (plan: UserPlan) => {
  switch (plan) {
    case 'elite':
      return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
    case 'pro':
      return 'bg-primary/20 text-primary border-primary/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getPlanIcon = (plan: UserPlan) => {
  switch (plan) {
    case 'elite':
      return <Crown className="h-3 w-3" />;
    case 'pro':
      return <Star className="h-3 w-3" />;
    default:
      return null;
  }
};

export const ChatHeader = ({
  userPlan,
  personality,
  onPersonalityChange,
  onToggleSidebar,
  onExport,
  onManageSubscription,
  onSignOut,
  onOpenAnalytics,
  onOpenScriptAutomation,
  maxChats,
  dailyChats,
}: ChatHeaderProps) => {
  const navigate = useNavigate();
  const isProOrHigher = userPlan === 'pro' || userPlan === 'elite';
  const isElite = userPlan === 'elite';

  return (
    <div className="flex items-center justify-between p-3 border-b border-border bg-card/30 backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-8 w-8">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold gradient-text hidden sm:block">ShadowTalk AI</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Personality Selector */}
        <Select value={personality} onValueChange={(v) => onPersonalityChange(v as Personality)}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {personalities.map(p => (
              <SelectItem key={p.value} value={p.value}>
                <div className="flex items-center gap-2">
                  {p.icon}
                  <span>{p.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Plan Badge */}
        <Badge className={`hidden sm:flex gap-1 ${getPlanBadgeStyle(userPlan)}`}>
          {getPlanIcon(userPlan)}
          {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)} • {isProOrHigher ? '∞' : `${dailyChats}/${maxChats}`}
        </Badge>

        {/* Script Automation - Pro+ */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenScriptAutomation}
          className={`h-8 w-8 relative ${!isProOrHigher ? 'opacity-50' : ''}`}
          title={isProOrHigher ? 'Script Automation' : 'Pro feature'}
        >
          <Workflow className="h-4 w-4" />
          {!isProOrHigher && <Lock className="h-2 w-2 absolute -top-0.5 -right-0.5" />}
        </Button>

        {/* Analytics - Elite only */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenAnalytics}
          className={`h-8 w-8 relative ${!isElite ? 'opacity-50' : ''}`}
          title={isElite ? 'Analytics Dashboard' : 'Elite feature'}
        >
          <BarChart3 className="h-4 w-4" />
          {!isElite && <Lock className="h-2 w-2 absolute -top-0.5 -right-0.5" />}
        </Button>

        {/* Export Button - Pro+ */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onExport}
          className={`h-8 w-8 relative ${!isProOrHigher ? 'opacity-50' : ''}`}
          title={isProOrHigher ? 'Export chat' : 'Pro feature'}
        >
          <Download className="h-4 w-4" />
          {!isProOrHigher && <Lock className="h-2 w-2 absolute -top-0.5 -right-0.5" />}
        </Button>

        {/* Settings (Pro+) */}
        {isProOrHigher && (
          <Button variant="ghost" size="icon" onClick={onManageSubscription} className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {/* Sign Out */}
        <Button variant="ghost" size="icon" onClick={onSignOut} className="h-8 w-8">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
