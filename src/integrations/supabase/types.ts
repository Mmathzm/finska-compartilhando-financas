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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string
          description: string
          icon: string
          id: string
          points: number
          requirement_type: string
          requirement_value: number
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description: string
          icon: string
          id?: string
          points: number
          requirement_type: string
          requirement_value: number
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string
          icon?: string
          id?: string
          points?: number
          requirement_type?: string
          requirement_value?: number
          title?: string
        }
        Relationships: []
      }
      bank_transfers: {
        Row: {
          account_type: string
          amount: number
          created_at: string
          description: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: string
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          amount: number
          category_id: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          created_at: string
          description: string
          difficulty: string
          duration_days: number
          id: string
          is_active: boolean
          requirement_category_id: string | null
          requirement_type: string
          requirement_value: number | null
          reward_points: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          difficulty: string
          duration_days: number
          id?: string
          is_active?: boolean
          requirement_category_id?: string | null
          requirement_type: string
          requirement_value?: number | null
          reward_points: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          duration_days?: number
          id?: string
          is_active?: boolean
          requirement_category_id?: string | null
          requirement_type?: string
          requirement_value?: number | null
          reward_points?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_requirement_category_id_fkey"
            columns: ["requirement_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          created_at: string
          currency_code: string
          currency_name: string
          id: string
          last_updated: string
          rate_to_brl: number
          source: string | null
        }
        Insert: {
          created_at?: string
          currency_code: string
          currency_name: string
          id?: string
          last_updated?: string
          rate_to_brl: number
          source?: string | null
        }
        Update: {
          created_at?: string
          currency_code?: string
          currency_name?: string
          id?: string
          last_updated?: string
          rate_to_brl?: number
          source?: string | null
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category_id: string | null
          created_at: string
          current_amount: number
          deadline: string | null
          description: string | null
          id: string
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          target_amount: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          description?: string | null
          id?: string
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_tips: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          priority: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          priority?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          priority?: number
          title?: string
        }
        Relationships: []
      }
      installment_plans: {
        Row: {
          category_id: string | null
          created_at: string
          current_installment: number
          description: string
          id: string
          installment_count: number
          installment_value: number
          start_date: string
          status: string
          total_amount: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          current_installment?: number
          description: string
          id?: string
          installment_count: number
          installment_value: number
          start_date?: string
          status?: string
          total_amount: number
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          current_installment?: number
          description?: string
          id?: string
          installment_count?: number
          installment_value?: number
          start_date?: string
          status?: string
          total_amount?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installment_plans_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      motivational_quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          quote: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          quote: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          quote?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_type: string | null
          bank_name: string | null
          card_brand: string | null
          card_holder_name: string | null
          card_last_four: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          is_default: boolean
          method_type: string
          pix_key: string | null
          pix_key_type: string | null
          updated_at: string
          user_id: string
          wallet_provider: string | null
        }
        Insert: {
          account_type?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          method_type: string
          pix_key?: string | null
          pix_key_type?: string | null
          updated_at?: string
          user_id: string
          wallet_provider?: string | null
        }
        Update: {
          account_type?: string | null
          bank_name?: string | null
          card_brand?: string | null
          card_holder_name?: string | null
          card_last_four?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          method_type?: string
          pix_key?: string | null
          pix_key_type?: string | null
          updated_at?: string
          user_id?: string
          wallet_provider?: string | null
        }
        Relationships: []
      }
      pix_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          pix_key: string
          status: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          pix_key: string
          status?: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          pix_key?: string
          status?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          amount: number | null
          category_id: string | null
          created_at: string
          description: string | null
          due_date: string
          frequency: Database["public"]["Enums"]["reminder_frequency"] | null
          id: string
          is_completed: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          frequency?: Database["public"]["Enums"]["reminder_frequency"] | null
          id?: string
          is_completed?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          frequency?: Database["public"]["Enums"]["reminder_frequency"] | null
          id?: string
          is_completed?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      report_exports: {
        Row: {
          created_at: string
          filters: Json | null
          format: string
          id: string
          period_end: string
          period_start: string
          report_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json | null
          format: string
          id?: string
          period_end: string
          period_start: string
          report_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json | null
          format?: string
          id?: string
          period_end?: string
          period_start?: string
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_filters: {
        Row: {
          created_at: string | null
          description: string | null
          filter_config: Json
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          filter_config: Json
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          filter_config?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shared_account_contributions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          shared_account_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          shared_account_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          shared_account_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_account_contributions_shared_account_id_fkey"
            columns: ["shared_account_id"]
            isOneToOne: false
            referencedRelation: "shared_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_account_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invited_by: string
          invited_email: string
          shared_account_id: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invited_by: string
          invited_email: string
          shared_account_id: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invited_by?: string
          invited_email?: string
          shared_account_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_account_invitations_shared_account_id_fkey"
            columns: ["shared_account_id"]
            isOneToOne: false
            referencedRelation: "shared_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_account_members: {
        Row: {
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["account_role"]
          shared_account_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["account_role"]
          shared_account_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["account_role"]
          shared_account_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_account_members_shared_account_id_fkey"
            columns: ["shared_account_id"]
            isOneToOne: false
            referencedRelation: "shared_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_accounts: {
        Row: {
          balance: number
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_report_access: {
        Row: {
          accessed_at: string | null
          can_edit: boolean | null
          created_at: string | null
          email: string | null
          id: string
          shared_report_id: string
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          can_edit?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          shared_report_id: string
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          can_edit?: boolean | null
          created_at?: string | null
          email?: string | null
          id?: string
          shared_report_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_report_access_shared_report_id_fkey"
            columns: ["shared_report_id"]
            isOneToOne: false
            referencedRelation: "shared_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_reports: {
        Row: {
          access_token: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_public: boolean | null
          owner_id: string
          period_end: string
          period_start: string
          report_config: Json
          report_type: string
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          owner_id: string
          period_end: string
          period_start: string
          report_config: Json
          report_type: string
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_public?: boolean | null
          owner_id?: string
          period_end?: string
          period_start?: string
          report_config?: Json
          report_type?: string
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          shared_account_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          shared_account_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          shared_account_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_transactions_shared_account"
            columns: ["shared_account_id"]
            isOneToOne: false
            referencedRelation: "shared_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          earned: boolean
          earned_at: string | null
          id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          earned?: boolean
          earned_at?: string | null
          id?: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          earned?: boolean
          earned_at?: string | null
          id?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action_description: string
          activity_type: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_description: string
          activity_type: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_description?: string
          activity_type?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          progress: number
          started_at: string
          status: string
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          started_at?: string
          status?: string
          target: number
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          started_at?: string
          status?: string
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_currency_conversions: {
        Row: {
          created_at: string
          exchange_rate: number
          from_amount: number
          from_currency: string
          id: string
          to_amount: number
          to_currency: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exchange_rate: number
          from_amount: number
          from_currency: string
          id?: string
          to_amount: number
          to_currency: string
          user_id: string
        }
        Update: {
          created_at?: string
          exchange_rate?: number
          from_amount?: number
          from_currency?: string
          id?: string
          to_amount?: number
          to_currency?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notification_preferences: {
        Row: {
          budget_alerts: boolean
          created_at: string
          email_notifications: boolean
          goal_updates: boolean
          id: string
          marketing_emails: boolean
          payment_reminders: boolean
          push_notifications: boolean
          transaction_alerts: boolean
          updated_at: string
          user_id: string
          weekly_reports: boolean
        }
        Insert: {
          budget_alerts?: boolean
          created_at?: string
          email_notifications?: boolean
          goal_updates?: boolean
          id?: string
          marketing_emails?: boolean
          payment_reminders?: boolean
          push_notifications?: boolean
          transaction_alerts?: boolean
          updated_at?: string
          user_id: string
          weekly_reports?: boolean
        }
        Update: {
          budget_alerts?: boolean
          created_at?: string
          email_notifications?: boolean
          goal_updates?: boolean
          id?: string
          marketing_emails?: boolean
          payment_reminders?: boolean
          push_notifications?: boolean
          transaction_alerts?: boolean
          updated_at?: string
          user_id?: string
          weekly_reports?: boolean
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_backup: boolean
          compact_view: boolean
          created_at: string
          currency: string
          date_format: string
          decimal_separator: string
          first_day_of_week: number
          id: string
          language: string
          show_animations: boolean
          theme: string
          thousands_separator: string
          time_format: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_backup?: boolean
          compact_view?: boolean
          created_at?: string
          currency?: string
          date_format?: string
          decimal_separator?: string
          first_day_of_week?: number
          id?: string
          language?: string
          show_animations?: boolean
          theme?: string
          thousands_separator?: string
          time_format?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_backup?: boolean
          compact_view?: boolean
          created_at?: string
          currency?: string
          date_format?: string
          decimal_separator?: string
          first_day_of_week?: number
          id?: string
          language?: string
          show_animations?: boolean
          theme?: string
          thousands_separator?: string
          time_format?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_privacy_settings: {
        Row: {
          allow_data_collection: boolean
          allow_third_party_sharing: boolean
          biometric_enabled: boolean
          created_at: string
          id: string
          login_alerts: boolean
          profile_visibility: string
          session_timeout: number
          show_financial_stats: boolean
          suspicious_activity_alerts: boolean
          two_factor_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_data_collection?: boolean
          allow_third_party_sharing?: boolean
          biometric_enabled?: boolean
          created_at?: string
          id?: string
          login_alerts?: boolean
          profile_visibility?: string
          session_timeout?: number
          show_financial_stats?: boolean
          suspicious_activity_alerts?: boolean
          two_factor_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_data_collection?: boolean
          allow_third_party_sharing?: boolean
          biometric_enabled?: boolean
          created_at?: string
          id?: string
          login_alerts?: boolean
          profile_visibility?: string
          session_timeout?: number
          show_financial_stats?: boolean
          suspicious_activity_alerts?: boolean
          two_factor_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          level: number
          level_name: string
          longest_streak: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          level_name?: string
          longest_streak?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          level?: number
          level_name?: string
          longest_streak?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_contribution_to_shared_account: {
        Args: { p_account_id: string; p_amount: number; p_description?: string }
        Returns: undefined
      }
      cleanup_expired_shared_reports: { Args: never; Returns: undefined }
      create_default_categories: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      increment_report_views: {
        Args: { p_access_token?: string; p_report_id: string }
        Returns: undefined
      }
      is_shared_account_member: {
        Args: { account_id: string }
        Returns: boolean
      }
      is_shared_account_owner: {
        Args: { account_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_role: "owner" | "member"
      reminder_frequency: "daily" | "weekly" | "monthly" | "yearly"
      transaction_type: "income" | "expense"
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
      account_role: ["owner", "member"],
      reminder_frequency: ["daily", "weekly", "monthly", "yearly"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
