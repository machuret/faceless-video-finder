
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { niches as defaultNiches } from "@/data/niches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NicheForm from "./NicheForm";
import { useNicheForm } from "./hooks/useNicheForm";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NicheDetails {
  name: string;
  description: string | null;
  example: string | null;
  image_url: string | null;
}

// Function to fetch niches data from Supabase
const fetchNiches = async () => {
  console.log("Fetching niches from Supabase...");
  const { data, error } = await supabase.functions.invoke("get-niches");
  
  if (error) {
    console.error("Error from get-niches function:", error);
    throw new Error(error.message);
  }
  
  console.log("Niches response:", data);
  
  if (data && data.niches) {
    return {
      niches: data.niches,
      nicheDetails: data.nicheDetails || {}
    };
  }
  
  // Fallback to default niches if API fails
  console.warn("No niches found, using default list");
  return {
    niches: defaultNiches,
    nicheDetails: {}
  };
};

const ManageNiches = () => {
  const [newNiche, setNewNiche] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use React Query for data fetching with caching
  const { 
    data: nichesData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['niches'],
    queryFn: fetchNiches,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  });
  
  const niches = nichesData?.niches || [];
  const nicheDetails = nichesData?.nicheDetails || {};
  
  const {
    isEditing,
    formData,
    submitting,
    uploading,
    handleInputChange,
    handleRichTextChange,
    setEditingNiche,
    cancelEditing,
    saveNicheDetails,
    handleImageUpload,
    handleDeleteImage
  } = useNicheForm();

  const handleAddNiche = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNiche.trim()) {
      toast.error("Please enter a niche name");
      return;
    }
    
    if (niches.includes(newNiche.trim())) {
      toast.error("This niche already exists");
      return;
    }
    
    setIsAdding(true);
    
    try {
      const { error } = await supabase.functions.invoke("add-niche", {
        body: { niche: newNiche.trim() }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh the niches list
      await refetch();
      setNewNiche("");
      toast.success(`Added "${newNiche}" to niches`);
    } catch (error) {
      console.error("Error adding niche:", error);
      toast.error("Failed to add niche");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteNiche = async (niche: string) => {
    if (!confirm(`Are you sure you want to delete "${niche}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase.functions.invoke("delete-niche", {
        body: { niche }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Refresh the niches list
      await refetch();
      toast.success(`Deleted "${niche}" from niches`);
    } catch (error) {
      console.error("Error deleting niche:", error);
      toast.error("Failed to delete niche");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEditNiche = (niche: string) => {
    const details = nicheDetails[niche] || { 
      name: niche, 
      description: null, 
      example: null,
      image_url: null 
    };
    setEditingNiche(
      details.name, 
      details.description, 
      details.example,
      details.image_url
    );
    setActiveTab("edit");
  };
  
  const handleCancelEdit = () => {
    cancelEditing();
    setActiveTab("list");
  };
  
  const handleSaveNicheDetails = async () => {
    const success = await saveNicheDetails();
    if (success) {
      refetch(); // Refresh the data after saving
      setActiveTab("list");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">Niches List</TabsTrigger>
          <TabsTrigger value="edit" disabled={!isEditing}>
            Edit Niche
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Add New Niche</h2>
            <form onSubmit={handleAddNiche} className="flex space-x-2">
              <Input
                value={newNiche}
                onChange={(e) => setNewNiche(e.target.value)}
                placeholder="Enter new niche name"
                className="flex-1"
              />
              <Button type="submit" disabled={isAdding}>
                {isAdding ? "Adding..." : "Add Niche"}
              </Button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Existing Niches</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : "Refresh"}
              </Button>
            </div>
            
            {isLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">Loading niches...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {niches.length === 0 ? (
                  <p className="col-span-full text-center py-4 text-gray-500">
                    No niches found. Add your first niche above.
                  </p>
                ) : (
                  niches.sort().map((niche) => {
                    const details = nicheDetails[niche];
                    return (
                      <div key={niche} className="flex items-center p-2 border rounded">
                        {details?.image_url && (
                          <img 
                            src={details.image_url} 
                            alt={niche}
                            className="w-10 h-10 rounded object-cover mr-2" 
                          />
                        )}
                        <span className="flex-grow truncate">{niche}</span>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNiche(niche)}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNiche(niche)}
                            disabled={isDeleting}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="edit">
          {isEditing && (
            <NicheForm
              formData={formData}
              isEditing={isEditing}
              submitting={submitting}
              uploading={uploading}
              onInputChange={handleInputChange}
              onRichTextChange={handleRichTextChange}
              onCancel={handleCancelEdit}
              onSubmit={handleSaveNicheDetails}
              onImageUpload={handleImageUpload}
              onDeleteImage={handleDeleteImage}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageNiches;
