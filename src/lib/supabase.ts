import { createClient, SupabaseClient } from '@supabase/supabase-js';

const URL = import.meta.env.SUPABASE_URL!;
const ANON = import.meta.env.SUPABASE_ANON_KEY!;
const SERVICE = import.meta.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client with anon key (for client-side telemetry only)
export function supabasePublic(): SupabaseClient {
  if (!URL || !ANON) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be configured');
  }
  
  return createClient(URL, ANON, {
    auth: { persistSession: false }
  });
}

// Admin client with service role key (server-only, bypasses RLS)
export function supabaseAdmin(): SupabaseClient {
  if (!URL || !SERVICE) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
  }
  
  return createClient(URL, SERVICE, {
    auth: { persistSession: false }
  });
}

// Database schema types (can be generated with supabase gen types)
export interface Database {
  public: {
    Tables: {
      quiz_sessions: {
        Row: {
          session_id: string;
          started_at: string;
          completed_at: string | null;
          consent: boolean;
          consent_at: string | null;
          consent_text_version: string | null;
          nome: string | null;
          email: string | null;
          answers: any;
          flags: any;
          quiz_version: string | null;
          utm: any;
          created_ip: string | null;
          experiment_key: string | null;
          variant_key: string | null;
          experiment_version: string | null;
          assigned_at: string | null;
          assignment_method: string | null;
        };
        Insert: {
          session_id?: string;
          started_at?: string;
          completed_at?: string | null;
          consent?: boolean;
          consent_at?: string | null;
          consent_text_version?: string | null;
          nome?: string | null;
          email?: string | null;
          answers?: any;
          flags?: any;
          quiz_version?: string | null;
          utm?: any;
          created_ip?: string | null;
          experiment_key?: string | null;
          variant_key?: string | null;
          experiment_version?: string | null;
          assigned_at?: string | null;
          assignment_method?: string | null;
        };
        Update: {
          session_id?: string;
          started_at?: string;
          completed_at?: string | null;
          consent?: boolean;
          consent_at?: string | null;
          consent_text_version?: string | null;
          nome?: string | null;
          email?: string | null;
          answers?: any;
          flags?: any;
          quiz_version?: string | null;
          utm?: any;
          created_ip?: string | null;
          experiment_key?: string | null;
          variant_key?: string | null;
          experiment_version?: string | null;
          assigned_at?: string | null;
          assignment_method?: string | null;
        };
      };
      checkout_intents: {
        Row: {
          id: number;
          session_id: string;
          variant: string | null;
          provider: string;
          provider_checkout_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          session_id: string;
          variant?: string | null;
          provider?: string;
          provider_checkout_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          session_id?: string;
          variant?: string | null;
          provider?: string;
          provider_checkout_id?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      stripe_checkout: {
        Row: {
          checkout_id: string;
          session_id: string;
          price_id: string | null;
          amount: number | null;
          currency: string | null;
          metadata: any;
          created_at: string;
        };
        Insert: {
          checkout_id: string;
          session_id: string;
          price_id?: string | null;
          amount?: number | null;
          currency?: string | null;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          checkout_id?: string;
          session_id?: string;
          price_id?: string | null;
          amount?: number | null;
          currency?: string | null;
          metadata?: any;
          created_at?: string;
        };
      };
      webhook_events: {
        Row: {
          event_id: string;
          type: string;
          received_at: string;
          payload: any;
          processed_at: string | null;
          processing_error: string | null;
        };
        Insert: {
          event_id: string;
          type: string;
          received_at?: string;
          payload: any;
          processed_at?: string | null;
          processing_error?: string | null;
        };
        Update: {
          event_id?: string;
          type?: string;
          received_at?: string;
          payload?: any;
          processed_at?: string | null;
          processing_error?: string | null;
        };
      };
      payments: {
        Row: {
          payment_id: string;
          checkout_id: string;
          session_id: string;
          status: string;
          amount: number;
          currency: string;
          customer_email: string | null;
          fulfilled_at: string | null;
        };
        Insert: {
          payment_id: string;
          checkout_id: string;
          session_id: string;
          status: string;
          amount: number;
          currency?: string;
          customer_email?: string | null;
          fulfilled_at?: string | null;
        };
        Update: {
          payment_id?: string;
          checkout_id?: string;
          session_id?: string;
          status?: string;
          amount?: number;
          currency?: string;
          customer_email?: string | null;
          fulfilled_at?: string | null;
        };
      };
      users_app: {
        Row: {
          user_id: number;
          email: string;
          nome: string | null;
          created_at: string;
          last_login_at: string | null;
        };
        Insert: {
          user_id?: number;
          email: string;
          nome?: string | null;
          created_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          user_id?: number;
          email?: string;
          nome?: string | null;
          created_at?: string;
          last_login_at?: string | null;
        };
      };
      enrollments: {
        Row: {
          enrollment_id: number;
          user_id: number;
          product_code: string;
          origin_session_id: string | null;
          payment_id: string | null;
          status: string;
          fulfilled_at: string;
        };
        Insert: {
          enrollment_id?: number;
          user_id: number;
          product_code?: string;
          origin_session_id?: string | null;
          payment_id?: string | null;
          status?: string;
          fulfilled_at?: string;
        };
        Update: {
          enrollment_id?: number;
          user_id?: number;
          product_code?: string;
          origin_session_id?: string | null;
          payment_id?: string | null;
          status?: string;
          fulfilled_at?: string;
        };
      };
      magic_links: {
        Row: {
          token_hash: string;
          user_id: number;
          expires_at: string;
          used_at: string | null;
        };
        Insert: {
          token_hash: string;
          user_id: number;
          expires_at: string;
          used_at?: string | null;
        };
        Update: {
          token_hash?: string;
          user_id?: number;
          expires_at?: string;
          used_at?: string | null;
        };
      };
      email_log: {
        Row: {
          id: number;
          user_id: number | null;
          to_email: string;
          template: string;
          provider: string | null;
          message_id: string | null;
          sent_at: string;
          meta: any;
        };
        Insert: {
          id?: number;
          user_id?: number | null;
          to_email: string;
          template: string;
          provider?: string | null;
          message_id?: string | null;
          sent_at?: string;
          meta?: any;
        };
        Update: {
          id?: number;
          user_id?: number | null;
          to_email?: string;
          template?: string;
          provider?: string | null;
          message_id?: string | null;
          sent_at?: string;
          meta?: any;
        };
      };
      product_events: {
        Row: {
          id: number;
          session_id: string;
          event: string;
          ts: string;
          detail: any;
        };
        Insert: {
          id?: number;
          session_id: string;
          event: string;
          ts?: string;
          detail?: any;
        };
        Update: {
          id?: number;
          session_id?: string;
          event?: string;
          ts?: string;
          detail?: any;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
