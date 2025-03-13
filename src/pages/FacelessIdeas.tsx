
import { useState, useEffect, useMemo, useCallback } from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { toast } from "sonner";
import { OptimizedList } from "@/components/ui/optimized-list";
import { useIdeasPagination } from "@/hooks/ideas/useIdeasPagination";
import IdeaCard from "./components/ideas/IdeaCard";
import IdeasPagination from "./components/ideas/IdeasPagination";
import { useDebounce } from "@/hooks/useDebounce";
import IdeasSkeletonLoader from "./components/ideas/IdeasSkeletonLoader";
import IdeasEmptyState from "./components/ideas/IdeasEmptyState";
import IdeasErrorState from "./components/ideas/IdeasErrorState";
import IdeasHeader from "./components/ideas/IdeasHeader";
import IdeasSearch from "./components/ideas/IdeasSearch";
import IdeasStatus from "./components/ideas/IdeasStatus";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <IdeasHeader dataUpdatedAt={dataUpdatedAt} />
        
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="md:invisible md:h-0 md:w-0 md:overflow-hidden">
            {/* Placeholder for flex layout balance */}
          </div>
          
          <IdeasSearch 
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleClearSearch={handleClearSearch}
            handleRetry={handleRetry}
            isLoading={isLoading}
          />
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
            <IdeasStatus 
              ideas={ideas}
              totalItems={totalItems}
              isFetching={isFetching}
              isLoading={isLoading}
            />
            
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
                  <p className="font-lato">No faceless content ideas found.</p>
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
