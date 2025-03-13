
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { NicheInfo } from "./hooks/types";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface NicheFormProps {
  formData: NicheInfo;
  isEditing: boolean;
  submitting: boolean;
  uploading?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRichTextChange: (name: string, value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage?: () => void;
}

const NicheForm: React.FC<NicheFormProps> = ({
  formData,
  isEditing,
  submitting,
  uploading = false,
  onInputChange,
  onRichTextChange,
  onCancel,
  onSubmit,
  onImageUpload,
  onDeleteImage
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
          <Label htmlFor="cpm">Cost Per Mille (CPM)</Label>
          <Input
            id="cpm"
            name="cpm"
            type="number"
            step="0.01"
            value={formData.cpm || ''}
            onChange={onInputChange}
            className="mt-1"
            placeholder="Enter CPM value (e.g. 4.00)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Default CPM value for all channels in this niche
          </p>
        </div>
        
        {onImageUpload && (
          <div className="space-y-2">
            <Label htmlFor="image">Featured Image</Label>
            
            <ImageUploader
              imageUrl={formData.image_url}
              uploading={uploading}
              onUpload={onImageUpload}
              onDelete={onDeleteImage}
              className="mt-1"
              maxFileSizeMB={5}
            />
          </div>
        )}
        
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
            disabled={submitting || uploading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={onSubmit}
            disabled={submitting || uploading}
          >
            {submitting ? "Saving..." : "Save Niche Details"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NicheForm;
