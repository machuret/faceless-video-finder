
import { useChannelForm } from "../hooks/useChannelForm";
import ChannelForm from "./ChannelForm";

const ChannelFormContainer = () => {
  const {
    loading,
    youtubeUrl,
    isEditMode,
    formData,
    debugInfo,
    setYoutubeUrl,
    fetchYoutubeData,
    handleSubmit,
    handleChange,
    handleScreenshotChange,
    handleFieldChange,
    handleKeywordsChange
  } = useChannelForm();

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <ChannelForm 
        formData={formData}
        loading={loading}
        youtubeUrl={youtubeUrl}
        isEditMode={isEditMode}
        setYoutubeUrl={setYoutubeUrl}
        fetchYoutubeData={fetchYoutubeData}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handleScreenshotChange={handleScreenshotChange}
        handleFieldChange={handleFieldChange}
        handleKeywordsChange={handleKeywordsChange}
        debugInfo={debugInfo}
      />
    </div>
  );
};

export default ChannelFormContainer;
