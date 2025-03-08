
import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChannelListPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (newLimit: number) => void;
  currentLimit?: number;
}

const ChannelListPagination: React.FC<ChannelListPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onLimitChange,
  currentLimit
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      if (startPage > 2) {
        pages.push("ellipsis");
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pages.push("ellipsis");
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1 && !onLimitChange) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
          
          {getPageNumbers().map((page, i) => (
            <PaginationItem key={i}>
              {page === "ellipsis" ? (
                <span className="px-4 py-2">...</span>
              ) : (
                <PaginationLink 
                  isActive={currentPage === page}
                  onClick={() => onPageChange(Number(page))}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>

      {onLimitChange && currentLimit && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Items per page:</span>
          <Select 
            value={String(currentLimit)} 
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[80px] h-9">
              <SelectValue>{currentLimit}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
              <SelectItem value="96">96</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default ChannelListPagination;
