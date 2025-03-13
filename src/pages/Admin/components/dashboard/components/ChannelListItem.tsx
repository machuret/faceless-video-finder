
import React from 'react';
import { Button } from '@/components/ui/button';
import { Channel } from '@/types/youtube';

interface ChannelListItemProps {
  channel: Channel;
  isSelected?: boolean;
  onSelect: (channel: Channel) => void;
  renderActions: (channel: Channel) => React.ReactNode;
}

const ChannelListItem: React.FC<ChannelListItemProps> = ({
  channel,
  isSelected = false,
  onSelect,
  renderActions
}) => {
  return (
    <div 
      key={channel.id} 
      className={`p-4 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}
      onClick={() => onSelect(channel)}
    >
      <div className="flex justify-between items-center">
        <div className="truncate max-w-[70%]">
          <p className="font-medium truncate">{channel.channel_title}</p>
          <p className="text-sm text-gray-500 truncate">{channel.channel_url}</p>
        </div>
        {renderActions(channel)}
      </div>
    </div>
  );
};

export default ChannelListItem;
