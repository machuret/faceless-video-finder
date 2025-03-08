
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClipboardCopy, Search } from "lucide-react";
import { toast } from "sonner";

interface KeywordResult {
  keyword: string;
  suggestion: string;
}

interface KeywordResultsProps {
  results: KeywordResult[];
}

const KeywordResults = ({ results }: KeywordResultsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredResults = searchTerm
    ? results.filter(result => 
        result.suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : results;

  const copyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword)
      .then(() => toast.success(`Copied: ${keyword}`))
      .catch(err => toast.error("Failed to copy keyword"));
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Filter results..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="bg-gray-100 p-3 rounded-md">
        <div className="text-sm font-medium text-gray-500 mb-1">
          {filteredResults.length} of {results.length} keywords
        </div>
      </div>
      
      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4">
          <div className="space-y-2">
            {filteredResults.map((result, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md group"
              >
                <span className="text-sm">{result.suggestion}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyKeyword(result.suggestion)}
                >
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {filteredResults.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No keywords matching your filter
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default KeywordResults;
