
import React from "react";
import { Button } from "@/components/ui/button";
import ChannelIdentitySection from "./form-sections/ChannelIdentitySection";
import ChannelStatsSection from "./form-sections/ChannelStatsSection";
import ChannelTypeCategories from "./form-sections/ChannelTypeCategories";
import RevenueDetailsSection from "./form-sections/RevenueDetailsSection";
import ChannelContentSection from "./form-sections/ChannelContentSection";
import NotesSection from "./form-sections/NotesSection";
import { Loader2 } from "lucide-react";

interface ChannelFormProps {
  loading: boolean;
  isEditMode: boolean;
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleFieldChange: (field: string, value: any) => void;
  handleScreenshotChange: (url: string) => void;
  handleKeywordsChange: (keywords: string[]) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const ChannelForm = ({
  loading,
  isEditMode,
  formData,
  handleChange,
  handleFieldChange,
  handleScreenshotChange,
  handleKeywordsChange,
  handleSubmit
}: ChannelFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-8 my-4">
      {/* Channel Identity Section */}
      <ChannelIdentitySection
        formData={formData}
        handleChange={handleChange}
        handleScreenshotChange={handleScreenshotChange}
        isEditMode={isEditMode}
      />

      {/* Channel Stats Section */}
      <ChannelStatsSection
        formData={formData}
        handleChange={handleChange}
        handleFieldChange={handleFieldChange}
        isEditMode={isEditMode}
      />

      {/* Channel Type & Categories */}
      <ChannelTypeCategories
        formData={formData}
        handleFieldChange={handleFieldChange}
      />

      {/* Revenue Details */}
      <RevenueDetailsSection
        formData={formData}
        handleChange={handleChange}
      />

      {/* AI Content Generation */}
      <ChannelContentSection
        title={formData.channel_title}
        description={formData.ai_description || ""}
        onDescriptionChange={(value) => handleFieldChange("ai_description", value)}
      />

      {/* Notes */}
      <NotesSection
        notes={formData.notes || ""}
        channelType={formData.channel_type}
        onFieldChange={(name, value) => handleFieldChange(name, value)}
      />

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full md:w-auto flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditMode ? "Update Channel" : "Add Channel"}
        </Button>
      </div>
    </form>
  );
};

export default ChannelForm;
