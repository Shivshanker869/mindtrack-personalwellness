import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Target, TrendingUp } from "lucide-react";

interface QuickStatsProps {
  userId: string;
}

export const QuickStats = ({ userId }: QuickStatsProps) => {
  const [stats, setStats] = useState({
    todayCompleted: 0,
    totalHabits: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    
    // Today's completions
    const { data: completions } = await supabase
      .from("habit_completions")
      .select("id")
      .eq("user_id", userId)
      .gte("completed_at", `${today}T00:00:00`)
      .lte("completed_at", `${today}T23:59:59`);

    // Total active habits
    const { data: habits } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true);

    // Calculate streak (simplified - days with at least one completion)
    const { data: allCompletions } = await supabase
      .from("habit_completions")
      .select("completed_at")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(30);

    let streak = 0;
    if (allCompletions && allCompletions.length > 0) {
      const dates = new Set(
        allCompletions.map((c) => new Date(c.completed_at).toISOString().split("T")[0])
      );
      
      let currentDate = new Date();
      while (true) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (dates.has(dateStr)) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    setStats({
      todayCompleted: completions?.length || 0,
      totalHabits: habits?.length || 0,
      currentStreak: streak,
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-growth flex items-center justify-center">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today's Progress</p>
            <p className="text-2xl font-bold">
              {stats.todayCompleted}/{stats.totalHabits}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-energy flex items-center justify-center">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-2xl font-bold">{stats.currentStreak} days</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-calm flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Habits</p>
            <p className="text-2xl font-bold">{stats.totalHabits}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};