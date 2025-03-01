
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
      <h2 className="font-crimson text-2xl font-bold mb-4 text-gray-800">Find Faceless Youtube Channels ideas</h2>
      
      <form onSubmit={handleSearch} className="flex flex-col items-center mb-6">
        <div className="relative w-full max-w-2xl mx-auto mb-2">
          <div className="flex items-center w-full px-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:shadow-md">
            <Search className="text-gray-400 h-5 w-5 mr-3 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 shadow-none pl-0 font-montserrat text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 font-montserrat rounded-md px-4 py-2 text-sm">
            Search
          </Button>
          <Button type="button" onClick={() => setSearchTerm("")} className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-montserrat rounded-md px-4 py-2 text-sm">
            I'm Feeling Lucky
          </Button>
        </div>
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
