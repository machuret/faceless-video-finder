
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
import TopVideosPreview from "./channel-videos/TopVideosPreview";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface ChannelFormProps {
  formData: ChannelFormData;
  loading: boolean;
  isEditMode: boolean;
  handleSubmit: (e: React.FormEvent, returnToList?: boolean) => Promise<void>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleScreenshotChange: (url: string) => void;
  handleFieldChange: (field: string, value: any) => void;
  handleKeywordsChange: (keywords: string[]) => void;
  handleBooleanFieldChange?: (field: string, value: boolean) => void;
}

const ChannelForm: React.FC<ChannelFormProps> = ({ 
  formData, 
  loading, 
  isEditMode,
  handleSubmit,
  handleChange,
  handleScreenshotChange,
  handleFieldChange,
  handleKeywordsChange,
  handleBooleanFieldChange
}) => {
  const navigate = useNavigate();

  // Extract youtube channel ID if available in channel_url
  const extractYoutubeChannelId = (url: string) => {
    if (!url) return null;
    const channelMatch = url.match(/\/channel\/(UC[\w-]{22})/);
    if (channelMatch) return channelMatch[1];
    
    const rawIdMatch = url.match(/(UC[\w-]{22})/);
    if (rawIdMatch) return rawIdMatch[1];
    
    return null;
  };

  const youtubeChannelId = formData.channel_url ? extractYoutubeChannelId(formData.channel_url) : null;

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
        handleBooleanFieldChange={handleBooleanFieldChange}
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

      {isEditMode && formData.id && (
        <TopVideosPreview 
          channelId={formData.id} 
          youtubeChannelId={youtubeChannelId || undefined}
        />
      )}

      <div className="flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          disabled={loading} 
          onClick={() => navigate("/admin/dashboard")}
        >
          Cancel
        </Button>
        
        <Button 
          type="button" 
          variant="secondary" 
          disabled={loading} 
          onClick={(e) => handleSubmit(e as React.FormEvent, false)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
        
        <Button 
          type="button" 
          disabled={loading} 
          onClick={(e) => handleSubmit(e as React.FormEvent, true)}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update & Return"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChannelForm;
