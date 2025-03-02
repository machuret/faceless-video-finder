
import React, { useState } from "react";
import { FacelessIdeaInfo } from "@/services/facelessIdeaService";
import { SearchBar } from "./components/SearchBar";
import { HeaderActions } from "./components/HeaderActions";
import { IdeasTable } from "./components/IdeasTable";
import { ImportHelp } from "./components/ImportHelp";
import { LoadingState } from "./components/LoadingState";
import { EmptyState } from "./components/EmptyState";

interface FacelessIdeasListProps {
  facelessIdeas: FacelessIdeaInfo[];
  loading: boolean;
  onEdit: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onCsvUpload: (file: File) => void;
  onEnhanceDescription?: (id: string) => void;
  onEnhanceMultiple?: (ids: string[]) => void;
}

export const FacelessIdeasList: React.FC<FacelessIdeasListProps> = ({
  facelessIdeas,
  loading,
  onEdit,
  onCreateNew,
  onDelete,
  onDeleteMultiple,
  onCsvUpload,
  onEnhanceDescription,
  onEnhanceMultiple
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [enhancingMultiple, setEnhancingMultiple] = useState(false);
  
  const filteredIdeas = facelessIdeas.filter(idea => 
    idea.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredIdeas.map(idea => idea.id));
    } else {
      setSelectedIds([]);
    }
  };
  
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    }
  };
  
  const handleEnhanceDescription = async (id: string) => {
    if (!onEnhanceDescription) return;
    
    setEnhancingId(id);
    try {
      await onEnhanceDescription(id);
    } finally {
      setEnhancingId(null);
    }
  };

  const handleEnhanceMultipleIdeas = async (ids: string[]) => {
    if (!onEnhanceMultiple || ids.length === 0) return;
    
    setEnhancingMultiple(true);
    try {
      await onEnhanceMultiple(ids);
    } finally {
      setEnhancingMultiple(false);
      // Clear selection after enhancement is complete
      setSelectedIds([]);
    }
  };
  
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Faceless Content Ideas</h2>
        <HeaderActions 
          selectedIds={selectedIds}
          onCreateNew={onCreateNew}
          onCsvUpload={onCsvUpload}
          onDeleteMultiple={onDeleteMultiple}
          onEnhanceMultiple={handleEnhanceMultipleIdeas}
          enhancingMultiple={enhancingMultiple}
        />
      </div>
      
      <div className="mb-4">
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
      
      <div className="border rounded-md overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : filteredIdeas.length === 0 ? (
          <EmptyState />
        ) : (
          <IdeasTable 
            ideas={filteredIdeas}
            selectedIds={selectedIds}
            enhancingId={enhancingId}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onEdit={onEdit}
            onDelete={onDelete}
            onEnhanceDescription={handleEnhanceDescription}
          />
        )}
      </div>
      
      <ImportHelp />
    </div>
  );
};
