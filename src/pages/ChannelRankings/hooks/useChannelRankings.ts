
import { useQuery } from "@tanstack/react-query";
import { fetchAllChannels } from "@/services/channelService";
import { Channel } from "@/types/youtube";
import { toast } from "sonner";

type RankingMetric = "revenue_per_video" | "revenue_per_month" | "total_subscribers" | "total_views";

export const useChannelRankings = (rankingMetric: RankingMetric) => {
  const { data: channels, isLoading, error, refetch } = useQuery({
    queryKey: ["channels", "rankings", rankingMetric],
    queryFn: async () => {
      try {
        const allChannels = await fetchAllChannels();
        
        // Filter out channels without the ranking metric
        const filteredChannels = allChannels.filter(channel => {
          const value = channel[rankingMetric as keyof Channel];
          return value !== null && value !== undefined && Number(value) > 0;
        });
        
        // Sort channels by the ranking metric in descending order
        const sortedChannels = [...filteredChannels].sort((a, b) => {
          const aValue = Number(a[rankingMetric as keyof Channel]) || 0;
          const bValue = Number(b[rankingMetric as keyof Channel]) || 0;
          return bValue - aValue;
        });
        
        // Return top 100 channels
        return sortedChannels.slice(0, 100);
      } catch (error) {
        console.error("Error fetching channel rankings:", error);
        toast.error("Failed to load channel rankings");
        throw error;
      }
    }
  });

  return {
    channels,
    isLoading,
    error,
    refetch
  };
};
