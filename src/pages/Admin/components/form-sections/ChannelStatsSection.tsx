import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormSectionWrapper from "./FormSectionWrapper";
import { ChannelFormData } from "@/types/forms";
import { ChannelStatsFetcher } from "../channel-stats-fetcher";
import CountrySelector from "../form-dropdowns/CountrySelector";
import { AlertCircle } from "lucide-react";

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
    console.log("Stats received in ChannelStatsSection:", stats);
    
    // Update all fields that we received from the API
    const fieldsToUpdate = [
      { key: 'total_subscribers', value: stats.total_subscribers },
      { key: 'total_views', value: stats.total_views },
      { key: 'video_count', value: stats.video_count },
      { key: 'description', value: stats.description },
      { key: 'start_date', value: stats.start_date },
      { key: 'country', value: stats.country }
    ];
    
    for (const field of fieldsToUpdate) {
      if (field.value !== undefined && field.value !== null && field.value !== '') {
        console.log(`Updating ${field.key} to:`, field.value);
        handleFieldChange(field.key, field.value);
      }
    }
    
    // If we received a channel title and the current one is empty or generic, update it
    if (stats.channel_title && (!formData.channel_title || formData.channel_title === "Channel")) {
      handleFieldChange('channel_title', stats.channel_title);
    }
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

  // Function to determine field status
  const getFieldStatus = (value: string | undefined | null) => {
    if (!value) return "missing";
    return "complete";
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="total_subscribers">Total Subscribers</Label>
            {getFieldStatus(formData.total_subscribers) === "missing" && (
              <div className="flex items-center text-yellow-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Required</span>
              </div>
            )}
          </div>
          <Input
            type="number"
            id="total_subscribers"
            name="total_subscribers"
            value={formData.total_subscribers || ""}
            onChange={handleChange}
            placeholder="Enter total subscribers"
            required
            className={!formData.total_subscribers ? "border-yellow-500" : ""}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="total_views">Total Views</Label>
            {getFieldStatus(formData.total_views) === "missing" && (
              <div className="flex items-center text-yellow-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Required</span>
              </div>
            )}
          </div>
          <Input
            type="number"
            id="total_views"
            name="total_views"
            value={formData.total_views || ""}
            onChange={handleChange}
            placeholder="Enter total views"
            required
            className={!formData.total_views ? "border-yellow-500" : ""}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="start_date">Start Date</Label>
            {getFieldStatus(formData.start_date) === "missing" && (
              <div className="flex items-center text-yellow-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Required</span>
              </div>
            )}
          </div>
          <Input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date || ""}
            onChange={handleChange}
            required
            className={!formData.start_date ? "border-yellow-500" : ""}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="video_count">Video Count</Label>
            {getFieldStatus(formData.video_count) === "missing" && (
              <div className="flex items-center text-yellow-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Required</span>
              </div>
            )}
          </div>
          <Input
            type="number"
            id="video_count"
            name="video_count"
            value={formData.video_count || ""}
            onChange={handleChange}
            placeholder="Enter video count"
            required
            className={!formData.video_count ? "border-yellow-500" : ""}
          />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="country">Country</Label>
            {getFieldStatus(formData.country) === "missing" && (
              <div className="flex items-center text-yellow-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Required</span>
              </div>
            )}
          </div>
          <CountrySelector 
            selectedCountry={formData.country || ""}
            onSelect={(value) => handleFieldChange('country', value)}
          />
        </div>
      </div>
    </FormSectionWrapper>
  );
};

export default ChannelStatsSection;
