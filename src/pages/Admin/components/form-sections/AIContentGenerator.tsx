
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIContentGeneratorProps {
  channelTitle: string;
  description: string;
  onDescriptionGenerated: (description: string) => void;
}

const AIContentGenerator = ({ channelTitle, description, onDescriptionGenerated }: AIContentGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = async () => {
    if (!channelTitle) {
      toast.error('Please enter a channel title first');
      return;
    }
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-channel-content', {
        body: { title: channelTitle, description: description || '' }
      });
      
      if (error) {
        console.error('Edge Function error:', error);
        throw error;
      }
      
      console.log("AI generation response:", data);
      
      if (data?.description) {
        onDescriptionGenerated(data.description);
        toast.success('Description generated successfully!');
      } else {
        console.error('No description in response:', data);
        throw new Error('No description was generated');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      type="button" 
      size="sm" 
      variant="outline"
      onClick={generateContent}
      disabled={isGenerating}
      className="flex items-center gap-1"
    >
      <Sparkles className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Generate with AI"}
    </Button>
  );
};

export default AIContentGenerator;
