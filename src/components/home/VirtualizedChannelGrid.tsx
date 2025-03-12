
import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Channel } from '@/types/youtube';
import ChannelCard from './ChannelCard';

interface VirtualizedChannelGridProps {
  channels: Channel[];
  resetFilters: () => void;
  isFeatured?: boolean;
}

const VirtualizedChannelGrid = React.memo(({ 
  channels, 
  resetFilters, 
  isFeatured = false 
}: VirtualizedChannelGridProps) => {
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  // Calculate item size based on screen width
  const columnWidth = 350; // Base width of a card
  const rowHeight = 400; // Base height of a card
  const columns = Math.max(1, Math.floor((window.innerWidth - 48) / columnWidth));
  const rows = Math.ceil(channels.length / columns);
  
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 3, // Number of items to render outside of viewport
  });

  return (
    <div 
      ref={parentRef} 
      className="h-[800px] overflow-auto"
      style={{
        width: '100%',
        height: '800px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowStartIndex = virtualRow.index * columns;
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${rowHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {channels.slice(rowStartIndex, rowStartIndex + columns).map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  isFeatured={isFeatured}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualizedChannelGrid.displayName = 'VirtualizedChannelGrid';

export default VirtualizedChannelGrid;
