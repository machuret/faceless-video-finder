
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminHeader from "./components/AdminHeader";
import UsersManagement from "./components/users/UsersManagement";
import UserRegistration from "./components/users/UserRegistration";

const ManageUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader title="User Management" />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="list">Users List</TabsTrigger>
              <TabsTrigger value="register">Register User</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="space-y-6">
            <UsersManagement />
          </TabsContent>
          
          <TabsContent value="register" className="space-y-6">
            <UserRegistration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManageUsers;
