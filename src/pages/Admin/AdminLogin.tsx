
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MainNavbar from "@/components/MainNavbar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Check if user is already logged in and is admin
  useEffect(() => {
    console.log("AdminLogin auth state:", {
      user: user ? "exists" : "null",
      isAdmin,
      authLoading
    });
    
    if (!authLoading && user && isAdmin) {
      console.log("User is already logged in as admin, redirecting to dashboard");
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    if (!email || !password) {
      setLoginError("Please enter both email and password");
      toast.error("Please enter both email and password");
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Attempting to login with email: ${email}`);
      
      // Step 1: Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error.message);
        setLoginError(error.message);
        toast.error(error.message || "Login failed");
        return;
      }
      
      if (!data?.user) {
        setLoginError("Login failed - no user returned");
        toast.error("Login failed");
        return;
      }
      
      console.log("Login successful, user:", data.user.id);
      
      // Step 2: Check if user is admin
      const { data: adminData, error: adminError } = await supabase.rpc('check_is_admin', {
        user_id: data.user.id
      });
      
      if (adminError) {
        console.error("Error checking admin status:", adminError);
        setLoginError("Error verifying admin permissions: " + adminError.message);
        toast.error("Error verifying admin permissions");
        await supabase.auth.signOut();
        return;
      }
      
      console.log("Admin check result:", adminData);
      
      if (adminData === true) {
        console.log("User confirmed as admin, redirecting to dashboard");
        toast.success("Login successful");
        navigate("/admin/dashboard");
      } else {
        console.log("User is not an admin");
        setLoginError("You do not have admin permissions");
        toast.error("You do not have admin permissions");
        
        // Sign out non-admin users
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      setLoginError(error.message || "An unexpected error occurred");
      toast.error(error.message || "Login failed");
      // Make sure to sign out if there's an error
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
            
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                {loginError}
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
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || authLoading}
              >
                {loading ? (
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
