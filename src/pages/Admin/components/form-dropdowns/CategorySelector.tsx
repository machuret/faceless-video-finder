
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface CategorySelectorProps {
  selectedCategory: string | undefined;
  onSelect: (categoryId: string) => void;
}

const CategorySelector = ({ selectedCategory, onSelect }: CategorySelectorProps) => {
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

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Channel Category</h3>
      <div className="space-y-4">
        <label className="block text-sm font-medium">Category</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {selectedCategory ? 
                channelCategories.find(category => category.id === selectedCategory)?.label || 'Select Category' : 
                'Select Category'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full max-h-96 overflow-y-auto bg-white">
            {channelCategories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                onClick={() => onSelect(category.id)}
                className="cursor-pointer"
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
