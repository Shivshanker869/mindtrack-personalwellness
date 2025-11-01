import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Medal } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  stars: number;
  rank: string;
  current_streak: number;
}

export const WeeklyLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('user_id, stars, rank, current_streak')
      .order('stars', { ascending: false })
      .limit(10);

    if (!error && data) {
      setLeaderboard(data);
    }
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-muted-foreground">#{index + 1}</span>;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">Weekly Leaderboard</h3>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div
            key={entry.user_id}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              index < 3 ? "bg-primary/10" : "bg-secondary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center">
                {getMedalIcon(index)}
              </div>
              <div>
                <p className="font-medium">User {entry.user_id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.rank} • {entry.current_streak} day streak
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold">{entry.stars}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
