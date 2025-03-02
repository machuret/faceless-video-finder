
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainNavbar from "@/components/MainNavbar";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AdminHeader from "./components/AdminHeader";
import { FacelessIdeasList } from "./components/facelessIdeas/FacelessIdeasList";
import { FacelessIdeaForm } from "./components/facelessIdeas/FacelessIdeaForm";
import { useFacelessIdeas } from "./components/facelessIdeas/hooks/useFacelessIdeas";

export default function ManageFacelessIdeas() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const {
    facelessIdeas,
    loading,
    activeTab,
    setActiveTab,
    submitting,
    selectedIdea,
    formData,
    handleInputChange,
    handleRichTextChange,
    handleSelectIdea,
    handleCreateNew,
    handleSubmit,
    handleDelete,
    handleCancel,
    handleCsvUpload
  } = useFacelessIdeas();

  useEffect(() => {
    // Only run this check when auth loading is complete
    if (!authLoading) {
      if (!user) {
        toast.error("Please log in to access this page");
        navigate("/admin/login");
      } else if (!isAdmin) {
        toast.error("You don't have permission to access this page");
        navigate("/");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <AdminHeader 
        title="Manage Faceless Ideas" 
        subtitle="Create, edit, and delete faceless content ideas for your YouTube channels"
      />
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="list">Faceless Ideas List</TabsTrigger>
            <TabsTrigger value="edit">
              {selectedIdea ? "Edit Faceless Idea" : "Create New Faceless Idea"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            <Card className="p-6">
              <FacelessIdeasList
                facelessIdeas={facelessIdeas}
                loading={loading}
                onEdit={handleSelectIdea}
                onCreateNew={handleCreateNew}
                onDelete={handleDelete}
                onCsvUpload={handleCsvUpload}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6">
            <Card className="p-6">
              <FacelessIdeaForm
                formData={formData}
                selectedIdea={selectedIdea}
                submitting={submitting}
                onInputChange={handleInputChange}
                onRichTextChange={handleRichTextChange}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
