
import React from "react";

interface NichesHeaderProps {
  backgroundImage: string;
}

const NichesHeader = ({ backgroundImage }: NichesHeaderProps) => {
  return (
    <div 
      className="bg-cover bg-center h-64 flex items-center justify-center mb-8"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})` }}
    >
      <div className="text-center text-white max-w-3xl mx-auto px-4">
        <h1 className="font-crimson text-4xl font-bold mb-4 text-center">YouTube Niches</h1>
        <p className="font-lato text-lg text-center">
          Explore different YouTube niches to find the perfect category for your content.
          Find inspiration, examples, and growth opportunities.
        </p>
      </div>
    </div>
  );
};

export default NichesHeader;
