
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search, DollarSign, Users, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ChannelEarnings() {
  const { toast } = useToast();
  const [channelInput, setChannelInput] = useState<string>("");
  const [totalSubscribers, setTotalSubscribers] = useState<number>(0);
  const [totalViews, setTotalViews] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [avgEarningsPerVideo, setAvgEarningsPerVideo] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [channelFound, setChannelFound] = useState<boolean | null>(null);
  const [channelTitle, setChannelTitle] = useState<string>("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!channelInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a channel name, ID, or URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // First, try to search in our database
      let query = supabase
        .from("youtube_channels")
        .select("*");

      // If the input looks like a URL, extract channel name or ID
      let searchTerm = channelInput;
      if (channelInput.includes("youtube.com") || channelInput.includes("youtu.be")) {
        // Extract channel name or ID from URL
        const urlPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = channelInput.match(urlPattern);
        if (match && match[1]) {
          searchTerm = match[1];
        } else if (channelInput.includes("/@")) {
          // Handle @username format
          const handleMatch = channelInput.match(/\/@([^\/\s]+)/);
          if (handleMatch && handleMatch[1]) {
            searchTerm = handleMatch[1];
          }
        }
      }

      // Try to match by channel title, URL, or video ID
      query = query.or(`channel_title.ilike.%${searchTerm}%,channel_url.ilike.%${searchTerm}%,video_id.eq.${searchTerm}`);
      
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Use the first matching channel
        const channel = data[0];
        setChannelTitle(channel.channel_title || "Unknown Channel");
        setTotalSubscribers(channel.total_subscribers || 0);
        setTotalViews(channel.total_views || 0);
        
        // Calculate earnings (rough estimate)
        // Using $0.25 to $4.00 per 1000 views as a typical range for YouTube CPM
        // We'll use $1.00 per 1000 views as a conservative estimate
        const estimatedEarnings = (channel.total_views || 0) / 1000 * 1.00;
        setTotalEarnings(estimatedEarnings);
        
        // Calculate avg earnings per video if video count is available
        if (channel.video_count && channel.video_count > 0) {
          setAvgEarningsPerVideo(estimatedEarnings / channel.video_count);
        } else {
          setAvgEarningsPerVideo(0);
        }
        
        setChannelFound(true);
      } else {
        // No channel found
        setChannelFound(false);
        resetData();
        
        toast({
          title: "Channel not found",
          description: "We couldn't find this channel in our database.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error searching for channel:", error);
      toast({
        title: "Error",
        description: "Failed to search for the channel. Please try again.",
        variant: "destructive",
      });
      setChannelFound(false);
      resetData();
    } finally {
      setIsLoading(false);
    }
  };

  const resetData = () => {
    setTotalSubscribers(0);
    setTotalViews(0);
    setTotalEarnings(0);
    setAvgEarningsPerVideo(0);
    setChannelTitle("");
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    } else {
      return num.toString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">YouTube Channel Earnings Estimator</h1>
        
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search YouTube Channel</CardTitle>
              <CardDescription>
                Enter a channel name, ID, or URL to estimate earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Channel name, ID, or URL..."
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {channelFound && (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-center">
                {channelTitle}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Total Subscribers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{formatNumber(totalSubscribers)}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-500" />
                      Total Video Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{formatNumber(totalViews)}</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Total Estimated Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-700">
                      ${totalEarnings.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Based on average YouTube CPM rates
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Average Earnings per Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-700">
                      ${avgEarningsPerVideo.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Estimated average revenue per video
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> These estimates are based on industry averages and actual earnings may vary. 
                  YouTube typically pays creators between $0.25 to $4.00 per 1000 views, depending on factors such as 
                  niche, audience location, and engagement.
                </p>
              </div>
            </>
          )}
          
          {channelFound === false && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No channel found with the provided information.</p>
              <p className="text-sm text-gray-400">Try searching with a different channel name or ID.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
