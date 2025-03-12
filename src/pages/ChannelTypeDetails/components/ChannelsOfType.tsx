
import { Card } from "@/components/ui/card";
import { Channel } from "@/types/youtube";
import ChannelCard from "./ChannelCard";
import { OptimizedList } from "@/components/ui/optimized-list";
import { useState, useEffect } from "react";

interface ChannelsOfTypeProps {
  loading: boolean;
  channels: Channel[];
}

const ChannelsOfType = ({ loading, channels }: ChannelsOfTypeProps) => {
  const [itemHeight, setItemHeight] = useState(400); // Default height

  // Adjust item height based on screen size
  useEffect(() => {
    const updateItemHeight = () => {
      // Responsive height based on viewport width
      if (window.innerWidth >= 1024) { // lg breakpoint
        setItemHeight(400); // Height for larger screens
      } else if (window.innerWidth >= 768) { // md breakpoint
        setItemHeight(350); // Height for medium screens
      } else {
        setItemHeight(300); // Height for mobile screens
      }
    };

    updateItemHeight();
    window.addEventListener('resize', updateItemHeight, { passive: true });
    return () => window.removeEventListener('resize', updateItemHeight);
  }, []);

  return (
    <>
      <h2 className="font-crimson text-xl font-semibold mb-4">Channels of this type</h2>
      
      {loading ? (
        <div className="text-center py-8 font-lato">Loading channels...</div>
      ) : channels.length > 0 ? (
        <div className="mb-8">
          <OptimizedList
            items={channels}
            keyExtractor={(channel) => channel.id}
            itemHeight={itemHeight}
            containerClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            renderItem={(channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            )}
            emptyElement={
              <Card className="p-6">
                <p className="font-lato">No channels found for this type.</p>
              </Card>
            }
          />
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
