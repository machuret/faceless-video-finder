
import { useState, useEffect } from "react";
import { DidYouKnowFact } from "@/services/didYouKnowService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";

interface FactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fact: Partial<DidYouKnowFact>) => void;
  currentFact: Partial<DidYouKnowFact>;
  isEditing: boolean;
}

const FactDialog = ({ isOpen, onClose, onSubmit, currentFact, isEditing }: FactDialogProps) => {
  const [factState, setFactState] = useState<Partial<DidYouKnowFact>>(currentFact);

  useEffect(() => {
    setFactState(currentFact);
  }, [currentFact]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFactState(prev => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = (name: string, value: string) => {
    setFactState(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFactState(prev => ({ ...prev, is_active: checked }));
  };

  const handleSubmit = () => {
    onSubmit(factState);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              value={factState.title || ""}
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
              value={factState.content || ""}
              onChange={handleRichTextChange}
              placeholder="Enter the full content of your 'Did You Know' fact"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={factState.is_active || false}
              onCheckedChange={handleSwitchChange}
              id="is-active"
            />
            <Label htmlFor="is-active">Active</Label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "Update" : "Create"} Fact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FactDialog;
