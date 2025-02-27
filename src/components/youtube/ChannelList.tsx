
import { useState } from "react";
import { Channel, ChannelSize, UploadFrequency } from "@/types/youtube";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Wand2 } from "lucide-react";
import { ChannelEditForm } from "./channel-list/ChannelEditForm";

interface ChannelListProps {
  channels: Channel[];
  onDelete: (id: string) => void;
  onSave: (channel: Channel) => void;
  onGenerateContent: (channel: Channel) => void;
  generatingContent: boolean;
  getChannelSize: (subscribers: number | null) => ChannelSize;
  getGrowthRange: (size: ChannelSize) => string;
  calculateUploadFrequency: (startDate: string | null, videoCount: number | null) => number | null;
  getUploadFrequencyCategory: (frequency: number | null) => UploadFrequency;
  getUploadFrequencyLabel: (frequency: number | null) => string;
  formatDate?: (dateString: string | null) => string;
}

export const ChannelList = ({
  channels,
  onDelete,
  onSave,
  onGenerateContent,
  generatingContent,
  getChannelSize,
  getGrowthRange,
  calculateUploadFrequency,
  getUploadFrequencyCategory,
  getUploadFrequencyLabel,
  formatDate
}: ChannelListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Channel | null>(null);

  const handleEdit = (channel: Channel) => {
    setEditingId(channel.id);
    setEditForm(channel);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = () => {
    if (editForm) {
      onSave(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editForm) return;

    const { name, value, type } = e.target;
    
    if (type === 'number') {
      // Handle number inputs
      setEditForm({
        ...editForm,
        [name]: value === '' ? null : Number(value)
      });
    } else {
      // Handle text and other inputs
      setEditForm({
        ...editForm,
        [name]: value
      });
    }
  };

  if (channels.length === 0) {
    return <div className="bg-white rounded p-6 shadow">No channels found.</div>;
  }

  return (
    <div className="space-y-6">
      {channels.map((channel) => {
        const channelSize = getChannelSize(channel.total_subscribers);
        const growthRange = getGrowthRange(channelSize);
        const uploadFrequency = calculateUploadFrequency(channel.start_date, channel.video_count);
        const frequencyCategory = getUploadFrequencyCategory(uploadFrequency);
        const frequencyLabel = getUploadFrequencyLabel(uploadFrequency);

        if (editingId === channel.id && editForm) {
          return (
            <div key={channel.id} className="bg-white rounded-lg shadow p-6">
              <ChannelEditForm
                editForm={editForm}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          );
        }

        return (
          <div key={channel.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {channel.screenshot_url && (
                    <img
                      src={channel.screenshot_url}
                      alt={channel.channel_title}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{channel.channel_title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {channel.channel_category && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {channel.channel_category}
                        </span>
                      )}
                      {channel.channel_type && (
                        <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                          {channel.channel_type}
                        </span>
                      )}
                      <span className={`inline-block text-xs px-2 py-1 rounded ${
                        channelSize === "big" ? "bg-green-100 text-green-800" :
                        channelSize === "larger" ? "bg-emerald-100 text-emerald-800" :
                        channelSize === "established" ? "bg-yellow-100 text-yellow-800" :
                        channelSize === "growing" ? "bg-orange-100 text-orange-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {channelSize}
                      </span>
                      {channel.start_date && formatDate && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Since {formatDate(channel.start_date)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <a href={channel.channel_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {channel.channel_url}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(channel)}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(channel.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onGenerateContent(channel)} 
                    disabled={generatingContent}
                  >
                    <Wand2 className="w-4 h-4 mr-2" /> 
                    {generatingContent ? 'Generating...' : 'Generate Description'}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Channel Stats</h4>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm">Subscribers: {channel.total_subscribers?.toLocaleString() || 'N/A'}</li>
                    <li className="text-sm">Views: {channel.total_views?.toLocaleString() || 'N/A'}</li>
                    <li className="text-sm">Videos: {channel.video_count?.toLocaleString() || 'N/A'}</li>
                    <li className="text-sm">Frequency: {frequencyLabel}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Monetization</h4>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm">CPM: ${channel.cpm?.toFixed(2) || 'N/A'}</li>
                    <li className="text-sm">Revenue per Video: ${channel.revenue_per_video?.toLocaleString() || 'N/A'}</li>
                    <li className="text-sm">Monthly Revenue: ${channel.revenue_per_month?.toLocaleString() || 'N/A'}</li>
                    <li className="text-sm">Potential Revenue: ${channel.potential_revenue?.toLocaleString() || 'N/A'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-500">Growth Potential</h4>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm">Size: {channelSize}</li>
                    <li className="text-sm">Expected Growth: {growthRange} subs/month</li>
                    <li className="text-sm">Upload Frequency: <span className={`${
                      frequencyCategory === "insane" ? "text-emerald-600" :
                      frequencyCategory === "very_high" ? "text-green-600" :
                      frequencyCategory === "high" ? "text-blue-600" :
                      frequencyCategory === "medium" ? "text-yellow-600" :
                      frequencyCategory === "low" ? "text-orange-600" :
                      "text-red-600"
                    } font-medium`}>{frequencyCategory.replace('_', ' ')}</span></li>
                    <li className="text-sm">AI Content: {channel.uses_ai ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
              </div>

              {channel.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-500">Description</h4>
                  <div className="text-sm mt-1 whitespace-pre-wrap">{channel.description}</div>
                </div>
              )}

              {channel.keywords && channel.keywords.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-500">Keywords</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {channel.keywords.map((keyword, index) => (
                      <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
