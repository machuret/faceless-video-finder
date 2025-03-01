
import { useParams } from "react-router-dom";
import ChannelFormContainer from "./components/ChannelFormContainer";

const AddChannel = () => {
  const { channelId } = useParams();
  const isEditMode = !!channelId;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Channel" : "Add New Channel"}</h1>
      <ChannelFormContainer />
    </div>
  );
};

export default AddChannel;
