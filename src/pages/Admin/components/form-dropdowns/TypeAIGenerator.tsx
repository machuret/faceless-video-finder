
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
  const [retryCount, setRetryCount] = useState(0);

  const generateChannelType = async () => {
    if (!channelTitle) {
      toast.error('Please enter a channel title first');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Clean up description (remove HTML) for better processing
      const cleanDesc = description ? description.replace(/<\/?[^>]+(>|$)/g, "") : "";
      
      console.log("Calling generate-channel-type function with:", { 
        title: channelTitle, 
        description: cleanDesc || '' 
      });
      
      const response = await supabase.functions.invoke('generate-channel-type', {
        body: { 
          title: channelTitle, 
          description: cleanDesc || '' 
        }
      });
      
      console.log("Edge function response:", response);
      
      if (response.error) {
        console.error('Edge Function error:', response.error);
        throw new Error(`Edge function error: ${response.error.message || 'Unknown error'}`);
      }
      
      const data = response.data;
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
      
      // Error handling with retry logic
      if (retryCount < 2) {
        toast.error(`Retrying channel type generation (attempt ${retryCount + 1}/2)...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => generateChannelType(), 1000); // Retry after 1 second
        return;
      }
      
      toast.error('Failed to generate channel type: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setRetryCount(0);
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
