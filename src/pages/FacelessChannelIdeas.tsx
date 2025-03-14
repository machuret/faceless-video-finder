
import { useMemo } from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { fetchFacelessIdeas } from "@/services/facelessIdeas";
import { useQuery } from "@tanstack/react-query";
import IdeasHeaderWithHero from "./components/ideas/IdeasHeaderWithHero";
import IdeasGrid from "./components/ideas/IdeasGrid";
import NichesLoadingState from "./components/niches/NichesLoadingState";
import NichesErrorState from "./components/niches/NichesErrorState";
import NichesEmptyState from "./components/niches/NichesEmptyState";

// Array of background images for random selection
const backgroundImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80",
];

const FacelessChannelIdeas = () => {
  // Use React Query for data fetching with caching
  const { data: ideas, isLoading, error, refetch } = useQuery({
    queryKey: ['faceless-ideas'], 
    queryFn: fetchFacelessIdeas,
    staleTime: 10 * 60 * 1000, // Cache data for 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Memoize to prevent rerenders
  const sortedIdeas = useMemo(() => {
    return ideas ? [...ideas] : [];
  }, [ideas]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <IdeasHeaderWithHero 
        backgroundImages={backgroundImages}
        title="Faceless Channel Ideas"
        description="Discover profitable faceless YouTube channel ideas that require minimal on-camera presence. 
                    These ideas can be produced with basic equipment and are perfect for content creators who 
                    prefer to stay behind the scenes."
      />
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <NichesLoadingState />
        ) : error ? (
          <NichesErrorState 
            error={error instanceof Error ? error : new Error("An unknown error occurred")} 
            onRetry={() => refetch()} 
          />
        ) : !sortedIdeas || sortedIdeas.length === 0 ? (
          <NichesEmptyState onRetry={() => refetch()} />
        ) : (
          <IdeasGrid ideas={sortedIdeas} />
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default FacelessChannelIdeas;
