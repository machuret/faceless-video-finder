
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { useState } from "react";

interface TypeSelectorProps {
  selectedType: string | undefined;
  onSelect: (typeId: string) => void;
}

const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (typeId: string) => {
    console.log("Selected type in dropdown:", typeId);
    onSelect(typeId);
    setIsOpen(false);
  };

  // Find the selected type for display
  const selectedTypeInfo = channelTypes.find(type => type.id === selectedType);
  const displayValue = selectedTypeInfo ? selectedTypeInfo.label : "Select Type";
  
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
            >
              {displayValue}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[300px] max-h-[300px] overflow-y-auto bg-white shadow-lg z-50"
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
