
import React from "react";
import AdminHeader from "./components/AdminHeader";
import ManageNiches from "./components/niches/ManageNiches";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const ManageNichesPage = () => {
  const { isAdmin, user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/admin/login");
    }
  }, [isAdmin, navigate, loading]);
  
  if (loading) {
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
      <AdminHeader 
        title="Manage Niches" 
        subtitle="Add, edit, or remove niche categories for YouTube channels"
      />
      <div className="container mx-auto p-4">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <ManageNiches />
        </div>
      </div>
    </div>
  );
};

export default ManageNichesPage;
