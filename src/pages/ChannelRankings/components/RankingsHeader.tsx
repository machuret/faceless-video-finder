
import React from "react";

interface RankingsHeaderProps {
  title: string;
  description: string;
}

const RankingsHeader = ({ title, description }: RankingsHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl max-w-3xl opacity-90">{description}</p>
      </div>
    </div>
  );
};

export default RankingsHeader;
