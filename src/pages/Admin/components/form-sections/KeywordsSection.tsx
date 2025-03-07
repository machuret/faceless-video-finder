
import React from "react";
import { Label } from "@/components/ui/label";
import FormSectionWrapper from "./FormSectionWrapper";
import KeywordGenerator from "./keywords/KeywordGenerator";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface KeywordsSectionProps {
  channelTitle: string;
  description: string;
  category: string;
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
}

const KeywordsSection = ({
  channelTitle,
  description,
  category,
  keywords,
  onKeywordsChange
}: KeywordsSectionProps) => {
  const [inputValue, setInputValue] = React.useState("");

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      onKeywordsChange([...keywords, trimmedKeyword]);
    }
    setInputValue("");
  };

  const removeKeyword = (keywordToRemove: string) => {
    onKeywordsChange(keywords.filter((keyword) => keyword !== keywordToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword(inputValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(",")) {
      addKeyword(value.slice(0, -1));
    } else {
      setInputValue(value);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const pastedKeywords = pastedText
      .split(/[,\n]+/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    
    if (pastedKeywords.length) {
      const newKeywords = [...keywords];
      pastedKeywords.forEach((keyword) => {
        const normalizedKeyword = keyword.toLowerCase();
        if (!newKeywords.includes(normalizedKeyword)) {
          newKeywords.push(normalizedKeyword);
        }
      });
      onKeywordsChange(newKeywords);
    }
  };

  const handleKeywordsGenerated = (generatedKeywords: string[]) => {
    // Filter out duplicates and combine with existing keywords
    const newKeywords = [...keywords];
    generatedKeywords.forEach((keyword) => {
      const normalizedKeyword = keyword.toLowerCase();
      if (!newKeywords.includes(normalizedKeyword)) {
        newKeywords.push(normalizedKeyword);
      }
    });
    onKeywordsChange(newKeywords);
  };

  return (
    <FormSectionWrapper title="Keywords" description="Add relevant keywords to help categorize this channel">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <Label htmlFor="keywords">Keywords</Label>
          <KeywordGenerator
            channelTitle={channelTitle}
            description={description}
            category={category}
            onKeywordsGenerated={handleKeywordsGenerated}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mb-2 min-h-[30px]">
          {keywords.map((keyword) => (
            <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
              {keyword}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeKeyword(keyword)}
              />
            </Badge>
          ))}
        </div>
        
        <input
          type="text"
          id="keywords"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="flex w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Type keyword and press Enter (or paste comma-separated list)"
        />
        <p className="text-xs text-muted-foreground">
          Enter keywords separated by commas or Enter key
        </p>
      </div>
    </FormSectionWrapper>
  );
};

export default KeywordsSection;
