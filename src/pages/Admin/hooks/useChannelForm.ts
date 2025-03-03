
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

  const { handleChange, handleFieldChange, handleScreenshotChange, handleKeywordsChange } = 
    useChannelFormHandlers(formData, setFormData);
  
  const { fetchYoutubeData } = 
    useYouTubeDataFetcher(youtubeUrl, setLoading, setFormData);
  
  const { fetchChannelData } = 
    useChannelDataFetcher(setLoading, setFormData);
  
  const { handleSubmit } = 
    useChannelFormSubmission(formData, setLoading);

  // Use a more controlled approach with useEffect and add channelId dependency
  // to prevent multiple calls when params don't change
  useEffect(() => {
    console.log("🔍 Channel ID from URL params:", channelId);
    
    if (channelId) {
      console.log("📝 EDIT MODE ACTIVATED - Channel ID:", channelId);
      setIsEditMode(true);
      // Fetch channel data once when the component mounts or channelId changes
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
        notes: "",
        keywords: []
      });
    }
  }, [channelId]); // Only dependency is channelId to prevent unnecessary reruns

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
    handleFieldChange,
    handleKeywordsChange
  };
};
