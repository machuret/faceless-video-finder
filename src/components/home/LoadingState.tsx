
import React from 'react';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p className="mt-4 text-gray-600 font-medium font-montserrat">Loading data...</p>
      <p className="text-sm text-gray-500">This might take a moment</p>
    </div>
  );
};

export default LoadingState;
