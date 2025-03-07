
import React from "react";
import { ChannelFormData } from "@/types/forms";
import FormSectionWrapper from "./FormSectionWrapper";
import ChannelBasicFields from "./channel-identity/ChannelBasicFields";
import ScreenshotUploader from "./screenshot/ScreenshotUploader";
import AboutSectionFetcher from "../AboutSectionFetcher";

interface ChannelIdentitySectionProps {
  formData: ChannelFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleScreenshotChange: (url: string) => void;
  isEditMode: boolean;
  onFetchAbout?: () => (about: string) => void;
}

const ChannelIdentitySection = ({ 
  formData, 
  handleChange, 
  handleScreenshotChange, 
  isEditMode,
  onFetchAbout
}: ChannelIdentitySectionProps) => {
  // Process for fetching about section
  const handleFetchAboutClick = () => {
    if (onFetchAbout) {
      return onFetchAbout();
    }
    return () => {}; // Return a no-op function if onFetchAbout is not provided
  };

  return (
    <FormSectionWrapper 
      title="Channel Identity" 
      description="Basic information about the YouTube channel"
      actionComponent={
        isEditMode ? (
          <AboutSectionFetcher
            channelUrl={formData.channel_url}
            onAboutReceived={handleFetchAboutClick()}
            disabled={!formData.channel_url}
          />
        ) : null
      }
    >
      <ChannelBasicFields 
        channelTitle={formData.channel_title}
        channelUrl={formData.channel_url}
        description={formData.description || ""}
        handleChange={handleChange}
        channelId={isEditMode ? formData.id : undefined}
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
