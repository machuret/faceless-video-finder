
import { useState } from "react";
import { ChannelFormData } from "../components/ChannelForm";

export const useChannelFormState = (initialState: ChannelFormData = {
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
}) => {
  const [loading, setLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ChannelFormData>(initialState);

  return {
    loading,
    setLoading,
    youtubeUrl,
    setYoutubeUrl,
    isEditMode,
    setIsEditMode,
    formData,
    setFormData
  };
};
