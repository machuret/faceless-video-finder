
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainNavbar from "@/components/MainNavbar";
import { ChannelTypesList } from "./components/channelTypes/ChannelTypesList";
import { ChannelTypeForm } from "./components/channelTypes/ChannelTypeForm";
import { useChannelTypes } from "./components/channelTypes/hooks/useChannelTypes";

export default function ManageChannelTypes() {
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

  // Add console log to debug the issue
  console.log("Current active tab:", activeTab);
  console.log("Form data:", formData);
  console.log("Selected type:", selectedType);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-crimson mb-2">Manage Channel Types</h1>
          <p className="text-gray-600 font-lato">Create, edit, and delete channel types used for categorizing YouTube channels.</p>
        </div>
        
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
