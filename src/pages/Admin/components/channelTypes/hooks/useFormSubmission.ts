
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  ChannelTypeInfo, 
  createChannelType, 
  updateChannelType,
  validateChannelTypeId
} from "@/services/channelTypeService";

export const useFormSubmission = (
  refreshChannelTypes: () => Promise<void>,
  setActiveTab: (tab: string) => void,
  setFormData: React.Dispatch<React.SetStateAction<ChannelTypeInfo>>,
  setSelectedType: React.Dispatch<React.SetStateAction<ChannelTypeInfo | null>>,
  initialFormState: ChannelTypeInfo
) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent, formData: ChannelTypeInfo, selectedType: ChannelTypeInfo | null) => {
    e.preventDefault();
    
    if (submitting) {
      console.log("Submit already in progress, skipping");
      return;
    }
    
    try {
      setSubmitting(true);
      console.log("Form submitted with data:", formData);
      
      // Validate form fields
      if (!formData.id) {
        toast({
          title: "Error",
          description: "ID is required",
          variant: "destructive"
        });
        return;
      }
      
      if (!formData.label) {
        toast({
          title: "Error",
          description: "Label is required",
          variant: "destructive"
        });
        return;
      }
      
      // Validate ID format
      if (!selectedType && !validateChannelTypeId(formData.id)) {
        toast({
          title: "Error",
          description: "ID must contain only lowercase letters, numbers, and underscores",
          variant: "destructive"
        });
        return;
      }
      
      if (selectedType) {
        // Update existing
        console.log("Updating existing channel type:", formData);
        
        try {
          // Create a clean object for the update
          const updateData: ChannelTypeInfo = {
            id: formData.id,
            label: formData.label,
            description: formData.description || "",
            production: formData.production || "",
            example: formData.example || ""
          };
          
          console.log("Sending update with data:", updateData);
          
          const updatedType = await updateChannelType(updateData);
          console.log("Channel type updated successfully:", updatedType);
          
          toast({
            title: "Success",
            description: "Channel type updated successfully."
          });
          
          // Then refresh from server to ensure consistency
          await refreshChannelTypes();
          
          // Reset form and navigation
          setActiveTab("list");
          setFormData(initialFormState);
          setSelectedType(null);
        } catch (updateError) {
          console.error("Error during update operation:", updateError);
          toast({
            title: "Update Failed",
            description: `Error: ${updateError instanceof Error ? updateError.message : 'Unknown error occurred'}`,
            variant: "destructive"
          });
        }
      } else {
        // Create new
        console.log("Creating new channel type:", formData);
        await createChannelType(formData);
        console.log("New channel type created successfully");
        
        toast({
          title: "Success",
          description: "New channel type created successfully."
        });
        
        // Refresh the list from server
        await refreshChannelTypes();
        
        // Reset form and navigation
        setActiveTab("list");
        setFormData(initialFormState);
      }
    } catch (error) {
      console.error("Error saving channel type:", error);
      toast({
        title: "Error",
        description: `There was a problem saving the channel type: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    setActiveTab("list");
    setSelectedType(null);
    setFormData(initialFormState);
  };

  return {
    submitting,
    handleSubmit,
    handleCancel
  };
};
