import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const MOTIVATIONAL_MESSAGES = [
  "Every small step counts. Keep moving forward! 💪",
  "You're building amazing habits today! 🌟",
  "Consistency is the key to greatness! 🔑",
  "Your future self will thank you for today's efforts! 🎯",
  "One day at a time, one habit at a time! 🌱",
  "You're stronger than you think! Keep going! 💎",
  "Progress, not perfection. You're doing great! 🚀",
  "Small habits, big results. Keep it up! ⭐",
  "Today is another opportunity to grow! 🌻",
  "Believe in yourself and your journey! 🌈",
  "You're creating the life you want! ✨",
  "Every habit completed is a victory! 🏆",
  "Stay committed to your goals! 🎯",
  "Your dedication is inspiring! Keep shining! ☀️",
  "Success is built one day at a time! 🧱"
];

export const MotivationalMessage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Select a random message based on the day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const selectedMessage = MOTIVATIONAL_MESSAGES[dayOfYear % MOTIVATIONAL_MESSAGES.length];
    setMessage(selectedMessage);
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-growth flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <p className="text-lg font-medium text-foreground">
          {message}
        </p>
      </div>
    </Card>
  );
};
