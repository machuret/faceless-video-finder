
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface KeywordResult {
  keyword: string;
  suggestion: string;
}

export const useKeywordResearch = () => {
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("us");
  const [language, setLanguage] = useState("en");
  const [searchHashtags, setSearchHashtags] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<KeywordResult[]>([]);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword to search");
      return;
    }

    setIsLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('youtube-keyword-research', {
        body: {
          keyword: keyword.trim(),
          country,
          language,
          searchHashtags,
          removeDuplicates
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch keywords");
      }

      setResults(data.keywords);
      toast.success(`Found ${data.keywords.length} keyword suggestions`);
    } catch (err) {
      console.error("Error fetching keywords:", err);
      toast.error(`Failed to fetch keywords: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    if (!results.length) {
      toast.error("No results to export");
      return;
    }

    let content, filename, mimeType;

    if (format === "csv") {
      const header = "suggestion\n";
      const rows = results.map(result => `"${result.suggestion}"`).join("\n");
      content = header + rows;
      filename = `youtube-keywords-${keyword}-${new Date().toISOString().split("T")[0]}.csv`;
      mimeType = "text/csv";
    } else {
      content = JSON.stringify(results, null, 2);
      filename = `youtube-keywords-${keyword}-${new Date().toISOString().split("T")[0]}.json`;
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${results.length} keywords as ${format.toUpperCase()}`);
  };

  const copyToClipboard = () => {
    if (!results.length) {
      toast.error("No results to copy");
      return;
    }

    const text = results.map(result => result.suggestion).join("\n");
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Keywords copied to clipboard"))
      .catch(err => toast.error("Failed to copy keywords"));
  };

  return {
    keyword,
    setKeyword,
    country,
    setCountry,
    language,
    setLanguage,
    searchHashtags,
    setSearchHashtags,
    removeDuplicates,
    setRemoveDuplicates,
    isLoading,
    results,
    handleSearch,
    handleExport,
    copyToClipboard
  };
};
