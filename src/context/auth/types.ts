
import { User, Session } from "@supabase/supabase-js";

export type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  session?: Session | null;
};
