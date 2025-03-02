
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface CategorySelectorProps {
  selectedCategory: string | undefined;
  onSelect: (categoryId: string) => void;
}

const CategorySelector = ({ selectedCategory, onSelect }: CategorySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const channelCategories = [
    { id: "entertainment", label: "Entertainment" },
    { id: "education", label: "Education" },
    { id: "gaming", label: "Gaming" },
    { id: "sports", label: "Sports" },
    { id: "music", label: "Music" },
    { id: "news", label: "News & Politics" },
    { id: "howto", label: "How-to & Style" },
    { id: "tech", label: "Technology" },
    { id: "travel", label: "Travel & Events" },
    { id: "comedy", label: "Comedy" },
    { id: "film", label: "Film & Animation" },
    { id: "beauty", label: "Beauty & Fashion" },
    { id: "food", label: "Food & Cooking" },
    { id: "fitness", label: "Fitness & Health" },
    { id: "other", label: "Other" },
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
