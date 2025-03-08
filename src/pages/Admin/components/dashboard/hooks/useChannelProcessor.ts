
import { toast } from "sonner";
import { fetchChannelData, formatChannelData, saveChannelToDatabase } from "../utils/channelDataUtils";

export const useChannelProcessor = () => {
  /**
   * Process a single channel URL and save it to the database
   * Returns true if successful, false otherwise
   */
  const processChannelUrl = async (url: string, index: number, totalCount: number): Promise<boolean> => {
    try {
      console.log(`Processing channel ${index + 1}/${totalCount}: ${url}`);
      
      // Step 1: Get channel data using the dedicated Edge Function
      const channelData = await fetchChannelData(url);
      
      // Step 2: Format the channel data
      const formattedData = formatChannelData(channelData, url, index);
      
      // Step 3: Save the channel data to the database
      const success = await saveChannelToDatabase(formattedData);
      
      return success;
    } catch (error) {
      console.error(`Error processing channel ${url}:`, error);
      toast.error(`Failed to process channel: ${url}`);
      return false;
    }
  };

  return {
    processChannelUrl
  };
};
