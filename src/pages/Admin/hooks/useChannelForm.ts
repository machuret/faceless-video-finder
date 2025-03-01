import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChannelFormData } from "../components/ChannelForm";
import { DatabaseChannelType } from "@/types/youtube";

export const useChannelForm = () => {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const [loading, setLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<ChannelFormData>({
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
  });

  useEffect(() => {
    if (channelId) {
      setIsEditMode(true);
      fetchChannelData(channelId);
    }
  }, [channelId]);

  const fetchChannelData = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Error fetching channel: ${error.message}`);
      }

      if (!data) {
        throw new Error("Channel not found");
      }

      console.log("Channel data fetched for editing:", data);

      const formattedStartDate = data.start_date 
        ? new Date(data.start_date).toISOString().split('T')[0]
        : "";

      setFormData({
        video_id: data.video_id || "",
        channel_title: data.channel_title || "",
        channel_url: data.channel_url || "",
        description: data.description || "",
        screenshot_url: data.screenshot_url || "",
        total_subscribers: data.total_subscribers?.toString() || "",
        total_views: data.total_views?.toString() || "",
        start_date: formattedStartDate,
        video_count: data.video_count?.toString() || "",
        cpm: data.cpm?.toString() || "4",
        channel_type: data.channel_type || "",
      });

      toast.success("Channel data loaded successfully");
    } catch (error) {
      console.error("Error fetching channel data:", error);
      toast.error(error instanceof Error 
        ? error.message 
        : "Failed to load channel data");
    } finally {
      setLoading(false);
    }
  };

  const fetchYoutubeData = async () => {
    if (!youtubeUrl) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching YouTube data for URL:", youtubeUrl);
      
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { url: youtubeUrl }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Failed to fetch YouTube data: ${error.message}`);
      }

      if (!data) {
        console.error('No data received');
        throw new Error("No data received from YouTube API. Please check if the URL is correct.");
      }

      console.log("Received data from YouTube API:", data);

      const formattedStartDate = data.start_date 
        ? new Date(data.start_date).toISOString().split('T')[0]
        : "";

      setFormData({
        video_id: data.video_id || "",
        channel_title: data.channel_title || "",
        channel_url: data.channel_url || "",
        description: data.description || "",
        screenshot_url: data.screenshot_url || "",
        total_subscribers: data.total_subscribers?.toString() || "",
        total_views: data.total_views?.toString() || "",
        start_date: formattedStartDate,
        video_count: data.video_count?.toString() || "",
        cpm: "4",
        channel_type: "",
      });

      toast.success("Channel data fetched successfully");
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error instanceof Error 
        ? `Failed to fetch channel data: ${error.message}` 
        : "Failed to fetch channel data. Please check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.video_id || !formData.channel_title || !formData.channel_url) {
        throw new Error("Please fill in all required fields: Channel ID, Title, and URL");
      }

      const dataToSubmit = {
        video_id: formData.video_id.trim(),
        channel_title: formData.channel_title.trim(),
        channel_url: formData.channel_url.trim(),
        description: formData.description.trim() || null,
        screenshot_url: formData.screenshot_url || null,
        total_subscribers: formData.total_subscribers ? parseInt(formData.total_subscribers) : null,
        total_views: formData.total_views ? parseInt(formData.total_views) : null,
        start_date: formData.start_date || null,
        video_count: formData.video_count ? parseInt(formData.video_count) : null,
        cpm: formData.cpm ? parseFloat(formData.cpm) : 4,
        channel_type: formData.channel_type || "other"
      };

      console.log(`${isEditMode ? "Updating" : "Submitting"} data to Supabase:`, dataToSubmit);

      let result;
      
      if (isEditMode && channelId) {
        result = await supabase
          .from("youtube_channels")
          .update(dataToSubmit)
          .eq("id", channelId)
          .select();
      } else {
        result = await supabase
          .from("youtube_channels")
          .insert(dataToSubmit)
          .select();
      }

      const { data, error } = result;

      if (error) {
        console.error("Database error:", error);
        if (error.code === "23505") {
          throw new Error("This channel has already been added to the database");
        } else if (error.code === "42501") {
          throw new Error("You don't have permission to add channels. Please check your login status.");
        } else if (error.code === "42P17") {
          throw new Error("There's an issue with database permissions. Please contact the administrator.");
        }
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`${isEditMode ? "Update" : "Insert"} successful:`, data);
      toast.success(`Channel ${isEditMode ? "updated" : "added"} successfully!`);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error 
        ? `Failed to ${isEditMode ? "update" : "add"} channel: ${error.message}` 
        : `An unexpected error occurred while ${isEditMode ? "updating" : "adding"} the channel`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScreenshotChange = (url: string) => {
    setFormData((prev) => ({ ...prev, screenshot_url: url }));
  };

  return {
    loading,
    youtubeUrl,
    isEditMode,
    formData,
    setYoutubeUrl,
    fetchYoutubeData,
    handleSubmit,
    handleChange,
    handleScreenshotChange
  };
};
