
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminActionCards = () => {
  const navigate = useNavigate();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Channels</h2>
        <p className="text-gray-600 mb-4">Manage YouTube channels in the database.</p>
        <Button onClick={() => navigate("/admin/add-channel")} className="w-full">
          Add New Channel
        </Button>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Channel Types</h2>
        <p className="text-gray-600 mb-4">Manage channel types and their descriptions.</p>
        <Button onClick={() => navigate("/admin/channel-types")} className="w-full">
          Manage Channel Types
        </Button>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Faceless Ideas</h2>
        <p className="text-gray-600 mb-4">Manage faceless content ideas for YouTube creators.</p>
        <Button onClick={() => navigate("/admin/faceless-ideas")} className="w-full">
          Manage Faceless Ideas
        </Button>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Keyword Research</h2>
        <p className="text-gray-600 mb-4">Research YouTube keywords for video optimization.</p>
        <Button onClick={() => navigate("/keyword-research")} className="w-full">
          Research Keywords
        </Button>
      </Card>
    </div>
  );
};

export default AdminActionCards;
