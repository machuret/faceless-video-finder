
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { getFacelessIdeaById, FacelessIdeaInfo } from "@/services/facelessIdeaService";
import { toast } from "sonner";

const FacelessIdeaDetails = () => {
  const { ideaId } = useParams<{ ideaId: string }>();
  const [idea, setIdea] = useState<FacelessIdeaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIdeaDetails = async () => {
      if (!ideaId) return;
      
      try {
        setLoading(true);
        const data = await getFacelessIdeaById(ideaId);
        setIdea(data);
      } catch (error) {
        console.error("Error loading faceless idea details:", error);
        toast.error("Failed to load faceless idea details");
      } finally {
        setLoading(false);
      }
    };

    loadIdeaDetails();
  }, [ideaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Faceless Idea Not Found</h2>
            <p className="text-gray-600 mb-6">The faceless content idea you're looking for doesn't exist or has been removed.</p>
            <Link to="/faceless-ideas">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Ideas
              </Button>
            </Link>
          </Card>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/faceless-ideas" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Faceless Ideas
          </Link>
        </div>
        
        <Card className="mb-8 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">{idea.label}</h1>
            
            {idea.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: idea.description }}
                />
              </div>
            )}
            
            {idea.production && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">How to Create</h2>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: idea.production }}
                />
              </div>
            )}
            
            {idea.example && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Examples</h2>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: idea.example }}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
      
      <PageFooter />
    </div>
  );
};

export default FacelessIdeaDetails;
