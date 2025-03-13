
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, RefreshCcw, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIdeasPagination } from "@/hooks/ideas/useIdeasPagination";
import IdeaCard from "./components/ideas/IdeaCard";
import IdeasPagination from "./components/ideas/IdeasPagination";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

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
          <ErrorState error={error} retryType={retryType} retryCount={retryCount} onRetry={handleRetry} />
        ) : ideas.length === 0 ? (
          <EmptyState search={debouncedSearch} onRetry={handleRetry} onClearSearch={handleClearSearch} />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {memoizedIdeas.map((idea) => (
                <Link 
                  key={idea.id}
                  to={`/faceless-ideas/${idea.id}`}
                  className="block h-full"
                >
                  <Card className="hover:shadow-lg transition-shadow h-full overflow-hidden">
                    {idea.image_url ? (
                      <div className="w-full h-48 overflow-hidden bg-gray-100">
                        <img 
                          src={idea.image_url} 
                          alt={idea.label}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                        <div className="text-xl font-semibold text-blue-600 px-4 text-center">
                          {idea.label}
                        </div>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-crimson text-xl mb-3 font-semibold">{idea.label}</h3>
                      <p className="font-lato text-sm text-gray-600 mb-4">
                        {idea.description ? (
                          idea.description.length > 120 ? `${idea.description.substring(0, 120)}...` : idea.description
                        ) : "No description available."}
                      </p>
                      <div className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium mt-2">
                        View details <ArrowRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
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

const IdeasSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <Skeleton className="w-full h-48" />
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-8 w-32 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const EmptyState = ({ search, onRetry, onClearSearch }: { search: string, onRetry: () => void, onClearSearch: () => void }) => (
  <Card className="p-6 text-center">
    {search ? (
      <>
        <p className="text-gray-500 mb-4">No faceless content ideas found matching "{search}".</p>
        <div className="flex justify-center gap-4">
          <Button onClick={onClearSearch} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Clear Search
          </Button>
          <Button onClick={onRetry} variant="secondary">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </>
    ) : (
      <>
        <p className="text-gray-500 mb-4">No faceless content ideas found.</p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </>
    )}
  </Card>
);

const ErrorState = ({ 
  error, 
  retryType, 
  retryCount, 
  onRetry 
}: { 
  error: Error, 
  retryType: string,
  retryCount: number,
  onRetry: () => void 
}) => {
  let errorMessage = error.message;
  let errorTitle = "Error loading ideas";
  let errorClass = "bg-red-50 border-red-200";
  
  if (retryType === 'network') {
    errorTitle = "Network Connection Error";
    errorClass = "bg-yellow-50 border-yellow-200";
  } else if (retryType === 'server') {
    errorTitle = "Server Error";
  } else if (retryType === 'validation') {
    errorTitle = "Invalid Request";
    errorClass = "bg-amber-50 border-amber-200";
  }
  
  return (
    <Card className={`p-6 ${errorClass} mb-8 border`}>
      <h3 className="font-semibold text-red-700 mb-2">{errorTitle}</h3>
      <p className="text-red-600 mb-4">{errorMessage}</p>
      {retryCount > 0 && (
        <p className="text-sm text-gray-600 mb-4">
          Attempted {retryCount} retries
        </p>
      )}
      <Button onClick={onRetry} variant="secondary">
        <RefreshCcw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </Card>
  );
};

export default FacelessIdeas;
