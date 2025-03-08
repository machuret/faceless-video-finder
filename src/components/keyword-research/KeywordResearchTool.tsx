
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Download, Copy, Info } from "lucide-react";
import KeywordResults from "./KeywordResults";
import countryList from "./utils/countries";
import languageList from "./utils/languages";
import { supabase } from "@/integrations/supabase/client";

interface KeywordResult {
  keyword: string;
  suggestion: string;
}

const KeywordResearchTool = () => {
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="keyword">Main Keyword</Label>
            <Input
              id="keyword"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter a keyword to research"
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country" className="mt-1">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map(item => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language" className="mt-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languageList.map(item => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="searchHashtags"
                checked={searchHashtags}
                onCheckedChange={setSearchHashtags}
              />
              <Label htmlFor="searchHashtags">Search hashtags</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="removeDuplicates"
                checked={removeDuplicates}
                onCheckedChange={setRemoveDuplicates}
              />
              <Label htmlFor="removeDuplicates">Remove duplicates</Label>
            </div>
          </div>
          
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !keyword.trim()} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Search className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Keywords
              </>
            )}
          </Button>
        </div>
      </Card>
      
      {results.length > 0 && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Search Results</h2>
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
          
          <KeywordResults results={results} />
        </Card>
      )}
      
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start space-x-4">
          <Info className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">How to Use YouTube Keyword Research</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Enter a main keyword related to your niche or video topic</li>
              <li>Select your target country and language to get localized results</li>
              <li>Toggle hashtag search to find related hashtags for your videos</li>
              <li>The tool will show you real YouTube autocomplete suggestions</li>
              <li>Use these keywords in your video titles, descriptions, and tags</li>
              <li>Export results to CSV or JSON for further analysis</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KeywordResearchTool;
