import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Key, Eye, EyeOff } from "lucide-react";

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export function ApiKeyInput({ onApiKeySubmit }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim());
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border/30 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Key className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">OpenAI API Key Required</h3>
        <p className="text-sm text-muted-foreground">
          To use SpillGPT, please enter your OpenAI API key. Your key is stored locally and never shared.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">OpenAI API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showKey ? "text" : "password"}
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button type="submit" variant="confession" className="w-full">
          Start Confessing ✨
        </Button>
      </form>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        <p>
          Don't have an API key?{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Get one from OpenAI
          </a>
        </p>
      </div>
    </Card>
  );
}