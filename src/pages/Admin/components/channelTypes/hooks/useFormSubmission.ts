
import { useState, Dispatch, SetStateAction } from "react";
import { ChannelTypeInfo, createChannelType, updateChannelType, validateChannelTypeId } from "@/services/channelTypeService";
import { toast } from "sonner";

export const useFormSubmission = (
  refreshChannelTypes: () => Promise<void>,
  setActiveTab: (tab: string) => void,
  setFormData: Dispatch<SetStateAction<ChannelTypeInfo>>,
  // Update type from string to ChannelTypeInfo to match useChannelTypeFormState
  setSelectedType: Dispatch<SetStateAction<ChannelTypeInfo | null>>,
  initialFormState: ChannelTypeInfo
) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent,
    formData: ChannelTypeInfo,
    // Update type here as well
    selectedType: ChannelTypeInfo | null
  ) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.id || !formData.label) {
      toast.error("ID and Label are required");
      return;
    }
    
    // Validate ID format using the utility function
    if (!validateChannelTypeId(formData.id)) {
      toast.error("ID must contain only lowercase letters, numbers, and underscores");
      return;
    }

    setSubmitting(true);
    
    try {
      if (selectedType) {
        // Update existing type
        await updateChannelType(formData);
        toast.success("Channel type updated successfully");
      } else {
        // Create new type
        await createChannelType(formData);
        toast.success("Channel type created successfully");
      }
      
      // Refresh the channel types list
      await refreshChannelTypes();
      
      // Reset form and navigate to list view
      setFormData(initialFormState);
      setSelectedType(null);
      setActiveTab("list");
    } catch (error) {
      console.error("Error submitting channel type:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setSelectedType(null);
    setActiveTab("list");
  };

  return { submitting, handleSubmit, handleCancel };
};
