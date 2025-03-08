
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TypeAIGeneratorProps {
  channelTitle: string;
  channelDescription: string;
  onTypeDetected: (type: string) => void;
}

export const TypeAIGenerator = ({
  channelTitle,
  channelDescription,
  onTypeDetected
}: TypeAIGeneratorProps) => {
  const [generating, setGenerating] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const generateChannelType = async () => {
    if (!channelTitle || !channelDescription) {
      toast.error("Channel title and description are required to generate type");
      return;
    }

    setGenerating(true);
    setAttempts(a => a + 1);
    
    try {
      console.log("Calling generate-channel-type function with:", {
        channelTitle: channelTitle,
        description: channelDescription
      });
      
      const { data, error } = await supabase.functions.invoke('generate-channel-type', {
        body: { 
          channelTitle: channelTitle,
          description: channelDescription
        }
      });

      if (error) {
        console.error("Edge Function error:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      console.log("Edge function response:", data);
      
      if (!data || !data.channelType) {
        console.error("No channel type returned:", data);
        throw new Error("No channel type returned from AI");
      }

      toast.success(`Channel type detected: ${data.channelType}`);
      onTypeDetected(data.channelType);
    } catch (err) {
      console.error("Error generating channel type:", err);
      
      if (attempts < maxAttempts) {
        toast.error(`Failed to generate type. Retrying... (${attempts}/${maxAttempts})`);
        console.log(`Retrying channel type generation (attempt ${attempts}/${maxAttempts})...`);
        setTimeout(() => generateChannelType(), 1000);
      } else {
        toast.error(`Failed to generate channel type after ${maxAttempts} attempts`);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      type="button" 
      variant="outline"
      size="sm"
      onClick={generateChannelType}
      disabled={generating || !channelTitle || !channelDescription}
      className="ml-2"
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2" />
          Detect Type
        </>
      )}
    </Button>
  );
};
