
import { useState } from "react";
import ChannelSearch from "./ChannelSearch";
import ChannelGrid from "./ChannelGrid";
import ChannelPagination from "./ChannelPagination";
import { ChannelCategory } from "@/types/youtube";

interface ChannelSectionProps {
  channels: any[];
  featuredChannels: any[];
  loading: boolean;
  error: string | null;
  totalChannels: number;
  currentPage: number;
  showFeatured: boolean;
  channelsPerPage: number;
  setCurrentPage: (page: number) => void;
}

const ChannelSection = ({
  channels,
  featuredChannels,
  loading,
  error,
  totalChannels,
  currentPage,
  showFeatured,
  channelsPerPage,
  setCurrentPage,
}: ChannelSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | "">("");

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setCurrentPage(1);
  };

  const filteredChannels = channels.filter(channel => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      channel.channel_title?.toLowerCase().includes(searchLower) ||
      channel.description?.toLowerCase().includes(searchLower) ||
      channel.niche?.toLowerCase().includes(searchLower) ||
      (channel.keywords && channel.keywords.some((keyword: string) => 
        keyword.toLowerCase().includes(searchLower)
      ))
    );
  });

  return (
    <div className="container mx-auto px-4 py-16">
      {featuredChannels.length > 0 && showFeatured && (
        <div className="mb-16">
          <h2 className="font-crimson text-3xl font-bold text-gray-800 mb-6">
            Featured Channels
          </h2>
          <ChannelGrid 
            channels={featuredChannels}
            loading={false}
            resetFilters={() => {}}
            isFeatured={true}
          />
        </div>
      )}

      <ChannelSearch 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        handleCategorySelect={(category) => setSelectedCategory(category)}
        channelCount={filteredChannels.length}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error loading channels</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <ChannelGrid 
        channels={filteredChannels}
        loading={loading}
        resetFilters={resetFilters}
        isFeatured={false}
      />
      
      <ChannelPagination 
        currentPage={currentPage}
        totalChannels={totalChannels}
        channelsPerPage={channelsPerPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default ChannelSection;
