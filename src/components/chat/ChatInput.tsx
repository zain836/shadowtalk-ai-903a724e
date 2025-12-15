import { Send, Mic, MicOff, Square, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/chat/FileUpload";
import { ModeSelector, ChatMode } from "@/components/chat/ModeSelector";

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
  onOpenImageGenerator: () => void;
  onStopGeneration: () => void;
  selectedFile: { type: 'image' | 'file'; data: string; name: string; mimeType: string } | null;
  onFileSelect: (file: { type: 'image' | 'file'; data: string; name: string; mimeType: string } | null) => void;
  chatMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  personality: string;
}

export const ChatInput = ({
  message,
  onMessageChange,
  onSend,
  onKeyPress,
  isLoading,
  isListening,
  onToggleVoice,
  onOpenImageGenerator,
  onStopGeneration,
  selectedFile,
  onFileSelect,
  chatMode,
  onModeChange,
  personality,
}: ChatInputProps) => {
  return (
    <div className="p-3 border-t border-border bg-card/30 backdrop-blur-sm">
      {/* Mode Selector Row */}
      <div className="flex items-center gap-2 mb-2">
        <ModeSelector 
          mode={chatMode} 
          onModeChange={(mode) => {
            onModeChange(mode);
            if (mode === 'image') {
              onOpenImageGenerator();
            }
          }}
          disabled={isLoading}
        />
        <span className="text-xs text-muted-foreground">
          Mode: <span className="capitalize font-medium">{chatMode}</span>
        </span>
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2">
        <FileUpload
          onFileSelect={onFileSelect}
          selectedFile={selectedFile}
          onClear={() => onFileSelect(null)}
          disabled={isLoading}
        />
        
        <Input 
          value={message} 
          onChange={(e) => onMessageChange(e.target.value)} 
          onKeyPress={onKeyPress} 
          placeholder={isListening ? "Listening... (click to stop)" : `Message ShadowTalk AI (${personality})...`}
          className={`flex-1 h-10 ${isListening ? 'border-primary ring-2 ring-primary/30' : ''}`}
          disabled={isLoading}
        />
        
        <Button 
          onClick={onToggleVoice} 
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          className={`h-10 w-10 shrink-0 ${isListening ? "animate-pulse" : ""}`}
          disabled={isLoading}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        <Button
          onClick={onOpenImageGenerator}
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          disabled={isLoading}
          title="Generate image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        
        {isLoading ? (
          <Button onClick={onStopGeneration} variant="destructive" size="icon" className="h-10 w-10 shrink-0">
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={onSend} 
            className="btn-glow h-10 w-10 shrink-0" 
            size="icon"
            disabled={!message.trim() && !selectedFile}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
