import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Calendar, TrendingUp, Heart, Trophy, Star, Medal } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  stars: number;
  rank: string;
  current_streak: number;
}

const Landing = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('user_id, stars, rank, current_streak')
      .order('stars', { ascending: false })
      .limit(5);

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
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header with Theme Toggle and Notifications */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        <NotificationBell />
        <ThemeToggle />
      </div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 py-20 relative">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto animate-scale-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium">
              <Heart className="h-4 w-4" />
              Your wellness journey starts here
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Build Better Habits,
              <br />
              <span className="bg-gradient-growth bg-clip-text text-transparent">
                Track Your Growth
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              MindTrack helps you build lasting habits, track your mood, and visualize your progress with beautiful insights and motivational support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-growth hover:opacity-90 hover:scale-105 transition-all">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="hover:scale-105 transition-all">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Thrive
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to support your wellness journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 animate-slide-in">
          <Link to="/dashboard" className="group">
            <div className="p-8 rounded-2xl bg-card shadow-soft hover:shadow-glow transition-all hover:scale-105 cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-gradient-growth flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Daily Check-ins</h3>
              <p className="text-muted-foreground">
                Track your habits and mood daily with simple, beautiful interfaces that keep you motivated.
              </p>
            </div>
          </Link>

          <Link to="/calendar" className="group">
            <div className="p-8 rounded-2xl bg-card shadow-soft hover:shadow-glow transition-all hover:scale-105 cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-gradient-calm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Visual Streaks</h3>
              <p className="text-muted-foreground">
                See your progress at a glance with calendar views and streak tracking that celebrate consistency.
              </p>
            </div>
          </Link>

          <Link to="/analytics" className="group">
            <div className="p-8 rounded-2xl bg-card shadow-soft hover:shadow-glow transition-all hover:scale-105 cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-gradient-energy flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Analytics</h3>
              <p className="text-muted-foreground">
                Understand your patterns with beautiful charts and insights about your wellness trends.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Weekly Leaderboard Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold">
                Weekly Leaderboard
              </h2>
            </div>
            <p className="text-xl text-muted-foreground">
              Top performers this week
            </p>
          </div>

          <Card className="p-6 shadow-glow animate-fade-in">
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leaderboard data yet. Start tracking your habits to compete!
              </div>
            ) : (
              <div className="space-y-3 mb-6">
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
            )}
            
            <div className="text-center">
              <Link to="/leaderboard">
                <Button variant="outline" className="gap-2">
                  View Full Leaderboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-growth rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands building better habits and happier lives
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="hover:scale-105 transition-all">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 text-center text-muted-foreground">
          <p>© 2024 MindTrack. Built with care for your wellness.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;