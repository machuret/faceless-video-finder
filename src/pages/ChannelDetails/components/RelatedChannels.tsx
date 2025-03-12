
import { useEffect, useState } from "react";
import { Channel } from "@/types/youtube";
import ChannelCard from "@/components/home/ChannelCard";
import { Loader2 } from "lucide-react";
import { fetchRelatedChannels } from "@/services/channelApi";
import { toast } from "sonner";

interface RelatedChannelsProps {
  currentChannelId: string;
  niche?: string;
}

const RelatedChannels = ({ currentChannelId, niche }: RelatedChannelsProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRelatedChannels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Loading related channels for ID: ${currentChannelId}, niche: ${niche || 'any'}`);
        const relatedChannels = await fetchRelatedChannels(currentChannelId, niche);
        
        if (relatedChannels.length === 0) {
          // No results, but not an error
          console.log("No related channels found");
        } else {
          console.log(`Found ${relatedChannels.length} related channels`);
        }
        
        setChannels(relatedChannels);
      } catch (err) {
        console.error("Error loading related channels:", err);
        setError("Failed to load related channels");
        toast.error("Failed to load related channels");
      } finally {
        setLoading(false);
      }
    };

    if (currentChannelId) {
      loadRelatedChannels();
    }
  }, [currentChannelId, niche]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
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
