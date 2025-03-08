
import React from "react";
import { Channel } from "@/types/youtube";
import { ChannelCard } from "./ChannelCard";

interface ChannelGridProps {
  channels: Channel[];
  isAdmin: boolean;
  showSelectionControls: boolean;
  isChannelSelected: (id: string) => boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFeatured: (id: string, currentStatus: boolean) => void;
}

const ChannelGrid: React.FC<ChannelGridProps> = ({
  channels,
  isAdmin,
  showSelectionControls,
  isChannelSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleFeatured
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          isAdmin={isAdmin}
          selectable={showSelectionControls}
          isSelected={isChannelSelected(channel.id)}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleFeatured={onToggleFeatured}
        />
      ))}
    </div>
  );
};

export default ChannelGrid;
