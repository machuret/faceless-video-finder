
import { useState, useCallback } from 'react';
import { Channel } from '@/types/youtube';

export const useChannelSelection = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  const handleChannelSelect = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedChannel(null);
  }, []);

  return {
    selectedChannel,
    setSelectedChannel,
    handleChannelSelect,
    clearSelection
  };
};
