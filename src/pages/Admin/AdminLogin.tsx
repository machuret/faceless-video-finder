
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

// Augment the existing Database type with our RPC function
declare module '@/integrations/supabase/types' {
  interface Database {
    public: {
      Functions: {
        get_user_role: {
          Args: { user_id: string };
          Returns: string[];
        };
      };
    };
  }
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, attempt to sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
      if (!user) throw new Error("No user data returned");

      console.log("User signed in successfully:", user.id);

      // Use RPC call to check admin role to avoid recursion
      type RPCResponse = { data: string[] | null; error: Error | null };
      const { data: adminRoles, error: roleError } = await supabase
        .rpc('get_user_role', { user_id: user.id }) as RPCResponse;

      console.log("Admin role check result:", { adminRoles, roleError });

      if (roleError) {
        console.error("Role check error:", roleError);
        await supabase.auth.signOut();
        throw new Error(`Error checking admin privileges: ${roleError.message}`);
      }

      if (!adminRoles || !adminRoles.includes('admin')) {
        console.log("No admin role found for user:", user.id);
        await supabase.auth.signOut();
        throw new Error("Unauthorized - Admin access only");
      }

      toast.success("Welcome back, admin!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
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
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
