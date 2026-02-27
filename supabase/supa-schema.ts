export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_post_comments: {
        Row: {
          author_name: string | null
          body: string
          created_at: string
          id: string
          is_approved: boolean
          slug: string
        }
        Insert: {
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          is_approved?: boolean
          slug: string
        }
        Update: {
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_comments_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["slug"]
          },
        ]
      }
      blog_post_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          response: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          response?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          response?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_reactions_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["slug"]
          },
        ]
      }
      blog_post_views: {
        Row: {
          created_at: string
          id: number
          slug: string
        }
        Insert: {
          created_at?: string
          id?: number
          slug: string
        }
        Update: {
          created_at?: string
          id?: number
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_views_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["slug"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_name: string
          created_at: string | null
          description: string | null
          excerpt: string | null
          id: string
          is_featured: boolean
          published_at: string | null
          read_time_minutes: number
          sections: Json
          slug: string
          status: string
          tags: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          author_name?: string
          created_at?: string | null
          description?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          read_time_minutes?: number
          sections: Json
          slug: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          author_name?: string
          created_at?: string | null
          description?: string | null
          excerpt?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          read_time_minutes?: number
          sections?: Json
          slug?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_handoffs: {
        Row: {
          archived: boolean
          chat_history: Json
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          archived?: boolean
          chat_history: Json
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          archived?: boolean
          chat_history?: Json
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
