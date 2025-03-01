
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
        <Input
          name="start_date"
          placeholder="Start Date"
          type="date"
          value={startDate}
          onChange={onChange}
        />
      </div>
      <div>
        <Input
          name="total_subscribers"
          placeholder="Total Subscribers"
          type="number"
          value={totalSubscribers}
          onChange={onChange}
        />
      </div>
      <div>
        <Input
          name="total_views"
          placeholder="Total Views"
          type="number"
          value={totalViews}
          onChange={onChange}
        />
      </div>
      <div>
        <Input
          name="video_count"
          placeholder="Number of Videos"
          type="number"
          value={videoCount}
          onChange={onChange}
        />
      </div>
    </FormSection>
  );
};

export default ChannelStats;
