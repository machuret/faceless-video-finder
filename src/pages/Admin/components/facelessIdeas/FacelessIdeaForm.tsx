
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FacelessIdeaInfo } from "@/services/facelessIdeaService";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";

interface FacelessIdeaFormProps {
  formData: FacelessIdeaInfo;
  selectedIdea: FacelessIdeaInfo | null;
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onRichTextChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const FacelessIdeaForm: React.FC<FacelessIdeaFormProps> = ({
  formData,
  selectedIdea,
  submitting,
  onInputChange,
  onRichTextChange,
  onSubmit,
  onCancel
}) => {
  const [idError, setIdError] = useState<string | null>(null);
  
  // Debug log to check form data
  useEffect(() => {
    console.log("Faceless Idea Form Data:", formData);
    console.log("Selected Idea:", selectedIdea);
  }, [formData, selectedIdea]);
  
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
    if (!selectedIdea) {
      const idValidationError = validateId(formData.id);
      if (idValidationError) {
        setIdError(idValidationError);
        return;
      }
    }
    
    // Set form data in dataset for the submit handler to access
    (e.currentTarget as HTMLFormElement).dataset.formData = JSON.stringify(formData);
    (e.currentTarget as HTMLFormElement).dataset.selectedIdea = JSON.stringify(selectedIdea);
    
    onSubmit(e);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        {selectedIdea ? `Edit Faceless Idea: ${selectedIdea.label}` : "Create New Faceless Idea"}
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
                placeholder="e.g. compilation_videos"
                disabled={!!selectedIdea}
                required
                className={idError ? "border-red-500" : ""}
              />
              {idError ? (
                <p className="text-sm text-red-500 mt-1">{idError}</p>
              ) : !selectedIdea && (
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
                placeholder="e.g. Compilation Videos"
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
              placeholder="Describe this faceless idea concept..."
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
            placeholder="Provide examples of content ideas for this faceless idea concept..."
            className="min-h-[100px]"
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || (idError !== null && !selectedIdea)}>
            {submitting ? "Saving..." : (selectedIdea ? "Update Faceless Idea" : "Create Faceless Idea")}
          </Button>
        </div>
      </form>
    </div>
  );
};
