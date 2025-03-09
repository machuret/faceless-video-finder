
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dhbuaffdzhjzsqjfkesg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoYnVhZmZkemhqenNxamZrZXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NjI4NDksImV4cCI6MjA1NjEzODg0OX0.1hLvYTU7_Z8BMDv1CFe8PTkHQ24F-LTO6Fe-qUbcXHc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

try {
  console.log("Initializing Supabase client");
} catch (error) {
  console.error("Error initializing Supabase client:", error);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
