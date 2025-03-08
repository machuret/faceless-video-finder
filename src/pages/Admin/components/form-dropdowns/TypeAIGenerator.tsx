
import { useState, useRef } from "react";
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
  const isRequestInProgress = useRef(false);

  const generateChannelType = async () => {
    if (!channelTitle) {
      toast.error('Please enter a channel title first');
      return;
    }
    
    // Prevent multiple simultaneous requests
    if (isRequestInProgress.current) {
      console.log("Request already in progress, skipping");
      return;
    }
    
    setIsGenerating(true);
    isRequestInProgress.current = true;
    
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
        // Reset retry count on success
        setRetryCount(0);
      } else {
        console.error('No channel type in response:', data);
        throw new Error('No channel type was generated');
      }
    } catch (error) {
      console.error('Error generating channel type:', error);
      
      // Fixed retry logic - limits the number of retries to 1 (total 2 attempts)
      // and properly releases locks when failing
      if (retryCount < 1) {  // Changed from < 2 to < 1 to only allow one retry
        toast.error(`Retrying channel type generation (attempt ${retryCount + 1}/1)...`);
        setRetryCount(prev => prev + 1);
        
        // Set a timeout before retrying
        setTimeout(() => {
          isRequestInProgress.current = false; // Release the lock before retrying
          generateChannelType();
        }, 2000); // Retry after 2 seconds
      } else {
        toast.error('Failed to generate channel type: ' + (error instanceof Error ? error.message : 'Unknown error'));
        setRetryCount(0);
        // Release locks to allow manual retry
        isRequestInProgress.current = false;
        setIsGenerating(false);
      }
      return;
    } finally {
      // Only set generating to false if we're not about to retry
      if (retryCount >= 1) {  // Changed from >= 2 to >= 1
        setIsGenerating(false);
        isRequestInProgress.current = false;
      }
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
