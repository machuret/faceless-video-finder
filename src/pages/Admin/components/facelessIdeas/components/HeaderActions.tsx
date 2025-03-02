
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash, Sparkles } from "lucide-react";

interface HeaderActionsProps {
  selectedIds: string[];
  onCreateNew: () => void;
  onCsvUpload: (file: File) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onEnhanceMultiple?: (ids: string[]) => void;
  enhancingMultiple: boolean;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  selectedIds,
  onCreateNew,
  onCsvUpload,
  onDeleteMultiple,
  onEnhanceMultiple,
  enhancingMultiple
}) => {
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCsvUpload(file);
      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected ideas? This action cannot be undone.`)) {
      onDeleteMultiple(selectedIds);
    }
  };

  const handleEnhanceMultiple = () => {
    if (!onEnhanceMultiple || selectedIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to enhance ${selectedIds.length} selected ideas? This may take a while and will overwrite existing descriptions.`)) {
      onEnhanceMultiple(selectedIds);
    }
  };

  return (
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
  );
};
