
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChannelTypeInfo } from "@/services/channelTypeService";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";

interface ChannelTypeFormProps {
  formData: ChannelTypeInfo;
  selectedType: ChannelTypeInfo | null;
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onRichTextChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ChannelTypeForm: React.FC<ChannelTypeFormProps> = ({
  formData,
  selectedType,
  submitting,
  onInputChange,
  onRichTextChange,
  onSubmit,
  onCancel
}) => {
  const [idError, setIdError] = useState<string | null>(null);
  
  // Debug log to check form data
  useEffect(() => {
    console.log("Channel Type Form Data:", formData);
    console.log("Selected Type:", selectedType);
  }, [formData, selectedType]);
  
  const validateId = (value: string) => {
    const regex = /^[a-z0-9_]+$/;
    if (!regex.test(value)) {
      return "ID must contain only lowercase letters, numbers, and underscores";
    }
    return null;
  };
  
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateId(value);
    setIdError(error);
    onInputChange(e);
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate ID field before submission
    if (!selectedType) {
      const idValidationError = validateId(formData.id);
      if (idValidationError) {
        setIdError(idValidationError);
        return;
      }
    }
    
    onSubmit(e);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        {selectedType ? `Edit Channel Type: ${selectedType.label}` : "Create New Channel Type"}
      </h2>
      
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="id">ID (slug)</Label>
              <Input 
                id="id" 
                name="id" 
                value={formData.id} 
                onChange={handleIdChange}
                placeholder="e.g. documentary_style"
                disabled={!!selectedType}
                required
                className={idError ? "border-red-500" : ""}
              />
              {idError ? (
                <p className="text-sm text-red-500 mt-1">{idError}</p>
              ) : !selectedType && (
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
                onChange={onInputChange}
                placeholder="e.g. Documentary Style"
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <RichTextEditor
              id="description"
              name="description"
              label="Description"
              value={formData.description || ''}
              onChange={(name, value) => {
                console.log(`Updating ${name} with value:`, value);
                onRichTextChange(name, value);
              }}
              placeholder="Describe this channel type..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <RichTextEditor
            id="production"
            name="production"
            label="How to Create"
            value={formData.production || ''}
            onChange={(name, value) => {
              console.log(`Updating ${name} with value:`, value);
              onRichTextChange(name, value);
            }}
            placeholder="Describe how to create this type of content with step-by-step instructions..."
            className="min-h-[200px]"
          />
          
          <RichTextEditor
            id="example"
            name="example"
            label="Example Ideas"
            value={formData.example || ''}
            onChange={(name, value) => {
              console.log(`Updating ${name} with value:`, value);
              onRichTextChange(name, value);
            }}
            placeholder="Provide examples of content ideas for this channel type..."
            className="min-h-[100px]"
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || (idError !== null && !selectedType)}>
            {submitting ? "Saving..." : (selectedType ? "Update Channel Type" : "Create Channel Type")}
          </Button>
        </div>
      </form>
    </div>
  );
};
