
import React, { useState, useEffect } from 'react';
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
  const [dimensions, setDimensions] = useState({
    containerHeight: 800,
    columnWidth: 350,
    rowHeight: 400,
    columns: 3
  });
  
  // Update dimensions based on screen size
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      let columns = 3; // Default for large screens
      let rowHeight = 400;
      
      if (width < 768) {
        columns = 1; // Mobile
        rowHeight = 350;
      } else if (width < 1024) {
        columns = 2; // Tablet
        rowHeight = 380;
      }
      
      // Calculate container height based on visible rows
      const visibleRows = Math.min(
        Math.ceil(channels.length / columns),
        5 // Limit to 5 rows maximum initially
      );
      
      setDimensions({
        containerHeight: Math.max(400, rowHeight * visibleRows),
        columnWidth: 350,
        rowHeight,
        columns
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });
    return () => window.removeEventListener('resize', updateDimensions);
  }, [channels.length]);
  
  const rows = Math.ceil(channels.length / dimensions.columns);
  
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => dimensions.rowHeight,
    overscan: 3, // Number of items to render outside of viewport
  });

  return (
    <div 
      ref={parentRef} 
      className="overflow-auto"
      style={{
        width: '100%',
        height: `${dimensions.containerHeight}px`,
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
          const rowStartIndex = virtualRow.index * dimensions.columns;
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${dimensions.rowHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {channels.slice(rowStartIndex, rowStartIndex + dimensions.columns).map((channel) => (
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
