
import React from 'react';
import { Channel } from '@/types/youtube';
import { Button } from '@/components/ui/button';
import ChannelListDisplay from './ChannelListDisplay';
import { useBulkStatsFetcher } from '@/components/youtube/channel-list/components/hooks/useBulkStatsFetcher';

interface StatsTabContentProps {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  onRetry: () => void;
  onNavigateToEdit: (channelId: string) => void;
}

const StatsTabContent: React.FC<StatsTabContentProps> = ({
  channels,
  loading,
  error,
  selectedChannel,
  onChannelSelect,
  onRetry,
  onNavigateToEdit
}) => {
  const statsFetcher = useBulkStatsFetcher();

  const generateStats = (channel: Channel) => {
    const selectedChannel = {
      id: channel.id,
      url: channel.channel_url,
      title: channel.channel_title
    };
    
    statsFetcher.fetchStatsForChannels([selectedChannel])
      .then(() => {
        onRetry(); // Refresh the list
      });
  };

  const renderActions = (channel: Channel) => (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the row click
          generateStats(channel);
        }}
        disabled={statsFetcher.isProcessing}
      >
        {statsFetcher.currentChannel === channel.channel_title ? 'Processing...' : 'Fetch Stats'}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the row click
          onNavigateToEdit(channel.id);
        }}
      >
        Edit
      </Button>
    </div>
  );

  return (
    <ChannelListDisplay
      channels={channels}
      loading={loading}
      error={error}
      selectedChannel={selectedChannel}
      onSelect={onChannelSelect}
      renderActions={renderActions}
      onRetry={onRetry}
    />
  );
};

export default StatsTabContent;
