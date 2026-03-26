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
          author_id: string | null
          author_name: string | null
          body: string
          created_at: string
          id: string
          is_approved: boolean
          parent_id: string | null
          slug: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          created_at?: string
          id?: string
          is_approved?: boolean
          parent_id?: string | null
          slug: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "blog_post_comments"
            referencedColumns: ["id"]
          },
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
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          response?: string
          slug: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          response?: string
          slug?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_reactions_slug_fkey"
            columns: ["slug"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "blog_post_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
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
          author_id: string | null
          author_name: string
          created_at: string | null
          description: string | null
          excerpt: string | null
          featured_on_community_landing: boolean
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
          author_id?: string | null
          author_name?: string
          created_at?: string | null
          description?: string | null
          excerpt?: string | null
          featured_on_community_landing?: boolean
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
          author_id?: string | null
          author_name?: string
          created_at?: string | null
          description?: string | null
          excerpt?: string | null
          featured_on_community_landing?: boolean
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
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
        ]
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
      community_users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          featured_blog_post_slugs: string[]
          featured_on_community_landing: boolean
          featured_projects: Json
          id: string
          name: string
          profile_links: Json
          tech_stack: string[]
          updated_at: string
          user_type: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          featured_blog_post_slugs?: string[]
          featured_on_community_landing?: boolean
          featured_projects?: Json
          id: string
          name: string
          profile_links?: Json
          tech_stack?: string[]
          updated_at?: string
          user_type?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          featured_blog_post_slugs?: string[]
          featured_on_community_landing?: boolean
          featured_projects?: Json
          id?: string
          name?: string
          profile_links?: Json
          tech_stack?: string[]
          updated_at?: string
          user_type?: string
          username?: string
        }
        Relationships: []
      }
      dashboard_activity_reads: {
        Row: {
          activity_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          user_id?: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_activity_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_comments: {
        Row: {
          author_id: string | null
          author_name: string
          body: string
          created_at: string
          discussion_id: string
          id: string
          parent_id: string | null
        }
        Insert: {
          author_id?: string | null
          author_name: string
          body: string
          created_at?: string
          discussion_id: string
          id?: string
          parent_id?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string
          body?: string
          created_at?: string
          discussion_id?: string
          id?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_comments_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussion_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_reactions: {
        Row: {
          created_at: string
          discussion_id: string
          id: string
          reaction_type: string
          response: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          discussion_id: string
          id?: string
          reaction_type: string
          response?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          discussion_id?: string
          id?: string
          reaction_type?: string
          response?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_reactions_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussion_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_views: {
        Row: {
          created_at: string
          discussion_id: string
          id: number
        }
        Insert: {
          created_at?: string
          discussion_id: string
          id?: number
        }
        Update: {
          created_at?: string
          discussion_id?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "discussion_views_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_muted_follows: {
        Row: {
          created_at: string
          following_id: string
          subscriber_id: string
        }
        Insert: {
          created_at?: string
          following_id: string
          subscriber_id: string
        }
        Update: {
          created_at?: string
          following_id?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_muted_follows_user_follows_fkey"
            columns: ["subscriber_id", "following_id"]
            isOneToOne: true
            referencedRelation: "user_follows"
            referencedColumns: ["follower_id", "following_id"]
          },
        ]
      }
      newsletter_send_log: {
        Row: {
          content_count: number
          frequency: Database["public"]["Enums"]["newsletter_digest_frequency"]
          id: string
          period_key: string
          provider_message_id: string | null
          sent_at: string
          user_id: string
        }
        Insert: {
          content_count?: number
          frequency: Database["public"]["Enums"]["newsletter_digest_frequency"]
          id?: string
          period_key: string
          provider_message_id?: string | null
          sent_at?: string
          user_id: string
        }
        Update: {
          content_count?: number
          frequency?: Database["public"]["Enums"]["newsletter_digest_frequency"]
          id?: string
          period_key?: string
          provider_message_id?: string | null
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_send_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_settings: {
        Row: {
          created_at: string
          frequency: Database["public"]["Enums"]["newsletter_digest_frequency"]
          include_blog: boolean
          include_discussions: boolean
          last_digest_sent_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          frequency?: Database["public"]["Enums"]["newsletter_digest_frequency"]
          include_blog?: boolean
          include_discussions?: boolean
          last_digest_sent_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          frequency?: Database["public"]["Enums"]["newsletter_digest_frequency"]
          include_blog?: boolean
          include_discussions?: boolean
          last_digest_sent_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferred_tags: {
        Row: {
          tag_id: string
          user_id: string
        }
        Insert: {
          tag_id: string
          user_id: string
        }
        Update: {
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferred_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_preferred_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "community_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_follow_stats: {
        Args: { p_profile_user_id: string; p_viewer_user_id?: string }
        Returns: Json
      }
    }
    Enums: {
      newsletter_digest_frequency: "none" | "weekly" | "biweekly" | "monthly"
      UserTypes:
        | "admin"
        | "client"
        | "community_member"
        | "developer"
        | "sales_team"
        | "staff"
        | "blogger"
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
    Enums: {
      newsletter_digest_frequency: ["none", "weekly", "biweekly", "monthly"],
      UserTypes: [
        "admin",
        "client",
        "community_member",
        "developer",
        "sales_team",
        "staff",
        "blogger",
      ],
    },
  },
} as const
