
import { useEffect } from "react";
import { DidYouKnowFact } from "@/services/didYouKnowService";
import { useFactsOperations } from "./useFactsOperations";
import { useFactsDialog } from "./useFactsDialog";
import { useFactsSearch } from "./useFactsSearch";
import { useFactsPagination } from "./useFactsPagination";

export const useFactsManagement = () => {
  const { 
    facts, 
    loading, 
    loadFacts, 
    handleSubmit: submitFact 
  } = useFactsOperations();

  const {
    dialogOpen,
    isEditing,
    currentFact,
    setDialogOpen,
    handleOpenDialog
  } = useFactsDialog();

  const {
    searchQuery,
    filteredFacts,
    handleSearch,
    filteredCount,
    totalCount
  } = useFactsSearch(facts);

  const pagination = useFactsPagination({ 
    facts: filteredFacts,
    searchQuery
  });

  // Initial data loading
  useEffect(() => {
    loadFacts();
  }, []);

  // Handle form submission with dialog state management
  const handleSubmit = async (factData: Partial<DidYouKnowFact>) => {
    const success = await submitFact(factData, isEditing);
    if (success) {
      setDialogOpen(false);
      loadFacts();
    }
  };

  return {
    // Facts data
    facts: pagination.currentFacts,
    allFacts: facts,
    loading,
    filteredCount,
    totalCount,
    
    // Dialog state
    dialogOpen,
    isEditing,
    currentFact,
    
    // Search state
    searchQuery,
    
    // Pagination
    pagination: {
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      handlePageChange: pagination.handlePageChange,
      itemsPerPage: pagination.itemsPerPage
    },
    
    // Actions
    setDialogOpen,
    handleOpenDialog,
    handleSubmit,
    handleSearch,
    loadFacts
  };
};
