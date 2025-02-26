
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2 } from "lucide-react";
import type { Channel } from "@/types/youtube";

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">
          {editing ? (
            <Input
              value={editedChannel.channel_title}
              onChange={(e) => setEditedChannel({
                ...editedChannel,
                channel_title: e.target.value
              })}
            />
          ) : (
            channel.channel_title
          )}
        </CardTitle>
        <div className="space-x-2">
          {editing ? (
            <>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
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
            <Input
              value={editedChannel.channel_url}
              onChange={(e) => setEditedChannel({
                ...editedChannel,
                channel_url: e.target.value
              })}
              placeholder="Channel URL"
            />
            <Input
              value={editedChannel.description || ""}
              onChange={(e) => setEditedChannel({
                ...editedChannel,
                description: e.target.value
              })}
              placeholder="Description"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{channel.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{channel.total_subscribers?.toLocaleString()} subscribers</span>
              <span>{channel.total_views?.toLocaleString()} views</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
