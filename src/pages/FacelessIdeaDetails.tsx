
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { fetchFacelessIdeaById } from "@/services/facelessIdeas";
import { FacelessIdeaInfo } from "@/services/facelessIdeas/types";
import { toast } from "sonner";

const FacelessIdeaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [idea, setIdea] = useState<FacelessIdeaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadIdea = async () => {
      try {
        setLoading(true);
        const data = await fetchFacelessIdeaById(id);
        setIdea(data);
      } catch (error) {
        console.error("Error loading faceless idea:", error);
        toast.error("Failed to load faceless idea details");
      } finally {
        setLoading(false);
      }
    };

    loadIdea();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNavbar />
        <div className="container mx-auto px-4 py-12">
          <Card className="p-6 text-center">
            <p className="text-gray-500">Faceless idea not found.</p>
            <Link to="/faceless-ideas" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              Back to all ideas
            </Link>
          </Card>
        </div>
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
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to all ideas
          </Link>
          
          <h1 className="font-crimson text-3xl font-bold text-gray-800">{idea.label}</h1>
        </div>
        
        {idea.image_url && (
          <div className="mb-8 max-w-3xl w-full mx-auto">
            <img 
              src={idea.image_url} 
              alt={idea.label}
              className="w-full rounded-lg shadow-md object-cover max-h-96" 
            />
          </div>
        )}
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-crimson text-xl font-semibold mb-4">Description</h2>
            {idea.description ? (
              <div 
                className="font-lato text-gray-700 prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: idea.description }}
              />
            ) : (
              <p className="text-gray-500">No description available.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-crimson text-xl font-semibold mb-4">How to Create</h2>
            {idea.production ? (
              <div 
                className="font-lato text-gray-700 prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: idea.production }}
              />
            ) : (
              <p className="text-gray-500">No production details available.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="font-crimson text-xl font-semibold mb-4">Examples</h2>
            {idea.example ? (
              <div 
                className="font-lato text-gray-700 prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: idea.example }}
              />
            ) : (
              <p className="text-gray-500">No examples available.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <PageFooter />
    </div>
  );
};

export default FacelessIdeaDetails;
