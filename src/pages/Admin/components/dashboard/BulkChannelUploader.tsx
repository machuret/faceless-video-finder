
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import UploadProgress from "./components/UploadProgress";
import UploadResultsReport from "./components/UploadResultsReport";
import { useBulkChannelUpload } from "./hooks/useBulkChannelUpload";

const BulkChannelUploader = () => {
  const [urls, setUrls] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(false);
  
  const {
    isProcessing,
    progress,
    currentChannel,
    processedCount,
    totalCount,
    errorCount,
    successCount,
    uploadResults,
    processChannelUrls
  } = useBulkChannelUpload();
  
  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrls(e.target.value);
  };
  
  const startBulkUpload = async () => {
    setShowResults(false);
    await processChannelUrls(urls);
    setShowResults(true);
  };
  
  const handleCloseResults = () => {
    setShowResults(false);
    setUrls("");
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Bulk Channel Uploader</h2>
      <p className="text-gray-600 mb-4">
        Enter up to 10 YouTube channel URLs (one per line) to add them in bulk. 
        We'll automatically fetch channel data for each URL.
      </p>
      
      {showResults && uploadResults.length > 0 && (
        <UploadResultsReport 
          results={uploadResults} 
          onClose={handleCloseResults} 
        />
      )}
      
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
          errorCount={errorCount}
          successCount={successCount}
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
