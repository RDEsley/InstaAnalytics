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
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      instagram_profiles: {
        Row: {
          id: string
          user_id: string
          instagram_username: string
          search_date: string
        }
        Insert: {
          id?: string
          user_id: string
          instagram_username: string
          search_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          instagram_username?: string
          search_date?: string
        }
      }
      posts: {
        Row: {
          id: string
          profile_id: string
          caption: string
          post_url: string
          instagram_post_id: string
          likes_count: number
          comments_count: number
          post_date: string
        }
        Insert: {
          id?: string
          profile_id: string
          caption: string
          post_url: string
          instagram_post_id: string
          likes_count: number
          comments_count: number
          post_date?: string
        }
        Update: {
          id?: string
          profile_id?: string
          caption?: string
          post_url?: string
          instagram_post_id?: string
          likes_count?: number
          comments_count?: number
          post_date?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          comment_text: string
          author: string
          likes: number
          comment_date: string
        }
        Insert: {
          id?: string
          post_id: string
          comment_text: string
          author: string
          likes?: number
          comment_date?: string
        }
        Update: {
          id?: string
          post_id?: string
          comment_text?: string
          author?: string
          likes?: number
          comment_date?: string
        }
      }
    }
  }
}