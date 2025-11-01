import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ExportReportProps {
  userId: string;
}

export const ExportReport = ({ userId }: ExportReportProps) => {
  const { toast } = useToast();

  const exportToCSV = async () => {
    try {
      // Fetch all user data
      const [habitsRes, completionsRes, waterRes, achievementsRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId),
        supabase.from('habit_completions').select('*').eq('user_id', userId),
        supabase.from('water_intake').select('*').eq('user_id', userId),
        supabase.from('user_achievements').select('*').eq('user_id', userId),
      ]);

      // Create CSV content
      let csvContent = "MindTrack & Wellness Habits Tracker - Progress Report\n\n";
      
      // Achievements section
      csvContent += "=== ACHIEVEMENTS ===\n";
      if (achievementsRes.data && achievementsRes.data[0]) {
        const ach = achievementsRes.data[0];
        csvContent += `Rank,${ach.rank}\n`;
        csvContent += `Stars,${ach.stars}\n`;
        csvContent += `Current Streak,${ach.current_streak}\n`;
        csvContent += `Longest Streak,${ach.longest_streak}\n`;
      }
      csvContent += "\n";

      // Habits section
      csvContent += "=== HABITS ===\n";
      csvContent += "Title,Category,Description,Status,Created Date\n";
      habitsRes.data?.forEach((habit) => {
        csvContent += `"${habit.title}","${habit.category}","${habit.description || ''}",${habit.is_active ? 'Active' : 'Inactive'},${new Date(habit.created_at).toLocaleDateString()}\n`;
      });
      csvContent += "\n";

      // Completions section
      csvContent += "=== HABIT COMPLETIONS ===\n";
      csvContent += "Date,Notes\n";
      completionsRes.data?.forEach((comp) => {
        csvContent += `${new Date(comp.completed_at).toLocaleDateString()},"${comp.notes || ''}"\n`;
      });
      csvContent += "\n";

      // Water intake section
      csvContent += "=== WATER INTAKE ===\n";
      csvContent += "Date,Glasses\n";
      waterRes.data?.forEach((water) => {
        csvContent += `${water.date},${water.glasses_count}\n`;
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `wellness-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "✅ Report Exported",
        description: "Your progress report has been downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your report.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={exportToCSV} variant="outline" className="w-full">
      <Download className="h-4 w-4 mr-2" />
      Export Progress Report (CSV)
    </Button>
  );
};
