
import { useEffect, useState } from "react";
import { Channel } from "@/types/youtube";
import ChannelCard from "@/components/home/ChannelCard";
import { Loader2, AlertCircle } from "lucide-react";
import { fetchRelatedChannels } from "@/services/channelApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface RelatedChannelsProps {
  currentChannelId: string;
  niche?: string;
}

const RelatedChannels = ({ currentChannelId, niche }: RelatedChannelsProps) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadRelatedChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Loading related channels for ID: ${currentChannelId}, niche: ${niche || 'any'}, retry: ${retryCount}`);
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
      
      // Only show toast on first error to avoid spamming
      if (retryCount === 0) {
        toast.error("Failed to load related channels");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentChannelId) {
      loadRelatedChannels();
    }
  }, [currentChannelId, niche, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mt-8 mb-12">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={handleRetry}
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="mt-8 mb-12 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <h2 className="text-2xl font-semibold mb-2">No Related Channels Found</h2>
        <p className="text-gray-600 mb-4">We couldn't find any other channels similar to this one at the moment.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-2xl font-semibold mb-6">Explore more Faceless YouTube Channels</h2>
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
