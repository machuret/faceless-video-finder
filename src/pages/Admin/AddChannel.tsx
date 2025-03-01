
import { useParams } from "react-router-dom";
import ChannelFormContainer from "./components/ChannelFormContainer";
import { useChannelForm } from "./hooks/useChannelForm";

const AddChannel = () => {
  const { channelId } = useParams();
  const isEditMode = !!channelId;
  
  const {
    loading,
    youtubeUrl,
    formData,
    setYoutubeUrl,
    fetchYoutubeData,
    handleSubmit,
    handleChange,
    handleScreenshotChange,
    handleFieldChange
  } = useChannelForm();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Channel" : "Add New Channel"}</h1>
      <ChannelFormContainer />
    </div>
  );
};

export default AddChannel;
