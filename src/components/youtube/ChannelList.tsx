
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, RefreshCw } from "lucide-react";
import type { Channel, ChannelCategory, ChannelType } from "@/types/youtube";

interface ChannelListProps {
  channels: Channel[];
  onDelete: (id: string) => void;
  onSave: (channel: Channel) => void;
  onGenerateContent?: (channel: Channel) => void;
  generatingContent?: boolean;
}

export const ChannelList = ({ 
  channels, 
  onDelete, 
  onSave,
  onGenerateContent,
  generatingContent 
}: ChannelListProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Channel | null>(null);

  const handleEdit = (channel: Channel) => {
    setEditForm({ ...channel });
    setEditingId(channel.id);
  };

  const handleSave = () => {
    if (editForm) {
      onSave(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (editForm) {
      let value: string | number | null = e.target.value;
      
      if (e.target.type === 'number') {
        value = e.target.value === '' ? null : Number(e.target.value);
      }

      setEditForm({
        ...editForm,
        [e.target.name]: value,
      });
    }
  };

  const channelCategories: ChannelCategory[] = [
    "entertainment",
    "education",
    "gaming",
    "music",
    "news",
    "sports",
    "technology",
    "other"
  ];

  const channelTypes: ChannelType[] = [
    "creator",
    "brand",
    "media",
    "other"
  ];

  return (
    <div className="space-y-4">
      {channels.map((channel) => (
        <Card key={channel.id} className="overflow-hidden">
          <CardContent className="p-6">
            {editingId === channel.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Channel Title</label>
                    <Input
                      name="channel_title"
                      value={editForm?.channel_title || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Video ID</label>
                    <Input
                      name="video_id"
                      value={editForm?.video_id || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Channel URL</label>
                    <Input
                      name="channel_url"
                      value={editForm?.channel_url || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Subscribers</label>
                    <Input
                      type="number"
                      name="total_subscribers"
                      value={editForm?.total_subscribers || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Views</label>
                    <Input
                      type="number"
                      name="total_views"
                      value={editForm?.total_views || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Video Count</label>
                    <Input
                      type="number"
                      name="video_count"
                      value={editForm?.video_count || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CPM</label>
                    <Input
                      type="number"
                      name="cpm"
                      value={editForm?.cpm || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Potential Revenue</label>
                    <Input
                      type="number"
                      name="potential_revenue"
                      value={editForm?.potential_revenue || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Revenue per Video</label>
                    <Input
                      type="number"
                      name="revenue_per_video"
                      value={editForm?.revenue_per_video || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Revenue per Month</label>
                    <Input
                      type="number"
                      name="revenue_per_month"
                      value={editForm?.revenue_per_month || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      name="channel_category"
                      value={editForm?.channel_category || "other"}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      {channelCategories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      name="channel_type"
                      value={editForm?.channel_type || "other"}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      {channelTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <Input
                      name="country"
                      value={editForm?.country || ""}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Niche</label>
                    <Input
                      name="niche"
                      value={editForm?.niche || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={editForm?.description || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded min-h-[100px]"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={editForm?.notes || ""}
                    onChange={handleChange}
                    className="w-full p-2 border rounded min-h-[100px]"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
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
                      onClick={() => handleEdit(channel)}
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
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
