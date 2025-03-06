
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormSectionWrapper from "./FormSectionWrapper";
import { ChannelFormData } from "@/types/forms";
import ChannelStatsFetcher from "../ChannelStatsFetcher";

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
    if (stats.total_subscribers) handleFieldChange('total_subscribers', stats.total_subscribers);
    if (stats.total_views) handleFieldChange('total_views', stats.total_views);
    if (stats.video_count) handleFieldChange('video_count', stats.video_count);
  };

  return (
    <FormSectionWrapper 
      title="Channel Stats" 
      description="Statistics and metrics for the YouTube channel"
      actionComponent={
        isEditMode && formData.channel_url ? (
          <ChannelStatsFetcher 
            channelUrl={formData.channel_url} 
            onStatsReceived={handleStatsReceived} 
          />
        ) : null
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="total_subscribers">Total Subscribers</Label>
          <Input
            type="number"
            id="total_subscribers"
            name="total_subscribers"
            value={formData.total_subscribers}
            onChange={handleChange}
            placeholder="Enter total subscribers"
          />
        </div>
        <div>
          <Label htmlFor="total_views">Total Views</Label>
          <Input
            type="number"
            id="total_views"
            name="total_views"
            value={formData.total_views}
            onChange={handleChange}
            placeholder="Enter total views"
          />
        </div>
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="video_count">Video Count</Label>
          <Input
            type="number"
            id="video_count"
            name="video_count"
            value={formData.video_count}
            onChange={handleChange}
            placeholder="Enter video count"
          />
        </div>
      </div>
    </FormSectionWrapper>
  );
};

export default ChannelStatsSection;
