
import { createContext, useContext } from "react";
import { AuthContextType } from "./auth/types";
import { AuthProvider as AuthProviderInternal, useAuth as useAuthInternal } from "./auth/AuthContext";

// Create context with full interface implementation
const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  userRoles: [],
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  refreshSession: async () => {}
});

export const useAuth = () => {
  return useAuthInternal();
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthProviderInternal>{children}</AuthProviderInternal>;
};
