
import { useState, useEffect, useMemo } from "react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { FacelessIdeaInfo } from "@/services/facelessIdeas";
import IdeaCard from "./components/ideas/IdeaCard";

// Array of background images for random selection
const backgroundImages = [
  "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526378787940-576a539ba69d?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80",
];

// Function to fetch faceless ideas from Supabase
const fetchIdeas = async (): Promise<FacelessIdeaInfo[]> => {
  console.log("Fetching ideas...");
  
  const { data, error } = await supabase
    .from("faceless_ideas")
    .select("*")
    .order("label");
  
  if (error) {
    console.error("Error fetching ideas:", error);
    throw error;
  }
  
  return data || [];
};

const Ideas = () => {
  const [backgroundImage, setBackgroundImage] = useState("");

  // Select a random background image
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);
  }, []);

  // Use React Query for data fetching with caching
  const { data: ideas, isLoading, error, refetch } = useQuery({
    queryKey: ['ideas'],
    queryFn: fetchIdeas,
    staleTime: 10 * 60 * 1000, // Cache data for 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
  
  // Memoize to prevent rerenders
  const sortedIdeas = useMemo(() => {
    return ideas ? [...ideas].sort((a, b) => a.label.localeCompare(b.label)) : [];
  }, [ideas]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div 
        className="bg-cover bg-center h-64 flex items-center justify-center mb-8"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}
      >
        <div className="text-center text-white max-w-3xl mx-auto px-4">
          <h1 className="font-crimson text-4xl font-bold mb-4 text-center">YouTube Content Ideas</h1>
          <p className="font-lato text-lg text-center">
            Discover profitable YouTube content ideas that you can create today.
            Browse these ideas to find inspiration for your next video or channel.
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
            <p className="font-medium">Error</p>
            <p>{error instanceof Error ? error.message : "Failed to load content ideas"}</p>
            <button 
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : !sortedIdeas || sortedIdeas.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No content ideas found.</p>
            <button 
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Refresh
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default Ideas;
