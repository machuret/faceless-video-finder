
import React from "react";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

const InfoCard: React.FC = () => {
  return (
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
  );
};

export default InfoCard;
