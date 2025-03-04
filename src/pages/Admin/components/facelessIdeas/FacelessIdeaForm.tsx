
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { FacelessIdeaInfo } from "@/services/facelessIdeas";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FacelessIdeaFormProps {
  formData: FacelessIdeaInfo;
  selectedIdea: FacelessIdeaInfo | null;
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRichTextChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onEnhanceDescription: (ideaId: string) => Promise<void>;
}

export const FacelessIdeaForm: React.FC<FacelessIdeaFormProps> = ({
  formData,
  selectedIdea,
  submitting,
  onInputChange,
  onRichTextChange,
  onSubmit,
  onCancel,
  onEnhanceDescription
}) => {
  const [enhancing, setEnhancing] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleEnhanceClick = async () => {
    if (!formData.id || !formData.label) {
      return;
    }
    
    setEnhancing(true);
    try {
      await onEnhanceDescription(formData.id);
    } finally {
      setEnhancing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      setUploading(true);

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `faceless-ideas/${formData.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('faceless-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('faceless-images')
        .getPublicUrl(filePath);

      // Update form data with the new image URL
      onInputChange({
        target: {
          name: 'image_url',
          value: data.publicUrl
        }
      } as React.ChangeEvent<HTMLInputElement>);

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {selectedIdea ? "Edit Faceless Idea" : "Create New Faceless Idea"}
        </h2>
        
        <div className="space-y-2">
          <label htmlFor="id" className="block text-sm font-medium">
            ID (lowercase, underscores only)
          </label>
          <Input
            id="id"
            name="id"
            value={formData.id}
            onChange={onInputChange}
            placeholder="my_faceless_idea"
            required
            readOnly={!!selectedIdea}
            className={selectedIdea ? "bg-gray-100" : ""}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="label" className="block text-sm font-medium">
            Label
          </label>
          <Input
            id="label"
            name="label"
            value={formData.label}
            onChange={onInputChange}
            placeholder="My Faceless Idea"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="image" className="block text-sm font-medium">
            Featured Image
          </label>
          <div className="flex flex-col space-y-3">
            {formData.image_url && (
              <div className="relative w-full max-w-xs">
                <img 
                  src={formData.image_url} 
                  alt={formData.label}
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
              {formData.image_url && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => onInputChange({
                    target: { name: 'image_url', value: '' }
                  } as React.ChangeEvent<HTMLInputElement>)}
                >
                  Remove
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleEnhanceClick}
              disabled={enhancing || !formData.id || !formData.label}
              className="flex items-center gap-1"
            >
              <Sparkles className="h-4 w-4" />
              {enhancing ? "Enhancing..." : "Enhance with AI"}
            </Button>
          </div>
          <RichTextEditor
            id="description"
            name="description"
            label=""
            value={formData.description || ""}
            onChange={onRichTextChange}
            placeholder="Enter description..."
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="production" className="block text-sm font-medium">
            How to Create
          </label>
          <RichTextEditor
            id="production"
            name="production"
            label=""
            value={formData.production || ""}
            onChange={onRichTextChange}
            placeholder="Enter production details..."
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="example" className="block text-sm font-medium">
            Examples
          </label>
          <RichTextEditor
            id="example"
            name="example"
            label=""
            value={formData.example || ""}
            onChange={onRichTextChange}
            placeholder="Enter examples..."
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? "Saving..." : selectedIdea ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};
