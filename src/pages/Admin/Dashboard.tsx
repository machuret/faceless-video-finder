
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Download } from "lucide-react";
import { toast } from "sonner";

interface Channel {
  id: string;
  video_id: string;
  screenshot_url: string;
  channel_title: string;
  channel_url: string;
  description: string;
  total_views: number;
  total_subscribers: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

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
      setEditingChannel(null);
      toast.success("Channel updated successfully");
    } catch (error) {
      toast.error("Failed to update channel");
    }
  };

  const handleLogout = () => {
    navigate("/admin/login");
  };

  const downloadTemplate = () => {
    const csvHeader = "video_id,channel_title,channel_url,description,screenshot_url,total_subscribers,total_views,channel_category,channel_type,keywords,country,niche,notes,cpm,potential_revenue,revenue_per_video,revenue_per_month,uses_ai\n";
    const csvContent = csvHeader + "dQw4w9WgXcQ,Rick Astley,https://youtube.com/rickastley,Official Rick Astley channel,https://example.com/screenshot.jpg,12500000,2000000000,entertainment,entertainment,\"music,pop,80s\",UK,Music,Great engagement,5.50,75000,1500,45000,false";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "youtube_channels_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <Button 
            onClick={() => navigate("/admin/channels/new")}
          >
            <Plus className="mr-2" /> Add New Channel
          </Button>
          <Button
            variant="outline"
            onClick={downloadTemplate}
          >
            <Download className="mr-2" /> Download CSV Template
          </Button>
        </div>

        <div className="grid gap-6">
          {channels.map(channel => (
            <Card key={channel.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">
                  {editingChannel?.id === channel.id ? (
                    <Input
                      value={editingChannel.channel_title}
                      onChange={(e) => setEditingChannel({
                        ...editingChannel,
                        channel_title: e.target.value
                      })}
                    />
                  ) : (
                    channel.channel_title
                  )}
                </CardTitle>
                <div className="space-x-2">
                  {editingChannel?.id === channel.id ? (
                    <>
                      <Button onClick={() => handleSave(editingChannel)}>Save</Button>
                      <Button variant="outline" onClick={() => setEditingChannel(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setEditingChannel(channel)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(channel.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editingChannel?.id === channel.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingChannel.channel_url}
                      onChange={(e) => setEditingChannel({
                        ...editingChannel,
                        channel_url: e.target.value
                      })}
                      placeholder="Channel URL"
                    />
                    <Input
                      value={editingChannel.description || ""}
                      onChange={(e) => setEditingChannel({
                        ...editingChannel,
                        description: e.target.value
                      })}
                      placeholder="Description"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{channel.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{channel.total_subscribers?.toLocaleString()} subscribers</span>
                      <span>{channel.total_views?.toLocaleString()} views</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
