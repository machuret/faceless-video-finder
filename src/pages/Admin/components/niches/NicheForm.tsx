
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { NicheInfo } from "./hooks/useNicheForm";

interface NicheFormProps {
  formData: NicheInfo;
  isEditing: boolean;
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRichTextChange: (name: string, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const NicheForm: React.FC<NicheFormProps> = ({
  formData,
  isEditing,
  submitting,
  onInputChange,
  onRichTextChange,
  onCancel,
  onSubmit
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? `Edit Niche: ${formData.name}` : "Add New Niche"}
      </h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Niche Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            disabled={isEditing}
            className="mt-1"
            placeholder="Enter niche name"
          />
        </div>
        
        <div>
          <RichTextEditor
            id="description"
            name="description"
            label="Description"
            value={formData.description || ""}
            onChange={onRichTextChange}
            placeholder="Describe this niche category..."
          />
        </div>
        
        <div>
          <RichTextEditor
            id="example"
            name="example"
            label="Example Content Ideas"
            value={formData.example || ""}
            onChange={onRichTextChange}
            placeholder="Provide examples of content ideas for this niche..."
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Niche Details"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NicheForm;
