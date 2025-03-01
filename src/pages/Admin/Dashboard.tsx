
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MainNavbar from "@/components/MainNavbar";
import { useAuth } from "@/context/AuthContext";
import { checkIsAdmin } from "@/services/userService";

// Import the component we need to make
import { ChannelList } from "@/components/youtube/channel-list/ChannelList";

const DashboardHeader = () => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold font-crimson mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 font-lato">Manage your YouTube channels and application settings.</p>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const status = await checkIsAdmin(user.id);
        setIsAdmin(status);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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
          
          {/* Additional admin cards can be added here */}
        </div>
        
        <ChannelList isAdmin={isAdmin} />
      </div>
    </div>
  );
}
