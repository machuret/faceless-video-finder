
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FormSectionWrapper from "./FormSectionWrapper";

interface ChannelContentSectionProps {
  title: string;
  description: string;
  onDescriptionChange: (value: string) => void;
}

const ChannelContentSection = ({ 
  title, 
  description, 
  onDescriptionChange 
}: ChannelContentSectionProps) => (
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
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => console.log("Generate content")}
          size="sm"
        >
          Generate
        </Button>
      </div>
    </div>
  </FormSectionWrapper>
);

export default ChannelContentSection;
