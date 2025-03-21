export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      channel_types: {
        Row: {
          created_at: string | null
          description: string | null
          example: string | null
          id: string
          image_url: string | null
          label: string
          production: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          example?: string | null
          id: string
          image_url?: string | null
          label: string
          production?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          example?: string | null
          id?: string
          image_url?: string | null
          label?: string
          production?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      did_you_know_facts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faceless_ideas: {
        Row: {
          created_at: string | null
          description: string | null
          example: string | null
          id: string
          image_url: string | null
          label: string
          production: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          example?: string | null
          id: string
          image_url?: string | null
          label: string
          production?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          example?: string | null
          id?: string
          image_url?: string | null
          label?: string
          production?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      niche_details: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          niche_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          niche_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          niche_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "niche_details_niche_id_fkey"
            columns: ["niche_id"]
            isOneToOne: false
            referencedRelation: "niches"
            referencedColumns: ["id"]
          },
        ]
      }
      niches: {
        Row: {
          cpm: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          cpm?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          cpm?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      youtube_channels: {
        Row: {
          ai_description: string | null
          channel_category:
            | Database["public"]["Enums"]["channel_category"]
            | null
          channel_title: string
          channel_type: Database["public"]["Enums"]["channel_type"] | null
          channel_url: string
          country: string | null
          cpm: number | null
          created_at: string | null
          description: string | null
          id: string
          is_editor_verified: boolean | null
          is_featured: boolean | null
          keywords: string[] | null
          metadata: Json | null
          niche: string | null
          notes: string | null
          potential_revenue: number | null
          revenue_per_month: number | null
          revenue_per_video: number | null
          screenshot_url: string | null
          start_date: string | null
          total_subscribers: number | null
          total_views: number | null
          updated_at: string | null
          uses_ai: boolean | null
          video_count: number | null
          video_id: string
        }
        Insert: {
          ai_description?: string | null
          channel_category?:
            | Database["public"]["Enums"]["channel_category"]
            | null
          channel_title: string
          channel_type?: Database["public"]["Enums"]["channel_type"] | null
          channel_url: string
          country?: string | null
          cpm?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_editor_verified?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          metadata?: Json | null
          niche?: string | null
          notes?: string | null
          potential_revenue?: number | null
          revenue_per_month?: number | null
          revenue_per_video?: number | null
          screenshot_url?: string | null
          start_date?: string | null
          total_subscribers?: number | null
          total_views?: number | null
          updated_at?: string | null
          uses_ai?: boolean | null
          video_count?: number | null
          video_id: string
        }
        Update: {
          ai_description?: string | null
          channel_category?:
            | Database["public"]["Enums"]["channel_category"]
            | null
          channel_title?: string
          channel_type?: Database["public"]["Enums"]["channel_type"] | null
          channel_url?: string
          country?: string | null
          cpm?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_editor_verified?: boolean | null
          is_featured?: boolean | null
          keywords?: string[] | null
          metadata?: Json | null
          niche?: string | null
          notes?: string | null
          potential_revenue?: number | null
          revenue_per_month?: number | null
          revenue_per_video?: number | null
          screenshot_url?: string | null
          start_date?: string | null
          total_subscribers?: number | null
          total_views?: number | null
          updated_at?: string | null
          uses_ai?: boolean | null
          video_count?: number | null
          video_id?: string
        }
        Relationships: []
      }
      youtube_video_stats: {
        Row: {
          channel_id: string | null
          created_at: string | null
          dislikes: number | null
          id: string
          likes: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_id: string
          views: number | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          dislikes?: number | null
          id?: string
          likes?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_id: string
          views?: number | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          dislikes?: number | null
          id?: string
          likes?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_video_stats_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "youtube_channels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      check_is_admin_safe: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_admin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              uid: string
            }
            Returns: boolean
          }
      update_channel_metadata: {
        Args: {
          channel_id: string
          metadata_json: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      channel_category:
        | "entertainment"
        | "education"
        | "gaming"
        | "music"
        | "news"
        | "sports"
        | "technology"
        | "other"
      channel_type: "creator" | "brand" | "media" | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
