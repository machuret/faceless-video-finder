
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChannelCategory } from "@/types/youtube";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Search, X, RefreshCw } from "lucide-react";

// Define category display names and colors
const categoryConfig: Record<ChannelCategory, { name: string, color: string }> = {
  "entertainment": { name: "Entertainment", color: "bg-pink-100 text-pink-800 hover:bg-pink-200" },
  "education": { name: "Education", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  "gaming": { name: "Gaming", color: "bg-green-100 text-green-800 hover:bg-green-200" },
  "music": { name: "Music", color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
  "news": { name: "News", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
  "sports": { name: "Sports", color: "bg-red-100 text-red-800 hover:bg-red-200" },
  "technology": { name: "Technology", color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" },
  "other": { name: "Other", color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
};

// Create search schema with validation
const searchSchema = z.object({
  searchTerm: z.string().max(100, "Search term must be 100 characters or less")
});

interface ChannelSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: ChannelCategory | "";
  handleCategorySelect: (category: ChannelCategory) => void;
  channelCount: number;
}

const ChannelSearch = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  handleCategorySelect,
  channelCount,
}: ChannelSearchProps) => {
  const [isSearching, setIsSearching] = useState(false);

  // Sample channel search terms for random search
  const sampleSearchTerms = [
    "cooking", "investing", "travel", "science", "facts",
    "history", "art", "fitness", "meditation", "crypto",
    "motivation", "DIY", "recipes", "language", "tutorials"
  ];

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      searchTerm: searchTerm
    }
  });

  const handleSearchSubmit = (values: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    setSearchTerm(values.searchTerm);
    
    // Simulate search delay for UI feedback
    setTimeout(() => {
      setIsSearching(false);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    form.reset({ searchTerm: "" });
  };

  const handleRandomSearch = () => {
    const randomTerm = sampleSearchTerms[Math.floor(Math.random() * sampleSearchTerms.length)];
    setSearchTerm(randomTerm);
    form.setValue("searchTerm", randomTerm);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-2xl font-bold font-crimson mb-6">Find YouTube Channels</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSearchSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="searchTerm"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Search by channel name, description, niche or keywords..."
                      className="pl-10 pr-16 py-6 text-base"
                    />
                  </FormControl>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  {field.value && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute inset-y-0 right-16 flex items-center pr-3"
                      aria-label="Clear search"
                    >
                      <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                  
                  <Button 
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRandomSearch}
                    className="absolute inset-y-0 right-8 flex items-center pr-3"
                    aria-label="Random search"
                    title="Try a random search term"
                  >
                    <RefreshCw className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h3 className="text-sm font-medium mb-2">Filter by category:</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className={`cursor-pointer text-sm px-3 py-1 ${
                      selectedCategory === key 
                        ? `${config.color} border-2 border-current` 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleCategorySelect(key as ChannelCategory)}
                  >
                    {config.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                className="px-4 h-10"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Searching...
                  </>
                ) : (
                  <>Search</>
                )}
              </Button>
              <p className="text-sm text-gray-500 whitespace-nowrap">
                {channelCount} {channelCount === 1 ? 'channel' : 'channels'} found
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChannelSearch;
