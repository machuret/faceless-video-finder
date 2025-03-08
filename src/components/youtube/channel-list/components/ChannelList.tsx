
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useChannelOperations } from "../hooks/useChannelOperations";
import { ChannelCard } from "./ChannelCard";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useBulkStatsFetcher } from "./hooks/useBulkStatsFetcher";
import { useBulkTypeGenerator } from "./hooks/useBulkTypeGenerator";
import { useBulkKeywordsGenerator } from "./hooks/useBulkKeywordsGenerator";
import { useBulkScreenshotGenerator } from "./hooks/useBulkScreenshotGenerator";
import { Check, Database, Image, KeySquare, Tag, X } from "lucide-react";
import BulkActionsMenu from "./BulkActionsMenu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

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
  
  const getOperationTitle = () => {
    switch (currentOperation) {
      case 'stats': return "Fetching Channel Stats";
      case 'type': return "Generating Channel Types";
      case 'keywords': return "Generating Channel Keywords";
      case 'screenshot': return "Taking Channel Screenshots";
      default: return "Bulk Operation";
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
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      if (startPage > 2) {
        pages.push("ellipsis");
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pages.push("ellipsis");
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const selectedCount = getSelectedCount();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Channels</h2>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              {showSelectionControls && (
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-sm font-medium">
                    {selectedCount} selected
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={selectAllChannels}
                    disabled={channels.length === 0}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearSelection}
                    disabled={selectedCount === 0}
                  >
                    Clear
                  </Button>
                  
                  <BulkActionsMenu 
                    disabled={selectedCount === 0}
                    onFetchStats={handleBulkFetchStats}
                    onGenerateTypes={handleBulkGenerateTypes}
                    onGenerateKeywords={handleBulkGenerateKeywords}
                    onGenerateScreenshots={handleBulkTakeScreenshots}
                  />
                </div>
              )}
              <Button 
                variant={showSelectionControls ? "secondary" : "outline"} 
                size="sm" 
                onClick={toggleSelectionMode}
              >
                {showSelectionControls ? "Exit Selection" : "Select Channels"}
              </Button>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            isAdmin={isAdmin}
            selectable={showSelectionControls}
            isSelected={isChannelSelected(channel.id)}
            onSelect={toggleChannelSelection}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleFeatured={toggleFeatured}
          />
        ))}
      </div>
      
      {isAdmin && showAll && totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {getPageNumbers().map((page, i) => (
              <PaginationItem key={i}>
                {page === "ellipsis" ? (
                  <span className="px-4 py-2">...</span>
                ) : (
                  <PaginationLink 
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(Number(page))}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
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

      {/* Alert Dialog for Bulk Operations */}
      <AlertDialog open={showBulkDialog} onOpenChange={closeBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAnyProcessing ? `${getOperationTitle()}...` : `${getOperationTitle()} Complete`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAnyProcessing ? (
                <div className="space-y-4">
                  <p>
                    {getOperationTitle()} for {getTotalCount()} channels. This may take some time.
                    Please don't close this window.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Progress: {getCurrentProgress()}%</span>
                      <span>
                        {getSuccessCount()} success, {getErrorCount()} failed
                      </span>
                    </div>
                    <Progress value={getCurrentProgress()} className="h-2" />
                  </div>
                  {getCurrentChannel() && (
                    <p className="text-sm text-muted-foreground truncate">
                      Current: {getCurrentChannel()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    Completed {getOperationTitle().toLowerCase()} for {getTotalCount()} channels.
                  </p>
                  <div className="flex justify-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-600 p-2 rounded-full">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">{getSuccessCount()}</p>
                        <p className="text-sm text-muted-foreground">Success</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 text-red-600 p-2 rounded-full">
                        <X className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">{getErrorCount()}</p>
                        <p className="text-sm text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!isAnyProcessing && (
              <AlertDialogAction onClick={handleBulkDialogDone}>
                Done
              </AlertDialogAction>
            )}
            {isAnyProcessing && (
              <AlertDialogCancel disabled>Cancel</AlertDialogCancel>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
