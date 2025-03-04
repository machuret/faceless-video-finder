
import { Card } from "@/components/ui/card";
import { Channel } from "@/types/youtube";
import ChannelCard from "./ChannelCard";

interface ChannelsOfTypeProps {
  loading: boolean;
  channels: Channel[];
}

const ChannelsOfType = ({ loading, channels }: ChannelsOfTypeProps) => {
  return (
    <>
      <h2 className="font-crimson text-xl font-semibold mb-4">Channels of this type</h2>
      
      {loading ? (
        <div className="text-center py-8 font-lato">Loading channels...</div>
      ) : channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {channels.map(channel => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      ) : (
        <Card className="p-6 mb-8">
          <p className="font-lato">No channels found for this type.</p>
        </Card>
      )}
    </>
  );
};

export default ChannelsOfType;
