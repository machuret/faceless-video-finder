
import React from "react";
import AdminHeader from "./components/AdminHeader";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import FeaturedChannels from "./components/dashboard/FeaturedChannels";
import AdminActionCards from "./components/dashboard/AdminActionCards";
import { ChannelList } from "@/components/youtube/channel-list/components/ChannelList";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Admin Dashboard" />
      
      <div className="container mx-auto px-4 pt-8 pb-16">
        <DashboardHeader />
        <AdminActionCards />
        <FeaturedChannels />
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Recently Added Channels</h2>
          {/* Pass explicit number value for limit */}
          <ChannelList isAdmin={true} limit={6} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
