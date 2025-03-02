
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
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch channel types for dropdown
  useEffect(() => {
    const fetchChannelTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('channel_types')
          .select('id, label, description, production, example')
          .order('label', { ascending: true });
        
        if (error) throw error;
        console.log("Fetched channel types:", data?.length || 0);
        setChannelTypes(data || []);
        
        // If there's a selected type, fetch its details
        if (selectedType) {
          console.log("Looking for details of selected type:", selectedType);
          const selected = data?.find(type => type.id === selectedType) || null;
          setSelectedTypeDetails(selected);
          console.log("Found type details:", selected?.label || "None");
        }
      } catch (error) {
        console.error('Error fetching channel types:', error);
        toast.error('Failed to load channel types');
      }
    };
    
    fetchChannelTypes();
  }, [selectedType]);
  
  const handleSelect = (typeId: string) => {
    console.log("Selected channel type:", typeId);
    onSelect(typeId);
    setIsOpen(false);
    const selected = channelTypes.find(type => type.id === typeId) || null;
    setSelectedTypeDetails(selected);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Channel Type</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Channel Type</label>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between bg-white"
              onClick={() => setIsOpen(true)}
            >
              {selectedType ? 
                channelTypes.find(type => type.id === selectedType)?.label || 'Select Type' : 
                'Select Type'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[calc(100vw-3rem)] sm:w-[400px] max-h-[300px] overflow-y-auto z-50 bg-white shadow-lg"
          >
            {channelTypes.map((type) => (
              <DropdownMenuItem
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className="cursor-pointer hover:bg-gray-100 py-2"
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
