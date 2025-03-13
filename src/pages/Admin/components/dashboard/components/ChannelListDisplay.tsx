
import React from 'react';
import { Channel } from '@/types/youtube';
import { Button } from '@/components/ui/button';
import ChannelListItem from './ChannelListItem';
import { LoadingState } from '@/pages/Admin/components/facelessIdeas/components/LoadingState';

interface ChannelListDisplayProps {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  selectedChannel: Channel | null;
  onSelect: (channel: Channel) => void;
  renderActions: (channel: Channel) => React.ReactNode;
  onRetry: () => void;
}

const ChannelListDisplay: React.FC<ChannelListDisplayProps> = ({
  channels,
  loading,
  error,
  selectedChannel,
  onSelect,
  renderActions,
  onRetry
}) => {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-red-500 py-4">
        <p>{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry} 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (channels.length === 0) {
    return <div className="text-gray-500 py-4">No channels found in this category.</div>;
  }

  return (
    <div className="space-y-2 max-h-96 overflow-auto pr-2">
      {channels.map(channel => (
        <ChannelListItem 
          key={channel.id}
          channel={channel}
          isSelected={selectedChannel?.id === channel.id}
          onSelect={onSelect}
          renderActions={renderActions}
        />
      ))}
    </div>
  );
};

export default ChannelListDisplay;
