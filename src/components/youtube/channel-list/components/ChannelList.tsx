import React, { useEffect, useState } from "react";
import { useChannelOperations } from "../hooks/useChannelOperations";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { useBulkStatsFetcher } from "./hooks/useBulkStatsFetcher";
import { useBulkTypeGenerator } from "./hooks/useBulkTypeGenerator";
import { useBulkKeywordsGenerator } from "./hooks/useBulkKeywordsGenerator";
import { useBulkScreenshotGenerator } from "./hooks/useBulkScreenshotGenerator";
import ChannelGrid from "./ChannelGrid";
import ChannelListHeader from "./ChannelListHeader";
import ChannelListFooter from "./ChannelListFooter";
import BulkOperationsHandler from "./BulkOperationsHandler";
import { BulkOperationsProvider } from "../context/BulkOperationsContext";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [showSelectionControls, setShowSelectionControls] = useState(false);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
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
    fetchStatsForChannels,
    isProcessing: isStatsProcessing,
    progress: statsProgress,
    currentChannel: statsCurrentChannel,
    successCount: statsSuccessCount,
    errorCount: statsErrorCount,
    totalCount: statsTotalCount
  } = useBulkStatsFetcher();
  
  const {
    generateTypesForChannels,
    isProcessing: isTypeProcessing,
    progress: typeProgress,
    currentChannel: typeCurrentChannel,
    successCount: typeSuccessCount,
    errorCount: typeErrorCount,
    totalCount: typeTotalCount
  } = useBulkTypeGenerator();
  
  const {
    generateKeywordsForChannels,
    isProcessing: isKeywordsProcessing,
    progress: keywordsProgress,
    currentChannel: keywordsCurrentChannel,
    successCount: keywordsSuccessCount,
    errorCount: keywordsErrorCount,
    totalCount: keywordsTotalCount
  } = useBulkKeywordsGenerator();
  
  const {
    generateScreenshotsForChannels,
    isProcessing: isScreenshotProcessing,
    progress: screenshotProgress,
    currentChannel: screenshotCurrentChannel,
    successCount: screenshotSuccessCount,
    errorCount: screenshotErrorCount,
    totalCount: screenshotTotalCount
  } = useBulkScreenshotGenerator();

  useEffect(() => {
    console.log("ChannelList useEffect running, fetching channels with limit:", showAll ? undefined : limit);
    if (isAdmin && showAll) {
      fetchChannels((currentPage - 1) * pageSize, pageSize);
    } else {
      const effectiveLimit = (isAdmin && !limit) ? 30 : limit;
      fetchChannels(0, effectiveLimit);
    }
  }, [isAdmin, limit, showAll, fetchChannels, currentPage, pageSize]);

  const sortedChannels = sortAlphabetically && channels ? 
    [...channels].sort((a, b) => (a.channel_title || "").localeCompare(b.channel_title || "")) : 
    channels;

  const toggleAlphabeticalSort = () => {
    setSortAlphabetically(!sortAlphabetically);
  };

  const handleBulkFetchStats = async () => {
    const selectedChannels = getSelectedChannels();
    await fetchStatsForChannels(selectedChannels);
  };
  
  const handleBulkGenerateTypes = async () => {
    const selectedChannels = getSelectedChannels();
    await generateTypesForChannels(selectedChannels);
  };
  
  const handleBulkGenerateKeywords = async () => {
    const selectedChannels = getSelectedChannels();
    await generateKeywordsForChannels(selectedChannels);
  };
  
  const handleBulkTakeScreenshots = async () => {
    const selectedChannels = getSelectedChannels();
    await generateScreenshotsForChannels(selectedChannels);
  };

  const toggleSelectionMode = () => {
    setShowSelectionControls(!showSelectionControls);
    if (showSelectionControls) {
      clearSelection();
    }
  };

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
            <Button 
              variant="outline" 
              onClick={toggleAlphabeticalSort}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortAlphabetically ? "Original Order" : "Sort A-Z"}
            </Button>
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
