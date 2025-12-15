import { Bot, ArrowLeft, LogOut, Settings, Download, Lock, MessageSquare } from "lucide-react";
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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Heart, Laugh, Briefcase, Sparkles } from "lucide-react";

type Personality = "friendly" | "sarcastic" | "professional" | "creative";

const personalities: { value: Personality; label: string; icon: React.ReactNode }[] = [
  { value: "friendly", label: "Friendly", icon: <Heart className="h-4 w-4" /> },
  { value: "sarcastic", label: "Sarcastic", icon: <Laugh className="h-4 w-4" /> },
  { value: "professional", label: "Professional", icon: <Briefcase className="h-4 w-4" /> },
  { value: "creative", label: "Creative", icon: <Sparkles className="h-4 w-4" /> },
];

interface ChatHeaderProps {
  userPlan: string | null;
  personality: Personality;
  onPersonalityChange: (personality: Personality) => void;
  onToggleSidebar: () => void;
  onExport: () => void;
  onManageSubscription: () => void;
  onSignOut: () => void;
  maxChats: string;
  dailyChats: number;
}

export const ChatHeader = ({
  userPlan,
  personality,
  onPersonalityChange,
  onToggleSidebar,
  onExport,
  onManageSubscription,
  onSignOut,
  maxChats,
  dailyChats,
}: ChatHeaderProps) => {
  const navigate = useNavigate();

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
        <Badge variant={userPlan === "pro" ? "default" : "secondary"} className="hidden sm:flex">
          {userPlan === "pro" ? "Pro" : "Free"} • {dailyChats}/{maxChats}
        </Badge>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Export Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onExport}
          className={`h-8 w-8 ${userPlan !== 'pro' ? 'opacity-50' : ''}`}
          title={userPlan !== 'pro' ? 'Pro feature' : 'Export chat'}
        >
          <Download className="h-4 w-4" />
          {userPlan !== 'pro' && <Lock className="h-2 w-2 absolute -top-1 -right-1" />}
        </Button>

        {/* Settings (Pro) */}
        {userPlan === "pro" && (
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
