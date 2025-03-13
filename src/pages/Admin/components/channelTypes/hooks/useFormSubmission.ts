
import { useState, Dispatch, SetStateAction } from "react";
import { 
  ChannelTypeInfo, 
  createChannelType, 
  updateChannelType, 
  validateChannelTypeId 
} from "@/services/channelTypeService";
import { useToast } from "@/components/ui/use-toast";

export const useFormSubmission = (
  refreshChannelTypes: () => Promise<void>,
  setActiveTab: (tab: string) => void,
  setFormData: Dispatch<SetStateAction<ChannelTypeInfo>>,
  setSelectedType: Dispatch<SetStateAction<ChannelTypeInfo | null>>,
  initialFormState: ChannelTypeInfo
) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (
    e: React.FormEvent,
    formData: ChannelTypeInfo,
    selectedType: ChannelTypeInfo | null
  ) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      console.log("Form submission data:", formData);
      console.log("Selected type:", selectedType);
      
      // Determine if we're creating or updating based on if we have a selected type
      if (!selectedType) {
        // Creating new channel type
        if (!validateChannelTypeId(formData.id)) {
          toast({
            title: "Invalid ID format",
            description: "ID must contain only lowercase letters, numbers, and underscores",
            variant: "destructive"
          });
          setSubmitting(false);
          return;
        }
        
        console.log("Creating new channel type:", formData);
        const result = await createChannelType(formData);
        console.log("Creation result:", result);
        
        toast({
          title: "Channel Type Created",
          description: `Successfully created channel type: ${formData.label}`
        });
      } else {
        // Updating existing channel type
        console.log("Updating channel type:", formData);
        const result = await updateChannelType(formData);
        console.log("Update result:", result);
        
        toast({
          title: "Channel Type Updated",
          description: `Successfully updated channel type: ${formData.label}`
        });
      }
      
      // Refresh the list of channel types
      await refreshChannelTypes();
      
      // Reset form and redirect to list view
      setFormData(initialFormState);
      setSelectedType(null);
      setActiveTab("list");
    } catch (error) {
      console.error("Error submitting channel type:", error);
      toast({
        title: "Error",
        description: `Failed to ${selectedType ? "update" : "create"} channel type: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
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
