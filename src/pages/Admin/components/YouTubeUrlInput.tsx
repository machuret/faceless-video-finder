
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormSectionWrapper from "./form-sections/FormSectionWrapper";
import { AlertCircle } from "lucide-react";

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
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");

  const validateUrl = (url: string) => {
    if (!url) {
      setIsValid(false);
      setValidationMessage("URL is required");
      return false;
    }
    
    // Basic check if it contains youtube.com or youtu.be
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      setIsValid(false);
      setValidationMessage("Enter a valid YouTube URL");
      return false;
    }
    
    setIsValid(true);
    setValidationMessage("");
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    
    if (url) {
      validateUrl(url);
    } else {
      setIsValid(true);
      setValidationMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateUrl(youtubeUrl)) {
      onFetch();
    }
  };

  return (
    <FormSectionWrapper 
      title="YouTube URL" 
      description="Enter a YouTube channel URL to auto-populate the form"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={youtubeUrl}
              onChange={handleInputChange}
              placeholder="https://youtube.com/..."
              className={`flex-1 ${!isValid ? 'border-red-500' : ''}`}
              required
            />
            <Button type="submit" disabled={loading || !youtubeUrl || !isValid}>
              {loading ? "Fetching..." : "Fetch"}
            </Button>
          </div>
          
          {!isValid && (
            <div className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>{validationMessage}</span>
            </div>
          )}
          
          <div className="text-gray-500 text-xs mt-1">
            <p>Accepted formats:</p>
            <ul className="list-disc ml-5">
              <li>Channel URLs: youtube.com/channel/UC...</li>
              <li>Custom URLs: youtube.com/c/ChannelName</li>
              <li>Handles: youtube.com/@username or @username</li>
              <li>Video URLs: youtube.com/watch?v=... or youtu.be/...</li>
            </ul>
          </div>
        </div>
      </form>
    </FormSectionWrapper>
  );
};

export default YouTubeUrlInput;
