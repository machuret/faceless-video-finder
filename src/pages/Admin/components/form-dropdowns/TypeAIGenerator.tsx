
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TypeAIGeneratorProps {
  channelTitle: string;
  description: string;
  onTypeGenerated: (type: string) => void;
}

const TypeAIGenerator = ({ channelTitle, description, onTypeGenerated }: TypeAIGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateChannelType = async () => {
    if (!channelTitle) {
      toast.error('Please enter a channel title first');
      return;
    }
    
    setIsGenerating(true);
    try {
      console.log("Calling generate-channel-type function with:", { 
        title: channelTitle, 
        description: description || '' 
      });
      
      const { data, error } = await supabase.functions.invoke('generate-channel-type', {
        body: { 
          title: channelTitle, 
          description: description || '' 
        }
      });
      
      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      console.log("AI channel type generation response:", data);
      
      if (data?.channelType) {
        onTypeGenerated(data.channelType);
        toast.success('Channel type generated successfully!');
      } else {
        console.error('No channel type in response:', data);
        throw new Error('No channel type was generated');
      }
    } catch (error) {
      console.error('Error generating channel type:', error);
      toast.error('Failed to generate channel type: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      type="button" 
      size="sm" 
      variant="outline"
      onClick={generateChannelType}
      disabled={isGenerating}
      className="flex items-center gap-1 ml-2"
    >
      <Wand2 className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Generate Type"}
    </Button>
  );
};

export default TypeAIGenerator;
