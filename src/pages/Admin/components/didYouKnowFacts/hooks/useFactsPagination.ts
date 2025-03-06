
import { useState, useEffect } from "react";
import { DidYouKnowFact } from "@/services/didYouKnowService";

interface UseFactsPaginationProps {
  facts: DidYouKnowFact[];
  itemsPerPage?: number;
  searchQuery?: string;
}

export const useFactsPagination = ({ 
  facts, 
  itemsPerPage = 5,
  searchQuery = ""
}: UseFactsPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when facts change or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination values
  const indexOfLastFact = currentPage * itemsPerPage;
  const indexOfFirstFact = indexOfLastFact - itemsPerPage;
  const currentFacts = facts.slice(indexOfFirstFact, indexOfLastFact);
  const totalPages = Math.ceil(facts.length / itemsPerPage);

  // Page change handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return {
    currentPage,
    totalPages,
    currentFacts,
    handlePageChange,
    itemsPerPage
  };
};
