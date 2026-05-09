import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResponseDisplayProps {
  response: string;
  mood: string;
  isLoading: boolean;
  gifUrl?: string;
  onReset: () => void;
}

const moodEmojis: Record<string, string> = {
  roast: "🔥",
  therapist: "🧘",
  dadi: "👵🍵",
  drama: "💅😭🎭"
};

export function ResponseDisplay({ response, mood, isLoading, gifUrl, onReset }: ResponseDisplayProps) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response);
      toast({
        title: "Copied to clipboard! 📋",
        description: "The response has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-bounce text-4xl">
          {moodEmojis[mood] || "💭"}
        </div>
        <p className="text-lg text-muted-foreground animate-pulse">
          Crafting your personalized response...
        </p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <Card className="p-6 bg-gradient-card border-border/30 shadow-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{moodEmojis[mood] || "💭"}</span>
          <h3 className="font-semibold text-lg">Your AI Response</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 w-8 p-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-background/50 rounded-lg p-4 border border-border/20 space-y-4">
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {response}
        </p>
        
        {gifUrl && (
          <div className="flex justify-center">
            <img 
              src={gifUrl} 
              alt="Vibe GIF" 
              className="max-w-xs rounded-lg shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <Button variant="ghost" onClick={onReset} className="text-sm text-muted-foreground">
          ✨ Want to try a different vibe? Start over
        </Button>
      </div>
    </Card>
  );
}