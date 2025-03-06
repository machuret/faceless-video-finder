
import { useState, useEffect, useMemo } from "react";
import { DidYouKnowFact } from "@/services/didYouKnowService";

export const useFactsSearch = (facts: DidYouKnowFact[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter facts based on search query
  const filteredFacts = useMemo(() => {
    if (!searchQuery.trim()) return facts;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return facts.filter(fact => 
      fact.title.toLowerCase().includes(lowerCaseQuery) || 
      fact.content.toLowerCase().includes(lowerCaseQuery)
    );
  }, [facts, searchQuery]);

  // Reset to first page when search query changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return {
    searchQuery,
    filteredFacts,
    handleSearch,
    filteredCount: filteredFacts.length,
    totalCount: facts.length
  };
};
