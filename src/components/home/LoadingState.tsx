
import React from 'react';

const LoadingState = () => {
  return (
    <div className="text-center py-12">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      <p className="mt-4 text-gray-600 font-medium font-montserrat">Loading channels...</p>
    </div>
  );
};

export default LoadingState;
