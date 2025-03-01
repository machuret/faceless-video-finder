
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft, Plus, Edit, Trash, Save } from "lucide-react";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { supabase } from "@/integrations/supabase/client";

interface ChannelTypeFormData {
  id: string;
  label: string;
  description: string;
  production: string;
  example: string;
}

const emptyFormData: ChannelTypeFormData = {
  id: "",
  label: "",
  description: "",
  production: "",
  example: ""
};

export default function ManageChannelTypes() {
  const navigate = useNavigate();
  const [types, setTypes] = useState<typeof channelTypes>([]);
  const [editForm, setEditForm] = useState<ChannelTypeFormData>(emptyFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Load channel types
    loadChannelTypes();
  }, []);

  const loadChannelTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("channel_types")
        .select("*")
        .order("label");
      
      if (error) throw error;
      
      if (data) {
        setTypes(data);
      } else {
        // Fallback to hard-coded types if no data in DB
        setTypes(channelTypes);
      }
    } catch (error) {
      console.error("Error loading channel types:", error);
      toast.error("Failed to load channel types");
      // Fallback to hard-coded types
      setTypes(channelTypes);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (field: keyof ChannelTypeFormData) => (value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateNew = () => {
    setEditForm({
      ...emptyFormData,
      id: generateSlug("new_channel_type")
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (type: any) => {
    setEditForm({
      id: type.id,
      label: type.label,
      description: type.description,
      production: type.production,
      example: type.example
    });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditForm(emptyFormData);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSave = async () => {
    try {
      if (!editForm.id || !editForm.label) {
        toast.error("ID and label are required fields");
        return;
      }

      // Generate a slug-friendly ID if creating new
      const channelTypeId = isCreating ? generateSlug(editForm.label) : editForm.id;
      
      const typeData = {
        id: channelTypeId,
        label: editForm.label,
        description: editForm.description,
        production: editForm.production,
        example: editForm.example
      };

      let operation;
      if (isCreating) {
        operation = supabase.from("channel_types").insert(typeData);
      } else {
        operation = supabase.from("channel_types").update(typeData).eq("id", typeData.id);
      }

      const { error } = await operation;
      
      if (error) throw error;
      
      toast.success(`Channel type ${isCreating ? "created" : "updated"} successfully`);
      loadChannelTypes();
      handleCancel();
    } catch (error) {
      console.error("Error saving channel type:", error);
      toast.error(`Failed to ${isCreating ? "create" : "update"} channel type`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this channel type?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("channel_types")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Channel type deleted successfully");
      loadChannelTypes();
      
      // If we're editing the type that was just deleted, cancel the edit
      if (editForm.id === id) {
        handleCancel();
      }
    } catch (error) {
      console.error("Error deleting channel type:", error);
      toast.error("Failed to delete channel type");
    }
  };

  // Helper to generate a slug from a string
  const generateSlug = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^\w_]+/g, '')
      .replace(/__+/g, '_');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Manage Channel Types</h1>
          </div>
          
          <Button 
            onClick={handleCreateNew}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Type
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Channel Types List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Channel Types</h2>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {types.map((type) => (
                  <div 
                    key={type.id} 
                    className={`p-3 border rounded-md flex justify-between items-center ${
                      editForm.id === type.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-gray-500 truncate">{type.id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(type)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(type.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {isCreating ? "Create New Channel Type" : isEditing ? "Edit Channel Type" : "Channel Type Details"}
              </h2>
              
              {(isEditing || isCreating) ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">ID (slug)</label>
                    <Input 
                      name="id"
                      value={editForm.id}
                      onChange={handleInputChange}
                      placeholder="channel_type_id"
                      disabled={isEditing} // Only allow changing ID when creating
                      className="mb-1"
                    />
                    <p className="text-xs text-gray-500">Used in URLs and database. Cannot be changed after creation.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Label</label>
                    <Input 
                      name="label"
                      value={editForm.label}
                      onChange={handleInputChange}
                      placeholder="Channel Type Name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <RichTextEditor 
                      value={editForm.description}
                      onChange={handleRichTextChange("description")}
                      placeholder="Describe this channel type..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Typical Production</label>
                    <RichTextEditor 
                      value={editForm.production}
                      onChange={handleRichTextChange("production")}
                      placeholder="Describe the typical production process..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Examples</label>
                    <RichTextEditor 
                      value={editForm.example}
                      onChange={handleRichTextChange("example")}
                      placeholder="Provide examples of this channel type..."
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select a channel type to edit or click "Add New Type"
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
