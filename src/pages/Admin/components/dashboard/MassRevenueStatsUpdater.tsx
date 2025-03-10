
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  calculateTotalRevenue, 
  calculateRevenuePerSubscriber, 
  calculateRevenuePerVideo,
  calculatePotentialRevenue
} from "@/pages/ChannelDetails/utils/revenueCalculations";
import { Loader2 } from "lucide-react";

const MassRevenueStatsUpdater = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isUpdatingCpm, setIsUpdatingCpm] = useState(false);
  const [cpmProgress, setCpmProgress] = useState(0);
  const [cpmProcessedCount, setCpmProcessedCount] = useState(0);
  const [cpmTotalCount, setCpmTotalCount] = useState(0);
  const [cpmSuccessCount, setCpmSuccessCount] = useState(0);
  const [cpmErrorCount, setCpmErrorCount] = useState(0);

  const findChannelsWithMissingRevenueStats = async () => {
    try {
      // Find channels that have views and CPM but missing revenue stats
      const { data, count, error } = await supabase
        .from('youtube_channels')
        .select('*', { count: 'exact' })
        .not('total_views', 'is', null)
        .not('cpm', 'is', null)
        .or('potential_revenue.is.null,revenue_per_video.is.null,revenue_per_month.is.null');
      
      if (error) throw error;
      
      return { 
        channels: data || [], 
        count: count || 0 
      };
    } catch (error) {
      console.error("Error finding channels with missing revenue stats:", error);
      toast.error("Failed to find channels with missing revenue stats");
      return { channels: [], count: 0 };
    }
  };

  const findChannelsWithNoCpm = async () => {
    try {
      // Find channels that have no CPM value
      const { data, count, error } = await supabase
        .from('youtube_channels')
        .select('*', { count: 'exact' })
        .is('cpm', null);
      
      if (error) throw error;
      
      return { 
        channels: data || [], 
        count: count || 0 
      };
    } catch (error) {
      console.error("Error finding channels with missing CPM:", error);
      toast.error("Failed to find channels with missing CPM");
      return { channels: [], count: 0 };
    }
  };

  const updateChannelRevenueStats = async (channel: any) => {
    try {
      // Calculate revenue metrics
      const totalRevenue = calculateTotalRevenue(channel.total_views, channel.cpm);
      
      if (totalRevenue === null) {
        return { success: false, message: "Could not calculate total revenue" };
      }
      
      const revenuePerSubscriber = calculateRevenuePerSubscriber(totalRevenue, channel.total_subscribers);
      const revenuePerVideo = calculateRevenuePerVideo(totalRevenue, channel.video_count);
      const potentialRevenue = calculatePotentialRevenue(totalRevenue);
      
      // Monthly revenue is annual revenue divided by 12
      const revenuePerMonth = totalRevenue ? Math.round(totalRevenue / 12) : null;
      
      // Update the channel with calculated values
      const { error } = await supabase
        .from('youtube_channels')
        .update({
          potential_revenue: potentialRevenue,
          revenue_per_video: revenuePerVideo,
          revenue_per_month: revenuePerMonth
        })
        .eq('id', channel.id);
      
      if (error) throw error;
      
      return { 
        success: true, 
        message: `Updated revenue stats for ${channel.channel_title}` 
      };
    } catch (error) {
      console.error(`Error updating revenue stats for ${channel.channel_title}:`, error);
      return { 
        success: false, 
        message: `Failed to update ${channel.channel_title}: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  };

  const updateChannelDefaultCpm = async (channel: any) => {
    try {
      // Update the channel with default CPM of $4
      const { error } = await supabase
        .from('youtube_channels')
        .update({
          cpm: 4
        })
        .eq('id', channel.id);
      
      if (error) throw error;
      
      return { 
        success: true, 
        message: `Set default CPM for ${channel.channel_title}` 
      };
    } catch (error) {
      console.error(`Error setting default CPM for ${channel.channel_title}:`, error);
      return { 
        success: false, 
        message: `Failed to update ${channel.channel_title}: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  };

  const processRevenueUpdate = async () => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentChannel(null);
    setProcessedCount(0);
    setSuccessCount(0);
    setErrorCount(0);
    
    try {
      const { channels, count } = await findChannelsWithMissingRevenueStats();
      
      if (channels.length === 0) {
        toast.info("No channels found with missing revenue stats");
        setIsProcessing(false);
        return;
      }
      
      setTotalCount(count);
      toast.info(`Found ${count} channels with missing revenue stats. Starting update...`);
      
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        setCurrentChannel(channel.channel_title);
        
        const result = await updateChannelRevenueStats(channel);
        
        if (result.success) {
          setSuccessCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
        }
        
        setProcessedCount(i + 1);
        setProgress(Math.floor(((i + 1) / count) * 100));
        
        // Add a small delay to avoid overwhelming the database
        if (i < channels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (errorCount === 0) {
        toast.success(`Successfully updated revenue stats for all ${count} channels!`);
      } else {
        toast.warning(`Completed with ${successCount} successes and ${errorCount} errors`);
      }
    } catch (error) {
      console.error("Error in mass revenue update:", error);
      toast.error(`Error during revenue update: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      setCurrentChannel(null);
    }
  };

  const processDefaultCpmUpdate = async () => {
    setIsUpdatingCpm(true);
    setCpmProgress(0);
    setCpmProcessedCount(0);
    setCpmSuccessCount(0);
    setCpmErrorCount(0);
    
    try {
      const { channels, count } = await findChannelsWithNoCpm();
      
      if (channels.length === 0) {
        toast.info("No channels found with missing CPM values");
        setIsUpdatingCpm(false);
        return;
      }
      
      setCpmTotalCount(count);
      toast.info(`Found ${count} channels with missing CPM values. Setting default $4 CPM...`);
      
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        setCurrentChannel(channel.channel_title);
        
        const result = await updateChannelDefaultCpm(channel);
        
        if (result.success) {
          setCpmSuccessCount(prev => prev + 1);
        } else {
          setCpmErrorCount(prev => prev + 1);
        }
        
        setCpmProcessedCount(i + 1);
        setCpmProgress(Math.floor(((i + 1) / count) * 100));
        
        // Add a small delay to avoid overwhelming the database
        if (i < channels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      if (cpmErrorCount === 0) {
        toast.success(`Successfully set default $4 CPM for all ${count} channels!`);
      } else {
        toast.warning(`Completed with ${cpmSuccessCount} successes and ${cpmErrorCount} errors`);
      }
    } catch (error) {
      console.error("Error in mass CPM update:", error);
      toast.error(`Error during CPM update: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsUpdatingCpm(false);
      setCurrentChannel(null);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Mass Revenue Stats Updater</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Update revenue statistics (Total Revenue, Revenue per Video, Revenue per Subscriber, Monthly Revenue, and Potential Revenue) for channels with missing data.
      </p>
      
      {isProcessing ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Processing: {processedCount}/{totalCount}</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {currentChannel && (
            <div className="text-sm text-muted-foreground mt-2">
              Currently updating: {currentChannel}
            </div>
          )}
          
          <div className="flex justify-between text-sm mt-4">
            <span className="text-green-600">Success: {successCount}</span>
            <span className="text-red-600">Errors: {errorCount}</span>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setIsProcessing(false)}
          >
            Cancel
          </Button>
        </div>
      ) : isUpdatingCpm ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Setting default CPM: {cpmProcessedCount}/{cpmTotalCount}</span>
            <span className="text-sm font-medium">{cpmProgress}%</span>
          </div>
          <Progress value={cpmProgress} className="h-2" />
          
          {currentChannel && (
            <div className="text-sm text-muted-foreground mt-2">
              Currently updating: {currentChannel}
            </div>
          )}
          
          <div className="flex justify-between text-sm mt-4">
            <span className="text-green-600">Success: {cpmSuccessCount}</span>
            <span className="text-red-600">Errors: {cpmErrorCount}</span>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setIsUpdatingCpm(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Button 
            onClick={processRevenueUpdate} 
            className="w-full mb-4"
            disabled={isProcessing || isUpdatingCpm}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : "Update Revenue Stats"}
          </Button>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          
          <Button 
            onClick={processDefaultCpmUpdate} 
            variant="outline"
            className="w-full"
            disabled={isProcessing || isUpdatingCpm}
          >
            {isUpdatingCpm ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Default CPM...
              </>
            ) : "Set Default $4 CPM for All Channels"}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default MassRevenueStatsUpdater;
