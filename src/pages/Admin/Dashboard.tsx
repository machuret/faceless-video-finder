
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
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 px-4 mb-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">Manage your YouTube channels and application settings.</p>
          </div>
          <Button onClick={async () => {
            try {
              await supabase.auth.signOut();
              toast.success("Logged out successfully");
              window.location.href = "/admin/login";
            } catch (error) {
              console.error("Error logging out:", error);
              toast.error("Error logging out");
            }
          }} variant="outline">Logout</Button>
        </div>
      </div>
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
      <DashboardHeader />
      <div className="container mx-auto px-4 py-8">
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
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Faceless Ideas</h2>
            <p className="text-gray-600 mb-4">Manage faceless content ideas for YouTube creators.</p>
            <Button onClick={() => navigate("/admin/faceless-ideas")} className="w-full">
              Manage Faceless Ideas
            </Button>
          </Card>
        </div>
        
        <ChannelList isAdmin={true} />
      </div>
    </div>
  );
}
