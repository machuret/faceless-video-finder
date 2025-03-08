
import React, { useEffect, useState } from "react";
import { useChannelOperations } from "../hooks/useChannelOperations";
import ChannelGrid from "./ChannelGrid";
import ChannelListHeader from "./ChannelListHeader";
import ChannelListFooter from "./ChannelListFooter";
import ChannelListPagination from "./ChannelListPagination";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
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

  // Bulk operations state
  const [isStatsProcessing, setIsStatsProcessing] = useState(false);
  const [isTypeProcessing, setIsTypeProcessing] = useState(false);
  const [isKeywordsProcessing, setIsKeywordsProcessing] = useState(false);
  const [isScreenshotProcessing, setIsScreenshotProcessing] = useState(false);
  const [statsProgress, setStatsProgress] = useState(0);
  const [typeProgress, setTypeProgress] = useState(0);
  const [keywordsProgress, setKeywordsProgress] = useState(0);
  const [screenshotProgress, setScreenshotProgress] = useState(0);
  const [statsCurrentChannel, setStatsCurrentChannel] = useState<string | null>(null);
  const [typeCurrentChannel, setTypeCurrentChannel] = useState<string | null>(null);
  const [keywordsCurrentChannel, setKeywordsCurrentChannel] = useState<string | null>(null);
  const [screenshotCurrentChannel, setScreenshotCurrentChannel] = useState<string | null>(null);
  const [statsSuccessCount, setStatsSuccessCount] = useState(0);
  const [typeSuccessCount, setTypeSuccessCount] = useState(0);
  const [keywordsSuccessCount, setKeywordsSuccessCount] = useState(0);
  const [screenshotSuccessCount, setScreenshotSuccessCount] = useState(0);
  const [statsErrorCount, setStatsErrorCount] = useState(0);
  const [typeErrorCount, setTypeErrorCount] = useState(0);
  const [keywordsErrorCount, setKeywordsErrorCount] = useState(0);
  const [screenshotErrorCount, setScreenshotErrorCount] = useState(0);
  const [statsTotalCount, setStatsTotalCount] = useState(0);
  const [typeTotalCount, setTypeTotalCount] = useState(0);
  const [keywordsTotalCount, setKeywordsTotalCount] = useState(0);
  const [screenshotTotalCount, setScreenshotTotalCount] = useState(0);

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
    <BulkOperationsProvider
      fetchChannels={fetchChannels}
      currentPage={currentPage}
      pageSize={limit}
      clearSelection={clearSelection}
      isStatsProcessing={isStatsProcessing}
      isTypeProcessing={isTypeProcessing}
      isKeywordsProcessing={isKeywordsProcessing}
      isScreenshotProcessing={isScreenshotProcessing}
      statsProgress={statsProgress}
      typeProgress={typeProgress}
      keywordsProgress={keywordsProgress}
      screenshotProgress={screenshotProgress}
      statsCurrentChannel={statsCurrentChannel}
      typeCurrentChannel={typeCurrentChannel}
      keywordsCurrentChannel={keywordsCurrentChannel}
      screenshotCurrentChannel={screenshotCurrentChannel}
      statsSuccessCount={statsSuccessCount}
      typeSuccessCount={typeSuccessCount}
      keywordsSuccessCount={keywordsSuccessCount}
      screenshotSuccessCount={screenshotSuccessCount}
      statsErrorCount={statsErrorCount}
      typeErrorCount={typeErrorCount}
      keywordsErrorCount={keywordsErrorCount}
      screenshotErrorCount={screenshotErrorCount}
      statsTotalCount={statsTotalCount}
      typeTotalCount={typeTotalCount}
      keywordsTotalCount={keywordsTotalCount}
      screenshotTotalCount={screenshotTotalCount}
    >
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <ChannelListHeader 
            isAdmin={isAdmin}
            showSelectionControls={showSelectionControls}
            selectedCount={getSelectedCount()}
            channelsLength={channels.length}
            toggleSelectionMode={toggleSelectionMode}
            selectAllChannels={selectAllChannels}
            clearSelection={clearSelection}
            onBulkFetchStats={() => {}}
            onBulkGenerateTypes={() => {}}
            onBulkGenerateKeywords={() => {}}
            onBulkTakeScreenshots={() => {}}
            isStatsProcessing={isStatsProcessing}
            isTypeProcessing={isTypeProcessing}
            isKeywordsProcessing={isKeywordsProcessing}
            isScreenshotProcessing={isScreenshotProcessing}
          />
          
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
          <EmptyState isAdmin={isAdmin} />
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

        <ChannelListFooter
          isAdmin={isAdmin}
          showAll={showAll || false}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          limit={limit}
          channelsLength={channels.length}
        >
          <ChannelListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </ChannelListFooter>
      </div>

      {/* This component handles the actual bulk operations */}
      <BulkOperationsHandler 
        getSelectedChannels={getSelectedChannels}
        onStatsProcessingChange={setIsStatsProcessing}
        onTypeProcessingChange={setIsTypeProcessing}
        onKeywordsProcessingChange={setIsKeywordsProcessing}
        onScreenshotProcessingChange={setIsScreenshotProcessing}
        onStatsProgressChange={setStatsProgress}
        onTypeProgressChange={setTypeProgress}
        onKeywordsProgressChange={setKeywordsProgress}
        onScreenshotProgressChange={setScreenshotProgress}
        onStatsCurrentChannelChange={setStatsCurrentChannel}
        onTypeCurrentChannelChange={setTypeCurrentChannel}
        onKeywordsCurrentChannelChange={setKeywordsCurrentChannel}
        onScreenshotCurrentChannelChange={setScreenshotCurrentChannel}
        onStatsSuccessCountChange={setStatsSuccessCount}
        onTypeSuccessCountChange={setTypeSuccessCount}
        onKeywordsSuccessCountChange={setKeywordsSuccessCount}
        onScreenshotSuccessCountChange={setScreenshotSuccessCount}
        onStatsErrorCountChange={setStatsErrorCount}
        onTypeErrorCountChange={setTypeErrorCount}
        onKeywordsErrorCountChange={setKeywordsErrorCount}
        onScreenshotErrorCountChange={setScreenshotErrorCount}
        onStatsTotalCountChange={setStatsTotalCount}
        onTypeTotalCountChange={setTypeTotalCount}
        onKeywordsTotalCountChange={setKeywordsTotalCount}
        onScreenshotTotalCountChange={setScreenshotTotalCount}
      />
    </BulkOperationsProvider>
  );
};
