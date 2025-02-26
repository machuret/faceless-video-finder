
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
  const [formData, setFormData] = useState({
    video_id: "",
    channel_title: "",
    channel_url: "",
    description: "",
    screenshot_url: "",
    total_subscribers: "",
    total_views: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("youtube_channels")
        .insert([
          {
            ...formData,
            total_subscribers: parseInt(formData.total_subscribers) || null,
            total_views: parseInt(formData.total_views) || null,
          },
        ]);

      if (error) throw error;

      toast.success("Channel added successfully");
      navigate("/admin/dashboard");
    } catch (error) {
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  name="video_id"
                  placeholder="Video ID"
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
