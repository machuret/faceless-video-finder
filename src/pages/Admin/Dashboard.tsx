
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);

  const fetchChannels = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await fetchAllChannels();
      setChannels(data);
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
    const success = await updateChannel(channel);
    if (success) {
      // Refresh the channels to get the updated data from the server
      await fetchChannels();
      toast.success("Channel updated successfully");
    }
  };

  const handleLogout = () => {
    navigate("/admin/login");
  };

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

        <ChannelList
          channels={channels}
          onDelete={handleDelete}
          onSave={handleSave}
          onGenerateContent={handleGenerateContent}
          generatingContent={generatingContent}
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
