
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import MainNavbar from "@/components/MainNavbar";
import PageFooter from "@/components/home/PageFooter";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  
  // Get the return URL from location state or default to home page
  const from = location.state?.from || "/";

  useEffect(() => {
    // Add a small delay before checking auth state to ensure it's loaded
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect if we've finished the initial loading check
    if (!loading && !isChecking && user) {
      console.log("User is authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from, isChecking]);

  // Show loading spinner while checking auth status
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <MainNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Checking authentication status...</p>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <MainNavbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {activeTab === "login" 
                ? "Sign in to your account" 
                : "Create your account"}
            </p>
          </div>
          
          <Card className="p-6">
            <Tabs 
              defaultValue="login" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      <PageFooter />
    </div>
  );
};

export default Auth;
