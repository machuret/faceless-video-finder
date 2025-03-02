
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Channel, ChannelCategory } from "@/types/youtube";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";
import ChannelSearch from "@/components/home/ChannelSearch";
import ChannelGrid from "@/components/home/ChannelGrid";
import PageFooter from "@/components/home/PageFooter";
import HeroSection from "@/components/home/HeroSection";
import ToolsSection from "@/components/home/ToolsSection";
import StatsSection from "@/components/home/StatsSection";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const CHANNELS_PER_PAGE = 9; // Number of channels to display per page

const Index = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [featuredChannels, setFeaturedChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalChannels, setTotalChannels] = useState(0);
  const [showFeatured, setShowFeatured] = useState(true);

  useEffect(() => {
    fetchChannels();
    fetchFeaturedChannels();
  }, [selectedCategory, currentPage]);

  useEffect(() => {
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const fetchChannels = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, get count for pagination
      let countQuery = supabase
        .from("youtube_channels")
        .select("id", { count: "exact" });

      if (selectedCategory) {
        countQuery = countQuery.eq("channel_category", selectedCategory);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) {
        throw countError;
      }
      
      setTotalChannels(count || 0);

      // Then fetch the actual data with pagination
      let query = supabase
        .from("youtube_channels")
        .select("*, videoStats:youtube_video_stats(*)")
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("channel_category", selectedCategory);
      }

      // Add pagination
      const from = (currentPage - 1) * CHANNELS_PER_PAGE;
      const to = from + CHANNELS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Properly type-cast the data
      const typedChannels = data.map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata as Channel['metadata'],
        is_featured: channel.is_featured || false,
      })) as Channel[];

      setChannels(typedChannels);
    } catch (error: any) {
      console.error("Error fetching channels:", error);
      toast.error("Failed to fetch channels");
      setError(error.message || "An unexpected error occurred");
      setChannels([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*, videoStats:youtube_video_stats(*)")
        .eq("is_featured", true)
        .limit(3);

      if (error) {
        throw error;
      }

      // Properly type-cast the data
      const typedChannels = data.map(channel => ({
        ...channel,
        // Ensure metadata is properly typed
        metadata: channel.metadata as Channel['metadata'],
        is_featured: true,
      })) as Channel[];

      setFeaturedChannels(typedChannels);
    } catch (error: any) {
      console.error("Error fetching featured channels:", error);
      // Don't show error for featured channels, just set to empty
      setFeaturedChannels([]);
    }
  };

  const handleCategorySelect = (category: ChannelCategory) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

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
      (channel.keywords && channel.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchLower)
      ))
    );
  });

  const totalPages = Math.ceil(totalChannels / CHANNELS_PER_PAGE);

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages is less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Show current page and pages around it
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />

      <main>
        <HeroSection />

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
            handleCategorySelect={handleCategorySelect}
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
          
          {/* Pagination */}
          {!loading && !error && filteredChannels.length > 0 && totalPages > 1 && (
            <Pagination className="my-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={`page-${index}`}>
                    {page === 'ellipsis-start' || page === 'ellipsis-end' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          
          <div className="my-20"></div>
          
          <ToolsSection />
        </div>
        
        <StatsSection />
      </main>

      <PageFooter />
    </div>
  );
};

export default Index;
