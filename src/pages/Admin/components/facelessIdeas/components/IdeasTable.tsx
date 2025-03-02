
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Sparkles } from "lucide-react";
import { FacelessIdeaInfo } from "@/services/facelessIdeaService";

interface IdeasTableProps {
  ideas: FacelessIdeaInfo[];
  selectedIds: string[];
  enhancingId: string | null;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onEnhanceDescription?: (id: string) => void;
}

export const IdeasTable: React.FC<IdeasTableProps> = ({
  ideas,
  selectedIds,
  enhancingId,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  onEnhanceDescription
}) => {
  const handleEnhanceDescription = async (id: string) => {
    if (!onEnhanceDescription) return;
    await onEnhanceDescription(id);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input 
                type="checkbox" 
                checked={selectedIds.length === ideas.length && ideas.length > 0}
                onChange={onSelectAll}
                className="h-4 w-4 rounded border-gray-300"
              />
            </TableHead>
            <TableHead>Label</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas.map((idea) => (
            <TableRow key={idea.id}>
              <TableCell>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(idea.id)}
                  onChange={(e) => onSelectOne(idea.id, e.target.checked)}
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
  );
};
