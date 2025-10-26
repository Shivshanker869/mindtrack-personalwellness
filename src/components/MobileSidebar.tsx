import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Calendar, TrendingUp, Timer, User, LogOut, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
    setOpen(false);
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: TrendingUp, label: "Analytics", path: "/analytics" },
    { icon: Timer, label: "Timer", path: "/timer" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold bg-gradient-growth bg-clip-text text-transparent">
              MindTrack
            </h2>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                navigate(-1);
                setOpen(false);
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
