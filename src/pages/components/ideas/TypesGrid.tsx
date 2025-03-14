
import React, { useMemo } from "react";
import { ChannelTypeInfo } from "@/services/channelTypeService";
import ChannelTypeCard from "../../ChannelTypes/components/ChannelTypeCard";

interface TypesGridProps {
  types: ChannelTypeInfo[];
}

const TypesGrid = ({ types }: TypesGridProps) => {
  // Memoize to prevent rerenders
  const sortedTypes = useMemo(() => {
    return [...types].sort((a, b) => a.label.localeCompare(b.label));
  }, [types]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedTypes.map((type) => (
        <ChannelTypeCard key={type.id} type={type} />
      ))}
    </div>
  );
};

export default TypesGrid;
