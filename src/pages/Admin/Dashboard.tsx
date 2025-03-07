
import React from "react";
import AdminHeader from "./components/AdminHeader";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import FeaturedChannels from "./components/dashboard/FeaturedChannels";
import AdminActionCards from "./components/dashboard/AdminActionCards";
import { ChannelList } from "@/components/youtube/channel-list/components/ChannelList";
import MassScreenshotUpdater from "./components/dashboard/MassScreenshotUpdater";
import BulkChannelUploader from "./components/dashboard/BulkChannelUploader";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="Admin Dashboard" />
      
      <div className="container mx-auto px-4 pt-8 pb-16">
        <DashboardHeader />
        <AdminActionCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <FeaturedChannels />
          </div>
          <div className="lg:col-span-1">
            <MassScreenshotUpdater />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-3">
            <BulkChannelUploader />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">All Channels</h2>
          <ChannelList isAdmin={true} showAll={true} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
