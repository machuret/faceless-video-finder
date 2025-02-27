
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CSVUploader } from "@/components/youtube/CSVUploader";
import { ChannelList } from "@/components/youtube/ChannelList";
import type { Channel } from "@/types/youtube";

const Dashboard = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from("youtube_channels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      toast.error("Failed to fetch channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const generateContent = async (channel: Channel) => {
    setGeneratingContent(true);
    try {
      console.log('Calling generate-channel-content for:', channel.channel_title);
      
      const { data, error } = await supabase.functions.invoke('generate-channel-content', {
        body: { channelTitle: channel.channel_title }
      });

      console.log('Function response:', data);

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Failed to generate content: ${error.message}`);
      }

      if (!data || !data.description) {
        console.error('Invalid response:', data);
        throw new Error('Failed to generate valid content');
      }

      // Update the channel with the new description
      const { error: updateError } = await supabase
        .from('youtube_channels')
        .update({ description: data.description })
        .eq('id', channel.id);

      if (updateError) throw updateError;

      // Update local state
      setChannels(channels.map(c => 
        c.id === channel.id 
          ? { ...c, description: data.description }
          : c
      ));

      toast.success('Channel description updated successfully');
    } catch (error) {
      console.error('Generate content error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate content');
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;

    try {
      const { error } = await supabase
        .from("youtube_channels")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setChannels(channels.filter(channel => channel.id !== id));
      toast.success("Channel deleted successfully");
    } catch (error) {
      toast.error("Failed to delete channel");
    }
  };

  const handleSave = async (channel: Channel) => {
    try {
      const { error } = await supabase
        .from("youtube_channels")
        .update(channel)
        .eq("id", channel.id);

      if (error) throw error;
      setChannels(channels.map(c => c.id === channel.id ? channel : c));
      toast.success("Channel updated successfully");
    } catch (error) {
      toast.error("Failed to update channel");
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={() => navigate("/admin/channels/new")}>
            <Plus className="mr-2" /> Add New Channel
          </Button>
          <CSVUploader onUploadSuccess={fetchChannels} />
        </div>

        <ChannelList
          channels={channels}
          onDelete={handleDelete}
          onSave={handleSave}
          onGenerateContent={generateContent}
          generatingContent={generatingContent}
        />
      </div>
    </div>
  );
};

export default Dashboard;
