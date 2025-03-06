
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormSectionWrapper from "./form-sections/FormSectionWrapper";
import { AlertCircle, Info, Youtube } from "lucide-react";

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
  const [showDebugInfo, setShowDebugInfo] = useState(true);

  const validateUrl = (url: string) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔍 Validating URL: "${url}"`);
    
    if (!url || url.trim() === "") {
      setIsValid(false);
      setValidationMessage("URL is required");
      console.log(`[${timestamp}] ❌ URL is empty`);
      return false;
    }
    
    // Check if it's any YouTube-related URL or handle
    const youtubePatterns = [
      /youtube\.com\/channel\/([^\/\?]+)/,     // Channel URL
      /youtube\.com\/c\/([^\/\?]+)/,           // Custom URL
      /youtube\.com\/@([^\/\?]+)/,             // Handle URL
      /@([^\/\?\s]+)/,                         // Just the handle
      /youtube\.com\/watch\?v=([^&]+)/,        // Video URL
      /youtu\.be\/([^\/\?]+)/                  // Short video URL
    ];
    
    const isYoutubeUrl = youtubePatterns.some(pattern => pattern.test(url));
    
    if (!isYoutubeUrl) {
      setIsValid(false);
      setValidationMessage("Enter a valid YouTube URL or handle");
      console.log(`[${timestamp}] ❌ Not a valid YouTube URL format: "${url}"`);
      return false;
    }
    
    setIsValid(true);
    setValidationMessage("");
    console.log(`[${timestamp}] ✅ URL validation passed for: "${url}"`);
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
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔘 Submit button clicked for URL: "${youtubeUrl}"`);
    
    if (validateUrl(youtubeUrl)) {
      console.log(`[${timestamp}] ✅ URL valid, initiating fetch`);
      onFetch();
    } else {
      console.log(`[${timestamp}] ❌ URL validation failed, not fetching`);
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
            <div className="relative flex-1">
              <Input
                value={youtubeUrl}
                onChange={handleInputChange}
                placeholder="https://youtube.com/... or @username"
                className={`pl-10 ${!isValid ? 'border-red-500' : ''}`}
                required
              />
              <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !youtubeUrl || !isValid}
              className="min-w-24"
            >
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
          
          <div className="mt-2">
            <button 
              type="button" 
              className="text-xs text-blue-500 flex items-center gap-1"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              <Info className="h-3 w-3" />
              {showDebugInfo ? "Hide debug info" : "Show debug info"}
            </button>
            
            {showDebugInfo && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-48">
                <p>• Current status: {loading ? "Loading..." : "Ready"}</p>
                <p>• Entered URL: {youtubeUrl || "None"}</p>
                <p>• URL valid: {isValid ? "Yes" : "No"}</p>
                <p>• Test URLs - Try these examples:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Channel: https://youtube.com/channel/UCnz-ZXXER4jOvDUe3fx2JXg</li>
                  <li>Handle: @techwithtim</li>
                  <li>Video: https://www.youtube.com/watch?v=dQw4w9WgXcQ</li>
                  <li>Custom: https://www.youtube.com/c/TechWithTim</li>
                </ul>
                <p className="mt-1">• Check browser console (F12) for detailed logs.</p>
                <p className="mt-1">• Edge function logs are also available in Supabase dashboard.</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </FormSectionWrapper>
  );
};

export default YouTubeUrlInput;
