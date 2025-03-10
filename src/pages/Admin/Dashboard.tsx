
import React, { useEffect, useMemo } from "react";
import AdminHeader from "./components/AdminHeader";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import FeaturedChannels from "./components/dashboard/FeaturedChannels";
import AdminActionCards from "./components/dashboard/AdminActionCards";
import { ChannelList } from "@/components/youtube/channel-list/components/ChannelList";
import MassScreenshotUpdater from "./components/dashboard/MassScreenshotUpdater";
import MassStatsUpdater from "./components/dashboard/MassStatsUpdater";
import MassRevenueStatsUpdater from "./components/dashboard/MassRevenueStatsUpdater";
import BulkChannelUploader from "./components/dashboard/BulkChannelUploader";
import ChannelsToImprove from "./components/dashboard/ChannelsToImprove";
import CsvChannelUploader from "./components/dashboard/components/CsvChannelUploader";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Database, Layers, BookOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Using memo to prevent unnecessary re-renders
const AdminLinks = React.memo(() => (
  <Card className="p-6">
    <h3 className="text-xl font-semibold mb-4">Content Management</h3>
    <div className="space-y-2">
      <Link to="/admin/manage-niches" className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
        <Database className="h-5 w-5 mr-2 text-blue-600" />
        <span>Manage Niches</span>
      </Link>
      <Link to="/admin/manage-channel-types" className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
        <Layers className="h-5 w-5 mr-2 text-purple-600" />
        <span>Manage Channel Types</span>
      </Link>
      <Link to="/admin/manage-faceless-ideas" className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
        <Sparkles className="h-5 w-5 mr-2 text-orange-600" />
        <span>Manage Faceless Ideas</span>
      </Link>
      <Link to="/admin/manage-did-you-know-facts" className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
        <BookOpen className="h-5 w-5 mr-2 text-green-600" />
        <span>Manage Did You Know Facts</span>
      </Link>
    </div>
  </Card>
));

// Main Dashboard component optimized
const Dashboard = () => {
  // Check for any in-progress operations on mount, using useEffect for side effects only
  useEffect(() => {
    // Only check once on mount
    try {
      const savedStatsProgress = localStorage.getItem("mass_stats_update_progress");
      if (savedStatsProgress) {
        const parsedProgress = JSON.parse(savedStatsProgress);
        if (parsedProgress.isActive) {
          toast.info(`You have a paused stats update (${parsedProgress.processedCount}/${parsedProgress.totalCount}). You can resume it in the Mass Stats Updater section.`);
        }
      }
    } catch (error) {
      console.error("Error checking for saved progress:", error);
    }
  }, []);

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
          <div className="lg:col-span-1 space-y-6">
            <AdminLinks />
          </div>
        </div>
        
        {/* Mass updaters grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <MassScreenshotUpdater />
          </div>
          <div className="lg:col-span-1">
            <MassStatsUpdater />
          </div>
          <div className="lg:col-span-1">
            <MassRevenueStatsUpdater />
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-8">
          <BulkChannelUploader />
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-8">
          <CsvChannelUploader />
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-8">
          <ChannelsToImprove />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">All Channels</h2>
          <ChannelList isAdmin={true} showAll={true} />
        </div>
      </div>
    </div>
  );
};

// Export a memoized version to prevent unnecessary re-renders
export default React.memo(Dashboard);
