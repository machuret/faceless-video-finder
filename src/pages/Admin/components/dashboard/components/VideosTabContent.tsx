
import React from 'react';
import { Channel } from '@/types/youtube';
import ChannelListDisplay from './ChannelListDisplay';
import TopVideosPreview from '@/pages/Admin/components/channel-videos/TopVideosPreview';
import { extractYoutubeChannelId } from '@/services/channels/improvement-queries';

interface VideosTabContentProps {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  selectedChannel: Channel | null;
  onChannelSelect: (channel: Channel) => void;
  onRetry: () => void;
}

const VideosTabContent: React.FC<VideosTabContentProps> = ({
  channels,
  loading,
  error,
  selectedChannel,
  onChannelSelect,
  onRetry
}) => {
  // In the videos tab, we don't need custom actions, we only need to select a channel
  const renderActions = () => null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium mb-3">Select Channel</h3>
        <ChannelListDisplay
          channels={channels}
          loading={loading}
          error={error}
          selectedChannel={selectedChannel}
          onSelect={onChannelSelect}
          renderActions={renderActions}
          onRetry={onRetry}
        />
      </div>
      
      <div>
        {selectedChannel && (
          <TopVideosPreview 
            channelId={selectedChannel.id}
            youtubeChannelId={selectedChannel.channel_url ? extractYoutubeChannelId(selectedChannel.channel_url) || undefined : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default VideosTabContent;
