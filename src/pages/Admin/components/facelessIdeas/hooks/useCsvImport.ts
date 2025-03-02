
import { toast } from "sonner";
import { processCsvImport } from "@/services/facelessIdeaService";

export const useCsvImport = (refreshFacelessIdeas: () => Promise<void>) => {
  const handleCsvUpload = async (file: File) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        if (!e.target?.result) return;
        
        const csvContent = e.target.result as string;
        console.log("CSV content first 100 chars:", csvContent.substring(0, 100));
        
        const lines = csvContent.split('\n').slice(0, 3);
        console.log("First 3 lines:");
        lines.forEach((line, i) => console.log(`Line ${i}:`, line));
        
        const result = await processCsvImport(csvContent);
        
        if (result.success > 0) {
          toast.success(`Successfully imported ${result.success} faceless ideas`);
          refreshFacelessIdeas();
        }
        
        if (result.failed > 0) {
          toast.error(`Failed to import ${result.failed} faceless ideas`);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("Error processing CSV file");
    }
  };

  return { handleCsvUpload };
};
