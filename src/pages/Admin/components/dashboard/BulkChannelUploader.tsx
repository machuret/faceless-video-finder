
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import UploadProgress from "./components/UploadProgress";
import { useBulkChannelUpload } from "./hooks/useBulkChannelUpload";

const BulkChannelUploader = () => {
  const [urls, setUrls] = useState<string>("");
  const {
    isProcessing,
    progress,
    currentChannel,
    processedCount,
    totalCount,
    processChannelUrls
  } = useBulkChannelUpload();
  
  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrls(e.target.value);
  };
  
  const startBulkUpload = async () => {
    await processChannelUrls(urls);
    setUrls("");
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Bulk Channel Uploader</h2>
      <p className="text-gray-600 mb-4">
        Enter up to 10 YouTube channel URLs (one per line) to add them in bulk. 
        We'll automatically fetch channel data for each URL.
      </p>
      
      <Textarea
        placeholder="Enter YouTube channel URLs (one per line)
e.g., https://www.youtube.com/@example
https://www.youtube.com/@another"
        value={urls}
        onChange={handleUrlsChange}
        rows={5}
        disabled={isProcessing}
        className="mb-4"
      />
      
      {isProcessing && (
        <UploadProgress
          processedCount={processedCount}
          totalCount={totalCount}
          progress={progress}
          currentChannel={currentChannel}
        />
      )}
      
      <Button 
        onClick={startBulkUpload} 
        disabled={isProcessing || !urls.trim()}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          "Bulk Upload Channels"
        )}
      </Button>
    </Card>
  );
};

export default BulkChannelUploader;
