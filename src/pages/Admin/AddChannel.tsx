
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import YouTubeUrlInput from "./components/YouTubeUrlInput";
import ChannelForm, { ChannelFormData } from "./components/ChannelForm";
import { useAuth } from "@/context/AuthContext";

const AddChannel = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
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

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please log in to access this page");
      navigate("/admin/login");
      return;
    }

    if (!authLoading && !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchYoutubeData = async () => {
    if (!youtubeUrl) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube-data', {
        body: { url: youtubeUrl }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Failed to fetch YouTube data: ${error.message}`);
      }

      if (!data) {
        console.error('No data received');
        throw new Error("No data received from YouTube API. Please check if the URL is correct.");
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
      toast.error(error instanceof Error 
        ? `Failed to fetch channel data: ${error.message}` 
        : "Failed to fetch channel data. Please check the URL and try again.");
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
        throw new Error("Please fill in all required fields: Channel ID, Title, and URL");
      }

      // Convert string values to appropriate types
      const dataToSubmit = {
        video_id: formData.video_id.trim(),
        channel_title: formData.channel_title.trim(),
        channel_url: formData.channel_url.trim(),
        description: formData.description.trim() || null,
        screenshot_url: formData.screenshot_url || null,
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
        if (error.code === "23505") {
          throw new Error("This channel has already been added to the database");
        } else if (error.code === "42501") {
          throw new Error("You don't have permission to add channels. Please check your login status.");
        } else if (error.code === "42P17") {
          throw new Error("There's an issue with database permissions. Please contact the administrator.");
        }
        throw new Error(`Database error: ${error.message}`);
      }

      console.log("Insert successful:", data);
      toast.success("Channel added successfully!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error instanceof Error 
        ? `Failed to add channel: ${error.message}` 
        : "An unexpected error occurred while adding the channel");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScreenshotChange = (url: string) => {
    setFormData((prev) => ({ ...prev, screenshot_url: url }));
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !isAdmin) {
    return null;
  }

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
              onScreenshotChange={handleScreenshotChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddChannel;
