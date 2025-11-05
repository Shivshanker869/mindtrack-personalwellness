import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

const categories = [
  { name: "Health", color: "#10b981", icon: "💪" },
  { name: "Mindfulness", color: "#8b5cf6", icon: "🧘" },
  { name: "Learning", color: "#3b82f6", icon: "📚" },
  { name: "Productivity", color: "#f59e0b", icon: "⚡" },
  { name: "Social", color: "#ec4899", icon: "👥" },
  { name: "Creative", color: "#f97316", icon: "🎨" },
  { name: "Eating", color: "#ef4444", icon: "🍎" },
  { name: "Water Intake Habits", color: "#06b6d4", icon: "💧" },
];

export const AddHabitDialog = ({ open, onOpenChange, userId }: AddHabitDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("habits").insert({
        user_id: userId,
        title,
        description,
        category: selectedCategory.name,
        color: selectedCategory.color,
        icon: selectedCategory.icon,
      });

      if (error) throw error;

      toast.success("Habit added! Let's build this streak! 🚀");
      setTitle("");
      setDescription("");
      onOpenChange(false);
      window.location.reload(); // Refresh to show new habit
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track your progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Habit Name</Label>
            <Input
              id="title"
              placeholder="e.g., Morning meditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Why is this important to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="p-3 rounded-lg border-2 transition-all hover:scale-105"
                  style={{
                    borderColor: selectedCategory.name === cat.name ? cat.color : "transparent",
                    backgroundColor: selectedCategory.name === cat.name ? `${cat.color}15` : "transparent",
                  }}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-growth hover:opacity-90"
            >
              {loading ? "Adding..." : "Add Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};