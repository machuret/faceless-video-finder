
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChannelFormData } from "../components/ChannelForm";
import ChannelIdentity from "./form-sections/ChannelIdentity";
import ChannelStats from "./form-sections/ChannelStats";
import ChannelContent from "./form-sections/ChannelContent";
import RevenueDetails from "./form-sections/RevenueDetails";
import TypeSelector from "./form-dropdowns/TypeSelector";
import CategorySelector from "./form-dropdowns/CategorySelector";
import CountrySelector from "./form-dropdowns/CountrySelector";
import NotesSection from "./form-sections/NotesSection";

export interface ChannelFormData {
  video_id: string;
  channel_title: string;
  channel_url: string;
  description: string;
  screenshot_url: string;
  total_subscribers: string;
  total_views: string;
  start_date: string;
  video_count: string;
  cpm: string;
  channel_type?: string;
  country?: string;
  channel_category?: string;
  notes?: string;
}

interface ChannelFormProps {
  formData: ChannelFormData;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onScreenshotChange: (url: string) => void;
  onFieldChange: (name: string, value: string) => void;
}

const ChannelForm = ({ 
  formData, 
  loading, 
  onChange, 
  onSubmit, 
  onScreenshotChange,
  onFieldChange 
}: ChannelFormProps) => {
  const isEditMode = !!formData.video_id && !!formData.channel_title;

  // Handle type selection
  const handleTypeSelect = (typeId: string) => {
    onFieldChange("channel_type", typeId);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    onFieldChange("channel_category", categoryId);
  };

  // Handle country selection
  const handleCountrySelect = (countryCode: string) => {
    onFieldChange("country", countryCode);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ChannelContent
        description={formData.description}
        screenshotUrl={formData.screenshot_url}
        channelTitle={formData.channel_title}
        onChange={onChange}
        onScreenshotChange={onScreenshotChange}
        onFieldChange={onFieldChange}
      />

      <NotesSection
        notes={formData.notes}
        onFieldChange={onFieldChange}
      />

      <TypeSelector
        selectedType={formData.channel_type}
        onSelect={handleTypeSelect}
      />

      <CategorySelector
        selectedCategory={formData.channel_category}
        onSelect={handleCategorySelect}
      />

      <CountrySelector
        selectedCountry={formData.country}
        onSelect={handleCountrySelect}
      />

      <ChannelIdentity
        videoId={formData.video_id}
        channelTitle={formData.channel_title}
        channelUrl={formData.channel_url}
        onChange={onChange}
      />

      <ChannelStats
        totalSubscribers={formData.total_subscribers}
        totalViews={formData.total_views}
        videoCount={formData.video_count}
        startDate={formData.start_date}
        onChange={onChange}
      />

      <RevenueDetails
        cpm={formData.cpm}
        onChange={onChange}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (isEditMode ? "Updating Channel..." : "Adding Channel...") : (isEditMode ? "Update Channel" : "Add Channel")}
      </Button>
    </form>
  );
};

export default ChannelForm;
