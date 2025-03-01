
import { useParams } from "react-router-dom";
import YouTubeUrlInput from "./components/YouTubeUrlInput";
import ChannelForm from "./components/ChannelForm";
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
    handleScreenshotChange
  } = useChannelForm();

  return (
    <ChannelFormContainer title={isEditMode ? "Edit Channel" : "Add New Channel"}>
      {!isEditMode && (
        <YouTubeUrlInput
          youtubeUrl={youtubeUrl}
          loading={loading}
          onUrlChange={setYoutubeUrl}
          onFetch={fetchYoutubeData}
        />
      )}
      <ChannelForm
        formData={formData}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onScreenshotChange={handleScreenshotChange}
      />
    </ChannelFormContainer>
  );
};

export default AddChannel;
