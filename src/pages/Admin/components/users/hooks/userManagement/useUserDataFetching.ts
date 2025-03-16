
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "../useUserForm";

export const useUserDataFetching = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async (debouncedSearchTerm: string) => {
    try {
      setIsLoading(true);
      
      // First fetch from profiles table
      let query = supabase
        .from("profiles")
        .select("id, first_name, last_name, display_name, email, created_at");
      
      if (debouncedSearchTerm) {
        query = query.or(
          `first_name.ilike.%${debouncedSearchTerm}%,last_name.ilike.%${debouncedSearchTerm}%,email.ilike.%${debouncedSearchTerm}%`
        );
      }
        
      const { data: profilesData, error: profilesError } = await query.order("created_at", { ascending: false });
      
      if (profilesError) throw profilesError;
      
      console.log("Profiles fetched:", profilesData?.length);
      
      // Also fetch users directly from auth.users through the admin-get-users edge function
      // to catch any users that might be in auth but not in profiles
      const { data: authUsersData, error: authUsersError } = await supabase.functions.invoke('admin-get-users', {
        body: {}
      });
      
      if (authUsersError) {
        console.error("Error fetching auth users:", authUsersError);
      } else {
        console.log("Auth users fetched:", authUsersData?.length);
      }
      
      // Combine data from both sources
      const combinedUsers = new Map<string, User>();
      
      // First add profile data
      profilesData?.forEach(profile => {
        combinedUsers.set(profile.id, {
          id: profile.id,
          email: profile.email || "",
          display_name: profile.display_name || "",
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          created_at: profile.created_at,
          banned_until: null
        });
      });
      
      // Then add or update with auth data
      if (authUsersData && Array.isArray(authUsersData)) {
        authUsersData.forEach(authUser => {
          if (!combinedUsers.has(authUser.id)) {
            // This user exists in auth but not in profiles
            combinedUsers.set(authUser.id, {
              id: authUser.id,
              email: authUser.email || "",
              display_name: "",
              first_name: "",
              last_name: "",
              created_at: authUser.created_at || new Date().toISOString(),
              banned_until: authUser.banned_until
            });
          } else {
            // Update existing entry with auth data
            const existingUser = combinedUsers.get(authUser.id)!;
            existingUser.banned_until = authUser.banned_until;
            if (!existingUser.email && authUser.email) {
              existingUser.email = authUser.email;
            }
            combinedUsers.set(authUser.id, existingUser);
          }
        });
      }
      
      // Convert map to array and filter by search term if needed
      let usersArray = Array.from(combinedUsers.values());
      
      if (debouncedSearchTerm) {
        usersArray = usersArray.filter(user => 
          user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
          user.first_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
          user.last_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          user.display_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
      }
      
      // Sort by created_at descending
      usersArray.sort((a, b) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
      
      setUsers(usersArray);
      
      return usersArray;
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
      setUsers([]);
      
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    setUsers,
    isLoading,
    setIsLoading,
    fetchUsers
  };
};
