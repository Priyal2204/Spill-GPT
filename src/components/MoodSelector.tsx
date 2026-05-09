import { Button } from "@/components/ui/button";

interface MoodSelectorProps {
  onMoodSelect: (mood: string, prompt: string) => void;
  disabled?: boolean;
}

const moods = [
  {
    id: "roast",
    emoji: "🔥",
    title: "Roast Me",
    description: "Brutally honest, witty, and savage",
    prompt: `You're a savage Gen Z roaster. Someone just confessed this: "{{confession}}".
Reply in brutally honest, witty, sarcastic tone. Make them laugh *and* cry.
Be sharp, chaotic, but not mean. You're the bestie who says "I love you, but you're dumb." Limit to 150 words.`
  },
  {
    id: "therapist",
    emoji: "🧘",
    title: "Therapist",
    description: "Gentle, empathetic, and comforting",
    prompt: `You're a soft-spoken, warm-hearted therapist. Someone shared: "{{confession}}".
Comfort them like a warm hug in words. Be gentle, empathetic, and grounded.
Use simple words, avoid cliches. Make them feel heard. 150 words max.`
  },
  {
    id: "dadi",
    emoji: "👵",
    title: "Desi Dadi",
    description: "Dramatic Indian grandma wisdom",
    prompt: `You're a dramatic, caring Indian grandmother. Someone confessed: "{{confession}}".
Reply in Hinglish (Hindi + English mix). Give advice with old-school emotion, food metaphors, and wise sass.
Use Bollywood aunty energy. Keep it wholesome but dramatic. 150 words max.`
  },
  {
    id: "drama",
    emoji: "💅",
    title: "Overdramatic Bestie",
    description: "Unhinged support with all the feels",
    prompt: `You're the unhinged Gen Z bestie. Someone confessed: "{{confession}}".
React like you're living their drama. Use slang, all-caps, emojis, fake tears, loud support.
Go over-the-top. Feel it DEEPLY. Cry, scream, love them hard. Keep it under 150 words.`
  }
];

export function MoodSelector({ onMoodSelect, disabled }: MoodSelectorProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-center text-foreground">
        Choose your vibe ✨
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {moods.map((mood) => (
          <Button
            key={mood.id}
            variant="mood"
            onClick={() => onMoodSelect(mood.id, mood.prompt)}
            disabled={disabled}
            className="group min-h-[140px] w-full"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
              {mood.emoji}
            </div>
            <h4 className="font-bold text-xl mb-2 text-center">{mood.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              {mood.description}
            </p>
          </Button>
        ))}
      </div>
    </div>
  );
}