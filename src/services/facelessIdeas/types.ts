
import { supabase } from "@/integrations/supabase/client";

export interface FacelessIdeaInfo {
  id: string;
  label: string;
  description: string | null;
  production: string | null;
  example: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type FacelessIdeaCreateInput = Omit<FacelessIdeaInfo, 'created_at' | 'updated_at'>;
export type FacelessIdeaUpdateInput = Omit<FacelessIdeaInfo, 'created_at' | 'updated_at'>;

// Validation helpers
export const validateFacelessIdeaId = (id: string): boolean => {
  const regex = /^[a-z0-9_]+$/;
  return regex.test(id);
};
