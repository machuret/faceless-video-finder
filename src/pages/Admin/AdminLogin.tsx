
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MainNavbar from "@/components/MainNavbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Auth context and navigation
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    console.log("AdminLogin auth state:", {
      hasUser: !!user,
      isAdmin,
      authLoading
    });
    
    if (!authLoading && user && isAdmin) {
      console.log("User already logged in as admin, redirecting to dashboard");
      toast.success("Already logged in as admin");
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage("");
      
      console.log(`Attempting to login with email: ${email}`);
      
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error("Login error:", error.message);
        setErrorMessage(`Login failed: ${error.message}`);
        toast.error(error.message || "Login failed");
        return;
      }
      
      if (!data?.user) {
        const msg = "Login failed - no user returned";
        console.error(msg);
        setErrorMessage(msg);
        toast.error("Login failed");
        return;
      }
      
      const userId = data.user.id;
      console.log("Login successful, user:", userId);
      toast.success("Login successful, checking admin permissions...");
      
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase.rpc('check_is_admin', {
        user_id: userId
      });
      
      if (adminError) {
        console.error("Error checking admin status:", adminError);
        setErrorMessage(`Admin verification failed: ${adminError.message}`);
        toast.error("Error verifying admin permissions");
        await supabase.auth.signOut();
        return;
      }
      
      const isUserAdmin = !!adminData;
      console.log("Admin check result:", isUserAdmin);
      
      if (isUserAdmin) {
        toast.success("Verified admin access! Redirecting to dashboard...");
        console.log("User confirmed as admin, redirecting to dashboard");
        navigate("/admin/dashboard");
      } else {
        console.error("User is not an admin");
        setErrorMessage("You don't have admin permissions");
        toast.error("You don't have admin permissions");
        
        // Sign out non-admin users
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
      toast.error(error.message || "Login failed");
      
      // Sign out on error
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
            
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-200">
                <p className="font-semibold">Login Error:</p>
                <p>{errorMessage}</p>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || authLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
