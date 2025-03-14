
import { useMemo } from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { useChannelTypesData } from "./hooks/useChannelTypesData";
import IdeasHeaderWithHero from "../components/ideas/IdeasHeaderWithHero";
import TypesGrid from "../components/ideas/TypesGrid";
import NichesLoadingState from "../components/niches/NichesLoadingState";
import NichesErrorState from "../components/niches/NichesErrorState";
import NichesEmptyState from "../components/niches/NichesEmptyState";

// Array of background images for random selection
const backgroundImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80",
];

const ChannelTypes = () => {
  // Use the custom hook to fetch channel types
  const { types, isLoading, error, refetch } = useChannelTypesData();
  
  // Memoize to prevent rerenders
  const sortedTypes = useMemo(() => {
    return types ? [...types] : [];
  }, [types]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <IdeasHeaderWithHero 
        backgroundImages={backgroundImages}
        title="YouTube Channel Types"
        description="Discover different types of YouTube channels you can create. Each type has its own 
                    production requirements and audience expectations. Find the perfect channel type that 
                    matches your skills and interests."
      />
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <NichesLoadingState />
        ) : error ? (
          <NichesErrorState 
            error={error instanceof Error ? error : new Error("An unknown error occurred")} 
            onRetry={() => refetch()} 
          />
        ) : !sortedTypes || sortedTypes.length === 0 ? (
          <NichesEmptyState onRetry={() => refetch()} />
        ) : (
          <TypesGrid types={sortedTypes} />
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default ChannelTypes;
