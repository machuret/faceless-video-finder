
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor/RichTextEditor";
import { FacelessIdeaInfo } from "@/services/facelessIdeaService";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FacelessIdeaFormProps {
  formData: FacelessIdeaInfo;
  selectedIdea: FacelessIdeaInfo | null;
  submitting: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRichTextChange: (name: string, value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
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
  const [enhancing, setEnhancing] = React.useState(false);

  const handleEnhanceDescription = async () => {
    if (!formData.label) {
      toast.error("Please enter a label first");
      return;
    }
    
    setEnhancing(true);
    toast.info("Enhancing description...", { duration: 2000 });
    
    try {
      console.log("Calling enhance-faceless-idea function with:", { 
        label: formData.label, 
        description: formData.description 
      });
      
      const { data, error } = await supabase.functions.invoke('enhance-faceless-idea', {
        body: { 
          label: formData.label,
          description: formData.description
        }
      });
      
      console.log("Response from enhance-faceless-idea:", { data, error });
      
      if (error) {
        throw error;
      }
      
      if (data?.enhancedDescription) {
        onRichTextChange('description', data.enhancedDescription);
        toast.success("Description enhanced successfully!");
      } else {
        throw new Error("No enhanced description received");
      }
    } catch (error) {
      console.error("Error enhancing description:", error);
      toast.error("Failed to enhance description: " + (error instanceof Error ? error.message : "Unknown error"));
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
              onClick={handleEnhanceDescription}
              disabled={enhancing}
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
