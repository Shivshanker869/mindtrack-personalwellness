import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

interface Mood {
  mood_type: string;
  emoji: string;
  color: string;
}

const moods: Mood[] = [
  { mood_type: "Amazing", emoji: "🤩", color: "#10b981" },
  { mood_type: "Happy", emoji: "😊", color: "#3b82f6" },
  { mood_type: "Okay", emoji: "😐", color: "#f59e0b" },
  { mood_type: "Stressed", emoji: "😰", color: "#f97316" },
  { mood_type: "Sad", emoji: "😢", color: "#ef4444" },
];

interface MoodSelectorProps {
  userId: string;
}

export const MoodSelector = ({ userId }: MoodSelectorProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [todayMood, setTodayMood] = useState<any>(null);

  useEffect(() => {
    fetchTodayMood();
  }, [userId]);

  const fetchTodayMood = async () => {
    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("moods")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .maybeSingle();

    if (!error && data) {
      setTodayMood(data);
      setSelectedMood(data.mood_type);
    }
  };

  const handleMoodSelect = async (mood: Mood) => {
    try {
      if (todayMood) {
        // Update existing mood
        const { error } = await supabase
          .from("moods")
          .update({
            mood_type: mood.mood_type,
            emoji: mood.emoji,
            color: mood.color,
          })
          .eq("id", todayMood.id);

        if (error) throw error;
        toast.success("Mood updated!");
      } else {
        // Create new mood
        const { error } = await supabase.from("moods").insert({
          user_id: userId,
          mood_type: mood.mood_type,
          emoji: mood.emoji,
          color: mood.color,
        });

        if (error) throw error;
        toast.success("Mood tracked! Keep it up! 🌟");
      }

      setSelectedMood(mood.mood_type);
      fetchTodayMood();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Card className="p-6">
      <div className="grid grid-cols-5 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.mood_type}
            onClick={() => handleMoodSelect(mood)}
            className="relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: selectedMood === mood.mood_type ? `${mood.color}15` : "transparent",
              border: selectedMood === mood.mood_type ? `2px solid ${mood.color}` : "2px solid transparent",
            }}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="text-xs font-medium text-center">{mood.mood_type}</span>
            {selectedMood === mood.mood_type && (
              <CheckCircle2
                className="absolute -top-2 -right-2 h-5 w-5"
                style={{ color: mood.color }}
              />
            )}
          </button>
        ))}
      </div>
    </Card>
  );
};