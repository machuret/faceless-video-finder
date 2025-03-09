
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainNavbar from "@/components/MainNavbar";
import { ChannelTypesList } from "./components/channelTypes/ChannelTypesList";
import { ChannelTypeForm } from "./components/channelTypes/ChannelTypeForm";
import { useChannelTypes } from "./components/channelTypes/hooks/useChannelTypes";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AdminHeader from "./components/AdminHeader";

export default function ManageChannelTypes() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  const {
    channelTypes,
    loading,
    activeTab,
    setActiveTab,
    submitting,
    selectedType,
    formData,
    handleInputChange,
    handleRichTextChange,
    handleSelectType,
    handleCreateNew,
    handleSubmit,
    handleDelete,
    handleCancel
  } = useChannelTypes();

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
        title="Manage Channel Types" 
        subtitle="Create, edit, and delete channel types for your YouTube channels"
      />
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="list">Channel Types List</TabsTrigger>
            <TabsTrigger value="edit">
              {selectedType ? "Edit Channel Type" : "Create New Channel Type"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-6">
            <Card className="p-6">
              <ChannelTypesList
                channelTypes={channelTypes}
                loading={loading}
                onEdit={handleSelectType}
                onCreateNew={handleCreateNew}
                onDelete={handleDelete}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="edit" className="mt-6">
            <Card className="p-6">
              <ChannelTypeForm
                formData={formData}
                selectedType={selectedType}
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
