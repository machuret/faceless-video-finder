
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface YouTubeUrlInputProps {
  youtubeUrl: string;
  loading: boolean;
  onUrlChange: (url: string) => void;
  onFetch: () => void;
}

const YouTubeUrlInput: React.FC<YouTubeUrlInputProps> = ({
  youtubeUrl,
  loading,
  onUrlChange,
  onFetch,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFetch();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <h2 className="text-lg font-medium">Fetch Channel Data</h2>
      <p className="text-sm text-gray-500">
        Enter a YouTube URL (channel URL, video URL, or @handle) to fetch channel data
      </p>
      <div className="flex gap-2">
        <Input
          value={youtubeUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://youtube.com/..."
          className="flex-1"
          required
        />
        <Button type="submit" disabled={loading || !youtubeUrl}>
          {loading ? "Fetching..." : "Fetch"}
        </Button>
      </div>
    </form>
  );
};

export default YouTubeUrlInput;
