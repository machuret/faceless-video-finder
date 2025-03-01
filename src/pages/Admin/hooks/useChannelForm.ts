
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useChannelFormState } from "./useChannelFormState";
import { useChannelFormHandlers } from "./useChannelFormHandlers";
import { useYouTubeDataFetcher } from "./useYouTubeDataFetcher";
import { useChannelDataFetcher } from "./useChannelDataFetcher";
import { useChannelFormSubmission } from "./useChannelFormSubmission";

export const useChannelForm = () => {
  const { channelId } = useParams();
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
    if (channelId) {
      setIsEditMode(true);
      fetchChannelData(channelId);
    }
  }, [channelId]);

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
