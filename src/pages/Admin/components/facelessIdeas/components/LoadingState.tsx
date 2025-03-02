
import React from "react";

export const LoadingState: React.FC = () => {
  return (
    <div className="py-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-sm text-gray-500">Loading faceless ideas...</p>
    </div>
  );
};
