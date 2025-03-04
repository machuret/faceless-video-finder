
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Channel } from "@/types/youtube";

const FeaturedChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedChannels();
  }, []);

  const fetchFeaturedChannels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Create a properly typed array to avoid deep type instantiation
      const typedChannels: Channel[] = [];
      
      if (data) {
        data.forEach(item => {
          // Add only essential properties needed for display
          typedChannels.push({
            id: item.id,
            channel_title: item.channel_title,
            channel_url: item.channel_url,
            total_subscribers: item.total_subscribers,
            channel_type: item.channel_type,
            video_id: item.video_id,
          });
        });
      }
      
      setChannels(typedChannels);
    } catch (error) {
      console.error("Error fetching featured channels:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center mb-4">
          <Star className="text-yellow-500 h-5 w-5 mr-2" />
          <h2 className="text-xl font-semibold">Featured Channels</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (channels.length === 0) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center mb-4">
          <Star className="text-yellow-500 h-5 w-5 mr-2" />
          <h2 className="text-xl font-semibold">Featured Channels</h2>
        </div>
        <p className="text-gray-500 mb-2">No featured channels yet.</p>
        <p className="text-sm text-gray-400">
          Use the channel list below to mark channels as featured.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 mb-8">
      <div className="flex items-center mb-4">
        <Star className="text-yellow-500 h-5 w-5 mr-2" />
        <h2 className="text-xl font-semibold">Featured Channels</h2>
      </div>
      <div className="space-y-3">
        {channels.map(channel => (
          <div key={channel.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
            <div>
              <p className="font-medium">{channel.channel_title}</p>
              <p className="text-sm text-gray-500">
                {channel.total_subscribers?.toLocaleString() || 0} subscribers • {channel.channel_type || 'N/A'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/channel/${channel.id}`)}
            >
              View
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FeaturedChannels;
