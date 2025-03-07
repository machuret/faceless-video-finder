
import React, { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ChannelFormData } from "@/types/forms";
import ChannelIdentitySection from "./form-sections/ChannelIdentitySection";
import ChannelStatsSection from "./form-sections/ChannelStatsSection";
import ChannelContentSection from "./form-sections/ChannelContentSection";
import ChannelTypeCategories from "./form-sections/ChannelTypeCategories";
import RevenueDetailsSection from "./form-sections/RevenueDetailsSection";
import NotesSection from "./form-sections/NotesSection";
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
    <Form onSubmit={handleSubmit}>
      <div className="space-y-8 mb-8">
        <ChannelIdentitySection 
          formData={formData}
          handleChange={handleChange}
          handleScreenshotChange={handleScreenshotChange}
        />
        
        <ChannelStatsSection 
          formData={formData}
          handleChange={handleChange}
        />
        
        <ChannelTypeCategories 
          formData={formData}
          handleFieldChange={handleFieldChange}
          handleKeywordsChange={handleKeywordsChange}
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
          onChange={(value) => handleFieldChange('notes', value)}
        />
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
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
    </Form>
  );
};

export default ChannelForm;
