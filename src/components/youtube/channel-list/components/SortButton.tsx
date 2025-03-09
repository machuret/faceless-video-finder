
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface SortButtonProps {
  sortAlphabetically: boolean;
  toggleAlphabeticalSort: () => void;
}

const SortButton: React.FC<SortButtonProps> = ({ 
  sortAlphabetically, 
  toggleAlphabeticalSort 
}) => {
  return (
    <Button 
      variant="outline" 
      onClick={toggleAlphabeticalSort}
      className="flex items-center gap-2"
    >
      <ArrowUpDown className="h-4 w-4" />
      {sortAlphabetically ? "Original Order" : "Sort A-Z"}
    </Button>
  );
};

export default SortButton;
