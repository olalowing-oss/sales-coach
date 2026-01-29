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
      call_sessions: {
        Row: {
          id: string
          user_id: string | null
          status: 'idle' | 'recording' | 'paused' | 'stopped'
          started_at: string
          ended_at: string | null
          customer_name: string | null
          customer_company: string | null
          customer_role: string | null
          full_transcript: string | null
          duration_seconds: number | null
          sentiment: 'positive' | 'neutral' | 'negative' | null
          topics: string[] | null
          // Analysis fields
          industry: string | null
          company_size: '1-50' | '51-200' | '201-1000' | '1000+' | null
          call_purpose: 'Prospektering' | 'Demo' | 'Uppföljning' | 'Förhandling' | 'Closing' | null
          call_outcome: 'Bokat möte' | 'Skickat offert' | 'Behöver tänka' | 'Nej tack' | 'Uppföljning krävs' | 'Avslutad affär' | null
          interest_level: 'Hög' | 'Medel' | 'Låg' | null
          estimated_value: number | null
          decision_timeframe: 'Omedelbart' | '1-3 månader' | '3-6 månader' | '6-12 månader' | 'Okänt' | null
          probability: number | null
          products_discussed: string[] | null
          competitors_mentioned: string[] | null
          objections_raised: string[] | null
          pain_points: string[] | null
          next_steps: string | null
          follow_up_date: string | null
          notes: string | null
          ai_summary: string | null
          key_topics: string[] | null
          analyzed_at: string | null
          is_analyzed: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status: 'idle' | 'recording' | 'paused' | 'stopped'
          started_at?: string
          ended_at?: string | null
          customer_name?: string | null
          customer_company?: string | null
          customer_role?: string | null
          full_transcript?: string | null
          duration_seconds?: number | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          topics?: string[] | null
          // Analysis fields
          industry?: string | null
          company_size?: '1-50' | '51-200' | '201-1000' | '1000+' | null
          call_purpose?: 'Prospektering' | 'Demo' | 'Uppföljning' | 'Förhandling' | 'Closing' | null
          call_outcome?: 'Bokat möte' | 'Skickat offert' | 'Behöver tänka' | 'Nej tack' | 'Uppföljning krävs' | 'Avslutad affär' | null
          interest_level?: 'Hög' | 'Medel' | 'Låg' | null
          estimated_value?: number | null
          decision_timeframe?: 'Omedelbart' | '1-3 månader' | '3-6 månader' | '6-12 månader' | 'Okänt' | null
          probability?: number | null
          products_discussed?: string[] | null
          competitors_mentioned?: string[] | null
          objections_raised?: string[] | null
          pain_points?: string[] | null
          next_steps?: string | null
          follow_up_date?: string | null
          notes?: string | null
          ai_summary?: string | null
          key_topics?: string[] | null
          analyzed_at?: string | null
          is_analyzed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: 'idle' | 'recording' | 'paused' | 'stopped'
          started_at?: string
          ended_at?: string | null
          customer_name?: string | null
          customer_company?: string | null
          customer_role?: string | null
          full_transcript?: string | null
          duration_seconds?: number | null
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          topics?: string[] | null
          // Analysis fields
          industry?: string | null
          company_size?: '1-50' | '51-200' | '201-1000' | '1000+' | null
          call_purpose?: 'Prospektering' | 'Demo' | 'Uppföljning' | 'Förhandling' | 'Closing' | null
          call_outcome?: 'Bokat möte' | 'Skickat offert' | 'Behöver tänka' | 'Nej tack' | 'Uppföljning krävs' | 'Avslutad affär' | null
          interest_level?: 'Hög' | 'Medel' | 'Låg' | null
          estimated_value?: number | null
          decision_timeframe?: 'Omedelbart' | '1-3 månader' | '3-6 månader' | '6-12 månader' | 'Okänt' | null
          probability?: number | null
          products_discussed?: string[] | null
          competitors_mentioned?: string[] | null
          objections_raised?: string[] | null
          pain_points?: string[] | null
          next_steps?: string | null
          follow_up_date?: string | null
          notes?: string | null
          ai_summary?: string | null
          key_topics?: string[] | null
          analyzed_at?: string | null
          is_analyzed?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transcript_segments: {
        Row: {
          id: string
          session_id: string
          text: string
          timestamp_ms: number
          speaker: 'seller' | 'customer' | 'unknown' | null
          confidence: number | null
          is_final: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          text: string
          timestamp_ms: number
          speaker?: 'seller' | 'customer' | 'unknown' | null
          confidence?: number | null
          is_final?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          text?: string
          timestamp_ms?: number
          speaker?: 'seller' | 'customer' | 'unknown' | null
          confidence?: number | null
          is_final?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      session_coaching_tips: {
        Row: {
          id: string
          session_id: string
          type: 'suggestion' | 'battlecard' | 'objection' | 'offer' | 'case' | 'warning'
          priority: 'high' | 'medium' | 'low'
          trigger_keyword: string
          title: string
          content: string
          talking_points: string[] | null
          was_dismissed: boolean | null
          related_offer_id: string | null
          related_case_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          type: 'suggestion' | 'battlecard' | 'objection' | 'offer' | 'case' | 'warning'
          priority: 'high' | 'medium' | 'low'
          trigger_keyword: string
          title: string
          content: string
          talking_points?: string[] | null
          was_dismissed?: boolean | null
          related_offer_id?: string | null
          related_case_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          type?: 'suggestion' | 'battlecard' | 'objection' | 'offer' | 'case' | 'warning'
          priority?: 'high' | 'medium' | 'low'
          trigger_keyword?: string
          title?: string
          content?: string
          talking_points?: string[] | null
          was_dismissed?: boolean | null
          related_offer_id?: string | null
          related_case_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      trigger_patterns: {
        Row: {
          id: string
          user_id: string | null
          keywords: string[]
          response_type: 'objection' | 'battlecard' | 'offer' | 'solution' | 'expand'
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          keywords: string[]
          response_type: 'objection' | 'battlecard' | 'offer' | 'solution' | 'expand'
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          keywords?: string[]
          response_type?: 'objection' | 'battlecard' | 'offer' | 'solution' | 'expand'
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      battlecards: {
        Row: {
          id: string
          user_id: string | null
          competitor: string
          their_strengths: string[]
          their_weaknesses: string[]
          our_advantages: string[]
          talking_points: string[]
          common_objections: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          competitor: string
          their_strengths: string[]
          their_weaknesses: string[]
          our_advantages: string[]
          talking_points: string[]
          common_objections?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          competitor?: string
          their_strengths?: string[]
          their_weaknesses?: string[]
          our_advantages?: string[]
          talking_points?: string[]
          common_objections?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      objection_handlers: {
        Row: {
          id: string
          user_id: string | null
          objection: string
          triggers: string[]
          category: 'price' | 'timing' | 'competition' | 'trust' | 'need'
          response_short: string
          response_detailed: string
          followup_questions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          objection: string
          triggers: string[]
          category: 'price' | 'timing' | 'competition' | 'trust' | 'need'
          response_short: string
          response_detailed: string
          followup_questions: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          objection?: string
          triggers?: string[]
          category?: 'price' | 'timing' | 'competition' | 'trust' | 'need'
          response_short?: string
          response_detailed?: string
          followup_questions?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_studies: {
        Row: {
          id: string
          user_id: string | null
          customer: string
          industry: string
          challenge: string
          solution: string
          results: string[]
          quote: string | null
          is_public: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          customer: string
          industry: string
          challenge: string
          solution: string
          results: string[]
          quote?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          customer?: string
          industry?: string
          challenge?: string
          solution?: string
          results?: string[]
          quote?: string | null
          is_public?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          id: string
          user_id: string | null
          name: string
          short_description: string
          full_description: string
          deliverables: string[]
          duration: string
          price_min: number
          price_max: number
          price_unit: 'fixed' | 'hourly' | 'daily'
          target_audience: string[] | null
          related_cases: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          short_description: string
          full_description: string
          deliverables: string[]
          duration: string
          price_min: number
          price_max: number
          price_unit: 'fixed' | 'hourly' | 'daily'
          target_audience?: string[] | null
          related_cases?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          short_description?: string
          full_description?: string
          deliverables?: string[]
          duration?: string
          price_min?: number
          price_max?: number
          price_unit?: 'fixed' | 'hourly' | 'daily'
          target_audience?: string[] | null
          related_cases?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_scenarios: {
        Row: {
          id: string
          user_id: string | null
          name: string
          difficulty: 'easy' | 'medium' | 'hard'
          description: string
          persona_name: string
          persona_role: string
          company_name: string
          company_size: string
          industry: string
          pain_points: string[]
          budget: string
          decision_timeframe: string
          personality: string
          objectives: string[]
          competitors: string[]
          opening_line: string
          success_criteria: string[]
          common_mistakes: string[]
          is_global: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          difficulty: 'easy' | 'medium' | 'hard'
          description: string
          persona_name: string
          persona_role: string
          company_name: string
          company_size: string
          industry: string
          pain_points: string[]
          budget: string
          decision_timeframe: string
          personality: string
          objectives: string[]
          competitors: string[]
          opening_line: string
          success_criteria: string[]
          common_mistakes: string[]
          is_global?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          description?: string
          persona_name?: string
          persona_role?: string
          company_name?: string
          company_size?: string
          industry?: string
          pain_points?: string[]
          budget?: string
          decision_timeframe?: string
          personality?: string
          objectives?: string[]
          competitors?: string[]
          opening_line?: string
          success_criteria?: string[]
          common_mistakes?: string[]
          is_global?: boolean
          created_at?: string
          updated_at?: string
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
  }
}
