
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useChannelFormSubmission } from "../../hooks/useChannelFormSubmission";

const BulkChannelUploader = () => {
  const [urls, setUrls] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string>("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrls(e.target.value);
  };
  
  const startBulkUpload = async () => {
    // Parse URLs, one per line
    const channelUrls = urls
      .split("\n")
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (channelUrls.length === 0) {
      toast.error("Please enter at least one YouTube channel URL");
      return;
    }
    
    if (channelUrls.length > 10) {
      toast.warning("You can only upload up to 10 channels at once. Only the first 10 will be processed.");
    }
    
    const urlsToProcess = channelUrls.slice(0, 10);
    setTotalCount(urlsToProcess.length);
    setProcessedCount(0);
    setProgress(0);
    setIsProcessing(true);
    
    toast.info(`Starting bulk upload of ${urlsToProcess.length} channels. This may take a while.`);
    
    for (let i = 0; i < urlsToProcess.length; i++) {
      const url = urlsToProcess[i];
      setCurrentChannel(url);
      
      try {
        // Create a minimal form data object for the channel
        const formData = {
          channel_url: url,
          video_id: "",
          channel_title: "", // Will be populated from YouTube data
          description: "",
          ai_description: "",
          screenshot_url: "",
          total_subscribers: "",
          total_views: "",
          start_date: "",
          video_count: "",
          cpm: "4",
          channel_type: "",
          country: "US",
          channel_category: "entertainment",
          notes: "",
          keywords: []
        };
        
        // Dummy event for the handleSubmit function
        const dummyEvent = {
          preventDefault: () => {}
        } as React.FormEvent;
        
        // Get the handleSubmit function from the hook
        const { handleSubmit } = useChannelFormSubmission(formData, setIsProcessing, false);
        
        // Process the channel submission (returnToList set to false)
        await handleSubmit(dummyEvent, false);
        
        setProcessedCount(i + 1);
        setProgress(Math.floor(((i + 1) / urlsToProcess.length) * 100));
        
      } catch (error) {
        console.error(`Error processing channel ${url}:`, error);
        toast.error(`Failed to process channel: ${url}`);
      }
      
      // Add a small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    toast.success(`Completed processing ${processedCount} out of ${urlsToProcess.length} channels`);
    setIsProcessing(false);
    setUrls("");
  };
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Bulk Channel Uploader</h2>
      <p className="text-gray-600 mb-4">
        Enter up to 10 YouTube channel URLs (one per line) to add them in bulk.
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
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span>Progress: {processedCount} of {totalCount} channels</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <p className="text-sm text-gray-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Currently processing: {currentChannel}
          </p>
        </div>
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
