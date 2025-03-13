
import { useState, useEffect, useMemo, useCallback } from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { toast } from "sonner";
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
import { Link } from "react-router-dom";

const ITEMS_PER_PAGE = 12;

// Array of background images for random selection
const backgroundImages = [
  "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526378787940-576a539ba69d?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80",
];

const FacelessIdeas = () => {
  const [searchInput, setSearchInput] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  
  // Select a random background image on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);
  }, []);
  
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
      
      <div 
        className="bg-cover bg-center h-64 flex items-center justify-center mb-8"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}
      >
        <div className="text-center text-white max-w-3xl mx-auto px-4">
          <h1 className="font-crimson text-4xl font-bold mb-4 text-center">Faceless Content Ideas</h1>
          <p className="font-lato text-lg text-center">
            Explore different types of faceless YouTube content ideas to inspire your next video creation.
            These ideas require minimal on-camera presence and can be produced with basic equipment.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {memoizedIdeas.map((idea) => (
                <Link key={idea.id} to={`/faceless-ideas/${idea.id}`}>
                  <IdeaCard idea={idea} />
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

export default FacelessIdeas;
