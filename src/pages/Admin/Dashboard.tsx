
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Import the components we need
import { ChannelList } from "@/components/youtube/channel-list/ChannelList";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import FeaturedChannels from "./components/dashboard/FeaturedChannels";
import AdminActionCards from "./components/dashboard/AdminActionCards";

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
        <FeaturedChannels />
        <AdminActionCards />
        <ChannelList isAdmin={true} />
      </div>
    </div>
  );
}
