import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/dashboard/Header";
import { MoodSelector } from "@/components/dashboard/MoodSelector";
import { HabitList } from "@/components/dashboard/HabitList";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddHabitDialog } from "@/components/dashboard/AddHabitDialog";

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
    <div className="min-h-screen bg-background">
      <Header user={user} />
      
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Mood Tracker */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">How are you feeling today?</h2>
          <MoodSelector userId={user.id} />
        </section>

        {/* Quick Stats */}
        <QuickStats userId={user.id} />

        {/* Habits Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Today's Habits</h2>
            <Button
              onClick={() => setShowAddHabit(true)}
              className="bg-gradient-growth hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>
          
          <HabitList userId={user.id} />
        </section>
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