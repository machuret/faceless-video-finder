
import { useState } from "react";
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
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import FactRow from "./FactRow";
import FactTablePagination from "./FactTablePagination";

interface FactsTableProps {
  facts: DidYouKnowFact[];
  loading: boolean;
  onEdit: (fact: DidYouKnowFact) => void;
  onRefresh: () => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    itemsPerPage: number;
  };
}

const FactsTable = ({ facts, loading, onEdit, onRefresh, pagination }: FactsTableProps) => {
  const { currentPage, totalPages, handlePageChange } = pagination;
  
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
    return <LoadingState />;
  }

  if (facts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
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
            <FactRow 
              key={fact.id}
              fact={fact}
              onEdit={onEdit}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </TableBody>
      </Table>
      
      <FactTablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
      />
    </div>
  );
};

export default FactsTable;
