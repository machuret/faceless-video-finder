
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { channelTypes } from "@/components/youtube/channel-list/constants";

interface TypeAIGeneratorProps {
  channelTitle: string;
  channelDescription?: string;
  onTypeDetected: (typeId: string) => void;
}

export function TypeAIGenerator({ 
  channelTitle, 
  channelDescription = "", 
  onTypeDetected 
}: TypeAIGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const generateChannelType = async () => {
    if (!channelTitle) {
      toast.error("Channel title is required to generate a type");
      return;
    }

    setLoading(true);
    try {
      toast.info("Generating channel type with AI...");
      
      // Log for debugging
      console.log("Generating type for channel:", {
        title: channelTitle,
        description: channelDescription
      });

      const { data, error } = await supabase.functions.invoke("generate-channel-type", {
        body: {
          channelTitle,
          channelDescription
        }
      });

      if (error) {
        console.error("Error generating channel type:", error);
        toast.error(`Failed to generate type: ${error.message}`);
        
        // Implement retry logic
        if (retryCount < 1) {
          toast.info(`Retrying channel type generation (attempt ${retryCount + 1}/1)...`);
          setRetryCount(prev => prev + 1);
          setTimeout(generateChannelType, 2000);
        }
        return;
      }

      if (!data?.type) {
        console.error("No type returned from AI:", data);
        toast.error("AI couldn't determine a type for this channel");
        return;
      }

      console.log("AI generated type:", data.type);
      
      // Verify the type exists in our channel types
      const typeExists = channelTypes.some(type => type.id === data.type);
      
      if (!typeExists) {
        console.warn(`AI returned invalid type: ${data.type}. Defaulting to 'other'`);
        toast.warning("AI suggested an unknown type, using 'other' instead");
        onTypeDetected("other");
      } else {
        toast.success(`AI detected type: ${data.type}`);
        onTypeDetected(data.type);
      }
    } catch (err) {
      console.error("Exception generating channel type:", err);
      toast.error("Failed to generate channel type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
      onClick={generateChannelType}
      disabled={loading || !channelTitle}
      title="Use AI to suggest a channel type based on the title and description"
    >
      <Wand2 className="h-3.5 w-3.5" />
      {loading ? "Generating..." : "AI Detect"}
    </Button>
  );
}
