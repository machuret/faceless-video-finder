
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { 
  fetchAllFacts, 
  createFact, 
  updateFact, 
  DidYouKnowFact 
} from "@/services/didYouKnowService";

export const useFactsManagement = () => {
  const [facts, setFacts] = useState<DidYouKnowFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFact, setCurrentFact] = useState<Partial<DidYouKnowFact>>({
    title: "",
    content: "",
    is_active: true
  });
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    loadFacts();
  }, []);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadFacts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllFacts();
      setFacts(data);
    } catch (error) {
      toast.error("Failed to load facts");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (fact?: DidYouKnowFact) => {
    if (fact) {
      setCurrentFact(fact);
      setIsEditing(true);
    } else {
      setCurrentFact({
        title: "",
        content: "",
        is_active: true
      });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (factData: Partial<DidYouKnowFact>) => {
    try {
      if (!factData.title || !factData.content) {
        toast.error("Title and content are required");
        return;
      }

      if (isEditing && factData.id) {
        await updateFact(factData.id, {
          title: factData.title,
          content: factData.content,
          is_active: factData.is_active
        });
        toast.success("Fact updated successfully");
      } else {
        await createFact({
          title: factData.title,
          content: factData.content,
          is_active: factData.is_active || true
        });
        toast.success("Fact created successfully");
      }
      
      setDialogOpen(false);
      loadFacts();
    } catch (error) {
      toast.error(isEditing ? "Failed to update fact" : "Failed to create fact");
      console.error(error);
    }
  };

  // Filter facts based on search query
  const filteredFacts = useMemo(() => {
    if (!searchQuery.trim()) return facts;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return facts.filter(fact => 
      fact.title.toLowerCase().includes(lowerCaseQuery) || 
      fact.content.toLowerCase().includes(lowerCaseQuery)
    );
  }, [facts, searchQuery]);

  // Calculate pagination values
  const indexOfLastFact = currentPage * itemsPerPage;
  const indexOfFirstFact = indexOfLastFact - itemsPerPage;
  const currentFacts = filteredFacts.slice(indexOfFirstFact, indexOfLastFact);
  const totalPages = Math.ceil(filteredFacts.length / itemsPerPage);

  // Page change handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return {
    facts: currentFacts,
    allFacts: facts,
    filteredCount: filteredFacts.length,
    totalCount: facts.length,
    loading,
    dialogOpen,
    isEditing,
    currentFact,
    searchQuery,
    pagination: {
      currentPage,
      totalPages,
      handlePageChange,
      itemsPerPage
    },
    setDialogOpen,
    handleOpenDialog,
    handleSubmit,
    handleSearch,
    loadFacts
  };
};
