
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Channel {
  id: string;
  video_id: string;
  screenshot_url: string;
  channel_title: string;
  channel_url: string;
  total_views: number;
  total_subscribers: number;
  description: string;
  start_date: string;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: channels, isLoading } = useQuery({
    queryKey: ["channels", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("youtube_channels")
        .select("*");
      
      if (searchQuery) {
        query = query.or(`channel_title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query.order('total_subscribers', { ascending: false });
      if (error) throw error;
      return data as Channel[];
    },
  });

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Faceless YouTube Channels
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            Discover and analyze successful faceless YouTube channels across different niches
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full text-base py-6"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-base text-gray-600">Loading channels...</div>
          </div>
        ) : channels && channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {channels.map((channel) => (
              <Card key={channel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  {channel.screenshot_url && (
                    <img
                      src={channel.screenshot_url}
                      alt={channel.channel_title}
                      className="w-full h-48 object-cover rounded-lg mb-4 cursor-pointer"
                      onClick={() => navigate(`/channel/${channel.id}`)}
                    />
                  )}
                  <CardTitle 
                    className="text-xl font-semibold line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
                    onClick={() => navigate(`/channel/${channel.id}`)}
                  >
                    {channel.channel_title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-base text-gray-600 line-clamp-3">
                      {channel.description}
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span className="font-medium">{channel.total_subscribers?.toLocaleString() || 0} subscribers</span>
                      <span className="font-medium">{channel.total_views?.toLocaleString() || 0} views</span>
                    </div>
                    {channel.start_date && (
                      <div className="text-sm text-gray-500">
                        <span>Started: {formatDate(channel.start_date)}</span>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/channel/${channel.id}`)}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              {searchQuery ? "No channels found matching your search." : "No channels available. Check back later!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
