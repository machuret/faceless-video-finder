
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { ChannelTypeInfo } from "@/services/channelTypeService";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChannelTypeFormProps {
  formData: ChannelTypeInfo;
  selectedType: ChannelTypeInfo | null;
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRichTextChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const ChannelTypeForm: React.FC<ChannelTypeFormProps> = ({
  formData,
  selectedType,
  submitting,
  onInputChange,
  onRichTextChange,
  onSubmit,
  onCancel
}) => {
  const [uploading, setUploading] = useState(false);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      setUploading(true);
      toast.info("Uploading image...");

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `channel_type_${formData.id}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('channel-type-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('channel-type-images')
        .getPublicUrl(fileName);

      // Update the form data
      onInputChange({
        target: {
          name: 'image_url',
          value: data.publicUrl
        }
      } as React.ChangeEvent<HTMLInputElement>);

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async () => {
    if (!formData.image_url) return;

    try {
      setUploading(true);
      
      // Extract file name from URL
      const fileName = formData.image_url.split('/').pop();
      
      if (fileName) {
        // Delete from storage
        const { error } = await supabase.storage
          .from('channel-type-images')
          .remove([fileName]);
        
        if (error) {
          throw error;
        }
      }
      
      // Update form data
      onInputChange({
        target: {
          name: 'image_url',
          value: ''
        }
      } as React.ChangeEvent<HTMLInputElement>);
      
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {selectedType ? "Edit Channel Type" : "Create New Channel Type"}
        </h2>
        
        {/* ID Field */}
        <div className="space-y-2">
          <label htmlFor="id" className="block text-sm font-medium">
            ID (lowercase, underscores only)
          </label>
          <Input
            id="id"
            name="id"
            value={formData.id}
            onChange={onInputChange}
            placeholder="channel_type_id"
            required
            readOnly={!!selectedType}
            className={selectedType ? "bg-gray-100" : ""}
          />
        </div>
        
        {/* Label Field */}
        <div className="space-y-2">
          <label htmlFor="label" className="block text-sm font-medium">
            Label
          </label>
          <Input
            id="label"
            name="label"
            value={formData.label}
            onChange={onInputChange}
            placeholder="Channel Type Name"
            required
          />
        </div>

        {/* Image Upload Field */}
        <div className="space-y-2">
          <label htmlFor="image" className="block text-sm font-medium">
            Featured Image
          </label>
          <ImageUploader
            imageUrl={formData.image_url}
            uploading={uploading}
            onUpload={handleImageUpload}
            onDelete={handleDeleteImage}
          />
        </div>
        
        {/* Description Field */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <RichTextEditor
            id="description"
            name="description"
            label=""
            value={formData.description || ""}
            onChange={onRichTextChange}
            placeholder="Enter description..."
          />
        </div>
        
        {/* Production Field */}
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
        
        {/* Example Field */}
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
      
      {/* Submit and Cancel Buttons */}
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
          {submitting ? "Saving..." : selectedType ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default ChannelTypeForm;
