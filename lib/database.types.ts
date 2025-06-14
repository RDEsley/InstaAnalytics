export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          biography: string | null
          follower_count: number
          following_count: number
          posts_count: number
          profile_pic_url: string | null
          is_private: boolean | null
          is_verified: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          username: string
          full_name?: string | null
          biography?: string | null
          follower_count?: number
          following_count?: number
          posts_count?: number
          profile_pic_url?: string | null
          is_private?: boolean | null
          is_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          biography?: string | null
          follower_count?: number
          following_count?: number
          posts_count?: number
          profile_pic_url?: string | null
          is_private?: boolean | null
          is_verified?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      posts: {
        Row: {
          id: string
          profile_id: string
          post_id: string
          caption: string | null
          likes_count: number
          comments_count: number
          timestamp: string | null
          url: string | null
          media_type: string | null
          media_url: string | null
          location_name: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          post_id: string
          caption?: string | null
          likes_count?: number
          comments_count?: number
          timestamp?: string | null
          url?: string | null
          media_type?: string | null
          media_url?: string | null
          location_name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          post_id?: string
          caption?: string | null
          likes_count?: number
          comments_count?: number
          timestamp?: string | null
          url?: string | null
          media_type?: string | null
          media_url?: string | null
          location_name?: string | null
          created_at?: string | null
        }
      }
      engagement_metrics: {
        Row: {
          id: string
          profile_id: string
          engagement_rate: number
          posting_frequency: number
          average_likes: number
          average_comments: number
          best_performing_post_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          profile_id: string
          engagement_rate?: number
          posting_frequency?: number
          average_likes?: number
          average_comments?: number
          best_performing_post_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          profile_id?: string
          engagement_rate?: number
          posting_frequency?: number
          average_likes?: number
          average_comments?: number
          best_performing_post_id?: string | null
          created_at?: string | null
        }
      }
      search_history: {
        Row: {
          id: string
          username: string
          result: Json | null
          status: string
          error_message: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          username: string
          result?: Json | null
          status?: string
          error_message?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          username?: string
          result?: Json | null
          status?: string
          error_message?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
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