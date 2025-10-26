import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/dashboard/Header";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { TrendingUp, Target, Activity, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Analytics = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [habitStats, setHabitStats] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
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

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30);

    // Fetch habits
    const { data: habitsData } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_active", true);

    setHabits(habitsData || []);

    // Fetch completions for last 30 days
    const { data: completionsData } = await supabase
      .from("habit_completions")
      .select("*, habits(title, color, icon)")
      .eq("user_id", user?.id)
      .gte("completed_at", thirtyDaysAgo.toISOString())
      .order("completed_at", { ascending: true });

    setCompletions(completionsData || []);

    // Process weekly data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayCompletions = (completionsData || []).filter(
        (c) => format(new Date(c.completed_at), "yyyy-MM-dd") === dateStr
      );

      return {
        date: format(date, "EEE"),
        completions: dayCompletions.length,
        fullDate: dateStr,
      };
    });

    setWeeklyData(last7Days);

    // Process habit stats
    const habitCounts = (habitsData || []).map((habit) => {
      const count = (completionsData || []).filter(
        (c) => c.habit_id === habit.id
      ).length;

      return {
        name: habit.title,
        completions: count,
        color: habit.color,
        icon: habit.icon,
      };
    });

    setHabitStats(habitCounts);
  };

  const totalCompletions = completions.length;
  const averagePerDay = (totalCompletions / 30).toFixed(1);
  const mostCompletedHabit = habitStats.reduce(
    (max, habit) => (habit.completions > max.completions ? habit : max),
    { completions: 0, name: "None" }
  );

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
      <Header user={user} />

      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <Link to="/dashboard">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Track your progress and understand your habits better
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 animate-slide-in">
          <Card className="p-6 hover:shadow-glow transition-shadow">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-growth flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Completions</p>
                <p className="text-2xl font-bold">{totalCompletions}</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-shadow">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-energy flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">{averagePerDay}</p>
                <p className="text-xs text-muted-foreground">Per day</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-glow transition-shadow">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-calm flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Habit</p>
                <p className="text-lg font-bold truncate">
                  {mostCompletedHabit.icon} {mostCompletedHabit.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mostCompletedHabit.completions} completions
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completions"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                name="Completions"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Habit Completions Bar Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Habit Completions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={habitStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="completions" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Habit Distribution Pie Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Habit Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={habitStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="completions"
                >
                  {habitStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
