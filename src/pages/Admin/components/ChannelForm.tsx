
import React, { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { ChannelFormData } from "@/types/forms";
import ChannelIdentitySection from "./form-sections/ChannelIdentitySection";
import ChannelStatsSection from "./form-sections/ChannelStatsSection";
import ChannelTypeCategories from "./form-sections/ChannelTypeCategories";
import ChannelContentSection from "./form-sections/ChannelContentSection";
import RevenueDetailsSection from "./form-sections/RevenueDetailsSection";
import NotesSection from "./form-sections/NotesSection";
import KeywordsSection from "./form-sections/KeywordsSection";
import { Loader2 } from "lucide-react";

export interface ChannelFormProps {
  formData: ChannelFormData;
  loading: boolean;
  isEditMode: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleScreenshotChange: (url: string) => void;
  handleFieldChange: (field: string, value: any) => void;
  handleKeywordsChange: (keywords: string[]) => void;
}

const ChannelForm: React.FC<ChannelFormProps> = ({ 
  formData, 
  loading, 
  isEditMode,
  handleSubmit,
  handleChange,
  handleScreenshotChange,
  handleFieldChange,
  handleKeywordsChange
}) => {
  return (
    <div className="space-y-8 mb-8">
      <ChannelIdentitySection 
        formData={formData}
        handleChange={handleChange}
        handleScreenshotChange={handleScreenshotChange}
        isEditMode={isEditMode}
      />
      
      <ChannelStatsSection 
        formData={formData}
        handleChange={handleChange}
        handleFieldChange={handleFieldChange}
        isEditMode={isEditMode}
      />
      
      <ChannelTypeCategories 
        formData={formData}
        handleFieldChange={handleFieldChange}
      />
      
      <KeywordsSection
        channelTitle={formData.channel_title || ''}
        description={formData.description || ''}
        category={formData.channel_category || ''}
        keywords={formData.keywords || []}
        onKeywordsChange={handleKeywordsChange}
      />
      
      <ChannelContentSection 
        title={formData.channel_title || ''}
        description={formData.ai_description || ''}
        onDescriptionChange={(value) => handleFieldChange('ai_description', value)}
      />
      
      <RevenueDetailsSection 
        formData={formData}
        handleChange={handleChange}
      />
      
      <NotesSection 
        notes={formData.notes || ''}
        channelType={formData.channel_type}
        onFieldChange={handleFieldChange}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} onClick={handleSubmit}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditMode ? "Update Channel" : "Create Channel"}</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChannelForm;
