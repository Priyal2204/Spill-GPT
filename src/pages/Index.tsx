import { useState } from "react";
import { ConfessionInput } from "@/components/ConfessionInput";
import { MoodSelector } from "@/components/MoodSelector";
import { ResponseDisplay } from "@/components/ResponseDisplay";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-confessions.jpg";

const Index = () => {
  const [confession, setConfession] = useState("");
  const [response, setResponse] = useState("");
  const [mood, setMood] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gifUrl, setGifUrl] = useState("");
  const { toast } = useToast();

  const handleMoodSelect = async (selectedMood: string, prompt: string) => {
    if (!confession.trim()) {
      toast({
        title: "Hold up! 🛑",
        description: "You need to spill something first before we can respond!",
        variant: "destructive",
      });
      return;
    }

    setMood(selectedMood);
    setIsLoading(true);

    try {
      // Get AI response from Gemini via Vercel API route
      const chatRes = await fetch('/api/chat-with-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confession, mood: selectedMood, prompt }),
      });

      if (!chatRes.ok) throw new Error('Failed to get AI response');
      const chatData = await chatRes.json();

      const aiResponse = chatData.response || "Oops, the vibe took a break! Try again? ✨";
      setResponse(aiResponse);

      // Get GIF based on mood via Vercel API route
      const gifRes = await fetch('/api/get-vibe-gif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, response: aiResponse }),
      });

      if (gifRes.ok) {
        const gifData = await gifRes.json();
        if (gifData?.gifUrl) setGifUrl(gifData.gifUrl);
      }

    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Oops! Something went wrong 😅",
        description: "There was an issue getting your AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setConfession("");
    setResponse("");
    setMood("");
    setGifUrl("");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative z-10 text-center py-16 px-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            SpillGPT
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            Confess Anything. Choose the Vibe.
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your anonymous AI confession box where secrets meet personality ✨
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Confession Input */}
          <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 border border-border/20 shadow-soft">
            <ConfessionInput
              confession={confession}
              onConfessionChange={setConfession}
            />
          </div>

          {/* Mood Selection */}
          {confession.trim() && !response && (
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-6 border border-border/20 shadow-soft">
              <MoodSelector
                onMoodSelect={handleMoodSelect}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Response Display */}
          {(response || isLoading) && (
            <ResponseDisplay
              response={response}
              mood={mood}
              isLoading={isLoading}
              gifUrl={gifUrl}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
