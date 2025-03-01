
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { SearchForm } from "@/components/channel-earnings/SearchForm";
import { ChannelResults } from "@/components/channel-earnings/ChannelResults";
import { NoResults } from "@/components/channel-earnings/NoResults";
import { searchChannel, formatNumber, calculateEarnings } from "@/utils/channelSearch";

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
    
    if (!channelInput.trim()) return;

    setIsLoading(true);
    
    try {
      const data = await searchChannel(channelInput);

      if (data && data.length > 0) {
        // Use the first matching channel
        const channel = data[0];
        setChannelTitle(channel.channel_title || "Unknown Channel");
        setTotalSubscribers(channel.total_subscribers || 0);
        setTotalViews(channel.total_views || 0);
        
        // Calculate earnings
        const estimatedEarnings = calculateEarnings(channel.total_views || 0);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">YouTube Channel Earnings Estimator</h1>
        
        <div className="max-w-4xl mx-auto">
          <SearchForm 
            isLoading={isLoading}
            channelInput={channelInput}
            setChannelInput={setChannelInput}
            onSearch={handleSearch}
          />
          
          {channelFound && (
            <ChannelResults
              channelTitle={channelTitle}
              totalSubscribers={totalSubscribers}
              totalViews={totalViews}
              totalEarnings={totalEarnings}
              avgEarningsPerVideo={avgEarningsPerVideo}
              formatNumber={formatNumber}
            />
          )}
          
          {channelFound === false && <NoResults />}
        </div>
      </div>
    </div>
  );
}
