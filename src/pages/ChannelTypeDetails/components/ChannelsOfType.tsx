
import { Card } from "@/components/ui/card";
import { Channel } from "@/types/youtube";
import ChannelCard from "./ChannelCard";
import { OptimizedList } from "@/components/ui/optimized-list";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

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

  // Memoize channels to prevent unnecessary re-renders
  const memoizedChannels = useMemo(() => channels, [channels]);

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
        <ChannelsSkeletonLoader />
      ) : channels.length > 0 ? (
        <div className="mb-8">
          <OptimizedList
            items={memoizedChannels}
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
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more channels"
                )}
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

// Skeleton loader for channels
const ChannelsSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="w-full h-40" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex justify-between mt-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ChannelsOfType;
