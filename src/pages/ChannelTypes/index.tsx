
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import ChannelTypesHeader from "./components/ChannelTypesHeader";
import ChannelTypeGrid from "./components/ChannelTypeGrid";
import { useChannelTypesData } from "./hooks/useChannelTypesData";
import { backgroundImages } from "./constants";

const ChannelTypes = () => {
  const { types, isLoading, error, refetch } = useChannelTypesData();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      
      <ChannelTypesHeader backgroundImages={backgroundImages} />
      
      <div className="container mx-auto px-4 py-8">
        <ChannelTypeGrid 
          types={types}
          isLoading={isLoading}
          error={error}
          refetch={refetch}
        />
      </div>
      
      <PageFooter />
    </div>
  );
};

export default ChannelTypes;
