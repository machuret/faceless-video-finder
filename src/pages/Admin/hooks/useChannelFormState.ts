
import { useState } from "react";
import { ChannelFormData } from "@/types/forms";

export const useChannelFormState = () => {
  const [loading, setLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ChannelFormData>({
    id: "",
    video_id: "",
    channel_title: "",
    channel_url: "",
    description: "",
    ai_description: "",
    screenshot_url: "",
    total_subscribers: "",
    total_views: "",
    start_date: "",
    video_count: "",
    cpm: "4", // Default to $4 CPM
    channel_type: "",
    country: "US", // Default to US
    channel_category: "entertainment", // Default to entertainment
    notes: "",
    keywords: [],
    niche: "",
    is_editor_verified: false
  });

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
