
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import YouTubeUrlInput from "./components/YouTubeUrlInput";
import ChannelForm, { ChannelFormData } from "./components/ChannelForm";

const AddChannel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [formData, setFormData] = useState<ChannelFormData>({
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

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (!data) {
        console.error('No data received');
        throw new Error("No data received from YouTube API");
      }

      console.log("Received data:", data);

      // Format the date string to YYYY-MM-DD if it exists
      const formattedStartDate = data.start_date 
        ? new Date(data.start_date).toISOString().split('T')[0]
        : "";

      setFormData({
        video_id: data.video_id || "",
        channel_title: data.channel_title || "",
        channel_url: data.channel_url || "",
        description: data.description || "",
        screenshot_url: data.screenshot_url || "",
        total_subscribers: data.total_subscribers?.toString() || "",
        total_views: data.total_views?.toString() || "",
        start_date: formattedStartDate,
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
      // Validate required fields
      if (!formData.video_id || !formData.channel_title || !formData.channel_url) {
        throw new Error("Please fill in all required fields");
      }

      // Convert string values to appropriate types
      const dataToSubmit = {
        video_id: formData.video_id.trim(),
        channel_title: formData.channel_title.trim(),
        channel_url: formData.channel_url.trim(),
        description: formData.description.trim() || null,
        screenshot_url: formData.screenshot_url.trim() || null,
        total_subscribers: formData.total_subscribers ? parseInt(formData.total_subscribers) : null,
        total_views: formData.total_views ? parseInt(formData.total_views) : null,
        start_date: formData.start_date || null,
        video_count: formData.video_count ? parseInt(formData.video_count) : null,
      };

      console.log("Submitting data:", dataToSubmit);

      const { data, error } = await supabase
        .from("youtube_channels")
        .insert([dataToSubmit])
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        if (error.code === "23505") { // Unique violation
          throw new Error("This channel has already been added");
        }
        throw error;
      }

      console.log("Insert successful:", data);
      toast.success("Channel added successfully");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
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
            <YouTubeUrlInput
              youtubeUrl={youtubeUrl}
              loading={loading}
              onUrlChange={setYoutubeUrl}
              onFetch={fetchYoutubeData}
            />
            <ChannelForm
              formData={formData}
              loading={loading}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddChannel;
