
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
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [generatingNiche, setGeneratingNiche] = useState(false);
  const [generatingCountry, setGeneratingCountry] = useState(false);
  const [generatingType, setGeneratingType] = useState(false);

  const generateDescription = async () => {
    if (!editForm.channel_title) {
      toast.error("Channel title is required to generate a description");
      return;
    }

    setGeneratingDescription(true);
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
      setGeneratingDescription(false);
    }
  };

  const generateNiche = async () => {
    if (!editForm.channel_title || !editForm.description) {
      toast.error("Channel title and description are required to generate niche");
      return;
    }

    setGeneratingNiche(true);
    try {
      console.log('Generating niche for:', editForm.channel_title);
      
      const { data, error } = await supabase.functions.invoke('generate-channel-metadata', {
        body: { 
          channelTitle: editForm.channel_title,
          description: editForm.description,
          fieldToGenerate: 'niche'
        }
      });

      if (error) throw error;

      if (!data || !data.niche) {
        throw new Error('Failed to generate niche');
      }

      console.log("Received niche from API:", data.niche);

      // Update niche
      const nicheEvent = {
        target: {
          name: "niche",
          value: data.niche
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(nicheEvent);
      
      toast.success(`Niche generated: ${data.niche}`);
    } catch (error) {
      console.error('Generate niche error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate niche');
    } finally {
      setGeneratingNiche(false);
    }
  };

  const generateCountry = async () => {
    if (!editForm.channel_title || !editForm.description) {
      toast.error("Channel title and description are required to generate country");
      return;
    }

    setGeneratingCountry(true);
    try {
      console.log('Generating country for:', editForm.channel_title);
      
      const { data, error } = await supabase.functions.invoke('generate-channel-metadata', {
        body: { 
          channelTitle: editForm.channel_title,
          description: editForm.description,
          fieldToGenerate: 'country'
        }
      });

      if (error) throw error;

      if (!data || !data.country) {
        throw new Error('Failed to generate country');
      }

      console.log("Received country from API:", data.country);

      // Update country
      const countryEvent = {
        target: {
          name: "country",
          value: data.country
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(countryEvent);
      
      toast.success(`Country generated: ${data.country}`);
    } catch (error) {
      console.error('Generate country error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate country');
    } finally {
      setGeneratingCountry(false);
    }
  };

  const generateChannelType = async () => {
    if (!editForm.channel_title || !editForm.description) {
      toast.error("Channel title and description are required to generate channel type");
      return;
    }

    setGeneratingType(true);
    try {
      console.log('Generating channel type for:', editForm.channel_title);
      
      const { data, error } = await supabase.functions.invoke('generate-channel-metadata', {
        body: { 
          channelTitle: editForm.channel_title,
          description: editForm.description,
          fieldToGenerate: 'channelType'
        }
      });

      if (error) throw error;

      if (!data || !data.channelType) {
        throw new Error('Failed to generate channel type');
      }

      console.log("Received channel type from API:", data.channelType);

      // Update channel type
      const typeEvent = {
        target: {
          name: "channel_type",
          value: data.channelType
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(typeEvent);
      
      toast.success(`Channel type generated: ${data.channelType}`);
    } catch (error) {
      console.error('Generate channel type error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate channel type');
    } finally {
      setGeneratingType(false);
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
            disabled={generatingDescription || !editForm.channel_title}
          >
            <Wand2 className="w-4 h-4 mr-2" /> 
            {generatingDescription ? 'Generating...' : 'Generate Description'}
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
      
      <div className="flex flex-wrap gap-2 justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateNiche}
          disabled={generatingNiche || !editForm.channel_title || !editForm.description}
        >
          <Wand2 className="w-4 h-4 mr-2" /> 
          {generatingNiche ? 'Generating...' : 'Generate Niche'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateCountry}
          disabled={generatingCountry || !editForm.channel_title || !editForm.description}
        >
          <Wand2 className="w-4 h-4 mr-2" /> 
          {generatingCountry ? 'Generating...' : 'Generate Country'}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateChannelType}
          disabled={generatingType || !editForm.channel_title || !editForm.description}
        >
          <Wand2 className="w-4 h-4 mr-2" /> 
          {generatingType ? 'Generating...' : 'Generate Channel Type'}
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
