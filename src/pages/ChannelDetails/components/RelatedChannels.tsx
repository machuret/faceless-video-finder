import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Channel } from "@/types/youtube";
import { supabase } from "@/integrations/supabase/client";
import { generateChannelSlug } from "@/pages/ChannelDetails";
import ChannelCard from "@/components/home/ChannelCard";
import { Loader2 } from "lucide-react";
import { getChannelSlug } from "@/utils/channelUtils";

interface RelatedChannelsProps {
  currentChannelId: string;
}

const RelatedChannels = ({ currentChannelId }: RelatedChannelsProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomChannels = async () => {
      setLoading(true);
      try {
        // Fetch 9 random channels that are not the current one
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("*")
          .neq("id", currentChannelId)
          .order("created_at", { ascending: false })
          .limit(50); // Fetch more than we need so we can randomize
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Shuffle and take first 9
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          const randomChannels = shuffled.slice(0, 9);
          setChannels(randomChannels as Channel[]);
        }
      } catch (error) {
        console.error("Error fetching random channels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomChannels();
  }, [currentChannelId]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (channels.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-2xl font-semibold mb-6">Explore more Faceless Youtube Channels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <ChannelCard 
            key={channel.id} 
            channel={channel}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedChannels;
