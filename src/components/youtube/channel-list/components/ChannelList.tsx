
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
import { Check, Database, X } from "lucide-react";
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

export const ChannelList: React.FC<ChannelListProps> = ({ 
  isAdmin, 
  limit,
  showAll = false
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showSelectionControls, setShowSelectionControls] = useState(false);
  const [showFetchDialog, setShowFetchDialog] = useState(false);
  const pageSize = 12; // Increase the number of channels displayed per page
  
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
    isProcessing,
    progress,
    currentChannel,
    successCount,
    errorCount,
    totalCount: totalToProcess
  } = useBulkStatsFetcher();

  useEffect(() => {
    console.log("ChannelList useEffect running, fetching channels with limit:", showAll ? undefined : limit);
    // In admin view with showAll=true or without specific limit, fetch with pagination
    if (isAdmin && showAll) {
      // Use pagination for admin view with showAll=true
      fetchChannels((currentPage - 1) * pageSize, pageSize);
    } else {
      // For other cases, use the provided limit
      const effectiveLimit = (isAdmin && !limit) ? 30 : limit;
      fetchChannels(0, effectiveLimit);
    }
  }, [isAdmin, limit, showAll, fetchChannels, currentPage, pageSize]); // Include currentPage in dependencies

  const handleBulkFetchStats = async () => {
    const selectedChannels = getSelectedChannels();
    setShowFetchDialog(true);
    await fetchStatsForChannels(selectedChannels);
    // We don't close the dialog here, it will be closed when the fetching is complete
  };

  const toggleSelectionMode = () => {
    setShowSelectionControls(!showSelectionControls);
    if (showSelectionControls) {
      clearSelection();
    }
  };

  const closeFetchDialog = () => {
    if (!isProcessing) {
      setShowFetchDialog(false);
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

  console.log(`Rendering ${channels.length} channels`);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Generate page numbers array for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // If we have fewer pages than the max we want to show, display all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of the middle section
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the start
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("ellipsis");
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis");
      }
      
      // Always show last page
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
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleBulkFetchStats}
                    disabled={selectedCount === 0}
                  >
                    <Database className="w-4 h-4 mr-1" />
                    Fetch Stats
                  </Button>
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
      
      {/* Pagination for admin view with showAll=true */}
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
      
      {/* View All button for limited set of channels */}
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

      {/* Alert Dialog for Bulk Stats Fetching */}
      <AlertDialog open={showFetchDialog} onOpenChange={closeFetchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isProcessing ? "Fetching Channel Stats..." : "Stats Fetch Complete"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isProcessing ? (
                <div className="space-y-4">
                  <p>
                    Fetching stats for {totalToProcess} channels. This may take some time.
                    Please don't close this window.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Progress: {progress}%</span>
                      <span>
                        {successCount} success, {errorCount} failed
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  {currentChannel && (
                    <p className="text-sm text-muted-foreground truncate">
                      Current: {currentChannel}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    Completed fetching stats for {totalToProcess} channels.
                  </p>
                  <div className="flex justify-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-600 p-2 rounded-full">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">{successCount}</p>
                        <p className="text-sm text-muted-foreground">Success</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-100 text-red-600 p-2 rounded-full">
                        <X className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">{errorCount}</p>
                        <p className="text-sm text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!isProcessing && (
              <AlertDialogAction onClick={() => {
                setShowFetchDialog(false);
                clearSelection();
                fetchChannels((currentPage - 1) * pageSize, pageSize);
              }}>
                Done
              </AlertDialogAction>
            )}
            {isProcessing && (
              <AlertDialogCancel disabled>Cancel</AlertDialogCancel>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
