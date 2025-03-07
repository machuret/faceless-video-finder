
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useChannelOperations } from "../hooks/useChannelOperations";
import { ChannelCard } from "./ChannelCard";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";

interface ChannelListProps {
  isAdmin: boolean;
  limit?: number;
}

export const ChannelList: React.FC<ChannelListProps> = ({ 
  isAdmin, 
  limit 
}) => {
  const navigate = useNavigate();
  const { 
    channels, 
    loading, 
    error, 
    fetchChannels, 
    handleEdit, 
    handleDelete, 
    toggleFeatured 
  } = useChannelOperations();

  useEffect(() => {
    console.log("ChannelList useEffect running, fetching channels with limit:", limit);
    // In admin view without specific limit, fetch up to 30 channels
    const effectiveLimit = isAdmin && !limit ? 30 : limit;
    fetchChannels(effectiveLimit);
    // Don't include fetchChannels in the dependency array as it would cause infinite rerenders
  }, [isAdmin, limit]); // Only re-run if isAdmin or limit changes

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchChannels(limit)} />;
  }

  if (!channels || channels.length === 0) {
    return <EmptyState isAdmin={isAdmin} />;
  }

  console.log(`Rendering ${channels.length} channels`);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Channels</h2>
        {isAdmin && (
          <Button onClick={() => navigate("/admin/add-channel")} size="sm">
            Add New Channel
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isAdmin={isAdmin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleFeatured={toggleFeatured}
          />
        ))}
      </div>
      
      {/* Add a View All button if we're showing a limited set of channels */}
      {limit && channels.length >= limit && !isAdmin && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/channels")}
          >
            View All Channels
          </Button>
        </div>
      )}
    </div>
  );
};
