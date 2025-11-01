import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Trophy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AchievementRankProps {
  userId: string;
}

interface Achievement {
  rank: string;
  stars: number;
  current_streak: number;
  longest_streak: number;
}

const RANK_THRESHOLDS = {
  Bronze: { min: 0, max: 49, emoji: "🟤", color: "text-amber-700" },
  Silver: { min: 50, max: 99, emoji: "⚪", color: "text-gray-400" },
  Gold: { min: 100, max: 199, emoji: "🟡", color: "text-yellow-500" },
  Diamond: { min: 200, max: 499, emoji: "💎", color: "text-blue-500" },
  Platinum: { min: 500, max: Infinity, emoji: "🪩", color: "text-purple-500" },
};

export const AchievementRank = ({ userId }: AchievementRankProps) => {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [newRank, setNewRank] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievement();
  }, [userId]);

  const fetchAchievement = async () => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setAchievement(data);
      updateRankBasedOnStars(data.stars, data.rank);
    } else if (!data) {
      // Create initial achievement record
      const { data: newData } = await supabase
        .from('user_achievements')
        .insert({ user_id: userId, rank: 'Bronze', stars: 0 })
        .select()
        .single();
      if (newData) setAchievement(newData);
    }
  };

  const updateRankBasedOnStars = (stars: number, currentRank: string) => {
    let calculatedRank = "Bronze";
    for (const [rank, threshold] of Object.entries(RANK_THRESHOLDS)) {
      if (stars >= threshold.min && stars <= threshold.max) {
        calculatedRank = rank;
        break;
      }
    }

    if (calculatedRank !== currentRank) {
      // Rank up!
      setNewRank(calculatedRank);
      setShowCongrats(true);
      supabase
        .from('user_achievements')
        .update({ rank: calculatedRank })
        .eq('user_id', userId)
        .then(() => fetchAchievement());
    }
  };

  const addStar = async () => {
    if (!achievement) return;
    const newStars = achievement.stars + 1;
    const { error } = await supabase
      .from('user_achievements')
      .update({ stars: newStars })
      .eq('user_id', userId);

    if (!error) {
      toast({
        title: "⭐ Star Earned!",
        description: `You now have ${newStars} stars!`,
      });
      fetchAchievement();
    }
  };

  if (!achievement) return null;

  const rankInfo = RANK_THRESHOLDS[achievement.rank as keyof typeof RANK_THRESHOLDS] || RANK_THRESHOLDS.Bronze;

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Achievement Rank
          </h3>
          <Button onClick={addStar} size="sm" variant="outline">
            <Star className="h-4 w-4 mr-1" />
            Earn Star
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className={`text-6xl ${rankInfo.color}`}>
            {rankInfo.emoji}
          </div>
          <div>
            <h4 className={`text-2xl font-bold ${rankInfo.color}`}>
              {achievement.rank}
            </h4>
            <p className="text-muted-foreground text-sm">
              {achievement.stars} stars collected
            </p>
          </div>

          {/* Progress to next rank */}
          {achievement.rank !== "Platinum" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{rankInfo.min} stars</span>
                <span>{rankInfo.max + 1} stars to next rank</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all"
                  style={{
                    width: `${((achievement.stars - rankInfo.min) / (rankInfo.max - rankInfo.min + 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Congratulations Popup */}
      <AlertDialog open={showCongrats} onOpenChange={setShowCongrats}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl">
              🎉 Congratulations! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-4">
              <div className="text-6xl">
                {RANK_THRESHOLDS[newRank as keyof typeof RANK_THRESHOLDS]?.emoji}
              </div>
              <p className="text-lg">
                You've reached <span className="font-bold">{newRank}</span> rank!
              </p>
              <p className="text-sm text-muted-foreground">
                Keep up the great work on your wellness journey!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowCongrats(false)} className="w-full">
              Awesome!
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
