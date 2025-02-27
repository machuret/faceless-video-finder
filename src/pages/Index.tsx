
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
        query = query.ilike("channel_title", `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Channel[];
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Faceless YouTube Channels</h1>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">Loading channels...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels?.map((channel) => (
              <Card key={channel.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  {channel.screenshot_url && (
                    <img
                      src={channel.screenshot_url}
                      alt={channel.channel_title}
                      className="w-full h-48 object-cover rounded-t-lg mb-4 cursor-pointer"
                      onClick={() => navigate(`/channel/${channel.id}`)}
                    />
                  )}
                  <CardTitle 
                    className="text-xl line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
                    onClick={() => navigate(`/channel/${channel.id}`)}
                  >
                    {channel.channel_title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {channel.description}
                    </p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{channel.total_subscribers?.toLocaleString()} subscribers</span>
                      <span>{channel.total_views?.toLocaleString()} views</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
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
        )}
        
        {channels?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No channels found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
