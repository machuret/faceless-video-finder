
import React from 'react';
import { Channel } from '@/types/youtube';
import VirtualizedChannelGrid from './VirtualizedChannelGrid';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

interface ChannelGridProps {
  channels: Channel[];
  loading: boolean;
  error: string | null;
  resetFilters: () => void;
  isFeatured?: boolean;
}

const ChannelGrid = React.memo(({ 
  channels, 
  loading, 
  error, 
  resetFilters, 
  isFeatured = false 
}: ChannelGridProps) => {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={resetFilters}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  if (channels.length === 0) {
    return <EmptyState resetFilters={resetFilters} />;
  }

  return (
    <VirtualizedChannelGrid
      channels={channels}
      resetFilters={resetFilters}
      isFeatured={isFeatured}
    />
  );
});

ChannelGrid.displayName = 'ChannelGrid';

export default ChannelGrid;
