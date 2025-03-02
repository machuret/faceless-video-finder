
import React from "react";

export const ImportHelp: React.FC = () => {
  return (
    <div className="mt-4 text-sm text-gray-500">
      <p>CSV Import Format:</p>
      <p className="text-xs mt-1">
        Niche Name | AI Voice Software (Yes/No) | Heavy Editing (Yes/No) | Complexity Level (Low/Medium/High) | Research Level (Low/Medium/High) | Difficulty (Easy/Medium/Hard) | Notes/Description | Example Channel Name | Example Channel URL
      </p>
    </div>
  );
};
