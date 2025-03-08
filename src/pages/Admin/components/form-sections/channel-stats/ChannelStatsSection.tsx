
import React from "react";
import FormSectionWrapper from "../FormSectionWrapper";
import { ChannelFormData } from "@/types/forms";
import { ChannelStatsFetcher } from "../../channel-stats-fetcher";
import StatsGrid from "./StatsGrid";

interface ChannelStatsSectionProps {
  formData: ChannelFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFieldChange: (field: string, value: string) => void;
  isEditMode: boolean;
}

const ChannelStatsSection = ({ 
  formData, 
  handleChange,
  handleFieldChange,
  isEditMode
}: ChannelStatsSectionProps) => {
  
  const handleStatsReceived = (stats: Partial<ChannelFormData>) => {
    console.log("🔄 Stats received in ChannelStatsSection:", stats);
    
    // Create a mapping of fields to check for updates
    const fieldsToUpdate = [
      { key: 'total_subscribers', value: stats.total_subscribers },
      { key: 'total_views', value: stats.total_views },
      { key: 'video_count', value: stats.video_count },
      { key: 'description', value: stats.description },
      { key: 'start_date', value: stats.start_date },
      { key: 'country', value: stats.country }
    ];
    
    let updatedFieldCount = 0;
    
    // Process each field
    for (const field of fieldsToUpdate) {
      // Only update if we have a valid value
      if (field.value !== undefined && field.value !== null && field.value !== '') {
        console.log(`🔄 Updating ${field.key} to:`, field.value);
        handleFieldChange(field.key, field.value);
        updatedFieldCount++;
      } else {
        console.log(`⚠️ Field ${field.key} has no valid value to update`);
      }
    }
    
    // If we received a channel title and the current one is empty or generic, update it
    if (stats.channel_title && (!formData.channel_title || formData.channel_title === "Channel" || formData.channel_title.includes("Unknown"))) {
      console.log(`🔄 Updating channel_title to:`, stats.channel_title);
      handleFieldChange('channel_title', stats.channel_title);
      updatedFieldCount++;
    }
    
    console.log(`✅ Updated ${updatedFieldCount} fields from received stats`);
  };

  // Determine what to use for fetching - channel URL, channel title, or a combination
  const determineChannelReference = () => {
    // If we have a proper channel URL, use that first
    if (formData.channel_url && (
        formData.channel_url.includes('youtube.com/channel/') || 
        formData.channel_url.includes('@') ||
        /^UC[\w-]{21,24}$/.test(formData.channel_url)
      )) {
      return formData.channel_url;
    }
    
    // If we have a channel title and no proper URL, use the title
    if (formData.channel_title && formData.channel_title.trim() !== "") {
      return formData.channel_title;
    }
    
    // Last resort, use whatever URL we have
    return formData.channel_url;
  };

  // Allow fetching data regardless of edit mode - just need a channel URL
  const canFetchData = formData.channel_url || formData.channel_title;

  return (
    <FormSectionWrapper 
      title="Channel Stats" 
      description="Statistics and metrics for the YouTube channel"
      actionComponent={
        canFetchData ? (
          <ChannelStatsFetcher 
            channelUrl={determineChannelReference()} 
            onStatsReceived={handleStatsReceived} 
          />
        ) : null
      }
    >
      <StatsGrid 
        formData={formData}
        handleChange={handleChange}
        handleFieldChange={handleFieldChange}
      />
    </FormSectionWrapper>
  );
};

export default ChannelStatsSection;
