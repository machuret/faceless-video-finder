
import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { ChannelFormData } from "@/types/forms";
import { toast } from "sonner";

export const useChannelFormHandlers = (
  formData: ChannelFormData,
  setFormData: Dispatch<SetStateAction<ChannelFormData>>
) => {
  // Standard input handling
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Input change - ${name}: ${value}`);
    
    // Convert form field names to database column names
    const fieldMap: Record<string, keyof ChannelFormData> = {
      'video_id': 'video_id',
      'channel_title': 'channel_title',
      'channel_url': 'channel_url',
      'total_subscribers': 'total_subscribers',
      'total_views': 'total_views',
      'start_date': 'start_date',
      'video_count': 'video_count',
      'cpm': 'cpm',
      'screenshot_url': 'screenshot_url'
    };
    
    const field = fieldMap[name] || name as keyof ChannelFormData;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Generic field update handler (for non-input elements)
  const handleFieldChange = (name: string, value: string) => {
    console.log(`Field change - ${name}: ${value}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Keywords handler
  const handleKeywordsChange = (keywords: string[]) => {
    console.log("Keywords change:", keywords);
    
    setFormData(prev => ({
      ...prev,
      keywords
    }));
  };

  // Screenshot URL handler
  const handleScreenshotChange = (url: string) => {
    if (!url) {
      console.log("Empty screenshot URL provided");
      return;
    }

    console.log("New screenshot URL:", url);
    setFormData(prev => ({
      ...prev,
      screenshot_url: url
    }));

    // Toast is now handled in the component that calls the screenshot function
  };

  return {
    handleChange,
    handleFieldChange,
    handleKeywordsChange,
    handleScreenshotChange
  };
};
