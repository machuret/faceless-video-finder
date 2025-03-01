
import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChannelCategory } from "@/types/youtube";
import { channelCategories } from "@/components/youtube/channel-list/constants";

interface ChannelSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: ChannelCategory | "";
  handleCategorySelect: (category: ChannelCategory) => void;
  channelCount: number;
}

const ChannelSearch = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  handleCategorySelect,
  channelCount
}: ChannelSearchProps) => {
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is done in the parent component via the searchTerm state
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleRandomSearch = () => {
    // Get a random term from predefined keywords or categories
    const randomTerms = ["gaming", "educational", "cooking", "review", "storytelling", "animation"];
    const randomTerm = randomTerms[Math.floor(Math.random() * randomTerms.length)];
    setSearchTerm(randomTerm);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mb-10">
      <div className="max-w-5xl mx-auto text-center mb-6">
        <h2 className="font-crimson text-4xl font-bold mb-3 text-gray-800">Find Faceless YouTube Channels ideas</h2>
        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
          Discover profitable niches and channel ideas that can be run without showing your face
        </p>
      </div>
      
      <form onSubmit={handleSearch} className="flex flex-col items-center mb-8">
        <div className="relative w-full max-w-2xl mx-auto mb-3">
          <div className="flex items-center w-full px-5 py-4 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md">
            <Search className="text-gray-400 h-5 w-5 mr-3 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search channel ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 shadow-none pl-0 font-montserrat text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            {searchTerm && (
              <button 
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-3 mt-2">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-montserrat rounded-md px-6 py-2.5 text-sm">
            Search
          </Button>
          <Button 
            type="button" 
            onClick={handleRandomSearch} 
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-montserrat rounded-md px-5 py-2.5 text-sm"
          >
            I'm Feeling Lucky
          </Button>
        </div>
      </form>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="font-montserrat text-base font-semibold text-gray-700">Filter by Category</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {channelCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category as ChannelCategory)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors font-montserrat ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              type="button"
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-montserrat text-lg font-semibold mb-2 text-gray-800">
          {selectedCategory 
            ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Channels`
            : "All Channels"}
        </h2>
        <p className="font-lato text-gray-600">
          {channelCount} {channelCount === 1 ? "channel" : "channels"} found
        </p>
      </div>
    </div>
  );
};

export default ChannelSearch;
