
import { Channel } from "@/types/youtube";
import { Input } from "@/components/ui/input";

interface ChannelStatsProps {
  editForm: Channel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const ChannelStatsForm = ({ editForm, onChange }: ChannelStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Total Subscribers</label>
        <Input
          type="number"
          name="total_subscribers"
          value={editForm?.total_subscribers || ""}
          onChange={onChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Total Views</label>
        <Input
          type="number"
          name="total_views"
          value={editForm?.total_views || ""}
          onChange={onChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Video Count</label>
        <Input
          type="number"
          name="video_count"
          value={editForm?.video_count || ""}
          onChange={onChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">CPM</label>
        <Input
          type="number"
          name="cpm"
          value={editForm?.cpm || ""}
          onChange={onChange}
          step="0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Revenue per Video</label>
        <Input
          type="number"
          name="revenue_per_video"
          value={editForm?.revenue_per_video || ""}
          onChange={onChange}
          step="0.01"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Monthly Revenue</label>
        <Input
          type="number"
          name="revenue_per_month"
          value={editForm?.revenue_per_month || ""}
          onChange={onChange}
          step="0.01"
        />
      </div>
    </div>
  );
};
