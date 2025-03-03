
import { useState, useEffect, useCallback } from "react";
import { ChannelsState, CHANNELS_PER_PAGE } from "./types";
import { fetchChannelCount, fetchChannelsData, fetchFeaturedChannelsData } from "./api";

export const useChannels = () => {
  // Initial state
  const initialState: ChannelsState = {
    channels: [],
    featuredChannels: [],
    loading: true,
    error: null,
    totalChannels: 0,
    currentPage: 1,
    showFeatured: true
  };

  // State
  const [state, setState] = useState<ChannelsState>(initialState);
  
  // Fetch channels method 
  const fetchChannels = useCallback(async (selectedCategory: string = "", page: number = 1) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Get count for pagination
      const count = await fetchChannelCount(selectedCategory);
      
      // Fetch the channels
      const channels = await fetchChannelsData(selectedCategory, page);
      
      setState(prev => ({
        ...prev,
        channels,
        totalChannels: count,
        loading: false
      }));
    } catch (error: any) {
      console.error("Error in fetchChannels:", error);
      setState(prev => ({
        ...prev,
        error: error.message || "An unexpected error occurred",
        channels: [],
        loading: false
      }));
    }
  }, []);

  // Fetch featured channels method
  const fetchFeaturedChannels = useCallback(async () => {
    try {
      const featuredChannels = await fetchFeaturedChannelsData();
      setState(prev => ({ ...prev, featuredChannels }));
    } catch (error) {
      console.error("Error in fetchFeaturedChannels:", error);
      setState(prev => ({ ...prev, featuredChannels: [] }));
    }
  }, []);

  // Set current page method
  const setCurrentPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  // Set show featured method
  const setShowFeatured = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showFeatured: show }));
  }, []);

  return {
    ...state,
    setCurrentPage,
    setShowFeatured,
    fetchChannels,
    fetchFeaturedChannels,
    CHANNELS_PER_PAGE,
  };
};
