
import React from "react";
import ChannelStatField from "./ChannelStatField";
import CountryField from "./CountryField";
import { ChannelFormData } from "@/types/forms";

interface StatsGridProps {
  formData: ChannelFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFieldChange: (field: string, value: string) => void;
}

const StatsGrid = ({ formData, handleChange, handleFieldChange }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ChannelStatField
        id="total_subscribers"
        name="total_subscribers"
        label="Total Subscribers"
        value={formData.total_subscribers || ""}
        type="number"
        placeholder="Enter total subscribers"
        required
        onChange={handleChange}
      />
      
      <ChannelStatField
        id="total_views"
        name="total_views"
        label="Total Views"
        value={formData.total_views || ""}
        type="number"
        placeholder="Enter total views"
        required
        onChange={handleChange}
      />
      
      <ChannelStatField
        id="start_date"
        name="start_date"
        label="Start Date"
        value={formData.start_date || ""}
        type="date"
        required
        onChange={handleChange}
      />
      
      <ChannelStatField
        id="video_count"
        name="video_count"
        label="Video Count"
        value={formData.video_count || ""}
        type="number"
        placeholder="Enter video count"
        required
        onChange={handleChange}
      />
      
      <CountryField
        country={formData.country || ""}
        onSelect={(value) => handleFieldChange('country', value)}
      />
    </div>
  );
};

export default StatsGrid;
