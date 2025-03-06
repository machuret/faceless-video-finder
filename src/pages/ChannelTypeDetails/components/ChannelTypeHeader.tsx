
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface ChannelTypeHeaderProps {
  typeInfo: {
    label: string;
    description?: string;
    production?: string;
    example?: string;
  };
}

const ChannelTypeHeader = ({ typeInfo }: ChannelTypeHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button 
        variant="outline" 
        className="mb-4 font-montserrat"
        onClick={() => navigate("/channel-types")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <Card className="p-6 mb-6">
        <h1 className="font-crimson text-2xl font-bold mb-2">{typeInfo.label}</h1>
        <div 
          className="font-lato text-gray-700 mb-6 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: typeInfo.description || '' }}
        />
        
        <div className="bg-gray-50 p-6 rounded-lg mb-6 prose max-w-none">
          <h3 className="font-montserrat font-medium mb-3 text-xl">How to Create</h3>
          <div 
            className="font-lato"
            dangerouslySetInnerHTML={{ __html: typeInfo.production || '' }}
          />
        </div>
        
        <div className="mt-4 prose max-w-none">
          <h3 className="font-montserrat font-medium mb-3 text-xl">Example Ideas</h3>
          <div 
            className="font-lato"
            dangerouslySetInnerHTML={{ __html: typeInfo.example || '' }}
          />
        </div>
      </Card>
    </>
  );
};

export default ChannelTypeHeader;
