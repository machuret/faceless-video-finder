
import ChannelForm from "./ChannelForm";
import { useChannelForm } from "../hooks/useChannelForm";
import YouTubeUrlInput from "./YouTubeUrlInput";

const ChannelFormContainer = () => {
  const {
    loading,
    youtubeUrl,
    isEditMode,
    formData,
    setYoutubeUrl,
    fetchYoutubeData,
    handleSubmit,
    handleChange,
    handleScreenshotChange,
    handleFieldChange
  } = useChannelForm();

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {!isEditMode && (
        <div className="mb-6">
          <YouTubeUrlInput 
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            onFetch={fetchYoutubeData}
            loading={loading}
          />
        </div>
      )}
      
      <ChannelForm 
        formData={formData}
        loading={loading}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onScreenshotChange={handleScreenshotChange}
        onFieldChange={handleFieldChange}
      />
    </div>
  );
};

export default ChannelFormContainer;
