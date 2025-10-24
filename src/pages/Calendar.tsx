import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/dashboard/Header";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth } from "date-fns";

const Calendar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [completions, setCompletions] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
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
    if (user && selectedDate) {
      fetchMonthData();
    }
  }, [user, selectedDate]);

  const fetchMonthData = async () => {
    if (!selectedDate) return;

    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);

    // Fetch completions for the month
    const { data: completionsData } = await supabase
      .from("habit_completions")
      .select("*, habits(title, color, icon)")
      .eq("user_id", user?.id)
      .gte("completed_at", start.toISOString())
      .lte("completed_at", end.toISOString())
      .order("completed_at", { ascending: false });

    setCompletions(completionsData || []);

    // Fetch all habits
    const { data: habitsData } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_active", true);

    setHabits(habitsData || []);
  };

  const getDayCompletions = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return completions.filter(
      (c) => format(new Date(c.completed_at), "yyyy-MM-dd") === dateStr
    );
  };

  const selectedDayCompletions = selectedDate
    ? getDayCompletions(selectedDate)
    : [];

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
        <div>
          <h1 className="text-3xl font-bold mb-2">Calendar View</h1>
          <p className="text-muted-foreground">
            Track your habit completion history and streaks
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          {/* Calendar */}
          <Card className="p-6">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              modifiers={{
                completed: (date) => getDayCompletions(date).length > 0,
              }}
              modifiersStyles={{
                completed: {
                  backgroundColor: "hsl(var(--primary-light))",
                  color: "hsl(var(--primary))",
                  fontWeight: "bold",
                },
              }}
            />
          </Card>

          {/* Selected Day Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h3>

            {selectedDayCompletions.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedDayCompletions.length} habit{selectedDayCompletions.length !== 1 ? "s" : ""} completed
                </p>
                {selectedDayCompletions.map((completion) => (
                  <div
                    key={completion.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: completion.habits?.color }}
                    >
                      {completion.habits?.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{completion.habits?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(completion.completed_at), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No habits completed on this day</p>
              </div>
            )}
          </Card>
        </div>

        {/* Legend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Habits</h3>
          <div className="flex flex-wrap gap-3">
            {habits.map((habit) => (
              <Badge
                key={habit.id}
                variant="secondary"
                className="px-4 py-2 text-sm"
                style={{
                  backgroundColor: habit.color + "20",
                  color: habit.color,
                  borderColor: habit.color,
                }}
              >
                <span className="mr-2">{habit.icon}</span>
                {habit.title}
              </Badge>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Calendar;
