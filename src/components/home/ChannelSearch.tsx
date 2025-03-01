
import { useState } from "react";
import { Search, Filter } from "lucide-react";
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="font-crimson text-2xl font-bold mb-4 text-gray-800">Find YouTube Channels</h2>
      
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 font-montserrat"
          />
        </div>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-montserrat">
          Search
        </Button>
      </form>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
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
