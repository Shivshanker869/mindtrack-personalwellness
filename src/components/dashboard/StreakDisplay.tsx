import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Flame, TrendingUp } from "lucide-react";

interface StreakDisplayProps {
  userId: string;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
}

export const StreakDisplay = ({ userId }: StreakDisplayProps) => {
  const [streakData, setStreakData] = useState<StreakData>({
    current_streak: 0,
    longest_streak: 0,
  });

  useEffect(() => {
    fetchStreakData();
  }, [userId]);

  const fetchStreakData = async () => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('current_streak, longest_streak')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setStreakData(data);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-bold">Current Streak</h3>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-orange-500">
            {streakData.current_streak}
          </p>
          <p className="text-sm text-muted-foreground">days in a row</p>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h3 className="text-lg font-bold">Longest Streak</h3>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-green-500">
            {streakData.longest_streak}
          </p>
          <p className="text-sm text-muted-foreground">personal best</p>
        </div>
      </Card>
    </div>
  );
};
