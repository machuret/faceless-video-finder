
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowRight, RefreshCcw } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { FacelessIdeaInfo } from "@/services/facelessIdeas";
import { fetchPaginatedIdeas } from "@/services/facelessIdeas/paginatedService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OptimizedList } from "@/components/ui/optimized-list";
import { Skeleton } from "@/components/ui/skeleton";
import { useIdeasPagination } from "@/hooks/ideas/useIdeasPagination";
import LazyImage from "@/components/ui/lazy-image";
import IdeaCard from "./components/ideas/IdeaCard";
import IdeasPagination from "./components/ideas/IdeasPagination";

const ITEMS_PER_PAGE = 12;

const FacelessIdeas = () => {
  const [search, setSearch] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const {
    currentPage,
    setTotalPages,
    setTotalItems,
    isLoading,
    setIsLoading,
    error,
    setError,
    ideas,
    setIdeas,
    handlePageChange,
    resetPagination,
    smartRetry
  } = useIdeasPagination({
    pageSize: ITEMS_PER_PAGE,
    retryLimit: 3
  });

  const loadIdeas = async (page: number = currentPage) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const fetcher = () => fetchPaginatedIdeas({
        page, 
        pageSize: ITEMS_PER_PAGE,
        search,
        sortBy: 'label',
        sortOrder: 'asc'
      });
      
      const response = await smartRetry(fetcher);
      
      setTotalPages(response.totalPages);
      setTotalItems(response.count);
      setIdeas(response.data);
      setError(null);
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Error loading faceless ideas:", error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load ideas on page change or search
  useEffect(() => {
    loadIdeas();
  }, [currentPage, search]);

  // Optimize list rendering with memoization
  const memoizedIdeas = useMemo(() => ideas, [ideas]);

  // Retry handler
  const handleRetry = () => {
    resetPagination();
    loadIdeas(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="font-crimson text-3xl font-bold text-gray-800">
            Faceless Content Ideas
          </h1>
          
          <div className="flex items-center gap-2">
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
        
        <p className="font-lato text-gray-600 mb-8 max-w-3xl">
          Explore different types of faceless YouTube content ideas to inspire your next video creation. 
          These ideas require minimal on-camera presence and can be produced with basic equipment.
        </p>
        
        {isInitialLoad ? (
          <IdeasSkeletonLoader />
        ) : error ? (
          <ErrorState error={error} onRetry={handleRetry} />
        ) : ideas.length === 0 ? (
          <EmptyState onRetry={handleRetry} />
        ) : (
          <>
            <div className="mb-8">
              <OptimizedList
                items={memoizedIdeas}
                keyExtractor={(idea) => idea.id}
                itemHeight={380}
                containerClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
              totalPages={ideas.length > 0 ? Math.ceil(ideas.length / ITEMS_PER_PAGE) : 0}
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

const EmptyState = ({ onRetry }: { onRetry: () => void }) => (
  <Card className="p-6 text-center">
    <p className="text-gray-500 mb-4">No faceless content ideas found.</p>
    <Button onClick={onRetry} variant="outline">
      <RefreshCcw className="h-4 w-4 mr-2" />
      Refresh
    </Button>
  </Card>
);

const ErrorState = ({ error, onRetry }: { error: Error, onRetry: () => void }) => (
  <Card className="p-6 bg-red-50 border-red-200 mb-8">
    <h3 className="font-semibold text-red-700 mb-2">Error loading ideas</h3>
    <p className="text-red-600 mb-4">{error.message}</p>
    <Button onClick={onRetry} variant="secondary">
      <RefreshCcw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </Card>
);

export default FacelessIdeas;
