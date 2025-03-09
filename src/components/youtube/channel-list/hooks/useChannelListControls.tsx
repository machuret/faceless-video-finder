
import { useState, useCallback, useMemo } from "react";
import { Channel } from "@/types/youtube";

export const useChannelListControls = (channels: Channel[] | null) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showSelectionControls, setShowSelectionControls] = useState(false);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  
  const toggleAlphabeticalSort = useCallback(() => {
    setSortAlphabetically(prev => !prev);
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setShowSelectionControls(prev => !prev);
  }, []);

  // Apply sorting to channels if needed
  const sortedChannels = useMemo(() => {
    if (!channels) return null;
    
    if (sortAlphabetically) {
      return [...channels].sort((a, b) => 
        (a.channel_title || "").localeCompare(b.channel_title || "")
      );
    }
    
    return channels;
  }, [channels, sortAlphabetically]);

  return {
    currentPage,
    setCurrentPage,
    showSelectionControls,
    setShowSelectionControls,
    sortAlphabetically,
    toggleAlphabeticalSort,
    toggleSelectionMode,
    sortedChannels
  };
};
