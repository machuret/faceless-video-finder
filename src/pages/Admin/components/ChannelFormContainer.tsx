
import { useChannelForm } from "../hooks/useChannelForm";
import ChannelForm from "./ChannelForm";

const ChannelFormContainer = () => {
  const {
    loading,
    isEditMode,
    formData,
    handleSubmit,
    handleChange,
    handleScreenshotChange,
    handleFieldChange,
    handleKeywordsChange,
    handleBooleanFieldChange
  } = useChannelForm();

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <ChannelForm 
        formData={formData}
        loading={loading}
        isEditMode={isEditMode}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        handleScreenshotChange={handleScreenshotChange}
        handleFieldChange={handleFieldChange}
        handleKeywordsChange={handleKeywordsChange}
        handleBooleanFieldChange={handleBooleanFieldChange}
      />
    </div>
  );
};

export default ChannelFormContainer;
