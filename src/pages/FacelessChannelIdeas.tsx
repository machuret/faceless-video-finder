
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { fetchFacelessIdeas } from "@/services/facelessIdeas";
import { FacelessIdeaInfo } from "@/services/facelessIdeas/types";
import { toast } from "sonner";
import LazyImage from "@/components/ui/lazy-image";

// Array of background images for random selection
const backgroundImages = [
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
];

const FacelessChannelIdeas = () => {
  const [ideas, setIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    // Select a random background image
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);

    const loadIdeas = async () => {
      try {
        setLoading(true);
        const data = await fetchFacelessIdeas();
        setIdeas(data);
      } catch (error) {
        console.error("Error loading faceless channel ideas:", error);
        toast.error("Failed to load faceless channel ideas");
      } finally {
        setLoading(false);
      }
    };

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
          <h1 className="font-crimson text-4xl font-bold mb-4">Faceless Channel Ideas</h1>
          <p className="font-lato text-lg">
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
        ) : ideas.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No faceless channel ideas found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow h-full overflow-hidden">
                {idea.image_url ? (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={idea.image_url} 
                      alt={idea.label}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
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
