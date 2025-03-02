
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { FacelessIdeaInfo } from "@/services/facelessIdeas";
import { Sparkles } from "lucide-react";

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
