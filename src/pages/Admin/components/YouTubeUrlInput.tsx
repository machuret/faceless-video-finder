
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormSectionWrapper from "./form-sections/FormSectionWrapper";

interface YouTubeUrlInputProps {
  youtubeUrl: string;
  loading: boolean;
  setYoutubeUrl: (url: string) => void;
  onFetch: () => void;
}

const YouTubeUrlInput = ({
  youtubeUrl,
  loading,
  setYoutubeUrl,
  onFetch,
}: YouTubeUrlInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFetch();
  };

  return (
    <FormSectionWrapper 
      title="YouTube URL" 
      description="Enter a YouTube channel URL to auto-populate the form"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/..."
            className="flex-1"
            required
          />
          <Button type="submit" disabled={loading || !youtubeUrl}>
            {loading ? "Fetching..." : "Fetch"}
          </Button>
        </div>
      </form>
    </FormSectionWrapper>
  );
};

export default YouTubeUrlInput;
