import { useState } from "react";
import { ImageIcon, Loader2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

interface ImageGeneratorProps {
  onClose: () => void;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
}

export const ImageGenerator = ({ onClose, onImageGenerated }: ImageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          generateImage: true, 
          imagePrompt: prompt,
          messages: [],
          personality: "creative"
        }),
      });

      if (!resp.ok) {
        throw new Error("Image generation failed");
      }

      const data = await resp.json();
      
      if (data.type === 'image' && data.content) {
        // The response contains the image description/URL
        setGeneratedImage(data.content);
        onImageGenerated(data.content, prompt);
        toast({ title: "Image generated!" });
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast({
        title: "Generation failed",
        description: "Could not generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            <span className="font-medium">Image Generator</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Describe your image</label>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cityscape at sunset with flying cars..."
              disabled={isGenerating}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          {/* Preview / Result */}
          {isGenerating && (
            <div className="flex items-center justify-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Generating your image...</p>
              </div>
            </div>
          )}

          {generatedImage && !isGenerating && (
            <div className="space-y-2">
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap">{generatedImage}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: AI image generation creates descriptions. For actual images, the model generates detailed visual descriptions.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={!prompt.trim() || isGenerating}
              className="btn-glow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
