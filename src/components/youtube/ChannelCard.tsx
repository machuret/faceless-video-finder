
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { Channel, ChannelCategory, ChannelType } from "@/types/youtube";

interface ChannelCardProps {
  channel: Channel;
  onDelete: (id: string) => void;
  onSave: (channel: Channel) => void;
}

export const ChannelCard = ({ channel, onDelete, onSave }: ChannelCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editedChannel, setEditedChannel] = useState(channel);

  const handleSave = () => {
    onSave(editedChannel);
    setEditing(false);
  };

  const channelCategories: ChannelCategory[] = [
    "entertainment",
    "education",
    "gaming",
    "music",
    "news",
    "sports",
    "technology",
    "other",
  ];

  const channelTypes: ChannelType[] = ["creator", "brand", "media", "other"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">
          {editing ? (
            <Input
              value={editedChannel.channel_title}
              onChange={(e) =>
                setEditedChannel({
                  ...editedChannel,
                  channel_title: e.target.value,
                })
              }
            />
          ) : (
            channel.channel_title
          )}
        </CardTitle>
        <div className="space-x-2">
          {editing ? (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="destructive" onClick={() => onDelete(channel.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Channel URL</Label>
                <Input
                  value={editedChannel.channel_url}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      channel_url: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Video ID</Label>
                <Input
                  value={editedChannel.video_id}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      video_id: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={editedChannel.description || ""}
                onChange={(e) =>
                  setEditedChannel({
                    ...editedChannel,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={editedChannel.channel_category || "other"}
                  onValueChange={(value: ChannelCategory) =>
                    setEditedChannel({
                      ...editedChannel,
                      channel_category: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type</Label>
                <Select
                  value={editedChannel.channel_type || "other"}
                  onValueChange={(value: ChannelType) =>
                    setEditedChannel({
                      ...editedChannel,
                      channel_type: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {channelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Total Subscribers</Label>
                <Input
                  type="number"
                  value={editedChannel.total_subscribers || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      total_subscribers: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label>Total Views</Label>
                <Input
                  type="number"
                  value={editedChannel.total_views || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      total_views: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CPM</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedChannel.cpm || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      cpm: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label>Video Count</Label>
                <Input
                  type="number"
                  value={editedChannel.video_count || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      video_count: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Revenue per Video</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedChannel.revenue_per_video || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      revenue_per_video: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label>Revenue per Month</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editedChannel.revenue_per_month || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      revenue_per_month: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <Input
                  value={editedChannel.country || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      country: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Niche</Label>
                <Input
                  value={editedChannel.niche || ""}
                  onChange={(e) =>
                    setEditedChannel({
                      ...editedChannel,
                      niche: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Input
                value={editedChannel.notes || ""}
                onChange={(e) =>
                  setEditedChannel({
                    ...editedChannel,
                    notes: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={editedChannel.uses_ai || false}
                onCheckedChange={(checked) =>
                  setEditedChannel({
                    ...editedChannel,
                    uses_ai: checked,
                  })
                }
              />
              <Label>Uses AI</Label>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{channel.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>{channel.total_subscribers?.toLocaleString()} subscribers</span>
              <span>{channel.total_views?.toLocaleString()} views</span>
              {channel.channel_category && (
                <span>Category: {channel.channel_category}</span>
              )}
              {channel.channel_type && <span>Type: {channel.channel_type}</span>}
              {channel.country && <span>Country: {channel.country}</span>}
              {channel.video_count && (
                <span>{channel.video_count.toLocaleString()} videos</span>
              )}
              {channel.uses_ai && <span>Uses AI</span>}
            </div>
            {channel.cpm && (
              <div className="text-sm text-gray-500">
                CPM: ${channel.cpm.toFixed(2)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
