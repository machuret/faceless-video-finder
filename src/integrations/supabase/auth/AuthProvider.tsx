
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../client';
import { AuthError, Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  checkIsAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    console.info('Auth Provider mounted');
    console.info('Setting up auth state change listener');
    
    let timeoutId: NodeJS.Timeout | null = null;
    
    const setupAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          console.info(`Found existing user session: ${initialSession.user.email}`);
          setUser(initialSession.user);
          setSession(initialSession);
          
          // Check admin status
          const isUserAdmin = await checkIsAdmin();
          setIsAdmin(isUserAdmin);
        } else {
          setUser(null);
          setSession(null);
          setIsAdmin(null);
        }
        
        // This timeout ensures we don't get stuck in loading state if auth takes too long
        timeoutId = setTimeout(() => {
          if (loading) {
            console.warn('Auth initialization timed out - forcing loading state to false');
            setLoading(false);
            setAuthInitialized(true);
          }
        }, 3000);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };
    
    // Set up the auth state subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // Only log meaningful auth events
        if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) {
          console.info(`Auth state changed: ${event} ${currentSession?.user?.email || ''}`);
        }
        
        if (currentSession) {
          setUser(currentSession.user);
          setSession(currentSession);
          
          // Check admin status on sign in
          if (event === 'SIGNED_IN') {
            const isUserAdmin = await checkIsAdmin();
            setIsAdmin(isUserAdmin);
          }
        } else {
          setUser(null);
          setSession(null);
          setIsAdmin(null);
        }
        
        // Make sure loading is set to false after auth state change
        setLoading(false);
      }
    );
    
    // Call setup auth on mount
    setupAuth();
    
    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      return { error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIsAdmin = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.rpc('check_is_admin', {
        user_id: user.id
      });
      
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      console.info('Admin check result:', data);
      return !!data;
    } catch (error) {
      console.error('Exception checking admin status:', error);
      return false;
    }
  };

  // If auth has been initialized but we're still loading, show a fallback
  if (!authInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Initializing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        checkIsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
