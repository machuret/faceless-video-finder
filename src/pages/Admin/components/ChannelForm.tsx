
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChannelFormData } from "@/types/forms";
import YouTubeUrlInput from "./YouTubeUrlInput";
import ChannelIdentitySection from "./form-sections/ChannelIdentitySection";
import ChannelTypeCategories from "./form-sections/ChannelTypeCategories";
import ChannelContentSection from "./form-sections/ChannelContentSection";
import ChannelStatsSection from "./form-sections/ChannelStatsSection";
import RevenueDetailsSection from "./form-sections/RevenueDetailsSection";
import NotesFormSection from "./form-sections/NotesFormSection";

interface ChannelFormProps {
  formData: ChannelFormData;
  loading: boolean;
  youtubeUrl: string;
  isEditMode: boolean;
  setYoutubeUrl: (url: string) => void;
  fetchYoutubeData: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleScreenshotChange: (url: string) => void;
  handleFieldChange: (field: string, value: string) => void;
  handleKeywordsChange: (keywords: string[]) => void;
  debugInfo?: {
    lastError: string | null;
    lastResponse: any;
  };
}

const ChannelForm: React.FC<ChannelFormProps> = ({
  formData,
  loading,
  youtubeUrl,
  isEditMode,
  setYoutubeUrl,
  fetchYoutubeData,
  handleSubmit,
  handleChange,
  handleScreenshotChange,
  handleFieldChange,
  handleKeywordsChange,
  debugInfo
}) => {
  const [keywords, setKeywords] = useState<string[]>(formData.keywords || []);

  useEffect(() => {
    setKeywords(formData.keywords || []);
  }, [formData.keywords]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {!isEditMode && (
        <YouTubeUrlInput
          youtubeUrl={youtubeUrl}
          setYoutubeUrl={setYoutubeUrl}
          onFetch={fetchYoutubeData}
          loading={loading}
          debugInfo={debugInfo}
        />
      )}

      <ChannelIdentitySection
        formData={formData}
        handleChange={handleChange}
        handleScreenshotChange={handleScreenshotChange}
        isEditMode={isEditMode}
      />
      
      <ChannelTypeCategories 
        formData={formData}
        handleFieldChange={handleFieldChange}
      />

      <ChannelContentSection
        title={formData.channel_title}
        description={formData.description || ""}
        onDescriptionChange={(value) => handleFieldChange('description', value)}
      />

      <ChannelStatsSection
        formData={formData}
        handleChange={handleChange}
      />
      
      <RevenueDetailsSection
        formData={formData}
        handleChange={handleChange}
      />
      
      <NotesFormSection
        notes={formData.notes || ""}
        onNotesChange={(value) => handleFieldChange('notes', value)}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEditMode ? 'Update Channel' : 'Create Channel')}
        </Button>
      </div>
    </form>
  );
};

export default ChannelForm;
