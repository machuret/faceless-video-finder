
import { useEffect, useState } from "react";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { getChannelTypeById } from "@/services/channelTypeService";
import { ChannelTypeInfo as ChannelTypeInfoType } from "@/services/channelTypeService";

interface ChannelTypeInfoProps {
  channelType: string | undefined;
}

const ChannelTypeInfo = ({ channelType }: ChannelTypeInfoProps) => {
  const [typeInfo, setTypeInfo] = useState<ChannelTypeInfoType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTypeInfo = async () => {
      if (!channelType) return;
      
      setLoading(true);
      try {
        // First try to get the channel type from the database
        const dbTypeInfo = await getChannelTypeById(channelType);
        
        if (dbTypeInfo) {
          setTypeInfo(dbTypeInfo);
        } else {
          // Fallback to local constant if not found in DB
          const localTypeInfo = channelTypes.find(type => type.id === channelType);
          setTypeInfo(localTypeInfo || null);
        }
      } catch (error) {
        console.error("Error fetching channel type info:", error);
        // Fallback to local constant if there's an error
        const localTypeInfo = channelTypes.find(type => type.id === channelType);
        setTypeInfo(localTypeInfo || null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTypeInfo();
  }, [channelType]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Loading channel type information...</h2>
        </div>
      </div>
    );
  }
  
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
