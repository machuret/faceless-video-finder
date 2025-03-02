
import { Card, CardContent } from "@/components/ui/card";
import { Youtube } from "lucide-react";

interface VideoStats {
  id?: string;
  title: string;
  video_id: string;
  thumbnail_url: string;
  views: number;
  likes: number;
  channel_id?: string;
}

interface ChannelVideosProps {
  videos: VideoStats[];
}

const ChannelVideos = ({ videos }: ChannelVideosProps) => {
  if (!videos.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id || video.video_id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <a 
                href={`https://youtube.com/watch?v=${video.video_id}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {video.thumbnail_url ? (
                  <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <Youtube className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{video.views?.toLocaleString() || 0} views</span>
                    <span>{video.likes?.toLocaleString() || 0} likes</span>
                  </div>
                </CardContent>
              </a>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChannelVideos;
