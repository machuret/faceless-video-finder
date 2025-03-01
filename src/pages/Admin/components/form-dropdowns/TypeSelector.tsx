
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

interface TypeSelectorProps {
  selectedType: string | undefined;
  onSelect: (typeId: string) => void;
}

const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const [channelTypes, setChannelTypes] = useState<{id: string, label: string}[]>([]);
  
  // Fetch channel types for dropdown
  useEffect(() => {
    const fetchChannelTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_types')
          .select('id, label')
          .order('label', { ascending: true });
        
        if (error) throw error;
        setChannelTypes(data || []);
      } catch (error) {
        console.error('Error fetching channel types:', error);
        toast.error('Failed to load channel types');
      }
    };
    
    fetchChannelTypes();
  }, []);

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
                onClick={() => onSelect(type.id)}
                className="cursor-pointer"
              >
                {type.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TypeSelector;
