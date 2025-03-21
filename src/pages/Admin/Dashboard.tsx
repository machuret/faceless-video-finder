
import React, { useEffect, useMemo, createContext, useContext } from "react";
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
import { Database, Layers, BookOpen, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

// Create a dashboard context to avoid prop drilling
interface DashboardContextType {
  checkForSavedProgress: () => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
}

// Using memo to prevent unnecessary re-renders
const AdminLinks = React.memo(() => (
  <Card className="p-6">
    <h3 className="text-xl font-semibold mb-4">Content Management</h3>
    <div className="space-y-2">
      <Link to="/admin/niches" className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
        <Database className="h-5 w-5 mr-2 text-blue-600" />
        <span>Manage Niches</span>
      </Link>
      <Link to="/admin/channel-types" className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
        <Layers className="h-5 w-5 mr-2 text-purple-600" />
        <span>Manage Channel Types</span>
      </Link>
      <Link to="/admin/faceless-ideas" className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
        <Sparkles className="h-5 w-5 mr-2 text-orange-600" />
        <span>Manage Faceless Ideas</span>
      </Link>
      <Link to="/admin/did-you-know-facts" className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
        <BookOpen className="h-5 w-5 mr-2 text-green-600" />
        <span>Manage Did You Know Facts</span>
      </Link>
      <Link to="/admin/users" className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors bg-red-50">
        <Users className="h-5 w-5 mr-2 text-red-600" />
        <span className="font-semibold">Manage Users</span>
      </Link>
    </div>
  </Card>
));

// Main Dashboard component optimized
const Dashboard = () => {
  // Memoize context functions to prevent unnecessary re-renders
  const dashboardContext = useMemo(() => ({
    checkForSavedProgress: () => {
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
    }
  }), []);

  useEffect(() => {
    // Only check once on mount
    dashboardContext.checkForSavedProgress();
  }, []);

  return (
    <DashboardContext.Provider value={dashboardContext}>
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
    </DashboardContext.Provider>
  );
};

// Export a memoized version to prevent unnecessary re-renders
export default React.memo(Dashboard);
