
import { channelTypes } from "@/components/youtube/channel-list/constants";

interface ChannelTypeInfoProps {
  channelType: string | undefined;
}

const ChannelTypeInfo = ({ channelType }: ChannelTypeInfoProps) => {
  if (!channelType) return null;
  
  const typeInfo = channelTypes.find(type => type.id === channelType);
  if (!typeInfo) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Channel Type: {typeInfo.label}</h2>
        
        {typeInfo.description && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: typeInfo.description }}
            />
          </div>
        )}
        
        {typeInfo.production && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">How to Create</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: typeInfo.production }}
            />
          </div>
        )}
        
        {typeInfo.example && (
          <div>
            <h3 className="text-lg font-medium mb-2">Example Ideas</h3>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: typeInfo.example }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelTypeInfo;
