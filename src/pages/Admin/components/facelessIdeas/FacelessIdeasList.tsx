
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Plus, Upload, Search, Sparkles } from "lucide-react";
import { FacelessIdeaInfo } from "@/services/facelessIdeaService";

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
  
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected ideas? This action cannot be undone.`)) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
    }
  };
  
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCsvUpload(file);
      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = '';
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

  const handleEnhanceMultiple = async () => {
    if (!onEnhanceMultiple || selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to enhance ${selectedIds.length} selected ideas? This may take a while and will overwrite existing descriptions.`)) {
      setEnhancingMultiple(true);
      try {
        await onEnhanceMultiple(selectedIds);
      } finally {
        setEnhancingMultiple(false);
      }
    }
  };
  
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold">Faceless Content Ideas</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onCreateNew} className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add New
          </Button>
          
          <div className="relative">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              <Upload className="h-4 w-4" /> Import CSV
            </Button>
            <input
              id="csv-upload"
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={handleCsvFileUpload}
            />
          </div>
          
          {selectedIds.length > 0 && (
            <>
              <Button 
                variant="destructive" 
                onClick={handleDeleteSelected}
                className="flex items-center gap-1"
              >
                <Trash className="h-4 w-4" /> Delete Selected ({selectedIds.length})
              </Button>
              
              {onEnhanceMultiple && (
                <Button 
                  variant="outline" 
                  onClick={handleEnhanceMultiple}
                  disabled={enhancingMultiple}
                  className="flex items-center gap-1"
                >
                  <Sparkles className="h-4 w-4" /> 
                  {enhancingMultiple ? "Enhancing..." : `Enhance Selected (${selectedIds.length})`}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading faceless ideas...</p>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No faceless ideas found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filteredIdeas.length && filteredIdeas.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIdeas.map((idea) => (
                  <TableRow key={idea.id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(idea.id)}
                        onChange={(e) => handleSelectOne(idea.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{idea.label}</TableCell>
                    <TableCell className="font-mono text-sm">{idea.id}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit(idea.id)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {onEnhanceDescription && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEnhanceDescription(idea.id)}
                            disabled={enhancingId === idea.id}
                            title="Enhance Description with AI"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(idea.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>CSV Import Format:</p>
        <p className="text-xs mt-1">
          Niche Name | AI Voice Software (Yes/No) | Heavy Editing (Yes/No) | Complexity Level (Low/Medium/High) | Research Level (Low/Medium/High) | Difficulty (Easy/Medium/Hard) | Notes/Description | Example Channel Name | Example Channel URL
        </p>
      </div>
    </div>
  );
};
