
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { DatabaseChannelType } from "@/types/youtube";
import { useState } from "react";

interface TypeSelectorProps {
  selectedType: string | undefined;
  onSelect: (typeId: string) => void;
}

// A mapping from UI channel types to database channel types
const typeMapping: Record<string, DatabaseChannelType> = {
  // By default, map to "other" for safety
  default: "other",
  // Add specific mappings if needed
  creator: "creator",
  brand: "brand",
  media: "media",
  // All other types default to "other" in the database
};

const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (typeId: string) => {
    console.log("Selected type in dropdown:", typeId);
    
    // For UI display and metadata, use the full type ID
    onSelect(typeId);
    
    setIsOpen(false);
  };

  // Find the selected type for display
  const selectedTypeInfo = channelTypes.find(type => type.id === selectedType);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Channel Type</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Type</label>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-white"
              onClick={() => setIsOpen(true)}
            >
              {selectedTypeInfo ? selectedTypeInfo.label : "Select Type"}
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
      </div>
    </div>
  );
};

export default TypeSelector;
