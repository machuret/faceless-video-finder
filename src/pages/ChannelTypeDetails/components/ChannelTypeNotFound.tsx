
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";

const ChannelTypeNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h1 className="font-crimson text-2xl font-bold mb-4">Channel Type Not Found</h1>
          <p className="font-lato">The requested channel type does not exist.</p>
          <Button 
            variant="outline" 
            className="mt-4 font-montserrat"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ChannelTypeNotFound;
