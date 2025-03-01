
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Channel } from "@/types/youtube";
import { ChannelList } from "@/components/youtube/ChannelList";
import DashboardHeader from "./components/DashboardHeader";
import { 
  getChannelSize,
  getGrowthRange,
  calculateUploadFrequency,
  getUploadFrequencyCategory,
  getUploadFrequencyLabel,
  formatDate
} from "@/utils/channelMetrics";
import { 
  fetchAllChannels, 
  deleteChannel, 
  updateChannel, 
  generateChannelContent 
} from "@/services/channelService";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [savingChannel, setSavingChannel] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);

  const fetchChannels = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log("Fetching all channels...");
      const data = await fetchAllChannels();
      console.log(`Fetched ${data.length} channels`);
      setChannels(data);
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast.error("Failed to fetch channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleGenerateContent = async (channel: Channel) => {
    setGeneratingContent(true);
    try {
      const newDescription = await generateChannelContent(channel);
      if (newDescription) {
        setChannels(channels.map(c => 
          c.id === channel.id 
            ? { ...c, description: newDescription }
            : c
        ));
      }
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;

    const success = await deleteChannel(id);
    if (success) {
      setChannels(channels.filter(channel => channel.id !== id));
    }
  };

  const handleSave = async (channel: Channel) => {
    console.log("Saving channel:", channel);
    setSavingChannel(true);
    setEditingChannelId(channel.id);
    
    try {
      // Ensure metadata is properly set if it exists
      const metadata = channel.metadata || {};
      
      // Always update metadata with current channel_type
      if (channel.channel_type) {
        metadata.ui_channel_type = channel.channel_type;
        channel.metadata = metadata;
        console.log("Updated metadata with ui_channel_type:", channel.channel_type);
        console.log("Full updated metadata:", metadata);
      }
      
      console.log("Saving channel with final data:", channel);
      const success = await updateChannel(channel);
      
      if (success) {
        console.log("Channel saved successfully, refreshing data...");
        // Ensure we fully refresh the data from the server
        await fetchChannels();
        toast.success("Channel updated successfully");
        setEditingChannelId(null);
      } else {
        console.error("Failed to save channel - update returned false");
        toast.error("Failed to update channel");
      }
    } catch (error) {
      console.error("Exception caught in handleSave:", error);
      toast.error("Error saving channel");
    } finally {
      setSavingChannel(false);
    }
  };
  
  const handleStartEditing = (channelId: string) => {
    setEditingChannelId(channelId);
  };
  
  const handleCancelEditing = () => {
    setEditingChannelId(null);
  };

  const handleLogout = () => {
    navigate("/admin/login");
  };

  // For debugging: directly check the db state
  const debugCheckDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("id, channel_title, channel_type, metadata")
        .limit(10);
      
      if (error) throw error;
      console.log("DEBUG - Channel data in database:", data);
      
      return data;
    } catch (err) {
      console.error("Error checking database:", err);
      return null;
    }
  };

  // Call once on component mount for debugging
  useEffect(() => {
    debugCheckDatabase();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader 
          onLogout={handleLogout} 
          onUploadSuccess={fetchChannels} 
        />

        {/* Debug button - temporary */}
        <button 
          onClick={debugCheckDatabase} 
          className="mb-4 px-3 py-1 bg-gray-200 text-xs rounded hover:bg-gray-300"
        >
          Debug: Check DB
        </button>

        <ChannelList
          channels={channels}
          onDelete={handleDelete}
          onSave={handleSave}
          onStartEditing={handleStartEditing}
          onCancelEditing={handleCancelEditing}
          onGenerateContent={handleGenerateContent}
          generatingContent={generatingContent}
          savingChannel={savingChannel}
          editingChannelId={editingChannelId}
          getChannelSize={getChannelSize}
          getGrowthRange={getGrowthRange}
          calculateUploadFrequency={calculateUploadFrequency}
          getUploadFrequencyCategory={getUploadFrequencyCategory}
          getUploadFrequencyLabel={getUploadFrequencyLabel}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default Dashboard;
