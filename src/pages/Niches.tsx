
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { niches as defaultNiches } from "@/data/niches";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const Niches = () => {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [nicheDetails, setNicheDetails] = useState<Record<string, NicheData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Select a random background image
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);
    
    // Fetch niches
    fetchNiches();
  }, []);
  
  const fetchNiches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching niches for Niches page...");
      const { data, error } = await supabase.functions.invoke("get-niches");
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Niches response:", data);
      
      if (data && data.niches && Array.isArray(data.niches) && data.niches.length > 0) {
        setNiches(data.niches);
        setNicheDetails(data.nicheDetails || {});
      } else {
        console.warn("No niches found, using default list");
        setNiches(defaultNiches);
        setNicheDetails({});
      }
    } catch (error) {
      console.error("Error fetching niches:", error);
      setError("Failed to load niches. Using default list.");
      toast.error("Failed to load niches");
      
      // Fallback to default niches
      setNiches(defaultNiches);
      setNicheDetails({});
    } finally {
      setLoading(false);
    }
  };

  // Handle empty niches list with retry
  useEffect(() => {
    if (!loading && niches.length === 0) {
      console.warn("No niches found after loading, attempting to use default list");
      setNiches(defaultNiches);
    }
  }, [loading, niches]);

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
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        ) : niches.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No niches found. Please try refreshing the page.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {niches.sort().map((niche) => {
              const details = nicheDetails[niche] || { name: niche, description: null, image_url: null, example: null };
              
              return (
                <Card key={niche} className="hover:shadow-lg transition-shadow">
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
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium font-montserrat"
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
