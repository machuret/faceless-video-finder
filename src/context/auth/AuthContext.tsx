import { createContext, useContext, useState, useMemo, useEffect, useRef, useCallback } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { UserRole, UserProfile } from "./types";

export type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  userRoles: UserRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  
  const [sessionToken, setSessionToken] = useLocalStorage<string | null>("supabase_auth_token", null);
  
  const adminCacheRef = useRef(new Map<string, boolean>());
  const profileCacheRef = useRef(new Map<string, UserProfile>());
  const roleCacheRef = useRef(new Map<string, UserRole[]>());
  
  const fetchUserProfile = useCallback(async (userId: string) => {
    if (profileCacheRef.current.has(userId)) {
      return profileCacheRef.current.get(userId) as UserProfile;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      if (data) {
        profileCacheRef.current.set(userId, data as UserProfile);
        return data as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error("Exception fetching user profile:", error);
      return null;
    }
  }, []);

  const fetchUserRoles = useCallback(async (userId: string) => {
    if (roleCacheRef.current.has(userId)) {
      return roleCacheRef.current.get(userId) as UserRole[];
    }
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error fetching user roles:", error);
        return [];
      }
      
      if (data && data.length > 0) {
        roleCacheRef.current.set(userId, data as UserRole[]);
        return data as UserRole[];
      }
      
      return [];
    } catch (error) {
      console.error("Exception fetching user roles:", error);
      return [];
    }
  }, []);

  const checkAdminStatus = useCallback(async (userId: string) => {
    if (adminCacheRef.current.has(userId)) {
      const isAdmin = adminCacheRef.current.get(userId);
      return isAdmin;
    }

    try {
      const { data: adminData, error: adminError } = await supabase.rpc('check_is_admin', {
        user_id: userId
      });

      if (adminError) {
        console.error('Error checking admin status:', adminError);
        return false;
      }
      
      adminCacheRef.current.set(userId, !!adminData);
      return !!adminData;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      return false;
    }
  }, []);

  const initializeUserData = useCallback(async (user: User) => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const [adminStatus, userProfile, userRoles] = await Promise.all([
        checkAdminStatus(user.id),
        fetchUserProfile(user.id),
        fetchUserRoles(user.id),
      ]);
      
      setIsAdmin(adminStatus);
      setProfile(userProfile);
      setUserRoles(userRoles);
    } catch (error) {
      console.error("Error initializing user data:", error);
    } finally {
      setLoading(false);
    }
  }, [checkAdminStatus, fetchUserProfile, fetchUserRoles]);

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

  const signOut = async () => {
    try {
      setLoading(true);
      
      setUser(null);
      setProfile(null);
      setUserRoles([]);
      setIsAdmin(false);
      setSessionToken(null);
      
      adminCacheRef.current.clear();
      profileCacheRef.current.clear();
      roleCacheRef.current.clear();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Logged out successfully");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Error signing out");
    } finally {
      setLoading(false);
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

  const refreshSession = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        await signOut();
        return;
      }
      
      if (data?.session) {
        setSessionToken(data.session.access_token);
        if (data.user) {
          setUser(data.user);
          await initializeUserData(data.user);
        }
      }
    } catch (error) {
      console.error("Exception refreshing session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized) return;
    
    let isMounted = true;
    let authListener: { data: { subscription: { unsubscribe: () => void } } };
    
    const initializeAuth = async () => {
      try {
        if (!isMounted) return;
        
        console.log("Initializing auth state...");
        
        if (sessionToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Error getting session:", sessionError);
            setSessionToken(null);
          } else if (sessionData?.session?.user) {
            console.log("Session found, setting user");
            setUser(sessionData.session.user);
            await initializeUserData(sessionData.session.user);
          }
        } else {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error("Error getting session:", sessionError);
          } else if (sessionData?.session?.user) {
            console.log("Session found, setting user");
            setUser(sessionData.session.user);
            setSessionToken(sessionData.session.access_token);
            await initializeUserData(sessionData.session.user);
          } else {
            console.log("No active session found");
            setUser(null);
            setProfile(null);
            setUserRoles([]);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };
    
    initializeAuth();
    
    authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          setSessionToken(session.access_token);
          await initializeUserData(session.user);
        }
      } 
      else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setUserRoles([]);
        setIsAdmin(false);
        setSessionToken(null);
        adminCacheRef.current.clear();
        profileCacheRef.current.clear();
        roleCacheRef.current.clear();
      }
    });
    
    return () => {
      isMounted = false;
      if (authListener?.data?.subscription) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, [initialized, sessionToken, initializeUserData]);

  useEffect(() => {
    if (!user || !sessionToken) return;
    
    const refreshInterval = setInterval(() => {
      refreshSession();
    }, 23 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [user, sessionToken, refreshSession]);

  const contextValue = useMemo(() => ({
    user,
    profile,
    isAdmin,
    userRoles,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession
  }), [user, profile, isAdmin, userRoles, loading, refreshSession]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
