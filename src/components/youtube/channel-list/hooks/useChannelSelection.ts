
import { useState } from "react";
import { Channel } from "@/types/youtube";

/**
 * Hook for managing channel selection
 */
export const useChannelSelection = (channels: Channel[]) => {
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());

  const toggleChannelSelection = (channelId: string) => {
    setSelectedChannels(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(channelId)) {
        newSelection.delete(channelId);
      } else {
        newSelection.add(channelId);
      }
      return newSelection;
    });
  };

  const clearSelection = () => {
    setSelectedChannels(new Set());
  };

  const selectAllChannels = () => {
    const channelIds = channels.map(channel => channel.id);
    setSelectedChannels(new Set(channelIds));
  };

  const isChannelSelected = (channelId: string) => {
    return selectedChannels.has(channelId);
  };

  const getSelectedCount = () => {
    return selectedChannels.size;
  };

  const getSelectedChannels = () => {
    return channels
      .filter(channel => selectedChannels.has(channel.id))
      .map(channel => ({
        id: channel.id,
        url: channel.channel_url,
        title: channel.channel_title
      }));
  };

  return {
    selectedChannels,
    toggleChannelSelection,
    clearSelection,
    selectAllChannels,
    isChannelSelected,
    getSelectedCount,
    getSelectedChannels
  };
};
