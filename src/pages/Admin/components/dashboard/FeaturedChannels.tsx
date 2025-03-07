
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { generateChannelSlug } from "@/pages/ChannelDetails";

interface Channel {
  id: string;
  channel_title: string;
  channel_url: string;
  total_subscribers: number | null;
  total_views: number | null;
  screenshot_url: string | null;
  is_featured?: boolean;
}

const FeaturedChannels = () => {
  const [featuredChannels, setFeaturedChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeaturedChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('youtube_channels')
          .select('id, channel_title, channel_url, total_subscribers, total_views, screenshot_url')
          .eq('is_featured', true)
          .order('total_subscribers', { ascending: false })
          .limit(3);
        
        if (error) {
          console.error("Error fetching featured channels:", error);
          return;
        }
        
        // Explicitly map to our Channel type to avoid type issues
        const channels: Channel[] = data.map((item: any) => ({
          id: item.id,
          channel_title: item.channel_title,
          channel_url: item.channel_url,
          total_subscribers: item.total_subscribers,
          total_views: item.total_views,
          screenshot_url: item.screenshot_url,
          is_featured: true
        }));
        
        setFeaturedChannels(channels);
      } catch (err) {
        console.error("Error in featured channels:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedChannels();
  }, []);
  
  if (loading) {
    return (
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Featured Channels</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded"></div>
          ))}
        </div>
      </Card>
    );
  }
  
  if (featuredChannels.length === 0) {
    return null;
  }
  
  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Featured Channels</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featuredChannels.map((channel) => {
          const channelSlug = generateChannelSlug(channel.channel_title);
          const seoUrl = `/channel/${channelSlug}-${channel.id}`;
          
          return (
            <Link key={channel.id} to={seoUrl}>
              <div className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  {channel.screenshot_url ? (
                    <img 
                      src={channel.screenshot_url} 
                      alt={channel.channel_title} 
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500">No img</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium truncate">{channel.channel_title}</h3>
                    <p className="text-sm text-gray-600">
                      {channel.total_subscribers ? `${(channel.total_subscribers / 1000).toFixed(1)}K subscribers` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};

export default FeaturedChannels;
