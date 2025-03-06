
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DidYouKnowFact } from "@/services/didYouKnowService";
import FactsTable from "./FactsTable";
import SearchBar from "./SearchBar";

interface FactsContainerProps {
  facts: DidYouKnowFact[];
  loading: boolean;
  onAddNew: () => void;
  onEdit: (fact: DidYouKnowFact) => void;
  onRefresh: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  filteredCount: number;
  totalCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    handlePageChange: (page: number) => void;
    itemsPerPage: number;
  };
}

const FactsContainer = ({ 
  facts, 
  loading, 
  onAddNew, 
  onEdit,
  onRefresh,
  onSearch,
  searchQuery,
  filteredCount,
  totalCount,
  pagination
}: FactsContainerProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Did You Know Facts</h2>
          <Button onClick={onAddNew} className="flex items-center gap-2">
            <Plus size={16} />
            Add New Fact
          </Button>
        </div>
        
        <div className="mb-6">
          <SearchBar 
            onSearch={onSearch}
            initialQuery={searchQuery}
            placeholder="Search by title or content..."
          />
          <div className="mt-2 text-sm text-gray-500">
            {searchQuery ? (
              <span>Found {filteredCount} fact{filteredCount !== 1 ? 's' : ''} out of {totalCount}</span>
            ) : (
              <span>Total: {totalCount} fact{totalCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        
        <FactsTable 
          facts={facts} 
          loading={loading} 
          onEdit={onEdit} 
          onRefresh={onRefresh}
          pagination={pagination}
        />
      </CardContent>
    </Card>
  );
};

export default FactsContainer;
