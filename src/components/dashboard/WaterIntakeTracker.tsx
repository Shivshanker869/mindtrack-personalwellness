import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WaterIntakeTrackerProps {
  userId: string;
}

export const WaterIntakeTracker = ({ userId }: WaterIntakeTrackerProps) => {
  const [glassCount, setGlassCount] = useState(0);
  const { toast } = useToast();
  const maxGlasses = 8;

  useEffect(() => {
    fetchTodayWater();
  }, [userId]);

  const fetchTodayWater = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('water_intake')
      .select('glasses_count')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (!error && data) {
      setGlassCount(data.glasses_count);
    }
  };

  const updateWaterIntake = async (newCount: number) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase
      .from('water_intake')
      .upsert(
        { user_id: userId, date: today, glasses_count: newCount },
        { onConflict: 'user_id,date' }
      );

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update water intake",
        variant: "destructive",
      });
    } else {
      setGlassCount(newCount);
      if (newCount === maxGlasses) {
        toast({
          title: "🎉 Goal Achieved!",
          description: "You've completed your daily water intake goal!",
        });
      }
    }
  };

  const addGlass = () => {
    if (glassCount < maxGlasses) {
      updateWaterIntake(glassCount + 1);
    }
  };

  const removeGlass = () => {
    if (glassCount > 0) {
      updateWaterIntake(glassCount - 1);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          Water Intake Tracker
        </h3>
        <span className="text-sm text-muted-foreground">
          {glassCount}/{maxGlasses} glasses
        </span>
      </div>

      {/* Visual Glasses Display */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: maxGlasses }).map((_, index) => (
          <div
            key={index}
            className={`h-16 w-full rounded-lg border-2 transition-all ${
              index < glassCount
                ? "bg-blue-500 border-blue-600"
                : "bg-background border-border"
            }`}
          >
            <Droplet
              className={`h-8 w-8 mx-auto mt-3 ${
                index < glassCount ? "text-white" : "text-muted-foreground"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
            style={{ width: `${(glassCount / maxGlasses) * 100}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={addGlass} disabled={glassCount >= maxGlasses} className="flex-1">
          Add Glass
        </Button>
        <Button onClick={removeGlass} disabled={glassCount === 0} variant="outline" className="flex-1">
          Remove
        </Button>
      </div>
    </Card>
  );
};
