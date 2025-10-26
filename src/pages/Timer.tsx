import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Timer = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"pomodoro" | "short" | "long">("pomodoro");
  const navigate = useNavigate();
  const { toast } = useToast();

  const TIMES = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
  };

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
    let interval: NodeJS.Timeout | null = null;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      toast({
        title: "Time's up!",
        description: "Great job! Take a break.",
      });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, toast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(TIMES[mode]);
  };

  const changeMode = (newMode: "pomodoro" | "short" | "long") => {
    setMode(newMode);
    setTime(TIMES[newMode]);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
      
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <Link to="/dashboard">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Focus Timer</h1>
            <p className="text-muted-foreground">Stay focused and productive with Pomodoro technique</p>
          </div>

          <Card className="border-2 animate-scale-in hover:shadow-glow transition-shadow">
            <CardHeader>
              <CardTitle>Timer</CardTitle>
              <CardDescription>Select your focus mode</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex gap-2 justify-center">
                <Button
                  variant={mode === "pomodoro" ? "default" : "outline"}
                  onClick={() => changeMode("pomodoro")}
                  disabled={isActive}
                >
                  Pomodoro
                </Button>
                <Button
                  variant={mode === "short" ? "default" : "outline"}
                  onClick={() => changeMode("short")}
                  disabled={isActive}
                >
                  Short Break
                </Button>
                <Button
                  variant={mode === "long" ? "default" : "outline"}
                  onClick={() => changeMode("long")}
                  disabled={isActive}
                >
                  Long Break
                </Button>
              </div>

              <div className="text-center">
                <div className="text-8xl font-bold mb-8 font-mono bg-gradient-growth bg-clip-text text-transparent">
                  {formatTime(time)}
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    onClick={toggleTimer}
                    className="bg-gradient-growth hover:opacity-90 hover:scale-105 transition-all"
                  >
                    {isActive ? (
                      <>
                        <Pause className="mr-2 h-5 w-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={resetTimer}
                    className="hover:scale-105 transition-all"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>• <strong>Pomodoro (25 min):</strong> Focus on a single task</p>
              <p>• <strong>Short Break (5 min):</strong> Take a quick breather</p>
              <p>• <strong>Long Break (15 min):</strong> Recharge after multiple pomodoros</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Timer;
