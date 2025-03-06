
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash, Edit, Eye, EyeOff } from "lucide-react";
import { DidYouKnowFact, updateFact, deleteFact } from "@/services/didYouKnowService";
import { toast } from "sonner";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface FactsTableProps {
  facts: DidYouKnowFact[];
  loading: boolean;
  onEdit: (fact: DidYouKnowFact) => void;
  onRefresh: () => void;
}

const FactsTable = ({ facts, loading, onEdit, onRefresh }: FactsTableProps) => {
  const handleToggleActive = async (fact: DidYouKnowFact) => {
    try {
      await updateFact(fact.id, { is_active: !fact.is_active });
      toast.success(`Fact ${fact.is_active ? "deactivated" : "activated"} successfully`);
      onRefresh();
    } catch (error) {
      toast.error("Failed to update fact status");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this fact? This action cannot be undone.")) {
      try {
        await deleteFact(id);
        toast.success("Fact deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete fact");
        console.error(error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (facts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No facts found. Create your first fact to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="hidden md:table-cell">Content Preview</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {facts.map(fact => (
          <TableRow key={fact.id}>
            <TableCell className="font-medium max-w-[200px] truncate">
              {fact.title}
            </TableCell>
            <TableCell className="hidden md:table-cell max-w-md">
              <div className="truncate">{fact.content.substring(0, 100)}...</div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <span className={`px-2 py-1 rounded-full text-xs ${
                fact.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {fact.is_active ? 'Active' : 'Inactive'}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleToggleActive(fact)}
                  title={fact.is_active ? "Deactivate" : "Activate"}
                >
                  {fact.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onEdit(fact)}
                  title="Edit"
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(fact.id)}
                  title="Delete"
                >
                  <Trash size={16} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default FactsTable;
