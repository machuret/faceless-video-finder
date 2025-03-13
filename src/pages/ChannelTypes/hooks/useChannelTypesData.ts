
import { useQuery } from "@tanstack/react-query";
import { fetchChannelTypes } from "@/services/channelTypeService";
import { toast } from "sonner";
import { useMemo } from "react";
import { ChannelTypeInfo } from "@/services/channelTypeService";

export const useChannelTypesData = () => {
  const { 
    data: types = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['channel-types'],
    queryFn: fetchChannelTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(attempt * 1000, 5000),
    // Catch and handle errors
    onError: (err) => {
      console.error("Error fetching channel types:", err);
      toast.error("Failed to load channel types");
    }
  });
  
  // Sort types by label and memoize to prevent unnecessary rerenders
  const sortedTypes = useMemo(() => {
    return [...types].sort((a, b) => a.label.localeCompare(b.label));
  }, [types]);

  return {
    types: sortedTypes,
    isLoading,
    error,
    refetch
  };
};
