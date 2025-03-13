
import ChannelTypeCard from "./ChannelTypeCard";
import { Button } from "@/components/ui/button";
import { ChannelTypeInfo } from "@/services/channelTypeService";

interface ChannelTypeGridProps {
  types: ChannelTypeInfo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const ChannelTypeGrid = ({ types, isLoading, error, refetch }: ChannelTypeGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        <p className="font-medium">Error</p>
        <p>{error instanceof Error ? error.message : "Failed to load channel types"}</p>
        <Button 
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (types.length === 0) {
    return (
      <div className="col-span-full text-center py-10">
        <p className="text-gray-600 mb-4">No channel types found</p>
        <Button 
          onClick={() => refetch()}
          variant="outline"
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {types.map((type) => (
        <ChannelTypeCard 
          key={type.id}
          id={type.id}
          label={type.label}
          description={type.description}
          image_url={type.image_url}
        />
      ))}
    </div>
  );
};

export default ChannelTypeGrid;
