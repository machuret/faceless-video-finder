
import { useChannelForm } from "../hooks/useChannelForm";
import ChannelForm from "./ChannelForm";
import { toast } from "sonner";
import { useEffect } from "react";

const ChannelFormContainer = () => {
  const {
    loading,
    isEditMode,
    formData,
    handleSubmit,
    handleChange,
    handleScreenshotChange,
    handleFieldChange,
    handleKeywordsChange,
    handleBooleanFieldChange,
    initializeFormWithChannel
  } = useChannelForm();

  useEffect(() => {
    // Check for URL parameters that might indicate we're in edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const channelIdParam = urlParams.get('id');
    
    if (channelIdParam && !isEditMode) {
      // This could indicate we have a channel ID but the form didn't load it properly
      console.log("Channel ID parameter detected but form not in edit mode:", channelIdParam);
      
      // Try to initialize the form with the channel ID from the URL
      if (initializeFormWithChannel) {
        initializeFormWithChannel(channelIdParam);
        toast.info("Loading channel data for editing...");
      }
    }
  }, [isEditMode, initializeFormWithChannel]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <ChannelForm 
        formData={formData}
        loading={loading}
        isEditMode={isEditMode}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handleScreenshotChange={handleScreenshotChange}
        handleFieldChange={handleFieldChange}
        handleKeywordsChange={handleKeywordsChange}
        handleBooleanFieldChange={handleBooleanFieldChange}
      />
    </div>
  );
};

export default ChannelFormContainer;
