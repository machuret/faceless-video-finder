
import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";

interface ChannelStatsProps {
  totalSubscribers: string;
  totalViews: string;
  videoCount: string;
  startDate: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChannelStats = ({ 
  totalSubscribers,
  totalViews,
  videoCount,
  startDate,
  onChange 
}: ChannelStatsProps) => {
  return (
    <FormSection title="Channel Statistics">
      <div>
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <Input
          name="start_date"
          placeholder="Start Date"
          type="date"
          value={startDate}
          onChange={onChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Total Subscribers</label>
        <Input
          name="total_subscribers"
          placeholder="Total Subscribers"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={totalSubscribers}
          onChange={onChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Total Views</label>
        <Input
          name="total_views"
          placeholder="Total Views"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={totalViews}
          onChange={onChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Number of Videos</label>
        <Input
          name="video_count"
          placeholder="Number of Videos"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={videoCount}
          onChange={onChange}
        />
      </div>
    </FormSection>
  );
};

export default ChannelStats;
