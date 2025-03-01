
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MainNavbar from "@/components/MainNavbar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import the component we need
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
  const { user, isAdmin, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please log in to access the admin dashboard");
      navigate("/admin/login");
      return;
    }
    
    if (!loading && !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }
  }, [user, isAdmin, loading, navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  // If still loading or not authorized, show loading state
  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <DashboardHeader />
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
        
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
        </div>
        
        <ChannelList isAdmin={true} />
      </div>
    </div>
  );
}
