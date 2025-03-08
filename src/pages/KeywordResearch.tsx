
import React from "react";
import MainLayout from "@/components/MainLayout";
import { Helmet } from "react-helmet";
import KeywordResearchTool from "@/components/keyword-research/KeywordResearchTool";

const KeywordResearch = () => {
  return (
    <MainLayout>
      <Helmet>
        <title>YouTube Keyword Research Tool | TubeFacts</title>
        <meta 
          name="description" 
          content="Unlock YouTube's hidden keyword landscape with our autocomplete keyword scraper. Find the exact terms your audience is searching for."
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">YouTube Keyword Research</h1>
          <p className="text-gray-600 mb-8">
            Discover the exact terms people are searching for on YouTube. Our tool taps directly into 
            YouTube's autocomplete feature, giving you real-time keyword insights for your videos.
          </p>
          
          <KeywordResearchTool />
        </div>
      </div>
    </MainLayout>
  );
};

export default KeywordResearch;
