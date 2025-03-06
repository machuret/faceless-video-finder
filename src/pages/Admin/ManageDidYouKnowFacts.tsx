
import { useState, useEffect } from "react";
import AdminHeader from "./components/AdminHeader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash, Edit, Eye, EyeOff } from "lucide-react";
import { 
  fetchAllFacts, 
  createFact, 
  updateFact, 
  deleteFact,
  DidYouKnowFact 
} from "@/services/didYouKnowService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const ManageDidYouKnowFacts = () => {
  const [facts, setFacts] = useState<DidYouKnowFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFact, setCurrentFact] = useState<Partial<DidYouKnowFact>>({
    title: "",
    content: "",
    is_active: true
  });

  useEffect(() => {
    loadFacts();
  }, []);

  const loadFacts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllFacts();
      setFacts(data);
    } catch (error) {
      toast.error("Failed to load facts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (fact?: DidYouKnowFact) => {
    if (fact) {
      setCurrentFact(fact);
      setIsEditing(true);
    } else {
      setCurrentFact({
        title: "",
        content: "",
        is_active: true
      });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentFact(prev => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (name: string, value: string) => {
    setCurrentFact(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setCurrentFact(prev => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = async () => {
    try {
      if (!currentFact.title || !currentFact.content) {
        toast.error("Title and content are required");
        return;
      }

      if (isEditing && currentFact.id) {
        await updateFact(currentFact.id, {
          title: currentFact.title,
          content: currentFact.content,
          is_active: currentFact.is_active
        });
        toast.success("Fact updated successfully");
      } else {
        await createFact({
          title: currentFact.title,
          content: currentFact.content,
          is_active: currentFact.is_active || true
        });
        toast.success("Fact created successfully");
      }
      
      setDialogOpen(false);
      loadFacts();
    } catch (error) {
      toast.error(isEditing ? "Failed to update fact" : "Failed to create fact");
      console.error(error);
    }
  };

  const handleToggleActive = async (fact: DidYouKnowFact) => {
    try {
      await updateFact(fact.id, { is_active: !fact.is_active });
      toast.success(`Fact ${fact.is_active ? "deactivated" : "activated"} successfully`);
      loadFacts();
    } catch (error) {
      toast.error("Failed to update fact status");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this fact? This action cannot be undone.")) {
      try {
        await deleteFact(id);
        toast.success("Fact deleted successfully");
        loadFacts();
      } catch (error) {
        toast.error("Failed to delete fact");
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title="Manage Did You Know Facts" 
        subtitle="Create and manage facts that appear on channel pages"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Did You Know Facts</h2>
              <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                <Plus size={16} />
                Add New Fact
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : facts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No facts found. Create your first fact to get started.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Content Preview</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facts.map(fact => (
                    <TableRow key={fact.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {fact.title}
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-md">
                        <div className="truncate">{fact.content.substring(0, 100)}...</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          fact.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {fact.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleToggleActive(fact)}
                            title={fact.is_active ? "Deactivate" : "Activate"}
                          >
                            {fact.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleOpenDialog(fact)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(fact.id)}
                            title="Delete"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Fact" : "Add New Fact"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={currentFact.title || ""}
                onChange={handleInputChange}
                placeholder="Enter a short, catchy title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                id="content"
                name="content"
                label=""
                value={currentFact.content || ""}
                onChange={handleRichTextChange}
                placeholder="Enter the full content of your 'Did You Know' fact"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentFact.is_active || false}
                onCheckedChange={handleSwitchChange}
                id="is-active"
              />
              <Label htmlFor="is-active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {isEditing ? "Update" : "Create"} Fact
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageDidYouKnowFacts;
