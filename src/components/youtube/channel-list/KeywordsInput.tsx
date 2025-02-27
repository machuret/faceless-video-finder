
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface KeywordsInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
}

export const KeywordsInput = ({ keywords, onChange }: KeywordsInputProps) => {
  const [keywordInput, setKeywordInput] = useState("");

  const handleKeywordAdd = () => {
    if (!keywordInput.trim()) return;
    const newKeywords = [...keywords, keywordInput.trim().toLowerCase()];
    onChange(newKeywords);
    setKeywordInput("");
  };

  const handleKeywordRemove = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword);
    onChange(newKeywords);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleKeywordAdd();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Keywords</label>
      <div className="flex gap-2 mb-2">
        <Input
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add keyword and press Enter"
        />
        <Button type="button" onClick={handleKeywordAdd}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {keywords?.map((keyword) => (
          <div
            key={keyword}
            className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
          >
            <span>{keyword}</span>
            <button
              onClick={() => handleKeywordRemove(keyword)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
