
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const AddChannel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [formData, setFormData] = useState({
    video_id: "",
    channel_title: "",
    channel_url: "",
    description: "",
    screenshot_url: "",
    total_subscribers: "",
    total_views: "",
    start_date: "",
    video_count: "",
  });

  const fetchYoutubeData = async () => {
    if (!youtubeUrl) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { url: youtubeUrl }
      });

      if (error) throw error;

      if (!data) throw new Error("No data received from YouTube API");

      console.log("Received data:", data); // Debug log

      setFormData({
        video_id: data.video_id || "",
        channel_title: data.channel_title || "",
        channel_url: data.channel_url || "",
        description: data.description || "",
        screenshot_url: data.screenshot_url || "",
        total_subscribers: data.total_subscribers?.toString() || "",
        total_views: data.total_views?.toString() || "",
        start_date: data.start_date || "",
        video_count: data.video_count?.toString() || "",
      });

      toast.success("Channel data fetched successfully");
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to fetch channel data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting data:", formData); // Debug log

      const dataToSubmit = {
        video_id: formData.video_id,
        channel_title: formData.channel_title,
        channel_url: formData.channel_url,
        description: formData.description,
        screenshot_url: formData.screenshot_url,
        total_subscribers: formData.total_subscribers ? parseInt(formData.total_subscribers) : null,
        total_views: formData.total_views ? parseInt(formData.total_views) : null,
        start_date: formData.start_date || null,
        video_count: formData.video_count ? parseInt(formData.video_count) : null,
      };

      const { error } = await supabase
        .from("youtube_channels")
        .insert([dataToSubmit]);

      if (error) {
        console.error("Insert error:", error); // Debug log
        throw error;
      }

      toast.success("Channel added successfully");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Submit error:", error); // Debug log
      toast.error(error instanceof Error ? error.message : "Failed to add channel");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Add New Channel</CardTitle>
              <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div>
                <Input
                  placeholder="Paste YouTube URL here"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                />
              </div>
              <Button 
                onClick={fetchYoutubeData} 
                disabled={loading || !youtubeUrl}
                className="w-full"
              >
                {loading ? "Fetching data..." : "Fetch Channel Data"}
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  name="video_id"
                  placeholder="Channel ID"
                  value={formData.video_id}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  name="channel_title"
                  placeholder="Channel Title"
                  value={formData.channel_title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  name="channel_url"
                  placeholder="Channel URL"
                  value={formData.channel_url}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Input
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="screenshot_url"
                  placeholder="Screenshot URL"
                  value={formData.screenshot_url}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="start_date"
                  placeholder="Start Date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="total_subscribers"
                  placeholder="Total Subscribers"
                  type="number"
                  value={formData.total_subscribers}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="total_views"
                  placeholder="Total Views"
                  type="number"
                  value={formData.total_views}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input
                  name="video_count"
                  placeholder="Number of Videos"
                  type="number"
                  value={formData.video_count}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding Channel..." : "Add Channel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddChannel;
