
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { fetchFacelessIdeas } from "@/services/facelessIdeas";
import { FacelessIdeaInfo } from "@/services/facelessIdeas/types";
import { toast } from "sonner";

// Array of background images for random selection
const backgroundImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80",
];

const FacelessChannelIdeas = () => {
  const [ideas, setIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Function to load ideas with retry logic
  const loadIdeas = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching faceless channel ideas...");
      const data = await fetchFacelessIdeas();
      console.log(`Fetched ${data.length} faceless ideas`);
      setIdeas(data);
    } catch (error) {
      console.error("Error loading faceless channel ideas:", error);
      setError("Failed to load faceless channel ideas. Please try again.");
      toast.error("Failed to load faceless channel ideas");
      
      // Auto-retry once after a short delay if we haven't already retried
      if (retryCount < 1) {
        toast.info("Attempting to reload faceless ideas...");
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          loadIdeas();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Select a random background image
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);

    // Load faceless ideas
    loadIdeas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div 
        className="bg-cover bg-center h-64 flex items-center justify-center mb-8"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}
      >
        <div className="text-center text-white max-w-3xl mx-auto px-4">
          <h1 className="font-crimson text-4xl font-bold mb-4 text-center">Faceless Channel Ideas</h1>
          <p className="font-lato text-lg text-center">
            Discover profitable faceless YouTube channel ideas that require minimal on-camera presence. 
            These ideas can be produced with basic equipment and are perfect for content creators who 
            prefer to stay behind the scenes.
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
            <p className="font-medium">Error</p>
            <p>{error}</p>
            <button 
              onClick={() => { setRetryCount(0); loadIdeas(); }}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : ideas.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No faceless channel ideas found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow h-full overflow-hidden">
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
                  <div className="w-full h-48 overflow-hidden bg-gradient-to-r from-blue-100 to-indigo-100">
                    <div className="flex items-center justify-center h-full text-blue-600 text-xl font-semibold">
                      {idea.label}
                    </div>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col h-auto">
                  <CardTitle className="font-crimson text-xl mb-3">{idea.label}</CardTitle>
                  <p className="font-lato text-sm text-gray-600 mb-4 flex-grow">
                    {idea.description ? (
                      idea.description.length > 120 ? `${idea.description.substring(0, 120)}...` : idea.description
                    ) : "No description available."}
                  </p>
                  <Link 
                    to={`/faceless-ideas/${idea.id}`} 
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium font-montserrat mt-auto"
                  >
                    View details <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <PageFooter />
    </div>
  );
};

export default FacelessChannelIdeas;
