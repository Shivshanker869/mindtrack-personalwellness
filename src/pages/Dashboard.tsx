import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/dashboard/Header";
import { MoodSelector } from "@/components/dashboard/MoodSelector";
import { HabitList } from "@/components/dashboard/HabitList";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { MotivationalMessage } from "@/components/dashboard/MotivationalMessage";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddHabitDialog } from "@/components/dashboard/AddHabitDialog";
import { MobileSidebar } from "@/components/MobileSidebar";
import { WaterIntakeTracker } from "@/components/dashboard/WaterIntakeTracker";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { AchievementRank } from "@/components/dashboard/AchievementRank";
import { WeeklyLeaderboard } from "@/components/dashboard/WeeklyLeaderboard";
import { StreakDisplay } from "@/components/dashboard/StreakDisplay";
import { ExportReport } from "@/components/dashboard/ExportReport";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="flex items-center justify-between gap-2 px-4 sm:px-6 pt-6">
        <MobileSidebar />
        <ThemeToggle />
      </div>
      <Header user={user} />
      
      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Motivational Message */}
        <div className="animate-slide-in">
          <MotivationalMessage />
        </div>

        {/* Mood Tracker */}
        <section className="space-y-4 animate-slide-in">
          <h2 className="text-2xl font-bold">How are you feeling today?</h2>
          <MoodSelector userId={user.id} />
        </section>

        {/* Quick Stats */}
        <div className="animate-scale-in">
          <QuickStats userId={user.id} />
        </div>

        {/* Streaks Display */}
        <div className="animate-slide-in">
          <StreakDisplay userId={user.id} />
        </div>

        {/* Water Intake & Achievement Rank */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-in">
          <WaterIntakeTracker userId={user.id} />
          <AchievementRank userId={user.id} />
        </div>

        {/* Weekly Leaderboard */}
        <div className="animate-scale-in">
          <WeeklyLeaderboard />
        </div>

        {/* Habits Section */}
        <section className="space-y-4 animate-slide-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Today's Habits</h2>
            <Button
              onClick={() => setShowAddHabit(true)}
              className="bg-gradient-growth hover:opacity-90 hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>
          
          <HabitList userId={user.id} />
        </section>

        {/* Export Report */}
        <div className="animate-fade-in">
          <ExportReport userId={user.id} />
        </div>
      </main>

      <AddHabitDialog
        open={showAddHabit}
        onOpenChange={setShowAddHabit}
        userId={user.id}
      />
    </div>
  );
};

export default Dashboard;