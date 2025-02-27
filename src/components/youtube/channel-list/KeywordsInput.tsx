
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Wand2 } from "lucide-react";

interface KeywordsInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  channelTitle: string;
  description: string;
  category: string;
}

export const KeywordsInput = ({ 
  keywords, 
  onChange, 
  channelTitle,
  description,
  category
}: KeywordsInputProps) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generateKeywords = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-channel-keywords', {
        body: { 
          title: channelTitle,
          description: description,
          category: category
        }
      });

      if (error) throw error;
      if (data.keywords) {
        onChange(data.keywords);
      }
    } catch (error) {
      console.error('Failed to generate keywords:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">Keywords</label>
        <Button 
          variant="outline" 
          size="sm"
          onClick={generateKeywords}
          disabled={isGenerating}
        >
          <Wand2 className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          Generate Keywords
        </Button>
      </div>
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
