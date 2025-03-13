
import React from "react";
import AdminHeader from "./components/AdminHeader";
import ManageNiches from "./components/niches/ManageNiches";

const ManageNichesPage = () => {
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
