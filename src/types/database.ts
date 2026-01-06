// src/types/database.ts

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
          full_name: string
          phone: string | null
          avatar_url: string | null
          role: 'student' | 'instructor' | 'admin'
          is_verified: boolean
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'student' | 'instructor' | 'admin'
          is_verified?: boolean
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          role?: 'student' | 'instructor' | 'admin'
          is_verified?: boolean
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          short_description: string | null
          thumbnail_url: string | null
          preview_video_url: string | null
          price_iqd: number
          discount_price_iqd: number | null
          instructor_id: string | null
          category: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          language: string
          duration_minutes: number
          lessons_count: number
          students_count: number
          average_rating: number
          is_published: boolean
          is_featured: boolean
          requirements: string[]
          what_you_learn: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          preview_video_url?: string | null
          price_iqd: number
          discount_price_iqd?: number | null
          instructor_id?: string | null
          category?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced'
          language?: string
          duration_minutes?: number
          lessons_count?: number
          students_count?: number
          average_rating?: number
          is_published?: boolean
          is_featured?: boolean
          requirements?: string[]
          what_you_learn?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          preview_video_url?: string | null
          price_iqd?: number
          discount_price_iqd?: number | null
          instructor_id?: string | null
          category?: string | null
          level?: 'beginner' | 'intermediate' | 'advanced'
          language?: string
          duration_minutes?: number
          lessons_count?: number
          students_count?: number
          average_rating?: number
          is_published?: boolean
          is_featured?: boolean
          requirements?: string[]
          what_you_learn?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          section_id: string
          course_id: string
          title: string
          description: string | null
          video_id: string | null
          video_url: string | null
          duration_seconds: number
          sort_order: number
          is_free: boolean
          is_published: boolean
          resources: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          course_id: string
          title: string
          description?: string | null
          video_id?: string | null
          video_url?: string | null
          duration_seconds?: number
          sort_order?: number
          is_free?: boolean
          is_published?: boolean
          resources?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          course_id?: string
          title?: string
          description?: string | null
          video_id?: string | null
          video_url?: string | null
          duration_seconds?: number
          sort_order?: number
          is_free?: boolean
          is_published?: boolean
          resources?: Json
          created_at?: string
          updated_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          payment_id: string | null
          enrolled_at: string
          expires_at: string | null
          progress_percentage: number
          last_lesson_id: string | null
          last_watched_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          payment_id?: string | null
          enrolled_at?: string
          expires_at?: string | null
          progress_percentage?: number
          last_lesson_id?: string | null
          last_watched_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          payment_id?: string | null
          enrolled_at?: string
          expires_at?: string | null
          progress_percentage?: number
          last_lesson_id?: string | null
          last_watched_at?: string | null
          completed_at?: string | null
        }
      }
      lesson_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          course_id: string
          watched_seconds: number
          total_seconds: number
          is_completed: boolean
          completed_at: string | null
          last_watched_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          course_id: string
          watched_seconds?: number
          total_seconds?: number
          is_completed?: boolean
          completed_at?: string | null
          last_watched_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          course_id?: string
          watched_seconds?: number
          total_seconds?: number
          is_completed?: boolean
          completed_at?: string | null
          last_watched_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          amount_iqd: number
          original_amount_iqd: number | null
          discount_amount_iqd: number
          coupon_id: string | null
          payment_method: 'zain_cash' | 'asiahawala' | 'fib' | 'qicard' | 'manual' | 'free'
          receipt_url: string | null
          transaction_id: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          failure_reason: string | null
          metadata: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          amount_iqd: number
          original_amount_iqd?: number | null
          discount_amount_iqd?: number
          coupon_id?: string | null
          payment_method: 'zain_cash' | 'asiahawala' | 'fib' | 'qicard' | 'manual' | 'free'
          receipt_url?: string | null
          transaction_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          failure_reason?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          amount_iqd?: number
          original_amount_iqd?: number | null
          discount_amount_iqd?: number
          coupon_id?: string | null
          payment_method?: 'zain_cash' | 'asiahawala' | 'fib' | 'qicard' | 'manual' | 'free'
          receipt_url?: string | null
          transaction_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          failure_reason?: string | null
          metadata?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          max_uses: number | null
          current_uses: number
          max_uses_per_user: number
          minimum_amount: number
          valid_from: string
          valid_until: string | null
          course_id: string | null
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          max_uses?: number | null
          current_uses?: number
          max_uses_per_user?: number
          minimum_amount?: number
          valid_from?: string
          valid_until?: string | null
          course_id?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          max_uses?: number | null
          current_uses?: number
          max_uses_per_user?: number
          minimum_amount?: number
          valid_from?: string
          valid_until?: string | null
          course_id?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          certificate_number: string
          issued_at: string
          pdf_url: string | null
          verification_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          certificate_number: string
          issued_at?: string
          pdf_url?: string | null
          verification_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          certificate_number?: string
          issued_at?: string
          pdf_url?: string | null
          verification_url?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          course_id: string
          rating: number
          title: string | null
          comment: string | null
          is_approved: boolean
          admin_reply: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          rating: number
          title?: string | null
          comment?: string | null
          is_approved?: boolean
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          is_approved?: boolean
          admin_reply?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          action_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          action_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          action_url?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Functions: {
      is_enrolled: {
        Args: { p_user_id: string; p_course_id: string }
        Returns: boolean
      }
      validate_coupon: {
        Args: { p_code: string; p_course_id?: string }
        Returns: {
          is_valid: boolean
          coupon_id: string | null
          discount_type: string | null
          discount_value: number
          error_message: string | null
        }[]
      }
    }
  }
}

// Types المساعدة
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Section = Database['public']['Tables']['sections']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type LessonProgress = Database['public']['Tables']['lesson_progress']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']
export type Certificate = Database['public']['Tables']['certificates']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Types مع Relations
export type CourseWithSections = Course & {
  sections: (Section & {
    lessons: Lesson[]
  })[]
}

export type EnrollmentWithCourse = Enrollment & {
  course: Course
}

export type LessonWithProgress = Lesson & {
  progress?: LessonProgress
}
