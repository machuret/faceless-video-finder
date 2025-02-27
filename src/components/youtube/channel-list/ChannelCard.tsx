
import { Channel, ChannelSize, UploadFrequency } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, RefreshCw } from "lucide-react";

interface ChannelCardProps {
  channel: Channel;
  onEdit: (channel: Channel) => void;
  onDelete: (id: string) => void;
  onGenerateContent?: (channel: Channel) => void;
  generatingContent?: boolean;
  getChannelSize: (subscribers: number | null) => ChannelSize;
  getGrowthRange: (size: ChannelSize) => string;
  calculateUploadFrequency: (startDate: string | null, videoCount: number | null) => number | null;
  getUploadFrequencyCategory: (frequency: number | null) => UploadFrequency;
  getUploadFrequencyLabel: (frequency: number | null) => string;
}

const getChannelSizeColor = (size: ChannelSize): string => {
  switch (size) {
    case "big":
      return "text-purple-600 font-semibold";
    case "larger":
      return "text-blue-600 font-semibold";
    case "established":
      return "text-green-600 font-semibold";
    case "growing":
      return "text-yellow-600 font-semibold";
    case "small":
      return "text-gray-600";
    default:
      return "text-gray-600";
  }
};

const getUploadFrequencyColor = (frequency: UploadFrequency): string => {
  switch (frequency) {
    case "insane":
      return "text-purple-600 font-semibold";
    case "very_high":
      return "text-blue-600 font-semibold";
    case "high":
      return "text-green-600 font-semibold";
    case "medium":
      return "text-yellow-600 font-semibold";
    case "low":
      return "text-orange-600 font-semibold";
    case "very_low":
      return "text-red-600 font-semibold";
    default:
      return "text-gray-600";
  }
};

export const ChannelCard = ({ 
  channel, 
  onEdit, 
  onDelete, 
  onGenerateContent,
  generatingContent,
  getChannelSize,
  getGrowthRange,
  calculateUploadFrequency,
  getUploadFrequencyCategory,
  getUploadFrequencyLabel
}: ChannelCardProps) => {
  const uploadFrequency = calculateUploadFrequency(channel.start_date, channel.video_count);
  const uploadFrequencyCategory = getUploadFrequencyCategory(uploadFrequency);

  return (
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{channel.channel_title}</h3>
          <p className="text-gray-600">{channel.description || "No description available."}</p>
          {channel.notes && (
            <p className="text-gray-500 text-sm">Notes: {channel.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          {onGenerateContent && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGenerateContent(channel)}
              disabled={generatingContent}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${generatingContent ? 'animate-spin' : ''}`} />
              Generate
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(channel)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(channel.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm text-gray-500">
        <p>Subscribers: {channel.total_subscribers?.toLocaleString()}</p>
        <p>Total Views: {channel.total_views?.toLocaleString()}</p>
        <p>Videos: {channel.video_count}</p>
        {channel.cpm && <p>CPM: ${channel.cpm}</p>}
        {channel.channel_category && <p>Category: {channel.channel_category}</p>}
        {channel.channel_type && <p>Type: {channel.channel_type}</p>}
        {channel.niche && <p>Niche: {channel.niche}</p>}
        {channel.country && <p>Country: {channel.country}</p>}
        
        <div className="col-span-2 mt-2">
          <p>
            Channel Size:{" "}
            <span className={getChannelSizeColor(getChannelSize(channel.total_subscribers))}>
              {getChannelSize(channel.total_subscribers).charAt(0).toUpperCase() + 
               getChannelSize(channel.total_subscribers).slice(1)}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Expected Monthly Growth: {getGrowthRange(getChannelSize(channel.total_subscribers))} subscribers
          </p>
        </div>

        <div className="col-span-2 mt-2">
          <p>
            Upload Frequency:{" "}
            <span className={getUploadFrequencyColor(uploadFrequencyCategory)}>
              {uploadFrequencyCategory.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getUploadFrequencyLabel(uploadFrequency)}
          </p>
        </div>
      </div>
    </div>
  );
};
