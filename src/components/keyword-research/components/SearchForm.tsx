
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import countryList from "../utils/countries";
import languageList from "../utils/languages";

interface SearchFormProps {
  keyword: string;
  setKeyword: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
  searchHashtags: boolean;
  setSearchHashtags: (value: boolean) => void;
  removeDuplicates: boolean;
  setRemoveDuplicates: (value: boolean) => void;
  handleSearch: () => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
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
  handleSearch,
  isLoading,
}) => {
  return (
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
  );
};

export default SearchForm;
