
import React from "react";
import { ChannelFormData } from "@/types/forms";
import FormSectionWrapper from "./FormSectionWrapper";
import ChannelBasicFields from "./channel-identity/ChannelBasicFields";
import ScreenshotUploader from "./screenshot/ScreenshotUploader";

interface ChannelIdentitySectionProps {
  formData: ChannelFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleScreenshotChange: (url: string) => void;
  isEditMode: boolean;
  onFetchAbout?: () => void;
  isLoadingAbout?: boolean;
}

const ChannelIdentitySection = ({ 
  formData, 
  handleChange, 
  handleScreenshotChange, 
  isEditMode,
  onFetchAbout,
  isLoadingAbout
}: ChannelIdentitySectionProps) => {
  return (
    <FormSectionWrapper title="Channel Identity" description="Basic information about the YouTube channel">
      <ChannelBasicFields 
        channelTitle={formData.channel_title}
        channelUrl={formData.channel_url}
        description={formData.description || ""}
        handleChange={handleChange}
        onFetchAbout={isEditMode ? onFetchAbout : undefined}
        isLoading={isLoadingAbout}
      />
      
      <ScreenshotUploader 
        channelId={formData.id}
        screenshotUrl={formData.screenshot_url || ""}
        onScreenshotChange={handleScreenshotChange}
      />
    </FormSectionWrapper>
  );
};

export default ChannelIdentitySection;
