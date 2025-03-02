
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelCategory } from "@/types/youtube";
import { toast } from "sonner";

const CHANNELS_PER_PAGE = 9;

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [featuredChannels, setFeaturedChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalChannels, setTotalChannels] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFeatured, setShowFeatured] = useState(true);

  const fetchChannels = async (selectedCategory: ChannelCategory | "" = "", page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      // First, get count for pagination
      let countQuery = supabase
        .from("youtube_channels")
        .select("id", { count: "exact" });

      if (selectedCategory) {
        countQuery = countQuery.eq("channel_category", selectedCategory as ChannelCategory);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) {
        throw countError;
      }
      
      setTotalChannels(count || 0);

      // Then fetch the actual data with pagination
      let query = supabase
        .from("youtube_channels")
        .select("*, videoStats:youtube_video_stats(*)")
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("channel_category", selectedCategory as ChannelCategory);
      }

      // Add pagination
      const from = (page - 1) * CHANNELS_PER_PAGE;
      const to = from + CHANNELS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Use type assertion without circular references
      setChannels(data as any as Channel[]);
    } catch (error: any) {
      console.error("Error fetching channels:", error);
      toast.error("Failed to fetch channels");
      setError(error.message || "An unexpected error occurred");
      setChannels([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*, videoStats:youtube_video_stats(*)")
        .eq("is_featured", true)
        .limit(3);

      if (error) {
        throw error;
      }

      // Use type assertion without circular references
      setFeaturedChannels(data as any as Channel[]);
    } catch (error: any) {
      console.error("Error fetching featured channels:", error);
      setFeaturedChannels([]);
    }
  };

  return {
    channels,
    featuredChannels,
    loading,
    error,
    totalChannels,
    currentPage,
    setCurrentPage,
    showFeatured,
    setShowFeatured,
    fetchChannels,
    fetchFeaturedChannels,
    CHANNELS_PER_PAGE,
  };
};
