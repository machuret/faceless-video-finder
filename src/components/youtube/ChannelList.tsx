
import { ChannelCard } from "./ChannelCard";
import type { Channel } from "@/types/youtube";

interface ChannelListProps {
  channels: Channel[];
  onDelete: (id: string) => void;
  onSave: (channel: Channel) => void;
}

export const ChannelList = ({ channels, onDelete, onSave }: ChannelListProps) => {
  return (
    <div className="grid gap-6">
      {channels.map(channel => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          onDelete={onDelete}
          onSave={onSave}
        />
      ))}
    </div>
  );
};
