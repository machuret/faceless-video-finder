
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { FacelessIdeaInfo } from "@/services/facelessIdeaService";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Upload } from "lucide-react";

interface FacelessIdeasListProps {
  facelessIdeas: FacelessIdeaInfo[];
  loading: boolean;
  onEdit: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onCsvUpload: (file: File) => void;
  onDeleteMultiple?: (ids: string[]) => void;
}

export const FacelessIdeasList: React.FC<FacelessIdeasListProps> = ({
  facelessIdeas,
  loading,
  onEdit,
  onCreateNew,
  onDelete,
  onCsvUpload,
  onDeleteMultiple = () => {}
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.type === "text/tab-separated-values" || file.name.endsWith('.csv') || file.name.endsWith('.tsv')) {
        onCsvUpload(file);
      } else {
        alert("Please select a CSV or TSV file");
      }
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(facelessIdeas.map(idea => idea.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
      setSelectAll(false);
    } else {
      setSelectedIds([...selectedIds, id]);
      if (selectedIds.length + 1 === facelessIdeas.length) {
        setSelectAll(true);
      }
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    
    const confirmMessage = selectedIds.length === 1
      ? "Are you sure you want to delete this idea?"
      : `Are you sure you want to delete ${selectedIds.length} ideas?`;
    
    if (window.confirm(confirmMessage)) {
      onDeleteMultiple(selectedIds);
      setSelectedIds([]);
      setSelectAll(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-semibold">Available Faceless Ideas</h2>
        <div className="flex gap-2">
          <Button onClick={onCreateNew}>Add New Idea</Button>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV/TSV
          </Button>
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={handleDeleteSelected}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Selected ({selectedIds.length})
            </Button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,.tsv,text/csv,text/tab-separated-values"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
      
      {loading ? (
        <p>Loading faceless ideas...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectAll && facelessIdeas.length > 0} 
                  onCheckedChange={handleSelectAll}
                  disabled={facelessIdeas.length === 0}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Niche Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facelessIdeas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">No faceless ideas found</TableCell>
              </TableRow>
            ) : (
              facelessIdeas.map((idea) => (
                <TableRow key={idea.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(idea.id)} 
                      onCheckedChange={() => handleSelectItem(idea.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{idea.id}</TableCell>
                  <TableCell>{idea.label}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {idea.description ? 
                      idea.description.replace(/<[^>]*>/g, '').substring(0, 100) + (idea.description.length > 100 ? '...' : '') 
                      : 'No description'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => onEdit(idea.id)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDelete(idea.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">CSV/TSV Import Format</h3>
        <p className="text-sm text-gray-600 mb-2">
          Your file should have the following tab-separated columns:
        </p>
        <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
          Niche Name | AI Voice Software (Yes/No) | Heavy Editing (Yes/No) | Complexity Level (Low/Medium/High) | Research Level (Low/Medium/High) | Difficulty (Easy/Medium/Hard) | Notes/Description | Example Channel Name | Example Channel URL
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Only the "Niche Name" column is required. An ID will be automatically generated from the niche name.
        </p>
      </div>
    </div>
  );
};
