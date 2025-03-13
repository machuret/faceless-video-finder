
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  is_admin: boolean;
  role: string;
}

export interface UserListResponse {
  users: UserProfile[];
  totalCount: number;
}

export interface UserManagementState {
  users: UserProfile[];
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
  currentPage: number;
  pageSize: number;
}
