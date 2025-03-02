
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ChannelCategory } from "@/types/youtube";

interface CategorySelectorProps {
  selectedCategory: string | undefined;
  onSelect: (categoryId: string) => void;
}

const CategorySelector = ({ selectedCategory, onSelect }: CategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Ensure these match the database enum values
  const channelCategories = [
    { id: "entertainment" as ChannelCategory, label: "Entertainment" },
    { id: "education" as ChannelCategory, label: "Education" },
    { id: "gaming" as ChannelCategory, label: "Gaming" },
    { id: "music" as ChannelCategory, label: "Music" },
    { id: "news" as ChannelCategory, label: "News & Politics" },
    { id: "sports" as ChannelCategory, label: "Sports" },
    { id: "technology" as ChannelCategory, label: "Technology" },
    { id: "other" as ChannelCategory, label: "Other" },
  ];

  const handleSelect = (categoryId: string) => {
    console.log("Selected category:", categoryId);
    onSelect(categoryId);
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Channel Category</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Category</label>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between bg-white"
              onClick={() => setIsOpen(true)}
            >
              {selectedCategory ? 
                channelCategories.find(category => category.id === selectedCategory)?.label || 'Select Category' : 
                'Select Category'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-[calc(100vw-3rem)] sm:w-[400px] max-h-[300px] overflow-y-auto z-50 bg-white shadow-lg"
          >
            {channelCategories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => handleSelect(category.id)}
                className="cursor-pointer hover:bg-gray-100 py-2"
              >
                {category.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CategorySelector;
