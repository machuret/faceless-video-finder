
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChannelFormState } from "./useChannelFormState";
import { useChannelFormHandlers } from "./useChannelFormHandlers";
import { useYouTubeDataFetcher } from "./useYouTubeDataFetcher";
import { useChannelDataFetcher } from "./useChannelDataFetcher";
import { useChannelFormSubmission } from "./useChannelFormSubmission";

export const useChannelForm = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const {
    loading, 
    setLoading,
    youtubeUrl, 
    setYoutubeUrl,
    isEditMode, 
    setIsEditMode,
    formData, 
    setFormData
  } = useChannelFormState();

  const { handleChange, handleFieldChange, handleScreenshotChange } = 
    useChannelFormHandlers(formData, setFormData);
  
  const { fetchYoutubeData } = 
    useYouTubeDataFetcher(youtubeUrl, setLoading, setFormData);
  
  const { fetchChannelData } = 
    useChannelDataFetcher(setLoading, setFormData);
  
  const { handleSubmit } = 
    useChannelFormSubmission(isEditMode, channelId, formData, setLoading);

  // Initialize edit mode and fetch data if channelId exists
  useEffect(() => {
    console.log("🔍 Channel ID from URL params:", channelId);
    
    if (channelId) {
      console.log("📝 EDIT MODE ACTIVATED - Channel ID:", channelId);
      setIsEditMode(true);
      fetchChannelData(channelId);
    } else {
      console.log("✨ CREATE MODE ACTIVATED");
      setIsEditMode(false);
      // Initialize with empty form for create mode
      setFormData({
        video_id: "",
        channel_title: "",
        channel_url: "",
        description: "",
        screenshot_url: "",
        total_subscribers: "",
        total_views: "",
        start_date: "",
        video_count: "",
        cpm: "4",
        channel_type: "",
        country: "",
        channel_category: "",
        notes: ""
      });
    }
  }, [channelId, setIsEditMode, fetchChannelData, setFormData]);

  return {
    loading,
    youtubeUrl,
    isEditMode,
    formData,
    setYoutubeUrl,
    fetchYoutubeData,
    handleSubmit,
    handleChange,
    handleScreenshotChange,
    handleFieldChange
  };
};
