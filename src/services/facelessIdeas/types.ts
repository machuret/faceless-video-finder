
export interface FacelessIdeaInfo {
  id: string;
  label: string;
  description: string | null;
  image_url: string | null;
  production: string | null;
  example: string | null;
}

// Input types for create and update operations
export interface FacelessIdeaCreateInput {
  id: string;
  label: string;
  description?: string | null;
  image_url?: string | null;
  production?: string | null;
  example?: string | null;
}

export interface FacelessIdeaUpdateInput {
  id: string;
  label: string;
  description?: string | null;
  image_url?: string | null;
  production?: string | null;
  example?: string | null;
}

// CSV import types
export interface CsvImportResult {
  success: number;
  failed: number;
  errors?: string[];
}
