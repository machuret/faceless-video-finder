
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash, Edit, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { DidYouKnowFact, updateFact, deleteFact } from "@/services/didYouKnowService";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface FactsTableProps {
  facts: DidYouKnowFact[];
  loading: boolean;
  onEdit: (fact: DidYouKnowFact) => void;
  onRefresh: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    itemsPerPage: number;
  };
}

const FactsTable = ({ facts, loading, onEdit, onRefresh, pagination }: FactsTableProps) => {
  const { currentPage, totalPages, handlePageChange } = pagination;
  
  const handleToggleActive = async (fact: DidYouKnowFact) => {
    try {
      await updateFact(fact.id, { is_active: !fact.is_active });
      toast.success(`Fact ${fact.is_active ? "deactivated" : "activated"} successfully`);
      onRefresh();
    } catch (error) {
      toast.error("Failed to update fact status");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this fact? This action cannot be undone.")) {
      try {
        await deleteFact(id);
        toast.success("Fact deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete fact");
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (facts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No facts found. Create your first fact to get started.</p>
      </div>
    );
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range to show
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, maxPagesToShow - 1);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxPagesToShow + 2);
      }
      
      // Add ellipsis if needed at the beginning
      if (start > 2) {
        pageNumbers.push("ellipsis-start");
      }
      
      // Add the page numbers
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed at the end
      if (end < totalPages - 1) {
        pageNumbers.push("ellipsis-end");
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Content Preview</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facts.map(fact => (
            <TableRow key={fact.id}>
              <TableCell className="font-medium max-w-[200px] truncate">
                {fact.title}
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-md">
                <div className="truncate">{fact.content.substring(0, 100)}...</div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  fact.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {fact.is_active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleToggleActive(fact)}
                    title={fact.is_active ? "Deactivate" : "Activate"}
                  >
                    {fact.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onEdit(fact)}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(fact.id)}
                    title="Delete"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis-start" || page === "ellipsis-end" ? (
                    <span className="mx-1 px-2">...</span>
                  ) : (
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default FactsTable;
