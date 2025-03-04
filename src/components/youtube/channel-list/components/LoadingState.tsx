
import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC = () => {
  return (
    <div className="text-center py-10">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
      <p className="text-gray-500">Loading channels...</p>
    </div>
  );
};
