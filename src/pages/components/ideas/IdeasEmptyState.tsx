
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCcw, X } from "lucide-react";

interface IdeasEmptyStateProps {
  search: string;
  onRetry: () => void;
  onClearSearch: () => void;
}

const IdeasEmptyState = ({ search, onRetry, onClearSearch }: IdeasEmptyStateProps) => (
  <Card className="p-6 text-center">
    {search ? (
      <>
        <p className="text-gray-500 mb-4">No faceless content ideas found matching "{search}".</p>
        <div className="flex justify-center gap-4">
          <Button onClick={onClearSearch} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Clear Search
          </Button>
          <Button onClick={onRetry} variant="secondary">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </>
    ) : (
      <>
        <p className="text-gray-500 mb-4">No faceless content ideas found.</p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </>
    )}
  </Card>
);

export default IdeasEmptyState;
