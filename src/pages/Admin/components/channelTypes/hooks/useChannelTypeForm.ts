
import { useState } from "react";
import { ChannelTypeInfo } from "@/services/channelTypeService";
import { useChannelTypeFormState } from "./useChannelTypeFormState";
import { useFormInputHandlers } from "./useFormInputHandlers";
import { useFormSubmission } from "./useFormSubmission";
import { useTypeSelection } from "./useTypeSelection";

export const initialFormState: ChannelTypeInfo = {
  id: "",
  label: "",
  description: "",
  image_url: null,
  production: "",
  example: ""
};

export const useChannelTypeForm = (
  refreshChannelTypes: () => Promise<void>,
  setActiveTab: (tab: string) => void
) => {
  // Get form state management
  const { formData, setFormData, selectedType, setSelectedType } = useChannelTypeFormState(initialFormState);
  
  // Get input handlers
  const { handleInputChange, handleRichTextChange } = useFormInputHandlers(setFormData);
  
  // Get form submission handlers
  const { submitting, handleSubmit, handleCancel } = useFormSubmission(
    refreshChannelTypes,
    setActiveTab,
    setFormData,
    setSelectedType,
    initialFormState
  );
  
  // Get type selection handlers
  const { handleSelectType, handleCreateNew } = useTypeSelection(
    setSelectedType,
    setFormData,
    setActiveTab
  );
  
  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, formData, selectedType);
  };

  return {
    submitting,
    selectedType,
    formData,
    handleInputChange,
    handleRichTextChange,
    handleSelectType,
    handleCreateNew,
    handleSubmit: onSubmit,
    handleCancel
  };
};
