
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ChannelBasicFieldsProps {
  channelTitle: string;
  channelUrl: string;
  description: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ChannelBasicFields = ({
  channelTitle,
  channelUrl,
  description,
  handleChange
}: ChannelBasicFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="channel_title">Channel Title</Label>
          <Input
            type="text"
            id="channel_title"
            name="channel_title"
            value={channelTitle}
            onChange={handleChange}
            placeholder="Enter channel title"
            required
          />
        </div>
        <div>
          <Label htmlFor="channel_url">Channel URL</Label>
          <Input
            type="url"
            id="channel_url"
            name="channel_url"
            value={channelUrl}
            onChange={handleChange}
            placeholder="Enter channel URL"
            required
          />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={description || ""}
          onChange={handleChange}
          placeholder="Enter channel description"
          rows={3}
        />
      </div>
    </>
  );
};

export default ChannelBasicFields;
