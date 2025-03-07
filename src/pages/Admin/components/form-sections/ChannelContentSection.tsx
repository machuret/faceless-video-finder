
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import FormSectionWrapper from "./FormSectionWrapper";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChannelContentSectionProps {
  title: string;
  description: string;
  onDescriptionChange: (value: string) => void;
}

const ChannelContentSection = ({ 
  title, 
  description, 
  onDescriptionChange 
}: ChannelContentSectionProps) => {
  const handleGenerateContent = async () => {
    if (!title) {
      toast.error("Channel title is required to generate AI content");
      return;
    }

    try {
      toast.info("Generating AI description...");
      
      console.log("Calling generate-channel-content with title:", title);
      
      const { data, error } = await supabase.functions.invoke('generate-channel-content', {
        body: { channelTitle: title }
      });
      
      console.log("Response from generate-channel-content:", { data, error });
      
      if (error) {
        console.error("Error generating AI content:", error);
        toast.error(`Failed to generate content: ${error.message}`);
        return;
      }
      
      if (!data || !data.description) {
        toast.error("No content was generated");
        return;
      }
      
      onDescriptionChange(data.description);
      toast.success("AI content generated successfully!");
      
    } catch (err) {
      console.error("Unexpected error generating content:", err);
      toast.error(`Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  return (
    <FormSectionWrapper title="AI Content Generation" description="AI-generated description of the channel's content">
      <div className="mb-4">
        <Label htmlFor="ai-description">AI Generated Description</Label>
        <div className="flex items-center">
          <Textarea
            id="ai-description"
            placeholder="AI Generated Description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="flex-grow mr-2"
            rows={10}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateContent}
            size="sm"
            className="flex items-center gap-1 self-start"
          >
            <Wand2 className="h-4 w-4" />
            Generate
          </Button>
        </div>
      </div>
    </FormSectionWrapper>
  );
};

export default ChannelContentSection;
