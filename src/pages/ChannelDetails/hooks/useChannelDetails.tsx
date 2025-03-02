
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";
import { toast } from "sonner";

export const useChannelDetails = (channelId: string | undefined) => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [videoStats, setVideoStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (channelId) {
      fetchChannelDetails(channelId);
    }
  }, [channelId]);

  const fetchChannelDetails = async (id: string) => {
    setLoading(true);
    try {
      // Fetch channel details
      const { data: channelData, error: channelError } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("id", id)
        .single();

      if (channelError) throw channelError;
      
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
