
import React, { useEffect, useState } from "react";
import { useChannelOperations } from "../hooks/useChannelOperations";
import ChannelGrid from "./ChannelGrid";
import ChannelListHeader from "./ChannelListHeader";
import ChannelListFooter from "./ChannelListFooter";
import ChannelListPagination from "./ChannelListPagination";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import ChannelSelectionControls from "./ChannelSelectionControls";
import { BulkOperationsProvider } from "../context/BulkOperationsContext";
import BulkOperationsHandler from "./BulkOperationsHandler";

interface ChannelListProps {
  isAdmin: boolean;
  showAll?: boolean;
}

export const ChannelList: React.FC<ChannelListProps> = ({ isAdmin, showAll = false }) => {
  const {
    channels,
    loading,
    error,
    totalCount,
    fetchChannels,
    handleEdit,
    handleDelete,
    bulkDeleteChannels,
    toggleFeatured,
    toggleChannelSelection,
    clearSelection,
    selectAllChannels,
    isChannelSelected,
    getSelectedCount,
    getSelectedChannels,
    deletingChannels
  } = useChannelOperations();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const totalPages = Math.ceil(totalCount / limit);

  // Selection mode state
  const [showSelectionControls, setShowSelectionControls] = useState(false);

  // Calculate the offset for pagination
  const offset = (currentPage - 1) * limit;

  // Fetch channels when the component mounts or when pagination changes
  useEffect(() => {
    fetchChannels(offset, limit);
  }, [fetchChannels, offset, limit]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Handle limit change (items per page)
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    if (showSelectionControls) {
      clearSelection();
    }
    setShowSelectionControls(prev => !prev);
  };

  return (
    <BulkOperationsProvider>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <ChannelListHeader totalCount={totalCount} loading={loading} />
          
          <ChannelSelectionControls
            selectedCount={getSelectedCount()}
            onSelectAll={selectAllChannels}
            onClearSelection={clearSelection}
            onToggleSelection={toggleSelectionMode}
            onBulkFetchStats={() => {}} // Handled by BulkOperationsHandler
            onBulkGenerateTypes={() => {}} // Handled by BulkOperationsHandler
            onBulkGenerateKeywords={() => {}} // Handled by BulkOperationsHandler
            onBulkTakeScreenshots={() => {}} // Handled by BulkOperationsHandler
            onBulkDelete={bulkDeleteChannels}
            showSelectionControls={showSelectionControls}
            hasChannels={channels.length > 0}
          />
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={() => fetchChannels(offset, limit)} />
        ) : channels.length === 0 ? (
          <EmptyState />
        ) : (
          <ChannelGrid
            channels={channels}
            isAdmin={isAdmin}
            showSelectionControls={showSelectionControls}
            isChannelSelected={isChannelSelected}
            onSelect={toggleChannelSelection}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleFeatured={toggleFeatured}
          />
        )}

        <ChannelListFooter>
          <ChannelListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            currentLimit={limit}
          />
        </ChannelListFooter>
      </div>

      {/* This component handles the actual bulk operations */}
      <BulkOperationsHandler 
        getSelectedChannels={getSelectedChannels} 
      />
    </BulkOperationsProvider>
  );
};
