
import { User, AuthError } from "@supabase/supabase-js";

export type UserRole = {
  id: string;
  user_id: string;
  role: string;
  created_at?: string;
};

export type UserProfile = {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  bio?: string;
  preferences?: Record<string, any>;
};

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
