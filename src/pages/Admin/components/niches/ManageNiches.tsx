
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NicheForm from "./NicheForm";
import AddNicheForm from "./components/AddNicheForm";
import NichesList from "./components/NichesList";
import { NicheProvider, useNicheContext } from "./context/NicheContext";

// Component that consumes the context
const NicheManager = () => {
  const [activeTab, setActiveTab] = React.useState("list");
  
  const {
    isEditing,
    formData,
    submitting,
    uploading,
    nichesData,
    isLoading,
    isDeleting,
    handleInputChange,
    handleRichTextChange,
    setEditingNiche,
    cancelEditing,
    saveNicheDetails,
    handleImageUpload,
    handleDeleteImage,
    handleDeleteNiche,
    refetchNiches
  } = useNicheContext();

  const handleEditNiche = React.useCallback((niche: string) => {
    const details = nichesData?.nicheDetails[niche] || { 
      name: niche, 
      description: null, 
      example: null,
      image_url: null,
      cpm: 4
    };
    setEditingNiche(
      details.name, 
      details.description, 
      details.example,
      details.image_url,
      details.cpm
    );
    setActiveTab("edit");
  }, [nichesData, setEditingNiche]);
  
  const handleCancelEdit = React.useCallback(() => {
    cancelEditing();
    setActiveTab("list");
  }, [cancelEditing]);
  
  const handleSaveNicheDetails = React.useCallback(async () => {
    try {
      await saveNicheDetails();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving niche details:", error);
    }
  }, [saveNicheDetails]);

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
            onNicheAdded={refetchNiches}
            niches={nichesData?.niches || []}
          />

          <NichesList
            isLoading={isLoading}
            nichesData={nichesData}
            onRefresh={refetchNiches}
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

// Wrapper component that provides the context
const ManageNiches = () => {
  return (
    <NicheProvider>
      <NicheManager />
    </NicheProvider>
  );
};

export default ManageNiches;
