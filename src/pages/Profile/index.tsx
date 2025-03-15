
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useProfileForm } from "./hooks/useProfileForm";
import ProfileForm from "./components/ProfileForm";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Profile = () => {
  const { form, isLoading, isFetching, onSubmit } = useProfileForm();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MainNavbar />
        
        <div className="flex-grow container mx-auto py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetching ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ProfileForm 
                    form={form} 
                    isLoading={isLoading} 
                    onSubmit={onSubmit}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <PageFooter />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
