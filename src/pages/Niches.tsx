
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { niches as defaultNiches } from "@/data/niches";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const backgroundImages = [
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
];

interface NicheData {
  name: string;
  description: string | null;
  image_url: string | null;
  example: string | null;
}

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
      
      <div 
        className="bg-cover bg-center h-64 flex items-center justify-center mb-8"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}
      >
        <div className="text-center text-white max-w-3xl mx-auto px-4">
          <h1 className="font-crimson text-4xl font-bold mb-4 text-center">YouTube Niches</h1>
          <p className="font-lato text-lg text-center">
            Explore different YouTube niches to find the perfect category for your content.
            Find inspiration, examples, and growth opportunities.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-medium">Error loading niches</p>
            <p>{error instanceof Error ? error.message : "An unexpected error occurred"}</p>
            <button 
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : niches.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No niches found. Please try refreshing the page.</p>
            <button 
              onClick={handleRetry}
              className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Refresh
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {niches.sort().map((niche) => {
              const details = nicheDetails[niche] || { name: niche, description: null, image_url: null, example: null };
              
              return (
                <Card key={niche} className="hover:shadow-lg transition-shadow h-full">
                  {details.image_url && (
                    <div className="w-full h-40 overflow-hidden">
                      <img 
                        src={details.image_url} 
                        alt={niche}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-crimson text-xl font-semibold mb-2">{niche}</h3>
                    
                    {details.description && (
                      <p className="font-lato text-sm text-gray-600 mb-4 line-clamp-3">
                        {details.description.substring(0, 100)}
                        {details.description.length > 100 ? "..." : ""}
                      </p>
                    )}
                    
                    <Link 
                      to={`/niches/${encodeURIComponent(niche)}`} 
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium font-montserrat mt-4"
                    >
                      View details <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default Niches;
