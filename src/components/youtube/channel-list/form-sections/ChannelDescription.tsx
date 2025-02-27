
import { Channel } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ChannelDescriptionProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const ChannelDescription = ({ editForm, onChange }: ChannelDescriptionProps) => {
  const [generating, setGenerating] = useState(false);

  const generateDescription = async () => {
    if (!editForm.channel_title) {
      toast.error("Channel title is required to generate a description");
      return;
    }

    setGenerating(true);
    try {
      console.log('Calling generate-channel-content for:', editForm.channel_title);
      
      const { data, error } = await supabase.functions.invoke('generate-channel-content', {
        body: { channelTitle: editForm.channel_title }
      });

      if (error) throw error;

      if (!data || !data.description) {
        throw new Error('Failed to generate valid content');
      }

      // Create a mock event to update the description
      const mockEvent = {
        target: {
          name: "description",
          value: data.description
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      onChange(mockEvent);
      toast.success('Description generated successfully');
    } catch (error) {
      console.error('Generate content error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const generateMetadata = async () => {
    if (!editForm.channel_title || !editForm.description) {
      toast.error("Channel title and description are required to generate metadata");
      return;
    }

    setGenerating(true);
    try {
      console.log('Calling generate-channel-metadata for:', editForm.channel_title);
      
      const { data, error } = await supabase.functions.invoke('generate-channel-metadata', {
        body: { 
          channelTitle: editForm.channel_title,
          description: editForm.description 
        }
      });

      if (error) throw error;

      if (!data) {
        throw new Error('Failed to generate valid metadata');
      }

      // Update niche
      if (data.niche) {
        const nicheEvent = {
          target: {
            name: "niche",
            value: data.niche
          }
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(nicheEvent);
      }

      // Update country
      if (data.country) {
        const countryEvent = {
          target: {
            name: "country",
            value: data.country
          }
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(countryEvent);
      }

      // Update channel type
      if (data.channelType) {
        const typeEvent = {
          target: {
            name: "channel_type",
            value: data.channelType
          }
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(typeEvent);
      }
      
      toast.success('Metadata generated successfully');
    } catch (error) {
      console.error('Generate metadata error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate metadata');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium">Description</label>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateDescription}
            disabled={generating || !editForm.channel_title}
          >
            <Wand2 className="w-4 h-4 mr-2" /> 
            {generating ? 'Generating...' : 'Generate Description'}
          </Button>
        </div>
        <textarea
          name="description"
          value={editForm?.description || ""}
          onChange={onChange}
          className="w-full p-2 border rounded min-h-[100px]"
          rows={4}
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateMetadata}
          disabled={generating || !editForm.channel_title || !editForm.description}
        >
          <Wand2 className="w-4 h-4 mr-2" /> 
          {generating ? 'Generating...' : 'Suggest Niche, Country, and Type'}
        </Button>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Gab Notes</label>
        <textarea
          name="notes"
          value={editForm?.notes || ""}
          onChange={onChange}
          className="w-full p-2 border rounded min-h-[100px]"
          rows={4}
        />
      </div>
    </div>
  );
};
