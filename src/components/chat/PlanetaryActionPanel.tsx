import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Leaf, 
  Droplets, 
  Zap as Lightning,
  Trophy,
  Target,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import EcoLeaderboard from './EcoLeaderboard';

interface EcoAction {
  id: string;
  title: string;
  description: string;
  impact: {
    co2Saved: number; // kg
    waterSaved: number; // liters
    energySaved: number; // kWh
    moneySaved: number; // $
  };
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'energy' | 'water' | 'transport' | 'food' | 'waste';
  eroi: number; // Environmental Return on Investment 1-10
  timeRequired: string;
  completed: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  requirement: number;
}

interface PlanetaryActionPanelProps {
  onGetActions: (location: string) => Promise<EcoAction[]>;
  isLoading: boolean;
}

const PlanetaryActionPanel: React.FC<PlanetaryActionPanelProps> = ({
  onGetActions,
  isLoading
}) => {
  const [location, setLocation] = useState('');
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [totalImpact, setTotalImpact] = useState({
    co2Saved: 0,
    waterSaved: 0,
    energySaved: 0,
    moneySaved: 0,
    actionsCompleted: 0,
  });
  const [badges, setBadges] = useState<Badge[]>([
    { id: '1', name: 'Carbon Pioneer', description: 'Save 10kg of CO2', icon: '🌱', earned: false, progress: 0, requirement: 10 },
    { id: '2', name: 'Water Guardian', description: 'Save 100L of water', icon: '💧', earned: false, progress: 0, requirement: 100 },
    { id: '3', name: 'Energy Hero', description: 'Save 50kWh of energy', icon: '⚡', earned: false, progress: 0, requirement: 50 },
    { id: '4', name: 'Eco Champion', description: 'Complete 10 actions', icon: '🏆', earned: false, progress: 0, requirement: 10 },
    { id: '5', name: 'Local Legend', description: 'Complete 5 high-EROI actions', icon: '🌍', earned: false, progress: 0, requirement: 5 },
  ]);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  const xpToNextLevel = level * 100;

  const fetchActions = async () => {
    if (!location.trim()) {
      toast.error('Please enter your location');
      return;
    }

    try {
      const newActions = await onGetActions(location);
      setActions(newActions);
    } catch (error) {
      toast.error('Failed to get eco-actions');
    }
  };

  const completeAction = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action || action.completed) return;

    // Update action status
    setActions(prev => prev.map(a => 
      a.id === actionId ? { ...a, completed: true } : a
    ));

    // Update total impact
    setTotalImpact(prev => ({
      co2Saved: prev.co2Saved + action.impact.co2Saved,
      waterSaved: prev.waterSaved + action.impact.waterSaved,
      energySaved: prev.energySaved + action.impact.energySaved,
      moneySaved: prev.moneySaved + action.impact.moneySaved,
      actionsCompleted: prev.actionsCompleted + 1,
    }));

    // Update XP and level
    const xpGained = action.eroi * 10;
    setXp(prev => {
      const newXp = prev + xpGained;
      if (newXp >= xpToNextLevel) {
        setLevel(l => l + 1);
        toast.success(`🎉 Level Up! You're now level ${level + 1}!`);
        return newXp - xpToNextLevel;
      }
      return newXp;
    });

    // Update badges
    setBadges(prev => prev.map(badge => {
      let newProgress = badge.progress;
      
      switch (badge.id) {
        case '1': // Carbon Pioneer
          newProgress = totalImpact.co2Saved + action.impact.co2Saved;
          break;
        case '2': // Water Guardian
          newProgress = totalImpact.waterSaved + action.impact.waterSaved;
          break;
        case '3': // Energy Hero
          newProgress = totalImpact.energySaved + action.impact.energySaved;
          break;
        case '4': // Eco Champion
          newProgress = totalImpact.actionsCompleted + 1;
          break;
        case '5': // Local Legend
          if (action.eroi >= 7) {
            newProgress = badge.progress + 1;
          }
          break;
      }

      const earned = newProgress >= badge.requirement;
      if (earned && !badge.earned) {
        toast.success(`🏅 Badge Earned: ${badge.name}!`);
      }

      return { ...badge, progress: newProgress, earned };
    }));

    // Update streak
    setStreak(prev => prev + 1);
    
    toast.success(`+${xpGained} XP! Action completed!`);
  };

  const getEROIColor = (eroi: number) => {
    if (eroi >= 8) return 'text-success';
    if (eroi >= 5) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'energy': return <Lightning className="h-4 w-4" />;
      case 'water': return <Droplets className="h-4 w-4" />;
      case 'transport': return <Target className="h-4 w-4" />;
      case 'food': return <Leaf className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Level & XP */}
      <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              <span className="font-bold">Level {level}</span>
              <Badge variant="secondary">{streak} day streak 🔥</Badge>
            </div>
            <span className="text-sm text-muted-foreground">{xp}/{xpToNextLevel} XP</span>
          </div>
          <Progress value={(xp / xpToNextLevel) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Impact Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-card/50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                <p className="font-bold text-success">{totalImpact.co2Saved.toFixed(1)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Water Saved</p>
                <p className="font-bold text-blue-400">{totalImpact.waterSaved.toFixed(0)} L</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <Lightning className="h-4 w-4 text-yellow-400" />
              <div>
                <p className="text-xs text-muted-foreground">Energy Saved</p>
                <p className="font-bold text-yellow-400">{totalImpact.energySaved.toFixed(1)} kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Money Saved</p>
                <p className="font-bold text-primary">${totalImpact.moneySaved.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {badges.map(badge => (
              <div 
                key={badge.id}
                className={`relative group cursor-pointer transition-all ${
                  badge.earned ? 'opacity-100' : 'opacity-40 grayscale'
                }`}
                title={`${badge.name}: ${badge.description} (${badge.progress}/${badge.requirement})`}
              >
                <span className="text-2xl">{badge.icon}</span>
                {!badge.earned && (
                  <div className="absolute -bottom-1 left-0 right-0">
                    <Progress value={(badge.progress / badge.requirement) * 100} className="h-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <EcoLeaderboard />

      {/* Location Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Enter your city or zip code..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchActions()}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchActions} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Actions'}
        </Button>
      </div>

      {/* Action List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          Personalized Eco-Actions
        </h3>
        
        {actions.length === 0 ? (
          <Card className="bg-card/30">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Leaf className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Enter your location to get personalized eco-actions</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {actions.sort((a, b) => b.eroi - a.eroi).map(action => (
              <Card 
                key={action.id} 
                className={`transition-all ${action.completed ? 'opacity-60 border-success' : ''}`}
              >
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="gap-1">
                          {getCategoryIcon(action.category)}
                          {action.category}
                        </Badge>
                        <Badge className={`${getEROIColor(action.eroi)} bg-transparent border`}>
                          EROI: {action.eroi}/10
                        </Badge>
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Clock className="h-3 w-3" />
                          {action.timeRequired}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm font-medium ${action.completed ? 'line-through' : ''}`}>
                        {action.title}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                      
                      <div className="flex gap-3 text-xs">
                        <span className="text-success">🌱 {action.impact.co2Saved}kg CO₂</span>
                        <span className="text-blue-400">💧 {action.impact.waterSaved}L</span>
                        <span className="text-yellow-400">⚡ {action.impact.energySaved}kWh</span>
                        <span className="text-primary">💰 ${action.impact.moneySaved}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant={action.completed ? "ghost" : "default"}
                      size="sm"
                      onClick={() => completeAction(action.id)}
                      disabled={action.completed}
                      className="shrink-0"
                    >
                      {action.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Complete
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanetaryActionPanel;
