
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { niches as defaultNiches } from "@/data/niches";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NicheForm from "./NicheForm";
import { useNicheForm } from "./hooks/useNicheForm";

interface NicheDetails {
  name: string;
  description: string | null;
  example: string | null;
}

const ManageNiches = () => {
  const [niches, setNiches] = useState<string[]>([]);
  const [nicheDetails, setNicheDetails] = useState<Record<string, NicheDetails>>({});
  const [newNiche, setNewNiche] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  
  const {
    isEditing,
    formData,
    submitting,
    handleInputChange,
    handleRichTextChange,
    setEditingNiche,
    cancelEditing,
    saveNicheDetails
  } = useNicheForm();

  useEffect(() => {
    fetchNiches();
  }, []);

  const fetchNiches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-niches");
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data && data.niches) {
        setNiches(data.niches);
        
        // Also fetch niche details if available
        if (data.nicheDetails) {
          setNicheDetails(data.nicheDetails);
        }
      } else {
        // Fallback to default niches if API fails
        setNiches(defaultNiches);
      }
    } catch (error) {
      console.error("Error fetching niches:", error);
      toast.error("Failed to load niches. Using default list.");
      setNiches(defaultNiches);
    } finally {
      setIsLoading(false);
    }
  };

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
      await fetchNiches();
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
      await fetchNiches();
      toast.success(`Deleted "${niche}" from niches`);
    } catch (error) {
      console.error("Error deleting niche:", error);
      toast.error("Failed to delete niche");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleEditNiche = (niche: string) => {
    const details = nicheDetails[niche] || { name: niche, description: null, example: null };
    setEditingNiche(details.name, details.description, details.example);
    setActiveTab("edit");
  };
  
  const handleCancelEdit = () => {
    cancelEditing();
    setActiveTab("list");
  };
  
  const handleSaveNicheDetails = async () => {
    await saveNicheDetails();
    fetchNiches(); // Refresh the data after saving
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
            <h2 className="text-xl font-semibold mb-4">Existing Niches</h2>
            {isLoading ? (
              <p className="text-gray-500">Loading niches...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {niches.sort().map((niche) => (
                  <div key={niche} className="flex items-center justify-between p-2 border rounded">
                    <span>{niche}</span>
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
                ))}
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
              onInputChange={handleInputChange}
              onRichTextChange={handleRichTextChange}
              onCancel={handleCancelEdit}
              onSubmit={handleSaveNicheDetails}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageNiches;
