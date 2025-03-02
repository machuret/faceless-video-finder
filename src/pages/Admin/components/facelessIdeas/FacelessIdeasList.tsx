
import React, { useState } from "react";
import { useFacelessIdeas } from "./hooks/useFacelessIdeas";
import { IdeasTable } from "./components/IdeasTable";
import { SearchBar } from "./components/SearchBar";
import { HeaderActions } from "./components/HeaderActions";
import { ImportHelp } from "./components/ImportHelp";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";

export const FacelessIdeasList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [enhancingMultiple, setEnhancingMultiple] = useState(false);
  
  const {
    facelessIdeas,
    loading,
    handleSelectIdea,
    handleCreateNew,
    handleDelete,
    handleDeleteMultiple,
    handleCsvUpload,
    handleEnhanceDescription,
    handleEnhanceMultiple
  } = useFacelessIdeas();
  
  // Filter ideas based on search query
  const filteredIdeas = facelessIdeas.filter(idea => 
    idea.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle selection of all ideas
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredIdeas.map(idea => idea.id));
    } else {
      setSelectedIds([]);
    }
  };
  
  // Handle selection of a single idea
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(ideaId => ideaId !== id));
    }
  };
  
  // Handle enhancing a single idea with a loading state
  const handleEnhanceWithLoadingState = async (id: string) => {
    setEnhancingId(id);
    try {
      await handleEnhanceDescription(id);
    } finally {
      setEnhancingId(null);
    }
  };
  
  // Handle enhancing multiple ideas with a loading state
  const handleEnhanceMultipleWithLoadingState = async (ids: string[]) => {
    setEnhancingMultiple(true);
    try {
      await handleEnhanceMultiple(ids);
      // Clear selections after enhancing
      setSelectedIds([]);
    } finally {
      setEnhancingMultiple(false);
    }
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div className="w-full md:w-1/3">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
        </div>
        
        <HeaderActions 
          selectedIds={selectedIds}
          onCreateNew={handleCreateNew}
          onCsvUpload={handleCsvUpload}
          onDeleteMultiple={handleDeleteMultiple}
          onEnhanceMultiple={handleEnhanceMultipleWithLoadingState}
          enhancingMultiple={enhancingMultiple}
        />
      </div>
      
      {filteredIdeas.length === 0 ? (
        <EmptyState />
      ) : (
        <IdeasTable 
          ideas={filteredIdeas}
          selectedIds={selectedIds}
          enhancingId={enhancingId}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          onEdit={handleSelectIdea}
          onDelete={handleDelete}
          onEnhanceDescription={handleEnhanceWithLoadingState}
        />
      )}
      
      <ImportHelp />
    </div>
  );
};
