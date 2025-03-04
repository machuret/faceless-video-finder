
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { fetchFacelessIdeas, FacelessIdeaInfo } from "@/services/facelessIdeas";
import { toast } from "sonner";

const FacelessIdeas = () => {
  const [ideas, setIdeas] = useState<FacelessIdeaInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIdeas = async () => {
      try {
        setLoading(true);
        const data = await fetchFacelessIdeas();
        setIdeas(data);
      } catch (error) {
        console.error("Error loading faceless ideas:", error);
        toast.error("Failed to load faceless ideas");
      } finally {
        setLoading(false);
      }
    };

    loadIdeas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation Bar */}
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <h1 className="font-crimson text-3xl font-bold text-gray-800">Faceless Content Ideas</h1>
        </div>
        
        <p className="font-lato text-gray-600 mb-8 max-w-3xl">
          Explore different types of faceless YouTube content ideas to inspire your next video creation. These ideas require minimal on-camera presence and can be produced with basic equipment.
        </p>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : ideas.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No faceless content ideas found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow h-full overflow-hidden">
                {idea.image_url && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={idea.image_url} 
                      alt={idea.label}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" 
                    />
                  </div>
                )}
                <CardContent className={`p-6 flex flex-col ${idea.image_url ? 'h-auto' : 'h-full'}`}>
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

export default FacelessIdeas;
