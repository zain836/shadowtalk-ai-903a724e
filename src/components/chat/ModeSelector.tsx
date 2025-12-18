import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ChatMode, modes } from "./mode-helpers.tsx";

interface ModeSelectorProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

export const ModeSelector = ({ mode, onModeChange, disabled }: ModeSelectorProps) => {
  const { toast } = useToast();
  const currentMode = modes.find(m => m.value === mode) || modes[0];
  const standardModes = modes.filter(m => !['cpf', 'ppag', 'hsca', 'uhs'].includes(m.value));
  const specialModes = modes.filter(m => ['cpf', 'ppag', 'hsca', 'uhs'].includes(m.value));

  const handleSpecialModeClick = (m: typeof modes[0]) => {
    if (m.value === 'cpf' || m.value === 'ppag') {
      toast({
        title: "Coming Soon",
        description: `The ${m.label.substring(2)} feature is under development and will be available soon.`,
      });
    } else {
      onModeChange(m.value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 h-9 px-3 border-border/50 hover:border-primary/50 transition-colors"
          disabled={disabled}
        >
          <span className={currentMode.color}>{currentMode.icon}</span>
          <span className="hidden sm:inline text-sm font-medium">{currentMode.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 p-1">
        <div className="grid grid-cols-2 gap-1 p-1">
          {standardModes.map((m) => (
            <DropdownMenuItem
              key={m.value}
              onClick={() => onModeChange(m.value)}
              className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-xs ${
                mode === m.value ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
              }`}
            >
              <span className={m.color}>{m.icon}</span>
              <span className="truncate">{m.label}</span>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-1" />
        <div className="px-2 py-1.5 text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          Advanced Features
        </div>
        <div className="p-1 space-y-1">
          {specialModes.map((m) => (
            <DropdownMenuItem
              key={m.value}
              onClick={() => handleSpecialModeClick(m)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md cursor-pointer ${
                mode === m.value 
                  ? "bg-primary/10 border border-primary/30" 
                  : (m.value === 'cpf' || m.value === 'ppag') ? 'opacity-50' : "hover:bg-muted"
              }`}
            >
              <span className={m.color}>{m.icon}</span>
              <span className="font-medium">{m.label}</span>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
