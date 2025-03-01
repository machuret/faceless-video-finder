
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import MainNavbar from "@/components/MainNavbar";
import { useAuth } from "@/context/AuthContext";
import { 
  ChannelTypeInfo, 
  fetchChannelTypes, 
  createChannelType, 
  updateChannelType, 
  deleteChannelType 
} from "@/services/channelTypeService";

export default function ManageChannelTypes() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [channelTypes, setChannelTypes] = useState<ChannelTypeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("list");
  
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
      const data = await fetchChannelTypes();
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectType = (type: ChannelTypeInfo) => {
    setSelectedType(type);
    setFormData(type);
    setActiveTab("edit");
  };
  
  const handleCreateNew = () => {
    setSelectedType(null);
    setFormData(initialFormState);
    setActiveTab("edit");
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    
    try {
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
        await updateChannelType(formData);
        toast({
          title: "Success",
          description: "Channel type updated successfully."
        });
      } else {
        // Create new
        console.log("Creating new channel type:", formData);
        await createChannelType(formData);
        toast({
          title: "Success",
          description: "New channel type created successfully."
        });
      }
      
      await loadChannelTypes();
      setActiveTab("list");
      setFormData(initialFormState);
      setSelectedType(null);
    } catch (error) {
      console.error("Error saving channel type:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the channel type.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this channel type? This action cannot be undone.")) {
      try {
        await deleteChannelType(id);
        toast({
          title: "Success",
          description: "Channel type deleted successfully."
        });
        await loadChannelTypes();
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-crimson mb-2">Manage Channel Types</h1>
          <p className="text-gray-600 font-lato">Create, edit, and delete channel types used for categorizing YouTube channels.</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="list">Channel Types List</TabsTrigger>
            <TabsTrigger value="edit">
              {selectedType ? "Edit Channel Type" : "Create New Channel Type"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <Card className="p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-xl font-semibold">Available Channel Types</h2>
                <Button onClick={handleCreateNew}>Add New Channel Type</Button>
              </div>
              
              {loading ? (
                <p>Loading channel types...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {channelTypes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No channel types found</TableCell>
                      </TableRow>
                    ) : (
                      channelTypes.map((type) => (
                        <TableRow key={type.id}>
                          <TableCell className="font-medium">{type.id}</TableCell>
                          <TableCell>{type.label}</TableCell>
                          <TableCell className="max-w-md truncate">{type.description}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mr-2"
                              onClick={() => handleSelectType(type)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(type.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="edit">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                {selectedType ? `Edit Channel Type: ${selectedType.label}` : "Create New Channel Type"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="id">ID (slug)</Label>
                      <Input 
                        id="id" 
                        name="id" 
                        value={formData.id} 
                        onChange={handleInputChange}
                        placeholder="e.g. documentary_style"
                        disabled={!!selectedType}
                        required
                      />
                      {!selectedType && (
                        <p className="text-sm text-gray-500 mt-1">
                          Use lowercase letters, numbers, and underscores only. This cannot be changed later.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="label">Label</Label>
                      <Input 
                        id="label" 
                        name="label" 
                        value={formData.label} 
                        onChange={handleInputChange}
                        placeholder="e.g. Documentary Style"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description" 
                        value={formData.description || ''} 
                        onChange={handleInputChange}
                        placeholder="Describe this channel type..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="production">Production Details</Label>
                    <Textarea 
                      id="production" 
                      name="production" 
                      value={formData.production || ''} 
                      onChange={handleInputChange}
                      placeholder="Describe how this type of content is typically produced..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="example">Examples</Label>
                    <Textarea 
                      id="example" 
                      name="example" 
                      value={formData.example || ''} 
                      onChange={handleInputChange}
                      placeholder="Provide examples of channels that use this format..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedType ? "Update Channel Type" : "Create Channel Type"}
                  </Button>
                </div>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
