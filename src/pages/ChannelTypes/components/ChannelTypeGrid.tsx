
import React from "react";
import { ChannelTypeInfo } from "@/services/channelTypeService";
import ChannelTypeCard from "./ChannelTypeCard";

interface ChannelTypeGridProps {
  types: ChannelTypeInfo[];
}

const ChannelTypeGrid = ({ types }: ChannelTypeGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {types.map((type) => (
        <ChannelTypeCard key={type.id} type={type} />
      ))}
    </div>
  );
};

export default ChannelTypeGrid;
