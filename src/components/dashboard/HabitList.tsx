import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  icon: string;
}

interface HabitListProps {
  userId: string;
}

export const HabitList = ({ userId }: HabitListProps) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHabits();
    fetchTodayCompletions();
  }, [userId]);

  const fetchHabits = async () => {
    const { data, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setHabits(data);
    }
  };

  const fetchTodayCompletions = async () => {
    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("habit_completions")
      .select("habit_id")
      .eq("user_id", userId)
      .gte("completed_at", `${today}T00:00:00`)
      .lte("completed_at", `${today}T23:59:59`);

    if (!error && data) {
      setCompletions(new Set(data.map((c) => c.habit_id)));
    }
  };

  const toggleCompletion = async (habitId: string) => {
    try {
      if (completions.has(habitId)) {
        // Remove completion
        const { error } = await supabase
          .from("habit_completions")
          .delete()
          .eq("habit_id", habitId)
          .eq("user_id", userId);

        if (error) throw error;
        
        setCompletions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(habitId);
          return newSet;
        });
      } else {
        // Add completion
        const { error } = await supabase.from("habit_completions").insert({
          user_id: userId,
          habit_id: habitId,
        });

        if (error) throw error;
        
        setCompletions((prev) => new Set(prev).add(habitId));
        toast.success("Great work! Keep the streak going! 🔥");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update({ is_active: false })
        .eq("id", habitId);

      if (error) throw error;
      
      toast.success("Habit removed");
      fetchHabits();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (habits.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-4">No habits yet. Add your first one!</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {habits.map((habit) => (
        <Card
          key={habit.id}
          className="p-6 hover:shadow-soft transition-shadow"
          style={{ borderLeft: `4px solid ${habit.color}` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex gap-4 flex-1">
              <button
                onClick={() => toggleCompletion(habit.id)}
                className="mt-1 transition-transform hover:scale-110 active:scale-95"
              >
                {completions.has(habit.id) ? (
                  <CheckCircle2 className="h-6 w-6" style={{ color: habit.color }} />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{habit.icon}</span>
                  <h3 className="font-semibold text-lg">{habit.title}</h3>
                </div>
                {habit.description && (
                  <p className="text-sm text-muted-foreground">{habit.description}</p>
                )}
                <span
                  className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${habit.color}15`,
                    color: habit.color,
                  }}
                >
                  {habit.category}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteHabit(habit.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};