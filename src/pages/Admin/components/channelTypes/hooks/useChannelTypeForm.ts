
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  ChannelTypeInfo, 
  createChannelType, 
  updateChannelType, 
  getChannelTypeById
} from "@/services/channelTypeService";

export const initialFormState: ChannelTypeInfo = {
  id: "",
  label: "",
  description: "",
  production: "",
  example: ""
};

export const useChannelTypeForm = (
  refreshChannelTypes: () => Promise<void>,
  setActiveTab: (tab: string) => void
) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<ChannelTypeInfo | null>(null);
  const [formData, setFormData] = useState<ChannelTypeInfo>(initialFormState);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log(`Field "${name}" updated to:`, value);
  };
  
  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log(`Rich text field "${name}" updated`);
  };
  
  const handleSelectType = async (type: ChannelTypeInfo) => {
    try {
      console.log("Selected type for editing:", type);
      
      // Fetch fresh data from the database to ensure we're working with the latest
      const freshData = await getChannelTypeById(type.id);
      if (!freshData) {
        toast({
          title: "Error",
          description: `Channel type with ID ${type.id} not found.`,
          variant: "destructive"
        });
        return;
      }
      
      // Set the selected type and form data
      setSelectedType(freshData);
      setFormData({
        id: freshData.id,
        label: freshData.label || "",
        description: freshData.description || "",
        production: freshData.production || "",
        example: freshData.example || ""
      });
      setActiveTab("edit");
    } catch (error) {
      console.error("Error selecting channel type:", error);
      toast({
        title: "Error",
        description: "There was a problem loading the channel type data.",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateNew = () => {
    setSelectedType(null);
    setFormData(initialFormState);
    setActiveTab("edit");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
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
        description: "There was a problem saving the channel type.",
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
    selectedType,
    formData,
    handleInputChange,
    handleRichTextChange,
    handleSelectType,
    handleCreateNew,
    handleSubmit,
    handleCancel
  };
};
