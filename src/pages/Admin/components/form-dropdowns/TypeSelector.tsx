
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChannelType {
  id: string;
  label: string;
  description: string | null;
  production: string | null;
  example: string | null;
}

interface TypeSelectorProps {
  selectedType: string | undefined;
  onSelect: (typeId: string) => void;
}

const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const [channelTypes, setChannelTypes] = useState<ChannelType[]>([]);
  const [selectedTypeDetails, setSelectedTypeDetails] = useState<ChannelType | null>(null);
  
  // Fetch channel types for dropdown
  useEffect(() => {
    const fetchChannelTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_types')
          .select('id, label, description, production, example')
          .order('label', { ascending: true });
        
        if (error) throw error;
        setChannelTypes(data || []);
        
        // If there's a selected type, fetch its details
        if (selectedType) {
          const selected = data?.find(type => type.id === selectedType) || null;
          setSelectedTypeDetails(selected);
        }
      } catch (error) {
        console.error('Error fetching channel types:', error);
        toast.error('Failed to load channel types');
      }
    };
    
    fetchChannelTypes();
  }, [selectedType]);
  
  const handleSelect = (typeId: string) => {
    onSelect(typeId);
    const selected = channelTypes.find(type => type.id === typeId) || null;
    setSelectedTypeDetails(selected);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Channel Type</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Channel Type</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedType ? 
                channelTypes.find(type => type.id === selectedType)?.label || 'Select Type' : 
                'Select Type'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full max-h-96 overflow-y-auto bg-white">
            {channelTypes.map((type) => (
              <DropdownMenuItem
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className="cursor-pointer"
              >
                {type.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {selectedTypeDetails && (
          <div className="mt-4 space-y-2 border rounded-md p-3 bg-gray-50">
            {selectedTypeDetails.description && (
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-gray-600">{selectedTypeDetails.description}</p>
              </div>
            )}
            {selectedTypeDetails.production && (
              <div>
                <h4 className="text-sm font-medium">Production</h4>
                <p className="text-sm text-gray-600">{selectedTypeDetails.production}</p>
              </div>
            )}
            {selectedTypeDetails.example && (
              <div>
                <h4 className="text-sm font-medium">Example</h4>
                <p className="text-sm text-gray-600">{selectedTypeDetails.example}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TypeSelector;
