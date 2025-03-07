
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface ChannelBasicFieldsProps {
  channelTitle: string;
  channelUrl: string;
  description: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFetchAbout?: () => void;
  isLoading?: boolean;
}

const ChannelBasicFields = ({
  channelTitle,
  channelUrl,
  description,
  handleChange,
  onFetchAbout,
  isLoading = false
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
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="description">About</Label>
          {onFetchAbout && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onFetchAbout}
              disabled={isLoading || !channelUrl}
              className="flex items-center gap-1"
            >
              <FileText className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? "Fetching..." : "Fetch About Section"}
            </Button>
          )}
        </div>
        <Textarea
          id="description"
          name="description"
          value={description || ""}
          onChange={handleChange}
          placeholder="Enter channel about information"
          rows={3}
        />
      </div>
    </>
  );
};

export default ChannelBasicFields;
