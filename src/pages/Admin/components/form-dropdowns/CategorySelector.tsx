
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { ChannelCategory } from "@/types/youtube";
import { channelCategories } from "@/components/youtube/channel-list/constants";

interface CategorySelectorProps {
  selectedCategory: string | undefined;
  onSelect: (categoryId: string) => void;
}

const CategorySelector = ({ selectedCategory, onSelect }: CategorySelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (categoryId: string) => {
    console.log("CategorySelector - Selected category:", categoryId);
    onSelect(categoryId);
    setOpen(false);
  };

  // Map category IDs to display labels
  const categoryLabels: Record<string, string> = {
    "entertainment": "Entertainment",
    "education": "Education",
    "gaming": "Gaming",
    "music": "Music",
    "news": "News & Politics",
    "sports": "Sports",
    "technology": "Technology",
    "other": "Other"
  };

  const displayValue = selectedCategory && categoryLabels[selectedCategory] 
    ? categoryLabels[selectedCategory] 
    : "Select Category";

  useEffect(() => {
    console.log("CategorySelector - Current selected category:", selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Channel Category</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Category</label>
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
            className="w-[calc(100vw-3rem)] sm:w-[400px] max-h-[300px] overflow-y-auto z-[100] bg-white shadow-lg"
            forceMount
          >
            {channelCategories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => handleSelect(category)}
                className={`cursor-pointer hover:bg-gray-100 py-2 ${
                  selectedCategory === category ? "bg-gray-100 font-medium" : ""
                }`}
              >
                {categoryLabels[category] || category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CategorySelector;
