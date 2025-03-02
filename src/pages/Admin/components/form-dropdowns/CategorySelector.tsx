
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { ChannelCategory } from "@/types/youtube";

interface CategorySelectorProps {
  selectedCategory: string | undefined;
  onSelect: (categoryId: string) => void;
}

const CategorySelector = ({ selectedCategory, onSelect }: CategorySelectorProps) => {
  const [open, setOpen] = useState(false);

  // Explicitly define the categories to ensure type safety
  const categories: {id: ChannelCategory, label: string}[] = [
    { id: "entertainment", label: "Entertainment" },
    { id: "education", label: "Education" },
    { id: "gaming", label: "Gaming" },
    { id: "music", label: "Music" },
    { id: "news", label: "News & Politics" },
    { id: "sports", label: "Sports" },
    { id: "technology", label: "Technology" },
    { id: "other", label: "Other" }
  ];

  const handleSelect = (categoryId: ChannelCategory) => {
    console.log("CategorySelector - Selected category:", categoryId);
    onSelect(categoryId);
    setOpen(false);
  };

  // Find the selected category for display
  const selectedCategoryInfo = categories.find(cat => cat.id === selectedCategory);
  const displayValue = selectedCategoryInfo ? selectedCategoryInfo.label : "Select Category";

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
          >
            {categories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => handleSelect(category.id)}
                className={`cursor-pointer hover:bg-gray-100 py-2 ${
                  selectedCategory === category.id ? "bg-gray-100 font-medium" : ""
                }`}
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
