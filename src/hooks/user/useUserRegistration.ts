
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUserRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast.success("Registration successful! Please check your email for confirmation.");
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
      toast.error(`Registration failed: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    isLoading,
    error
  };
};
