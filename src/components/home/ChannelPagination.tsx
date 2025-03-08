
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect } from "react";

interface ChannelPaginationProps {
  currentPage: number;
  totalChannels: number;
  channelsPerPage: number;
  setCurrentPage: (page: number) => void;
}

const ChannelPagination = ({
  currentPage,
  totalChannels,
  channelsPerPage,
  setCurrentPage
}: ChannelPaginationProps) => {
  const totalPages = Math.ceil(totalChannels / channelsPerPage);

  // Log pagination info for debugging
  useEffect(() => {
    console.log(`Pagination: Current page: ${currentPage}, Total pages: ${totalPages}, Total channels: ${totalChannels}, Per page: ${channelsPerPage}`);
  }, [currentPage, totalPages, totalChannels, channelsPerPage]);

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Handle page click
  const handlePageClick = (page: number) => {
    console.log(`Clicked page: ${page}`);
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <Pagination className="my-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => handlePageClick(Math.max(currentPage - 1, 1))}
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
                onClick={() => typeof page === 'number' && handlePageClick(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => handlePageClick(Math.min(currentPage + 1, totalPages))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ChannelPagination;
