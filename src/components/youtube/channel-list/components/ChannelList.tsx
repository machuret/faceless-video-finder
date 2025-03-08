import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useChannelOperations } from "../hooks/useChannelOperations";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { useBulkStatsFetcher } from "./hooks/useBulkStatsFetcher";
import { useBulkTypeGenerator } from "./hooks/useBulkTypeGenerator";
import { useBulkKeywordsGenerator } from "./hooks/useBulkKeywordsGenerator";
import { useBulkScreenshotGenerator } from "./hooks/useBulkScreenshotGenerator";
import ChannelGrid from "./ChannelGrid";
import ChannelListPagination from "./ChannelListPagination";
import ChannelSelectionControls from "./ChannelSelectionControls";
import BulkOperationDialog from "./BulkOperationDialog";

interface ChannelListProps {
  isAdmin: boolean;
  limit?: number;
  showAll?: boolean;
}

type BulkOperationType = 'stats' | 'type' | 'keywords' | 'screenshot' | null;

export const ChannelList: React.FC<ChannelListProps> = ({ 
  isAdmin, 
  limit,
  showAll = false
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSelectionControls, setShowSelectionControls] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BulkOperationType>(null);
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
  
  const isAnyProcessing = isStatsProcessing || isTypeProcessing || isKeywordsProcessing || isScreenshotProcessing;
  
  const getCurrentProgress = () => {
    switch (currentOperation) {
      case 'stats': return statsProgress;
      case 'type': return typeProgress;
      case 'keywords': return keywordsProgress;
      case 'screenshot': return screenshotProgress;
      default: return 0;
    }
  };
  
  const getCurrentChannel = () => {
    switch (currentOperation) {
      case 'stats': return statsCurrentChannel;
      case 'type': return typeCurrentChannel;
      case 'keywords': return keywordsCurrentChannel;
      case 'screenshot': return screenshotCurrentChannel;
      default: return null;
    }
  };
  
  const getSuccessCount = () => {
    switch (currentOperation) {
      case 'stats': return statsSuccessCount;
      case 'type': return typeSuccessCount;
      case 'keywords': return keywordsSuccessCount;
      case 'screenshot': return screenshotSuccessCount;
      default: return 0;
    }
  };
  
  const getErrorCount = () => {
    switch (currentOperation) {
      case 'stats': return statsErrorCount;
      case 'type': return typeErrorCount;
      case 'keywords': return keywordsErrorCount;
      case 'screenshot': return screenshotErrorCount;
      default: return 0;
    }
  };
  
  const getTotalCount = () => {
    switch (currentOperation) {
      case 'stats': return statsTotalCount;
      case 'type': return typeTotalCount;
      case 'keywords': return keywordsTotalCount;
      case 'screenshot': return screenshotTotalCount;
      default: return 0;
    }
  };

  const handleBulkFetchStats = async () => {
    const selectedChannels = getSelectedChannels();
    setCurrentOperation('stats');
    setShowBulkDialog(true);
    await fetchStatsForChannels(selectedChannels);
  };
  
  const handleBulkGenerateTypes = async () => {
    const selectedChannels = getSelectedChannels();
    setCurrentOperation('type');
    setShowBulkDialog(true);
    await generateTypesForChannels(selectedChannels);
  };
  
  const handleBulkGenerateKeywords = async () => {
    const selectedChannels = getSelectedChannels();
    setCurrentOperation('keywords');
    setShowBulkDialog(true);
    await generateKeywordsForChannels(selectedChannels);
  };
  
  const handleBulkTakeScreenshots = async () => {
    const selectedChannels = getSelectedChannels();
    setCurrentOperation('screenshot');
    setShowBulkDialog(true);
    await generateScreenshotsForChannels(selectedChannels);
  };

  const toggleSelectionMode = () => {
    setShowSelectionControls(!showSelectionControls);
    if (showSelectionControls) {
      clearSelection();
    }
  };

  const closeBulkDialog = () => {
    if (!isAnyProcessing) {
      setShowBulkDialog(false);
      setCurrentOperation(null);
    }
  };

  const handleBulkDialogDone = () => {
    setShowBulkDialog(false);
    setCurrentOperation(null);
    clearSelection();
    fetchChannels((currentPage - 1) * pageSize, pageSize);
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Channels</h2>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <ChannelSelectionControls
                selectedCount={selectedCount}
                onSelectAll={selectAllChannels}
                onClearSelection={clearSelection}
                onToggleSelection={toggleSelectionMode}
                onBulkFetchStats={handleBulkFetchStats}
                onBulkGenerateTypes={handleBulkGenerateTypes}
                onBulkGenerateKeywords={handleBulkGenerateKeywords}
                onBulkTakeScreenshots={handleBulkTakeScreenshots}
                showSelectionControls={showSelectionControls}
                hasChannels={channels.length > 0}
                isProcessingStats={isStatsProcessing}
                isProcessingTypes={isTypeProcessing}
                isProcessingKeywords={isKeywordsProcessing}
                isProcessingScreenshots={isScreenshotProcessing}
              />
              <Button 
                onClick={() => navigate("/admin/add-channel")} 
                size="sm"
              >
                Add New Channel
              </Button>
            </>
          )}
        </div>
      </div>
      
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
      
      {isAdmin && showAll && (
        <ChannelListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      
      {limit && channels.length >= limit && !isAdmin && !showAll && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/channels")}
          >
            View All Channels
          </Button>
        </div>
      )}

      <BulkOperationDialog
        showDialog={showBulkDialog}
        onClose={closeBulkDialog}
        onDone={handleBulkDialogDone}
        currentOperation={currentOperation}
        isProcessing={isAnyProcessing}
        progress={getCurrentProgress()}
        currentChannel={getCurrentChannel()}
        successCount={getSuccessCount()}
        errorCount={getErrorCount()}
        totalCount={getTotalCount()}
      />
    </div>
  );
};
