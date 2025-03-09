
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NicheForm from "./NicheForm";
import { useNicheForm } from "./hooks/useNicheForm";
import { useNichesList } from "./hooks/useNichesList";
import { useNicheOperations } from "./hooks/useNicheOperations";
import AddNicheForm from "./components/AddNicheForm";
import NichesList from "./components/NichesList";

const ManageNiches = () => {
  const [activeTab, setActiveTab] = useState("list");
  
  // Use React Query for data fetching with caching
  const { 
    data: nichesData,
    isLoading,
    refetch
  } = useNichesList();
  
  const {
    isDeleting,
    handleDeleteNiche
  } = useNicheOperations(refetch);
  
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

  const handleEditNiche = (niche: string) => {
    const details = nichesData?.nicheDetails[niche] || { 
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
    try {
      await saveNicheDetails();
      await refetch();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving niche details:", error);
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
          <AddNicheForm 
            niches={nichesData?.niches || []} 
            onNicheAdded={async () => { await refetch(); }}
          />

          <NichesList
            isLoading={isLoading}
            nichesData={nichesData}
            onRefresh={async () => { await refetch(); }}
            onEdit={handleEditNiche}
            onDelete={handleDeleteNiche}
            isDeleting={isDeleting}
          />
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
