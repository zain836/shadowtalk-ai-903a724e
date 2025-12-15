import { Bot, ArrowLeft, LogOut, Settings, Download, Lock, MessageSquare, BarChart3, Workflow, Crown, Star, Shield, Zap, Brain, Palette, Users, MoreVertical } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, Laugh, Briefcase, Sparkles } from "lucide-react";
import { OfflineModeIndicator } from "./OfflineModeIndicator";

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
  onOpenStealthVault: () => void;
  onOpenAgentWorkflows: () => void;
  onOpenModelFineTuning: () => void;
  onOpenWhiteLabelBranding: () => void;
  maxChats: string;
  dailyChats: number;
}

const getPlanBadgeStyle = (plan: UserPlan) => {
  switch (plan) {
    case 'elite':
      return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30';
    case 'pro':
      return 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border-primary/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
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
  onOpenStealthVault,
  onOpenAgentWorkflows,
  onOpenModelFineTuning,
  onOpenWhiteLabelBranding,
  maxChats,
  dailyChats,
}: ChatHeaderProps) => {
  const navigate = useNavigate();
  const isProOrHigher = userPlan === 'pro' || userPlan === 'elite';
  const isElite = userPlan === 'elite';

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="h-9 w-9 rounded-xl">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle sidebar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-9 w-9 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to home</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold">ShadowTalk AI</h1>
            <p className="text-xs text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Personality Selector */}
        <Select value={personality} onValueChange={(v) => onPersonalityChange(v as Personality)}>
          <SelectTrigger className="w-[120px] h-9 text-xs rounded-xl border-border/50">
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
        <Badge className={`hidden md:flex gap-1.5 px-3 py-1 rounded-xl border ${getPlanBadgeStyle(userPlan)}`}>
          {getPlanIcon(userPlan)}
          <span className="capitalize">{userPlan}</span>
          <span className="text-muted-foreground">•</span>
          <span>{isProOrHigher ? '∞' : `${dailyChats}/${maxChats}`}</span>
        </Badge>

        {/* Offline Mode Indicator */}
        <OfflineModeIndicator />

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Pro Features */}
            <DropdownMenuItem onClick={() => navigate('/rooms')} disabled={!isProOrHigher}>
              <Users className="h-4 w-4 mr-2" />
              Collaborative Rooms
              {!isProOrHigher && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenScriptAutomation} disabled={!isProOrHigher}>
              <Workflow className="h-4 w-4 mr-2" />
              Script Automation
              {!isProOrHigher && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport} disabled={!isProOrHigher}>
              <Download className="h-4 w-4 mr-2" />
              Export Chat
              {!isProOrHigher && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Elite Features */}
            <DropdownMenuItem onClick={onOpenModelFineTuning} disabled={!isElite}>
              <Brain className="h-4 w-4 mr-2" />
              Model Fine-Tuning
              {!isElite && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenWhiteLabelBranding} disabled={!isElite}>
              <Palette className="h-4 w-4 mr-2" />
              White-Label Branding
              {!isElite && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenAgentWorkflows} disabled={!isElite}>
              <Zap className="h-4 w-4 mr-2" />
              AI Agent Workflows
              {!isElite && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenStealthVault} disabled={!isElite}>
              <Shield className="h-4 w-4 mr-2" />
              Stealth Vault
              {!isElite && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenAnalytics} disabled={!isElite}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
              {!isElite && <Lock className="h-3 w-3 ml-auto text-muted-foreground" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Account */}
            {isProOrHigher && (
              <DropdownMenuItem onClick={onManageSubscription}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Subscription
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
