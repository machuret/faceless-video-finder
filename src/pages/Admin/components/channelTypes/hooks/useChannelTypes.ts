
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useChannelTypesList } from "./useChannelTypesList";
import { useChannelTypeForm } from "./useChannelTypeForm";

export const useChannelTypes = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("list");
  
  // Check authentication
  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate]);
  
  // Get channel types list functionality
  const { 
    channelTypes, 
    loading, 
    loadChannelTypes, 
    handleDelete 
  } = useChannelTypesList();
  
  // Create a wrapper function that returns void
  const loadChannelTypesWrapper = async () => {
    await loadChannelTypes();
    return;
  };
  
  // Get form functionality
  const {
    submitting,
    selectedType,
    formData,
    handleInputChange,
    handleRichTextChange,
    handleSelectType,
    handleCreateNew,
    handleSubmit,
    handleCancel
  } = useChannelTypeForm(loadChannelTypesWrapper, setActiveTab);

  // Debug logs to track state changes
  useEffect(() => {
    console.log("Active Tab:", activeTab);
    console.log("Selected Type:", selectedType);
    console.log("Form Data:", formData);
  }, [activeTab, selectedType, formData]);

  return {
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
  };
};
