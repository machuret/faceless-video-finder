
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();
  
  // Redirect if already logged in as admin
  useEffect(() => {
    // Only attempt redirect once to prevent loops
    if (redirectAttempted) return;
    
    // Only redirect when not loading and we have confirmed admin status
    if (!loading && user && isAdmin) {
      console.log("Already logged in as admin, redirecting to dashboard");
      setRedirectAttempted(true);
      
      // Use a direct navigation approach with cache-busting
      const destinationUrl = `/admin/dashboard?t=${Date.now()}`;
      window.location.href = destinationUrl;
    }
  }, [user, isAdmin, loading, navigate, redirectAttempted]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setErrorMessage("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setErrorMessage("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form validation
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage("");
      
      // Log the attempt for debugging
      console.log(`Attempting login with email: ${email} at ${new Date().toISOString()}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data?.user) {
        console.log("User logged in successfully, checking admin status");
        
        // Add artificial delay to ensure auth state is fully processed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase.rpc('check_is_admin', {
          user_id: data.user.id
        });

        if (adminError) {
          console.error("Error checking admin status:", adminError);
          throw adminError;
        }

        console.log("Admin check result:", adminData);

        if (adminData) {
          console.log("User is admin, redirecting to dashboard");
          toast.success("Logged in successfully");
          
          // Use direct location change with timestamp to avoid cache issues
          const timestamp = Date.now();
          window.location.href = `/admin/dashboard?t=${timestamp}`;
        } else {
          console.log("User is not an admin, signing out");
          toast.error("You don't have admin access");
          // Sign out non-admin users
          await supabase.auth.signOut();
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error("Login process failed:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
      toast.error(error.message || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Portal</h1>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : "Login"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
