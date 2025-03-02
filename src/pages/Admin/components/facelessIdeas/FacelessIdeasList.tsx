
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
import { Trash, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      // Accept more file types including text files
      if (file.type === "text/csv" || file.type === "text/tab-separated-values" || 
          file.type === "text/plain" || file.name.endsWith('.csv') || 
          file.name.endsWith('.tsv') || file.name.endsWith('.txt')) {
        onCsvUpload(file);
      } else {
        alert("Please select a CSV, TSV, or text file");
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
            accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain"
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
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-800">Import Format Instructions</AlertTitle>
          <AlertDescription className="text-amber-700">
            <p className="mb-2">
              Your file should be tab-separated (TSV) with the following columns:
            </p>
            <div className="bg-white p-3 rounded border border-amber-200 overflow-x-auto mb-2">
              <code className="text-xs whitespace-nowrap font-mono">
                Niche Name &#9; AI Voice Software (Yes/No) &#9; Heavy Editing (Yes/No) &#9; Complexity Level (Low/Medium/High) &#9; Research Level (Low/Medium/High) &#9; Difficulty (Easy/Medium/Hard) &#9; Notes/Description &#9; Example Channel Name &#9; Example Channel URL
              </code>
            </div>
            <p className="text-sm">
              Only the "Niche Name" column is required. Each field should be separated by a tab character. If your file uses commas instead of tabs, the system will attempt to detect this automatically.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
