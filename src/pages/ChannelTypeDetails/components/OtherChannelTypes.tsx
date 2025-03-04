
import OtherChannelTypeCard from "./OtherChannelTypeCard";
import { channelTypes } from "@/components/youtube/channel-list/constants";

interface OtherChannelTypesProps {
  otherChannelTypes: typeof channelTypes;
}

const OtherChannelTypes = ({ otherChannelTypes }: OtherChannelTypesProps) => {
  return (
    <>
      <h2 className="font-crimson text-xl font-semibold mb-4">Other Channel Types You Might Like</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {otherChannelTypes.map(type => (
          <OtherChannelTypeCard key={type.id} type={type} />
        ))}
      </div>
    </>
  );
};

export default OtherChannelTypes;
