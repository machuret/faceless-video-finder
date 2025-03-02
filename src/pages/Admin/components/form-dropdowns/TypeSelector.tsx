
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { DatabaseChannelType } from "@/types/youtube";

interface TypeSelectorProps {
  selectedType: string | undefined;
  onSelect: (typeId: string) => void;
}

const TypeSelector = ({ selectedType, onSelect }: TypeSelectorProps) => {
  const [open, setOpen] = useState(false);

  // Define the database enum channel types
  const dbChannelTypes: {id: DatabaseChannelType, label: string}[] = [
    { id: "creator", label: "Creator" },
    { id: "brand", label: "Brand" },
    { id: "media", label: "Media" },
    { id: "other", label: "Other" }
  ];

  useEffect(() => {
    console.log("TypeSelector - Current selected type:", selectedType);
  }, [selectedType]);

  const handleSelect = (typeId: string) => {
    console.log("TypeSelector - Selecting type:", typeId);
    onSelect(typeId);
    setOpen(false);
  };

  // Find the selected type for display
  const selectedTypeInfo = dbChannelTypes.find(type => type.id === selectedType);
  const displayValue = selectedTypeInfo ? selectedTypeInfo.label : "Select Type";
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Channel Type</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Type</label>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-white border border-gray-300"
              type="button"
            >
              {displayValue}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[300px] max-h-[300px] overflow-y-auto bg-white shadow-lg z-[100]"
            forceMount
          >
            {dbChannelTypes.map((type) => (
              <DropdownMenuItem
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className={`cursor-pointer hover:bg-gray-100 py-2 ${
                  selectedType === type.id ? "bg-gray-100 font-medium" : ""
                }`}
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
