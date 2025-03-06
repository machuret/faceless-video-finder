
import { useParams } from "react-router-dom";
import ChannelFormContainer from "./components/ChannelFormContainer";
import AdminHeader from "./components/AdminHeader";
import { useEffect } from "react";

const AddChannel = () => {
  const { channelId } = useParams();
  const isEditMode = !!channelId;
  
  // Log to help with debugging
  useEffect(() => {
    console.log("AddChannel component mounted");
    console.log("Channel ID from params:", channelId);
    console.log("Is Edit Mode:", isEditMode);
  }, [channelId, isEditMode]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader 
        title={isEditMode ? "Edit Channel" : "Add New Channel"} 
        subtitle="Manage channel information and settings"
      />
      <div className="container mx-auto p-4">
        <ChannelFormContainer />
      </div>
    </div>
  );
};

export default AddChannel;
