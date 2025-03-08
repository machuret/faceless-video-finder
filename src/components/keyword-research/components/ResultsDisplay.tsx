
import React from "react";
import { Card } from "@/components/ui/card";
import KeywordResults from "../KeywordResults";
import ResultsToolbar from "./ResultsToolbar";

interface KeywordResult {
  keyword: string;
  suggestion: string;
}

interface ResultsDisplayProps {
  results: KeywordResult[];
  handleExport: (format: "csv" | "json") => void;
  copyToClipboard: () => void;
  totalResults?: number;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  handleExport,
  copyToClipboard,
  totalResults,
}) => {
  if (results.length === 0) return null;

  return (
    <Card className="p-6">
      <ResultsToolbar 
        handleExport={handleExport} 
        copyToClipboard={copyToClipboard}
        resultsCount={totalResults || results.length} 
      />
      <KeywordResults results={results} />
    </Card>
  );
};

export default ResultsDisplay;
