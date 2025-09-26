// Lead storage utilities using Supabase - server-side only
import type { LeadPayload } from '../types/lead';
import { supabaseAdmin } from '../supabase';

export interface StoredLead {
  sessionId: string;
  nome: string;
  email: string;
  consent: boolean;
  answers: LeadPayload['answers'];
  flags: LeadPayload['flags'];
  meta: LeadPayload['meta'];
  completedAt: Date;
  createdAt: Date;
}

// Store lead data (upsert based on session_id)
export const storeLead = async (payload: LeadPayload): Promise<boolean> => {
  try {
    const supabase = supabaseAdmin();
    
    // Get client IP from payload meta if available
    const clientIP = payload.meta?.ip || null;
    
    // Upsert quiz session
    const { error } = await supabase
      .from('quiz_sessions')
      .upsert({
        session_id: payload.sessionId,
        nome: payload.nome,
        email: payload.email,
        consent: payload.consent,
        consent_at: payload.consent ? new Date().toISOString() : null,
        consent_text_version: 'v1.0',
        answers: payload.answers || {},
        flags: payload.flags || {},
        quiz_version: 'v1',
        utm: payload.meta?.utm || {},
        created_ip: clientIP,
        experiment_key: payload.meta?.experiment?.key || null,
        variant_key: payload.meta?.variant || null,
        experiment_version: payload.meta?.experiment?.version || null,
        assigned_at: payload.meta?.experiment?.assignedAt ? new Date(payload.meta.experiment.assignedAt).toISOString() : null,
        assignment_method: payload.meta?.experiment?.method || null,
        completed_at: payload.completedAt ? new Date(payload.completedAt).toISOString() : null
      }, {
        onConflict: 'session_id'
      });
    
    if (error) {
      console.error('Failed to store lead:', error);
      return false;
    }
    
    console.log('Lead stored:', {
      sessionId: payload.sessionId,
      hasEmail: !!payload.email,
      hasName: !!payload.nome,
      consent: payload.consent,
      variant: payload.meta?.variant,
      source: payload.meta?.source
    });
    
    return true;
  } catch (error) {
    console.error('Failed to store lead:', error);
    return false;
  }
};

// Retrieve lead by sessionId
export const getLeadBySessionId = async (sessionId: string): Promise<StoredLead | null> => {
  try {
    const supabase = supabaseAdmin();
    
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();
    
    if (error || !data) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error('Failed to retrieve lead:', error);
      }
      return null;
    }
    
    return {
      sessionId: data.session_id,
      nome: data.nome || '',
      email: data.email || '',
      consent: data.consent,
      answers: data.answers || {},
      flags: data.flags || {},
      meta: {
        variant: data.variant_key,
        utm: data.utm || {},
        experiment: data.experiment_key ? {
          key: data.experiment_key,
          version: data.experiment_version,
          assignedAt: data.assigned_at ? new Date(data.assigned_at).getTime() : undefined,
          method: data.assignment_method
        } : undefined
      },
      completedAt: data.completed_at ? new Date(data.completed_at) : new Date(),
      createdAt: new Date(data.started_at)
    };
  } catch (error) {
    console.error('Failed to retrieve lead:', error);
    return null;
  }
};

// Retrieve lead by email
export const getLeadByEmail = async (email: string): Promise<StoredLead | null> => {
  try {
    const supabase = supabaseAdmin();
    
    const { data, error } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('email', email)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error('Failed to retrieve lead by email:', error);
      }
      return null;
    }
    
    return {
      sessionId: data.session_id,
      nome: data.nome || '',
      email: data.email || '',
      consent: data.consent,
      answers: data.answers || {},
      flags: data.flags || {},
      meta: {
        variant: data.variant_key,
        utm: data.utm || {},
        experiment: data.experiment_key ? {
          key: data.experiment_key,
          version: data.experiment_version,
          assignedAt: data.assigned_at ? new Date(data.assigned_at).getTime() : undefined,
          method: data.assignment_method
        } : undefined
      },
      completedAt: data.completed_at ? new Date(data.completed_at) : new Date(),
      createdAt: new Date(data.started_at)
    };
  } catch (error) {
    console.error('Failed to retrieve lead by email:', error);
    return null;
  }
};

// Check idempotency for events/requests using webhook_events table
export const checkIdempotency = async (eventId: string): Promise<boolean> => {
  try {
    const supabase = supabaseAdmin();
    
    const { data, error } = await supabase
      .from('webhook_events')
      .select('event_id')
      .eq('event_id', eventId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Failed to check idempotency:', error);
      return false;
    }
    
    return !data; // If no record exists, it's a new event
  } catch (error) {
    console.error('Failed to check idempotency:', error);
    return false;
  }
};

// Mark as processed for idempotency
export const markProcessed = async (eventId: string, eventType: string, payload?: any): Promise<void> => {
  try {
    const supabase = supabaseAdmin();
    
    await supabase
      .from('webhook_events')
      .upsert({
        event_id: eventId,
        type: eventType,
        payload: payload || {},
        processed_at: new Date().toISOString()
      }, {
        onConflict: 'event_id'
      });
  } catch (error) {
    console.error('Failed to mark as processed:', error);
  }
};

// Mask email for logging (e.g., test@example.com -> t***@example.com)
export const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@');
  if (user.length <= 1) return email;
  return `${user[0]}${'*'.repeat(Math.min(user.length - 1, 3))}@${domain}`;
};

// Create checkout intent (idempotent per session)
export const createCheckoutIntent = async (
  sessionId: string, 
  variant: string, 
  checkoutId?: string
): Promise<{ id: number; created: boolean } | null> => {
  try {
    const supabase = supabaseAdmin();
    
    // First try to get existing intent
    const { data: existing } = await supabase
      .from('checkout_intents')
      .select('id')
      .eq('session_id', sessionId)
      .single();
    
    if (existing) {
      return { id: existing.id, created: false };
    }
    
    // Create new intent
    const { data, error } = await supabase
      .from('checkout_intents')
      .insert({
        session_id: sessionId,
        variant: variant,
        provider: 'stripe',
        provider_checkout_id: checkoutId,
        status: checkoutId ? 'redirected' : 'created'
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Failed to create checkout intent:', error);
      return null;
    }
    
    return { id: data.id, created: true };
  } catch (error) {
    console.error('Failed to create checkout intent:', error);
    return null;
  }
};

// Store Stripe checkout session
export const storeStripeCheckout = async (
  checkoutId: string,
  sessionId: string,
  priceId: string,
  amount: number,
  metadata: any
): Promise<boolean> => {
  try {
    const supabase = supabaseAdmin();
    
    const { error } = await supabase
      .from('stripe_checkout')
      .upsert({
        checkout_id: checkoutId,
        session_id: sessionId,
        price_id: priceId,
        amount: amount,
        currency: 'BRL',
        metadata: metadata
      }, {
        onConflict: 'checkout_id'
      });
    
    if (error) {
      console.error('Failed to store Stripe checkout:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to store Stripe checkout:', error);
    return false;
  }
};

// Store webhook event (idempotent)
export const storeWebhookEvent = async (
  eventId: string,
  eventType: string,
  payload: any
): Promise<boolean> => {
  try {
    const supabase = supabaseAdmin();
    
    const { error } = await supabase
      .from('webhook_events')
      .upsert({
        event_id: eventId,
        type: eventType,
        payload: payload,
        received_at: new Date().toISOString()
      }, {
        onConflict: 'event_id'
      });
    
    if (error) {
      console.error('Failed to store webhook event:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to store webhook event:', error);
    return false;
  }
};

// Mark webhook event as processed
export const markWebhookProcessed = async (
  eventId: string,
  error?: string
): Promise<boolean> => {
  try {
    const supabase = supabaseAdmin();
    
    const { error: updateError } = await supabase
      .from('webhook_events')
      .update({
        processed_at: new Date().toISOString(),
        processing_error: error || null
      })
      .eq('event_id', eventId);
    
    if (updateError) {
      console.error('Failed to mark webhook as processed:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to mark webhook as processed:', error);
    return false;
  }
};

// Store payment
export const storePayment = async (
  paymentId: string,
  checkoutId: string,
  sessionId: string,
  status: string,
  amount: number,
  customerEmail?: string,
  currency: string = 'BRL'
): Promise<boolean> => {
  try {
    const supabase = supabaseAdmin();
    
    const { error } = await supabase
      .from('payments')
      .upsert({
        payment_id: paymentId,
        checkout_id: checkoutId,
        session_id: sessionId,
        status: status,
        amount: amount,
        currency: currency,
        customer_email: customerEmail,
        fulfilled_at: status === 'succeeded' ? new Date().toISOString() : null
      }, {
        onConflict: 'payment_id'
      });
    
    if (error) {
      console.error('Failed to store payment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to store payment:', error);
    return false;
  }
};

// Get Stripe checkout session data
export const getStripeCheckout = async (checkoutId: string): Promise<any | null> => {
  try {
    const supabase = supabaseAdmin();
    
    const { data, error } = await supabase
      .from('stripe_checkout')
      .select('*')
      .eq('checkout_id', checkoutId)
      .single();
    
    if (error || !data) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error('Failed to get Stripe checkout:', error);
      }
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get Stripe checkout:', error);
    return null;
  }
};
