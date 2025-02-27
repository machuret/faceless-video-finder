
import { Channel } from "@/types/youtube";
import { GenerateButton } from "./GenerateButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MetadataGeneratorsProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function MetadataGenerators({ editForm, onChange }: MetadataGeneratorsProps) {
  const areRequiredFieldsPresent = !!(editForm.channel_title && editForm.description);
  
  const generateNiche = async () => {
    if (!areRequiredFieldsPresent) {
      toast.error("Channel title and description are required to generate niche");
      throw new Error("Required fields missing");
    }

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

    const nicheEvent = {
      target: {
        name: "niche",
        value: data.niche
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(nicheEvent);
    
    toast.success(`Niche generated: ${data.niche}`);
  };

  const generateCountry = async () => {
    if (!areRequiredFieldsPresent) {
      toast.error("Channel title and description are required to generate country");
      throw new Error("Required fields missing");
    }

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

    const countryEvent = {
      target: {
        name: "country",
        value: data.country
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(countryEvent);
    
    toast.success(`Country generated: ${data.country}`);
  };

  const generateChannelType = async () => {
    if (!areRequiredFieldsPresent) {
      toast.error("Channel title and description are required to generate channel type");
      throw new Error("Required fields missing");
    }

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

    const typeEvent = {
      target: {
        name: "channel_type",
        value: data.channelType
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    onChange(typeEvent);
    
    toast.success(`Channel type generated: ${data.channelType}`);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <GenerateButton 
        label="Niche"
        onGenerate={generateNiche}
        disabled={!areRequiredFieldsPresent}
      />
      
      <GenerateButton 
        label="Country"
        onGenerate={generateCountry}
        disabled={!areRequiredFieldsPresent}
      />
      
      <GenerateButton 
        label="Channel Type"
        onGenerate={generateChannelType}
        disabled={!areRequiredFieldsPresent}
      />
    </div>
  );
}
