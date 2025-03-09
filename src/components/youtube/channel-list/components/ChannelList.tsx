
import React, { useEffect } from "react";
import { useChannelOperations } from "../hooks/useChannelOperations";
import { useChannelListControls } from "../hooks/useChannelListControls";
import { useBulkOperations } from "../hooks/useBulkOperations";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import ChannelGrid from "./ChannelGrid";
import ChannelListHeader from "./ChannelListHeader";
import ChannelListFooter from "./ChannelListFooter";
import BulkOperationsHandler from "./BulkOperationsHandler";
import { BulkOperationsProvider } from "../context/BulkOperationsContext";
import SortButton from "./SortButton";

interface ChannelListProps {
  isAdmin: boolean;
  limit?: number;
  showAll?: boolean;
}

export const ChannelList: React.FC<ChannelListProps> = ({ 
  isAdmin, 
  limit,
  showAll = false
}) => {
  const pageSize = 12;
  
  const { 
    channels, 
    loading, 
    error,
    totalCount,
    fetchChannels, 
    handleEdit, 
    handleDelete, 
    toggleFeatured,
    toggleChannelSelection,
    clearSelection,
    selectAllChannels,
    isChannelSelected,
    getSelectedCount,
    getSelectedChannels
  } = useChannelOperations();

  const {
    currentPage,
    setCurrentPage,
    showSelectionControls,
    toggleSelectionMode,
    sortAlphabetically,
    toggleAlphabeticalSort,
    sortedChannels
  } = useChannelListControls(channels);

  const {
    handleBulkFetchStats,
    handleBulkGenerateTypes,
    handleBulkGenerateKeywords,
    handleBulkTakeScreenshots,
    isStatsProcessing,
    isTypeProcessing,
    isKeywordsProcessing,
    isScreenshotProcessing,
    statsProgress,
    typeProgress,
    keywordsProgress,
    screenshotProgress,
    statsCurrentChannel,
    typeCurrentChannel,
    keywordsCurrentChannel,
    screenshotCurrentChannel,
    statsSuccessCount,
    typeSuccessCount,
    keywordsSuccessCount,
    screenshotSuccessCount,
    statsErrorCount,
    typeErrorCount,
    keywordsErrorCount,
    screenshotErrorCount,
    statsTotalCount,
    typeTotalCount,
    keywordsTotalCount,
    screenshotTotalCount
  } = useBulkOperations(getSelectedChannels);

  useEffect(() => {
    console.log("ChannelList useEffect running, fetching channels with limit:", showAll ? undefined : limit);
    if (isAdmin && showAll) {
      fetchChannels((currentPage - 1) * pageSize, pageSize);
    } else {
      const effectiveLimit = (isAdmin && !limit) ? 30 : limit;
      fetchChannels(0, effectiveLimit);
    }
  }, [isAdmin, limit, showAll, fetchChannels, currentPage, pageSize]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={() => fetchChannels(0, showAll ? undefined : limit)} />;
  }

  if (!channels || channels.length === 0) {
    return <EmptyState isAdmin={isAdmin} />;
  }

  const totalPages = Math.ceil(totalCount / pageSize);
  const selectedCount = getSelectedCount();

  return (
    <BulkOperationsProvider
      fetchChannels={fetchChannels}
      currentPage={currentPage}
      pageSize={pageSize}
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
        <div className="flex justify-between items-center">
          <ChannelListHeader 
            isAdmin={isAdmin}
            showSelectionControls={showSelectionControls}
            selectedCount={selectedCount}
            channelsLength={channels.length}
            toggleSelectionMode={toggleSelectionMode}
            selectAllChannels={selectAllChannels}
            clearSelection={clearSelection}
            onBulkFetchStats={handleBulkFetchStats}
            onBulkGenerateTypes={handleBulkGenerateTypes}
            onBulkGenerateKeywords={handleBulkGenerateKeywords}
            onBulkTakeScreenshots={handleBulkTakeScreenshots}
            isStatsProcessing={isStatsProcessing}
            isTypeProcessing={isTypeProcessing}
            isKeywordsProcessing={isKeywordsProcessing}
            isScreenshotProcessing={isScreenshotProcessing}
          />
          
          {isAdmin && (
            <SortButton 
              sortAlphabetically={sortAlphabetically}
              toggleAlphabeticalSort={toggleAlphabeticalSort}
            />
          )}
        </div>
        
        <ChannelGrid
          channels={sortedChannels || []}
          isAdmin={isAdmin}
          showSelectionControls={showSelectionControls}
          isChannelSelected={isChannelSelected}
          onSelect={toggleChannelSelection}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleFeatured={toggleFeatured}
        />
        
        <ChannelListFooter
          isAdmin={isAdmin}
          showAll={showAll}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          limit={limit}
          channelsLength={channels?.length || 0}
        />
        
        <BulkOperationsHandler />
      </div>
    </BulkOperationsProvider>
  );
};
