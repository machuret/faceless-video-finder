
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { NicheInfo } from "./hooks/useNicheForm";
import { Image as ImageIcon, X } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        
        {onImageUpload && (
          <div className="space-y-2">
            <Label htmlFor="image">Featured Image</Label>
            <div className="flex flex-col space-y-3">
              {formData.image_url && (
                <div className="relative w-full max-w-xs">
                  <img 
                    src={formData.image_url} 
                    alt={formData.name}
                    className="rounded-md object-cover h-48 w-full" 
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1"
                >
                  <ImageIcon className="h-4 w-4" />
                  {uploading ? "Uploading..." : formData.image_url ? "Change Image" : "Upload Image"}
                </Button>
                {formData.image_url && onDeleteImage && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onDeleteImage}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </div>
            </div>
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
