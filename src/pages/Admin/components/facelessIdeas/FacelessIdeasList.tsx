
import React, { useRef } from "react";
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
import { Upload } from "lucide-react";

interface FacelessIdeasListProps {
  facelessIdeas: FacelessIdeaInfo[];
  loading: boolean;
  onEdit: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onCsvUpload: (file: File) => void;
}

export const FacelessIdeasList: React.FC<FacelessIdeasListProps> = ({
  facelessIdeas,
  loading,
  onEdit,
  onCreateNew,
  onDelete,
  onCsvUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        onCsvUpload(file);
      } else {
        alert("Please select a CSV file");
      }
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
            Import CSV
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
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
              <TableHead>ID</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facelessIdeas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No faceless ideas found</TableCell>
              </TableRow>
            ) : (
              facelessIdeas.map((idea) => (
                <TableRow key={idea.id}>
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
        <h3 className="text-lg font-medium mb-2">CSV Import Format</h3>
        <p className="text-sm text-gray-600 mb-2">
          Your CSV file should have the following columns:
        </p>
        <p className="text-sm text-gray-600">
          <code>id,label,description,production,example</code>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          The "id" should contain only lowercase letters, numbers, and underscores. The "label" is required.
          Other fields are optional.
        </p>
      </div>
    </div>
  );
};
