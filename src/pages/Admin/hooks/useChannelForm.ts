
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChannelFormState } from "./useChannelFormState";
import { useChannelFormHandlers } from "./useChannelFormHandlers";
import { useYouTubeDataFetcher } from "./youtube-data-fetcher";
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

  const { 
    handleChange, 
    handleFieldChange, 
    handleScreenshotChange, 
    handleKeywordsChange,
    handleBooleanFieldChange 
  } = useChannelFormHandlers(formData, setFormData);
  
  const { fetchYoutubeData, debugInfo } = 
    useYouTubeDataFetcher(youtubeUrl, setLoading, setFormData);
  
  const { fetchChannelData } = 
    useChannelDataFetcher(setLoading, setFormData);
  
  const { handleSubmit: submitForm } = 
    useChannelFormSubmission(formData, setLoading, false);

  // Custom submit handler that accepts returnToList parameter
  const handleSubmit = async (e: React.FormEvent, returnToList: boolean = true) => {
    return submitForm(e, returnToList);
  };

  // To prevent multiple calls to fetchChannelData
  const hasInitialized = useRef(false);

  // Use a more controlled approach with useEffect and add channelId dependency
  // to prevent multiple calls when params don't change
  useEffect(() => {
    console.log("🔍 Channel ID from URL params:", channelId);
    
    if (channelId && !hasInitialized.current) {
      console.log("📝 EDIT MODE ACTIVATED - Channel ID:", channelId);
      setIsEditMode(true);
      // Fetch channel data once when the component mounts or channelId changes
      fetchChannelData(channelId);
      hasInitialized.current = true;
    } else if (!channelId && !hasInitialized.current) {
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
        country: "US", // Default to US
        channel_category: "entertainment", // Default to entertainment
        notes: "",
        keywords: [],
        niche: "",
        is_editor_verified: false
      });
      hasInitialized.current = true;
    }
  }, [channelId]); // Only dependency is channelId to prevent unnecessary reruns

  return {
    loading,
    youtubeUrl,
    isEditMode,
    formData,
    debugInfo,
    setYoutubeUrl,
    fetchYoutubeData,
    handleSubmit,
    handleChange,
    handleScreenshotChange,
    handleFieldChange,
    handleKeywordsChange,
    handleBooleanFieldChange
  };
};
