
import { Card } from "@/components/ui/card";
import { Channel } from "@/types/youtube";
import ChannelCard from "./ChannelCard";
import { OptimizedList } from "@/components/ui/optimized-list";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ChannelsOfTypeProps {
  loading: boolean;
  channels: Channel[];
  loadMoreChannels: () => void;
  hasMoreChannels: boolean;
  totalChannels: number;
}

const ChannelsOfType = ({ 
  loading, 
  channels, 
  loadMoreChannels, 
  hasMoreChannels, 
  totalChannels 
}: ChannelsOfTypeProps) => {
  const [itemHeight, setItemHeight] = useState(400); // Default height
  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreChannels && !loading) {
          loadMoreChannels();
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMoreChannels, loading, loadMoreChannels]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-crimson text-xl font-semibold">Channels of this type</h2>
        <div className="text-sm text-gray-500 font-lato">
          {totalChannels > 0 ? 
            `Showing ${channels.length} of ${totalChannels} channels` : 
            loading ? "Loading..." : "No channels found"}
        </div>
      </div>
      
      {loading && channels.length === 0 ? (
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
          
          {/* Infinite scroll trigger element */}
          {hasMoreChannels && (
            <div 
              ref={loadMoreRef} 
              className="flex justify-center my-8"
            >
              <Button 
                variant="outline" 
                onClick={loadMoreChannels}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load more channels"}
              </Button>
            </div>
          )}
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
