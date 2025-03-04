
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DashboardHeader = () => {
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 px-4 mb-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm">Manage your YouTube channels and application settings.</p>
          </div>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
