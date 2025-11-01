import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Star, Medal, ArrowLeft, Flame } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

interface LeaderboardEntry {
  user_id: string;
  stars: number;
  rank: string;
  current_streak: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('user_id, stars, rank, current_streak')
      .order('stars', { ascending: false })
      .limit(50);

    if (!error && data) {
      setLeaderboard(data);
    }
    setLoading(false);
  };

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Medal className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-700" />;
    return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const getRankEmoji = (rank: string) => {
    const rankMap: { [key: string]: string } = {
      'Bronze': '🟤',
      'Silver': '⚪',
      'Gold': '🟡',
      'Diamond': '💎',
      'Platinum': '🪩'
    };
    return rankMap[rank] || '🟤';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Title Section */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex items-center justify-center gap-3">
              <Trophy className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold">Weekly Leaderboard</h1>
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground">
              Top performers this week
            </p>
          </div>

          {/* Leaderboard Card */}
          <Card className="p-6 animate-scale-in">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No data available yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      index < 3 
                        ? "bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30" 
                        : "bg-secondary/50 hover:bg-secondary/70"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 flex justify-center">
                        {getMedalIcon(index)}
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          User {entry.user_id.slice(0, 8)}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {getRankEmoji(entry.rank)} {entry.rank}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            {entry.current_streak} day streak
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-xl">{entry.stars}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Bottom CTA */}
          <div className="text-center animate-fade-in">
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
