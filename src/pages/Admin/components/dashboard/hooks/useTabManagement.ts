
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchChannelsToImprove } from '@/services/channels/improvement-queries';
import { Channel } from '@/types/youtube';

type TabValue = 'no-screenshot' | 'no-type' | 'no-stats' | 'no-keywords' | 'videos';

export const useTabManagement = (
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setSelectedChannel: React.Dispatch<React.SetStateAction<Channel | null>>
) => {
  const [activeTab, setActiveTab] = useState<TabValue>('no-screenshot');

  const fetchChannelsForTab = useCallback(async (tabValue: TabValue) => {
    setLoading(true);
    setSelectedChannel(null);
    setError(null);
    
    let options: Record<string, boolean | number> = { limit: 20 };
    
    // Set options based on tab
    switch (tabValue) {
      case 'no-screenshot':
        options.missingScreenshot = true;
        break;
      case 'no-type':
        options.missingType = true;
        break;
      case 'no-stats':
        options.missingStats = true;
        break;
      case 'no-keywords':
        options.missingKeywords = true;
        break;
      case 'videos':
        options.hasStats = true;
        break;
    }
    
    try {
      const { channels, error } = await fetchChannelsToImprove(options);
      
      if (error) {
        setError(error);
        toast.error(`Error loading channels: ${error}`);
      } else {
        setChannels(channels);
        
        if (channels.length > 0) {
          setSelectedChannel(channels[0]);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Failed to fetch channels. ${errorMessage}`);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [setChannels, setError, setLoading, setSelectedChannel]);

  const handleTabChange = useCallback((value: string) => {
    const tabValue = value as TabValue;
    setActiveTab(tabValue);
    fetchChannelsForTab(tabValue);
  }, [fetchChannelsForTab]);

  return {
    activeTab,
    handleTabChange,
    fetchChannelsForTab
  };
};
