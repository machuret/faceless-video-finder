
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface YouTubeUrlInputProps {
  youtubeUrl: string;
  loading: boolean;
  onUrlChange: (url: string) => void;
  onFetch: () => void;
}

const YouTubeUrlInput = ({ youtubeUrl, loading, onUrlChange, onFetch }: YouTubeUrlInputProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div>
        <Input
          placeholder="Paste YouTube URL here"
          value={youtubeUrl}
          onChange={(e) => onUrlChange(e.target.value)}
        />
      </div>
      <Button 
        onClick={onFetch} 
        disabled={loading || !youtubeUrl}
        className="w-full"
      >
        {loading ? "Fetching data..." : "Fetch Channel Data"}
      </Button>
    </div>
  );
};

export default YouTubeUrlInput;
