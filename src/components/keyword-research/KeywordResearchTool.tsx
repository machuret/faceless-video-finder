
import React from "react";
import { useKeywordResearch } from "./hooks/useKeywordResearch";
import SearchForm from "./components/SearchForm";
import ResultsDisplay from "./components/ResultsDisplay";
import InfoCard from "./components/InfoCard";

const KeywordResearchTool = () => {
  const {
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
  } = useKeywordResearch();

  return (
    <div className="space-y-6">
      <SearchForm
        keyword={keyword}
        setKeyword={setKeyword}
        country={country}
        setCountry={setCountry}
        language={language}
        setLanguage={setLanguage}
        searchHashtags={searchHashtags}
        setSearchHashtags={setSearchHashtags}
        removeDuplicates={removeDuplicates}
        setRemoveDuplicates={setRemoveDuplicates}
        handleSearch={handleSearch}
        isLoading={isLoading}
      />
      
      <ResultsDisplay
        results={results}
        handleExport={handleExport}
        copyToClipboard={copyToClipboard}
      />
      
      <InfoCard />
    </div>
  );
};

export default KeywordResearchTool;
