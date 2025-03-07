
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useChannelFormSubmission } from "../../hooks/useChannelFormSubmission";
import { useYouTubeDataFetcher } from "../../hooks/youtube-data-fetcher";

const BulkChannelUploader = () => {
  const [urls, setUrls] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string>("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [fetchingData, setFetchingData] = useState(false);
  
  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrls(e.target.value);
  };
  
  // Function to fetch YouTube data for a single URL
  const fetchYouTubeDataForUrl = async (url: string) => {
    // Create a minimal temporary form state to hold the data
    const tempFormData = {
      video_id: "",
      channel_title: "",
      channel_url: url,
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
    
    // Create a temporary state setter for the form data
    let updatedFormData = { ...tempFormData };
    const setTempFormData = (data: any) => {
      if (typeof data === 'function') {
        updatedFormData = data(updatedFormData);
      } else {
        updatedFormData = { ...updatedFormData, ...data };
      }
    };
    
    // Get the YouTube data fetcher from our hook
    const { fetchYoutubeData } = useYouTubeDataFetcher(url, setFetchingData, setTempFormData);
    
    // Fetch the data
    await fetchYoutubeData();
    
    // Wait a bit to ensure data is fetched
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return the updated form data
    return updatedFormData;
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
        // First, fetch the YouTube data using just the URL
        toast.info(`Fetching data for ${url}...`);
        const enhancedFormData = await fetchYouTubeDataForUrl(url);
        
        // Check if we got meaningful data
        if (!enhancedFormData.channel_title || (!enhancedFormData.video_id && enhancedFormData.channel_title === "")) {
          toast.warning(`Couldn't fetch complete data for ${url}. Treating as manual entry.`);
          
          // Try to extract a channel name from the URL for a better user experience
          const channelNameMatch = url.match(/\/@([^\/\?]+)/);
          const channelName = channelNameMatch ? channelNameMatch[1] : "Unknown Channel";
          
          // Update with minimal data for manual processing
          enhancedFormData.channel_title = channelName;
          enhancedFormData.notes = `Automatically added via bulk upload. Original URL: ${url}`;
        }
        
        toast.info(`Saving channel: ${enhancedFormData.channel_title}`);
        
        // Dummy event for the handleSubmit function
        const dummyEvent = {
          preventDefault: () => {}
        } as React.FormEvent;
        
        // Get the handleSubmit function from the hook
        const { handleSubmit } = useChannelFormSubmission(enhancedFormData, setIsProcessing, false);
        
        // Process the channel submission (returnToList set to false)
        await handleSubmit(dummyEvent, false);
        
        setProcessedCount(i + 1);
        setProgress(Math.floor(((i + 1) / urlsToProcess.length) * 100));
        
      } catch (error) {
        console.error(`Error processing channel ${url}:`, error);
        toast.error(`Failed to process channel: ${url}`);
      }
      
      // Add a small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1500));
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
        disabled={isProcessing || fetchingData || !urls.trim()}
        className="w-full"
      >
        {isProcessing || fetchingData ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            {fetchingData ? "Fetching data..." : "Processing..."}
          </>
        ) : (
          "Bulk Upload Channels"
        )}
      </Button>
    </Card>
  );
};

export default BulkChannelUploader;
