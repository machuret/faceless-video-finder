
import { Channel } from "@/types/youtube";
import { GenerateButton } from "./GenerateButton";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DescriptionEditorProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function DescriptionEditor({ editForm, onChange }: DescriptionEditorProps) {
  const handleDescriptionChange = (html: string) => {
    const mockEvent = {
      target: {
        name: "description",
        value: html
      }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    onChange(mockEvent);
  };

  const generateDescription = async () => {
    if (!editForm.channel_title) {
      toast.error("Channel title is required to generate a description");
      throw new Error("Channel title is required");
    }

    console.log('Calling generate-channel-content for:', editForm.channel_title);
    
    const { data, error } = await supabase.functions.invoke('generate-channel-content', {
      body: { channelTitle: editForm.channel_title }
    });

    if (error) throw error;

    if (!data || !data.description) {
      throw new Error('Failed to generate valid content');
    }

    handleDescriptionChange(data.description);
    toast.success('Description generated successfully');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium">Description</label>
        <GenerateButton 
          label="Description"
          onGenerate={generateDescription}
          disabled={!editForm.channel_title}
        />
      </div>
      <RichTextEditor 
        value={editForm?.description || ""} 
        onChange={handleDescriptionChange}
        placeholder="Enter channel description..." 
      />
    </div>
  );
}
