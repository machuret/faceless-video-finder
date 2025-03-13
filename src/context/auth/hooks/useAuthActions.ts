
import { useState } from "react";
import { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthActions = (setSessionToken: (token: string | null) => void) => {
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      if (data?.session) {
        setSessionToken(data.session.access_token);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast.error("Failed to sign in");
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, metadata?: { [key: string]: any }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      toast.success("Registration successful! Please check your email for confirmation.");
      return { error: null };
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error("Failed to sign up");
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      toast.success("Password reset link sent to your email");
      return { error: null };
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast.error("Failed to send reset email");
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      toast.success("Password updated successfully");
      return { error: null };
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
      return { error: error as AuthError };
    }
  };

  return {
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    loading,
    setLoading
  };
};
