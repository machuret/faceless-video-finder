
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Download, Upload } from "lucide-react";
import { toast } from "sonner";

interface Channel {
  id: string;
  video_id: string;
  screenshot_url: string | null;
  channel_title: string;
  channel_url: string;
  description: string | null;
  total_views: number | null;
  total_subscribers: number | null;
}

interface ChannelInput {
  video_id: string;
  channel_title: string;
  channel_url: string;
  description?: string | null;
  screenshot_url?: string | null;
  total_subscribers?: number | null;
  total_views?: number | null;
  channel_category?: string | null;
  channel_type?: string | null;
  keywords?: string[] | null;
  country?: string | null;
  niche?: string | null;
  notes?: string | null;
  cpm?: number | null;
  potential_revenue?: number | null;
  revenue_per_video?: number | null;
  revenue_per_month?: number | null;
  uses_ai?: boolean | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n');
      const headers = rows[0].split(',');
      const channels = rows.slice(1).filter(row => row.trim()).map(row => {
        const values = row.split(',');
        const channel: Partial<ChannelInput> = {};
        headers.forEach((header, index) => {
          let value = values[index]?.trim();
          if (value === undefined || value === '') return;
          
          const headerKey = header.trim() as keyof ChannelInput;
          
          // Convert values based on field type
          if (headerKey === 'keywords') {
            try {
              channel[headerKey] = JSON.parse(value);
            } catch {
              channel[headerKey] = value.split(',').map(k => k.trim());
            }
          } else if (headerKey === 'uses_ai') {
            channel[headerKey] = value.toLowerCase() === 'true';
          } else if ([
            'total_subscribers',
            'total_views',
            'cpm',
            'potential_revenue',
            'revenue_per_video',
            'revenue_per_month'
          ].includes(headerKey)) {
            channel[headerKey] = value ? parseFloat(value) : null;
          } else {
            channel[headerKey] = value;
          }
        });
        return channel;
      });

      const { error } = await supabase
        .from('youtube_channels')
        .insert(channels);

      if (error) throw error;
      
      await fetchChannels();
      toast.success(`Successfully uploaded ${channels.length} channels`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload channels. Please check your CSV format.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
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
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
            <Button
              variant="outline"
              disabled={uploading}
            >
              <Upload className="mr-2" />
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </Button>
          </div>
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
