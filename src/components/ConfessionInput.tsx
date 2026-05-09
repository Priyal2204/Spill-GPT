import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";

interface ConfessionInputProps {
  confession: string;
  onConfessionChange: (value: string) => void;
}

export function ConfessionInput({ confession, onConfessionChange }: ConfessionInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <MessageCircle className="w-6 h-6 text-primary" />
        <Label htmlFor="confession" className="text-lg font-semibold text-foreground">
          What's on your mind? Spill your confession below
        </Label>
      </div>
      
      <Textarea
        id="confession"
        placeholder="Type your secret, worry, or confession here... Remember, this is a safe space 💝"
        value={confession}
        onChange={(e) => onConfessionChange(e.target.value)}
        className="min-h-32 resize-none bg-card/50 border-border/30 focus:border-primary/50 text-base p-4 rounded-xl placeholder:text-muted-foreground/70"
      />
      
      <p className="text-sm text-muted-foreground text-center">
        ✨ Your confession is anonymous and handled with care
      </p>
    </div>
  );
}