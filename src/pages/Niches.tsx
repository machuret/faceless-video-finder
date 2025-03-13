
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { niches as defaultNiches } from "@/data/niches";
import { supabase } from "@/integrations/supabase/client";

import NichesHeader from "./components/niches/NichesHeader";
import NichesLoadingState from "./components/niches/NichesLoadingState";
import NichesErrorState from "./components/niches/NichesErrorState";
import NichesEmptyState from "./components/niches/NichesEmptyState";
import NichesGrid from "./components/niches/NichesGrid";

const backgroundImages = [
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
];

const fetchNiches = async () => {
  console.log("Fetching niches for Niches page...");
  try {
    const { data, error } = await supabase.functions.invoke("get-niches");
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log("Niches response:", data);
    
    if (data && data.niches && Array.isArray(data.niches) && data.niches.length > 0) {
      return {
        niches: data.niches,
        nicheDetails: data.nicheDetails || {}
      };
    }
    
    // Fallback to direct database query
    console.warn("Edge function returned empty niches array, trying direct DB query");
    
    const { data: nichesData, error: nichesError } = await supabase
      .from('niches')
      .select('id, name, description, image_url')
      .order('name');
      
    if (nichesError) {
      throw new Error(nichesError.message);
    }
    
    if (nichesData && nichesData.length > 0) {
      const niches = nichesData.map(niche => niche.name);
      const nicheDetails = {};
      
      nichesData.forEach(niche => {
        nicheDetails[niche.name] = {
          name: niche.name,
          description: niche.description,
          example: null,
          image_url: niche.image_url
        };
      });
      
      return { niches, nicheDetails };
    }
    
    // Fallback to default niches
    return {
      niches: defaultNiches,
      nicheDetails: {}
    };
  } catch (error) {
    console.error("Error fetching niches:", error);
    // Fallback to default niches
    return {
      niches: defaultNiches,
      nicheDetails: {}
    };
  }
};

const Niches = () => {
  const [backgroundImage, setBackgroundImage] = useState("");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['niches-page'],
    queryFn: fetchNiches,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
  
  const niches = useMemo(() => data?.niches || defaultNiches, [data]);
  const nicheDetails = useMemo(() => data?.nicheDetails || {}, [data]);

  // Select a random background image on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);
  }, []);
  
  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <NichesHeader backgroundImage={backgroundImage} />
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <NichesLoadingState />
        ) : error ? (
          <NichesErrorState error={error} onRetry={handleRetry} />
        ) : niches.length === 0 ? (
          <NichesEmptyState onRetry={handleRetry} />
        ) : (
          <NichesGrid niches={niches} nicheDetails={nicheDetails} />
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default Niches;
