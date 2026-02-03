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
          // Import metadata
          import_source: string | null
          original_meeting_date: string | null
          meeting_participants: string[] | null
          // Customer Register links
          account_id: string | null
          contact_id: string | null
          interaction_id: string | null
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
          // Import metadata
          import_source?: string | null
          original_meeting_date?: string | null
          meeting_participants?: string[] | null
          // Customer Register links
          account_id?: string | null
          contact_id?: string | null
          interaction_id?: string | null
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
          // Import metadata
          import_source?: string | null
          original_meeting_date?: string | null
          meeting_participants?: string[] | null
          // Customer Register links
          account_id?: string | null
          contact_id?: string | null
          interaction_id?: string | null
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
          product_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          keywords: string[]
          response_type: 'objection' | 'battlecard' | 'offer' | 'solution' | 'expand'
          category?: string | null
          product_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          keywords?: string[]
          response_type?: 'objection' | 'battlecard' | 'offer' | 'solution' | 'expand'
          category?: string | null
          product_id?: string | null
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
          product_id: string | null
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
          product_id?: string | null
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
          product_id?: string | null
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
          product_id: string | null
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
          product_id?: string | null
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
          product_id?: string | null
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
          product_id: string | null
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
          product_id?: string | null
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
          product_id?: string | null
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
          product_id: string | null
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
          product_id?: string | null
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
          product_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_profiles: {
        Row: {
          id: string
          name: string
          description: string | null
          industry: string | null
          target_audience: string | null
          key_features: Json
          value_propositions: Json
          common_objections: Json
          pricing_model: string | null
          pricing_details: Json | null
          logo_url: string | null
          website_url: string | null
          metadata: Json
          organization_id: string | null
          user_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          industry?: string | null
          target_audience?: string | null
          key_features?: Json
          value_propositions?: Json
          common_objections?: Json
          pricing_model?: string | null
          pricing_details?: Json | null
          logo_url?: string | null
          website_url?: string | null
          metadata?: Json
          organization_id?: string | null
          user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          industry?: string | null
          target_audience?: string | null
          key_features?: Json
          value_propositions?: Json
          common_objections?: Json
          pricing_model?: string | null
          pricing_details?: Json | null
          logo_url?: string | null
          website_url?: string | null
          metadata?: Json
          organization_id?: string | null
          user_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          id: string
          product_id: string | null
          source_type: 'pdf' | 'docx' | 'url' | 'text' | 'other'
          source_url: string | null
          file_name: string | null
          file_size_bytes: number | null
          title: string | null
          content: string | null
          processed_content: string | null
          summary: string | null
          embedding: string | null
          chunk_index: number
          total_chunks: number
          parent_document_id: string | null
          metadata: Json
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          processing_error: string | null
          uploaded_by: string | null
          created_at: string
          updated_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          source_type: 'pdf' | 'docx' | 'url' | 'text' | 'other'
          source_url?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          title?: string | null
          content?: string | null
          processed_content?: string | null
          summary?: string | null
          embedding?: string | null
          chunk_index?: number
          total_chunks?: number
          parent_document_id?: string | null
          metadata?: Json
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          processing_error?: string | null
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          source_type?: 'pdf' | 'docx' | 'url' | 'text' | 'other'
          source_url?: string | null
          file_name?: string | null
          file_size_bytes?: number | null
          title?: string | null
          content?: string | null
          processed_content?: string | null
          summary?: string | null
          embedding?: string | null
          chunk_index?: number
          total_chunks?: number
          parent_document_id?: string | null
          metadata?: Json
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          processing_error?: string | null
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "product_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_base_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
          voice_name: string | null
          product_id: string | null
          auto_generated: boolean
          knowledge_base_refs: Json
          generation_prompt: string | null
          generation_metadata: Json
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
          voice_name?: string | null
          product_id?: string | null
          auto_generated?: boolean
          knowledge_base_refs?: Json
          generation_prompt?: string | null
          generation_metadata?: Json
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
          voice_name?: string | null
          product_id?: string | null
          auto_generated?: boolean
          knowledge_base_refs?: Json
          generation_prompt?: string | null
          generation_metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_needs_mapping: {
        Row: {
          id: string
          call_session_id: string
          user_id: string
          need_category: string
          specific_need: string
          need_priority: string | null
          pain_level: number | null
          customer_quote: string | null
          suggested_product_id: string | null
          suggested_feature: string | null
          coverage_score: number | null
          has_gap: boolean | null
          gap_description: string | null
          workaround: string | null
          competitive_advantage: boolean | null
          estimated_impact: string | null
          revenue_opportunity: number | null
          requires_followup: boolean | null
          followup_action: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          call_session_id: string
          user_id: string
          need_category: string
          specific_need: string
          need_priority?: string | null
          pain_level?: number | null
          customer_quote?: string | null
          suggested_product_id?: string | null
          suggested_feature?: string | null
          coverage_score?: number | null
          has_gap?: boolean | null
          gap_description?: string | null
          workaround?: string | null
          competitive_advantage?: boolean | null
          estimated_impact?: string | null
          revenue_opportunity?: number | null
          requires_followup?: boolean | null
          followup_action?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          call_session_id?: string
          user_id?: string
          need_category?: string
          specific_need?: string
          need_priority?: string | null
          pain_level?: number | null
          customer_quote?: string | null
          suggested_product_id?: string | null
          suggested_feature?: string | null
          coverage_score?: number | null
          has_gap?: boolean | null
          gap_description?: string | null
          workaround?: string | null
          competitive_advantage?: boolean | null
          estimated_impact?: string | null
          revenue_opportunity?: number | null
          requires_followup?: boolean | null
          followup_action?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_needs_mapping_call_session_id_fkey"
            columns: ["call_session_id"]
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_needs_mapping_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_needs_mapping_suggested_product_id_fkey"
            columns: ["suggested_product_id"]
            referencedRelation: "product_profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          company_name: string
          org_number: string | null
          industry: string | null
          company_size: '1-50' | '51-200' | '201-1000' | '1000+' | null
          website: string | null
          address_street: string | null
          address_city: string | null
          address_postal_code: string | null
          address_country: string | null
          account_status: 'active' | 'inactive' | 'prospect' | 'customer' | 'churned' | null
          lifecycle_stage: 'prospect' | 'qualified' | 'opportunity' | 'customer' | 'champion' | null
          estimated_annual_value: number | null
          notes: string | null
          tags: string[] | null
          data_completeness: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          org_number?: string | null
          industry?: string | null
          company_size?: '1-50' | '51-200' | '201-1000' | '1000+' | null
          website?: string | null
          address_street?: string | null
          address_city?: string | null
          address_postal_code?: string | null
          address_country?: string | null
          account_status?: 'active' | 'inactive' | 'prospect' | 'customer' | 'churned' | null
          lifecycle_stage?: 'prospect' | 'qualified' | 'opportunity' | 'customer' | 'champion' | null
          estimated_annual_value?: number | null
          notes?: string | null
          tags?: string[] | null
          data_completeness?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          org_number?: string | null
          industry?: string | null
          company_size?: '1-50' | '51-200' | '201-1000' | '1000+' | null
          website?: string | null
          address_street?: string | null
          address_city?: string | null
          address_postal_code?: string | null
          address_country?: string | null
          account_status?: 'active' | 'inactive' | 'prospect' | 'customer' | 'churned' | null
          lifecycle_stage?: 'prospect' | 'qualified' | 'opportunity' | 'customer' | 'champion' | null
          estimated_annual_value?: number | null
          notes?: string | null
          tags?: string[] | null
          data_completeness?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contacts: {
        Row: {
          id: string
          account_id: string
          user_id: string
          first_name: string
          last_name: string
          role: string | null
          department: string | null
          email: string | null
          phone: string | null
          mobile: string | null
          linkedin_url: string | null
          is_primary: boolean | null
          is_decision_maker: boolean | null
          contact_status: 'active' | 'inactive' | 'left_company' | null
          notes: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          user_id: string
          first_name: string
          last_name: string
          role?: string | null
          department?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          linkedin_url?: string | null
          is_primary?: boolean | null
          is_decision_maker?: boolean | null
          contact_status?: 'active' | 'inactive' | 'left_company' | null
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          role?: string | null
          department?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          linkedin_url?: string | null
          is_primary?: boolean | null
          is_decision_maker?: boolean | null
          contact_status?: 'active' | 'inactive' | 'left_company' | null
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      interactions: {
        Row: {
          id: string
          account_id: string
          contact_id: string | null
          user_id: string
          interaction_type: 'call' | 'meeting' | 'email' | 'demo' | 'follow_up' | 'note'
          interaction_date: string
          duration_minutes: number | null
          subject: string | null
          summary: string | null
          outcome: 'success' | 'follow_up_needed' | 'no_interest' | 'closed_won' | 'closed_lost' | null
          next_steps: string | null
          follow_up_date: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          contact_id?: string | null
          user_id: string
          interaction_type: 'call' | 'meeting' | 'email' | 'demo' | 'follow_up' | 'note'
          interaction_date?: string
          duration_minutes?: number | null
          subject?: string | null
          summary?: string | null
          outcome?: 'success' | 'follow_up_needed' | 'no_interest' | 'closed_won' | 'closed_lost' | null
          next_steps?: string | null
          follow_up_date?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          contact_id?: string | null
          user_id?: string
          interaction_type?: 'call' | 'meeting' | 'email' | 'demo' | 'follow_up' | 'note'
          interaction_date?: string
          duration_minutes?: number | null
          subject?: string | null
          summary?: string | null
          outcome?: 'success' | 'follow_up_needed' | 'no_interest' | 'closed_won' | 'closed_lost' | null
          next_steps?: string | null
          follow_up_date?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      questionnaire_answers: {
        Row: {
          id: string
          account_id: string
          session_id: string | null
          user_id: string
          question_id: string
          question_text: string
          answer: string
          source: 'manual' | 'ai_auto_fill' | 'live_analysis'
          confidence: 'high' | 'medium' | 'low' | null
          source_quote: string | null
          answer_version: number | null
          previous_answer: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          session_id?: string | null
          user_id: string
          question_id: string
          question_text: string
          answer: string
          source: 'manual' | 'ai_auto_fill' | 'live_analysis'
          confidence?: 'high' | 'medium' | 'low' | null
          source_quote?: string | null
          answer_version?: number | null
          previous_answer?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          session_id?: string | null
          user_id?: string
          question_id?: string
          question_text?: string
          answer?: string
          source?: 'manual' | 'ai_auto_fill' | 'live_analysis'
          confidence?: 'high' | 'medium' | 'low' | null
          source_quote?: string | null
          answer_version?: number | null
          previous_answer?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_answers_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_answers_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "call_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_answers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_products: {
        Row: {
          id: string
          user_id: string
          product_id: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_products_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_products_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "product_profiles"
            referencedColumns: ["id"]
          }
        ]
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
