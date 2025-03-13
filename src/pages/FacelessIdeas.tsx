
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, RefreshCcw, Search, X } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OptimizedList } from "@/components/ui/optimized-list";
import { useIdeasPagination } from "@/hooks/ideas/useIdeasPagination";
import IdeaCard from "./components/ideas/IdeaCard";
import IdeasPagination from "./components/ideas/IdeasPagination";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import IdeasSkeletonLoader from "./components/ideas/IdeasSkeletonLoader";
import IdeasEmptyState from "./components/ideas/IdeasEmptyState";
import IdeasErrorState from "./components/ideas/IdeasErrorState";

const ITEMS_PER_PAGE = 12;

const FacelessIdeas = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const debouncedSearch = useDebounce(searchInput, 500);
  
  const {
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    isFetching,
    error,
    ideas,
    handlePageChange,
    resetPagination,
    refreshData,
    retryCount,
    retryType,
    dataUpdatedAt
  } = useIdeasPagination({
    pageSize: ITEMS_PER_PAGE,
    retryLimit: 3,
    search: debouncedSearch,
    useCache: true
  });

  useEffect(() => {
    if (!isLoading && ideas.length > 0) {
      setIsInitialLoad(false);
    }
  }, [isLoading, ideas]);

  const memoizedIdeas = useMemo(() => ideas, [ideas]);

  const handleRetry = useCallback(() => {
    resetPagination();
    refreshData(true);
    toast.info("Refreshing ideas list...");
  }, [resetPagination, refreshData]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    resetPagination();
  }, [resetPagination]);

  const formattedUpdateTime = useMemo(() => {
    if (!dataUpdatedAt) return null;
    
    const now = new Date();
    const updated = new Date(dataUpdatedAt);
    const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return updated.toLocaleDateString();
  }, [dataUpdatedAt]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="font-crimson text-3xl font-bold text-gray-800">
            Faceless Content Ideas
          </h1>
          
          <div className="flex items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Input
                type="text"
                placeholder="Search ideas..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-9"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              {searchInput && (
                <button 
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetry}
              disabled={isLoading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <p className="font-lato text-gray-600 max-w-3xl">
            Explore different types of faceless YouTube content ideas to inspire your next video creation. 
            These ideas require minimal on-camera presence and can be produced with basic equipment.
          </p>
          
          {formattedUpdateTime && (
            <p className="text-xs text-gray-500">
              Updated: {formattedUpdateTime}
            </p>
          )}
        </div>
        
        {isInitialLoad ? (
          <IdeasSkeletonLoader />
        ) : error ? (
          <IdeasErrorState 
            error={error} 
            retryType={retryType} 
            retryCount={retryCount} 
            onRetry={handleRetry} 
          />
        ) : ideas.length === 0 ? (
          <IdeasEmptyState 
            search={debouncedSearch} 
            onRetry={handleRetry} 
            onClearSearch={handleClearSearch} 
          />
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Showing {ideas.length} of {totalItems} ideas
              </p>
              
              {isFetching && !isLoading && (
                <div className="text-sm text-blue-500 flex items-center">
                  <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                  Updating...
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <OptimizedList
                items={memoizedIdeas}
                keyExtractor={(idea) => idea.id}
                itemHeight={380}
                containerClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                renderItem={(idea) => (
                  <IdeaCard key={idea.id} idea={idea} />
                )}
                emptyElement={
                  <Card className="p-6">
                    <p className="font-lato">No faceless content ideas found.</p>
                  </Card>
                }
              />
            </div>
            
            <IdeasPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default FacelessIdeas;
