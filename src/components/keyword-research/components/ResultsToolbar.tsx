
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy } from "lucide-react";

interface ResultsToolbarProps {
  handleExport: (format: "csv" | "json") => void;
  copyToClipboard: () => void;
  resultsCount?: number;
}

const ResultsToolbar: React.FC<ResultsToolbarProps> = ({
  handleExport,
  copyToClipboard,
  resultsCount,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        Search Results {resultsCount !== undefined && `(${resultsCount})`}
      </h2>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
          <Download className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <Button variant="outline" size="sm" onClick={copyToClipboard}>
          <Copy className="mr-2 h-4 w-4" />
          Copy All
        </Button>
      </div>
    </div>
  );
};

export default ResultsToolbar;
