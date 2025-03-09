
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { channelTypes } from "@/components/youtube/channel-list/constants";
import { fetchChannelTypeById } from "@/services/channelTypeService";
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
        const dbTypeInfo = await fetchChannelTypeById(channelType);
        
        if (dbTypeInfo) {
          setTypeInfo(dbTypeInfo);
        } else {
          // Fallback to local constant if not found in DB
          const localTypeInfo = channelTypes.find(type => type.id === channelType);
          if (localTypeInfo) {
            // Convert local type to match ChannelTypeInfoType
            setTypeInfo({
              id: localTypeInfo.id,
              label: localTypeInfo.label,
              description: localTypeInfo.description,
              production: localTypeInfo.production,
              example: localTypeInfo.example,
              image_url: null // Local types don't have image_url
            });
          } else {
            setTypeInfo(null);
          }
        }
      } catch (error) {
        console.error("Error fetching channel type info:", error);
        // Fallback to local constant if there's an error
        const localTypeInfo = channelTypes.find(type => type.id === channelType);
        if (localTypeInfo) {
          // Convert local type to match ChannelTypeInfoType
          setTypeInfo({
            id: localTypeInfo.id,
            label: localTypeInfo.label,
            description: localTypeInfo.description,
            production: localTypeInfo.production,
            example: localTypeInfo.example,
            image_url: null // Local types don't have image_url
          });
        } else {
          setTypeInfo(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTypeInfo();
  }, [channelType]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Loading channel type information...</h2>
        </div>
      </div>
    );
  }
  
  if (!typeInfo) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Channel Type: {' '}
          <Link 
            to={`/channel-types/${typeInfo.id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {typeInfo.label}
          </Link>
        </h2>
        
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
