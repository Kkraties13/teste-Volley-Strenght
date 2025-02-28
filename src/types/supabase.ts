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
          name: string
          username: string
          gender: string
          positions: string[]
          bio: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          username: string
          gender: string
          positions: string[]
          bio: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          username?: string
          gender?: string
          positions?: string[]
          bio?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          title: string
          description: string
          position: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          position: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          position?: string
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          name: string
          description: string
          sets: number
          reps: number
          video_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          description: string
          sets: number
          reps: number
          video_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          description?: string
          sets?: number
          reps?: number
          video_url?: string | null
          created_at?: string
        }
      }
      user_workouts: {
        Row: {
          id: string
          user_id: string
          workout_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_id?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          likes: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          likes?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          likes?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
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
  }
}