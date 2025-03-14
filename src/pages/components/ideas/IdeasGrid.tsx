
import React, { useMemo } from "react";
import FacelessIdeaCard from "./FacelessIdeaCard";
import { FacelessIdeaInfo } from "@/services/facelessIdeas/types";

interface IdeasGridProps {
  ideas: FacelessIdeaInfo[];
}

const IdeasGrid = ({ ideas }: IdeasGridProps) => {
  // Memoize to prevent rerenders
  const sortedIdeas = useMemo(() => {
    return [...ideas].sort((a, b) => a.label.localeCompare(b.label));
  }, [ideas]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedIdeas.map((idea) => (
        <FacelessIdeaCard key={idea.id} idea={idea} />
      ))}
    </div>
  );
};

export default IdeasGrid;
