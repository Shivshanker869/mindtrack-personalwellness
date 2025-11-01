import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";

interface ExportReportProps {
  userId: string;
}

export const ExportReport = ({ userId }: ExportReportProps) => {
  const { toast } = useToast();

  const exportToPDF = async () => {
    try {
      // Fetch all user data
      const [habitsRes, completionsRes, waterRes, achievementsRes, profileRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId),
        supabase.from('habit_completions').select('*').eq('user_id', userId),
        supabase.from('water_intake').select('*').eq('user_id', userId),
        supabase.from('user_achievements').select('*').eq('user_id', userId),
        supabase.from('profiles').select('full_name').eq('id', userId).single(),
      ]);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129);
      doc.text("MindTrack & Wellness Progress Report", pageWidth / 2, yPos, { align: "center" });
      yPos += 10;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // User Info
      if (profileRes.data) {
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`User: ${profileRes.data.full_name || 'N/A'}`, 20, yPos);
        yPos += 10;
      }

      // Achievements Section
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text("ACHIEVEMENTS", 20, yPos);
      yPos += 8;

      if (achievementsRes.data && achievementsRes.data[0]) {
        const ach = achievementsRes.data[0];
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Rank: ${ach.rank}`, 20, yPos);
        yPos += 6;
        doc.text(`Stars: ${ach.stars}`, 20, yPos);
        yPos += 6;
        doc.text(`Current Streak: ${ach.current_streak} days`, 20, yPos);
        yPos += 6;
        doc.text(`Longest Streak: ${ach.longest_streak} days`, 20, yPos);
        yPos += 12;
      }

      // Habits Section
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text("HABITS", 20, yPos);
      yPos += 8;

      if (habitsRes.data && habitsRes.data.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(0);
        habitsRes.data.forEach((habit) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`• ${habit.title} (${habit.category}) - ${habit.is_active ? 'Active' : 'Inactive'}`, 20, yPos);
          yPos += 6;
        });
        yPos += 6;
      }

      // Water Intake Summary
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text("WATER INTAKE SUMMARY", 20, yPos);
      yPos += 8;

      if (waterRes.data && waterRes.data.length > 0) {
        const totalGlasses = waterRes.data.reduce((sum, w) => sum + w.glasses_count, 0);
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(`Total Days Tracked: ${waterRes.data.length}`, 20, yPos);
        yPos += 6;
        doc.text(`Total Glasses: ${totalGlasses}`, 20, yPos);
        yPos += 6;
        doc.text(`Average: ${(totalGlasses / waterRes.data.length).toFixed(1)} glasses/day`, 20, yPos);
      }

      // Save the PDF
      doc.save(`wellness-report-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "✅ Report Exported",
        description: "Your progress report has been downloaded as PDF!",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your report.",
        variant: "destructive",
      });
    }
  };

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
        description: "Your progress report has been downloaded as CSV!",
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
    <div className="flex flex-col sm:flex-row gap-3">
      <Button onClick={exportToPDF} variant="outline" className="flex-1">
        <FileText className="h-4 w-4 mr-2" />
        Export as PDF
      </Button>
      <Button onClick={exportToCSV} variant="outline" className="flex-1">
        <Download className="h-4 w-4 mr-2" />
        Export as CSV
      </Button>
    </div>
  );
};
