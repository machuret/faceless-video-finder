
import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";

interface ChannelIdentityProps {
  videoId: string;
  channelTitle: string;
  channelUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ChannelIdentity = ({ videoId, channelTitle, channelUrl, onChange }: ChannelIdentityProps) => {
  return (
    <FormSection title="Channel Identity">
      <div>
        <Input
          name="video_id"
          placeholder="Channel ID"
          value={videoId}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <Input
          name="channel_title"
          placeholder="Channel Title"
          value={channelTitle}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <Input
          name="channel_url"
          placeholder="Channel URL"
          value={channelUrl}
          onChange={onChange}
          required
        />
      </div>
    </FormSection>
  );
};

export default ChannelIdentity;
