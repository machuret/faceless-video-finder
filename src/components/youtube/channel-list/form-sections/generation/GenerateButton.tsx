
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

interface GenerateButtonProps {
  label: string;
  onGenerate: () => Promise<void>;
  disabled?: boolean;
}

export function GenerateButton({ label, onGenerate, disabled = false }: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } catch (error) {
      console.error(`Error generating ${label}:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to generate ${label}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleGenerate}
      disabled={isGenerating || disabled}
    >
      <Wand2 className="w-4 h-4 mr-2" /> 
      {isGenerating ? 'Generating...' : `Generate ${label}`}
    </Button>
  );
}
