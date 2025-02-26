
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in and is admin, redirect to dashboard
    if (user && isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // After successful login, AuthContext will automatically check admin status
      toast.success("Successfully logged in");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Check your email to confirm your account");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Processing..." : "Login"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSignUp}
                disabled={loading}
              >
                Sign Up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
