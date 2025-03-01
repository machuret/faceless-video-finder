
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { 
  ChannelTypeInfo, 
  fetchChannelTypes, 
  createChannelType, 
  updateChannelType, 
  deleteChannelType,
  getChannelTypeById
} from "@/services/channelTypeService";

export const useChannelTypes = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [channelTypes, setChannelTypes] = useState<ChannelTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  const [submitting, setSubmitting] = useState(false);
  
  const initialFormState: ChannelTypeInfo = {
    id: "",
    label: "",
    description: "",
    production: "",
    example: ""
  };
  
  const [selectedType, setSelectedType] = useState<ChannelTypeInfo | null>(null);
  const [formData, setFormData] = useState<ChannelTypeInfo>(initialFormState);
  
  useEffect(() => {
    if (!isAdmin) {
      navigate("/admin/login");
      return;
    }
    
    loadChannelTypes();
  }, [isAdmin, navigate]);
  
  const loadChannelTypes = async () => {
    try {
      setLoading(true);
      console.log("Fetching channel types...");
      const data = await fetchChannelTypes();
      console.log("Fetched channel types:", data);
      setChannelTypes(data);
    } catch (error) {
      console.error("Error loading channel types:", error);
      toast({
        title: "Error loading channel types",
        description: "There was a problem fetching the channel types.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log(`Field "${name}" updated to:`, value);
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
          
          // Update the local state
          setChannelTypes(prev => 
            prev.map(type => type.id === updatedType.id ? updatedType : type)
          );
          
          toast({
            title: "Success",
            description: "Channel type updated successfully."
          });
          
          // Then refresh from server to ensure consistency
          await loadChannelTypes();
          
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
        const newType = await createChannelType(formData);
        console.log("New channel type created:", newType);
        
        // Update local state
        setChannelTypes(prev => [...prev, newType]);
        
        toast({
          title: "Success",
          description: "New channel type created successfully."
        });
        
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
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this channel type? This action cannot be undone.")) {
      try {
        console.log("Deleting channel type with ID:", id);
        await deleteChannelType(id);
        
        // Update local state
        setChannelTypes(prev => prev.filter(type => type.id !== id));
        
        toast({
          title: "Success",
          description: "Channel type deleted successfully."
        });
      } catch (error) {
        console.error("Error deleting channel type:", error);
        toast({
          title: "Error",
          description: "There was a problem deleting the channel type.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleCancel = () => {
    setActiveTab("list");
    setSelectedType(null);
    setFormData(initialFormState);
  };

  return {
    channelTypes,
    loading,
    activeTab,
    setActiveTab,
    submitting,
    selectedType,
    formData,
    handleInputChange,
    handleSelectType,
    handleCreateNew,
    handleSubmit,
    handleDelete,
    handleCancel
  };
};
