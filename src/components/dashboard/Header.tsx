import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, TrendingUp, User, LogOut, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface HeaderProps {
  user: SupabaseUser;
}

export const Header = ({ user }: HeaderProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-growth flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">MindTrack</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/dashboard">
              <Button variant="ghost" className="gap-2">
                <Heart className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/calendar">
              <Button variant="ghost" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="ghost" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link to="/timer">
              <Button variant="ghost" className="gap-2">
                <Timer className="h-4 w-4" />
                Timer
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" className="gap-2">
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </nav>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};