
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";
import { toast } from "sonner";

export const useChannelDetails = (channelId?: string, slug?: string) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videoStats, setVideoStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channelId) {
      // Direct ID lookup
      fetchChannelDetails(channelId);
    } else if (slug) {
      // Extract ID from slug (format: title-id)
      const idFromSlug = extractIdFromSlug(slug);
      if (idFromSlug) {
        fetchChannelDetails(idFromSlug);
      } else {
        setError("Invalid channel URL");
        setLoading(false);
      }
    }
  }, [channelId, slug]);

  const extractIdFromSlug = (slug: string): string | null => {
    // The ID is expected to be the last part after the last hyphen
    const parts = slug.split('-');
    const potentialId = parts[parts.length - 1];
    
    // Basic UUID validation (simple regex for UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(potentialId) ? potentialId : null;
  };

  const fetchChannelDetails = async (id: string) => {
    setLoading(true);
    try {
      console.log(`Fetching channel details for ID: ${id}`);
      
      // Fetch channel details
      const { data: channelData, error: channelError } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", id)
        .single();

      if (channelError) {
        console.error("Error fetching channel details:", channelError);
        throw channelError;
      }
      
      if (!channelData) {
        console.error("No channel found with ID:", id);
        throw new Error("Channel not found");
      }
      
      // Fetch video stats for this channel
      const { data: videoData, error: videoError } = await supabase
        .from("youtube_video_stats")
        .select("*")
        .eq("channel_id", id);
        
      if (videoError) throw videoError;

      setChannel(channelData as unknown as Channel);
      setVideoStats(videoData || []);
    } catch (err) {
      console.error("Error fetching channel details:", err);
      toast.error("Failed to load channel details");
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return { channel, videoStats, loading, error };
};
