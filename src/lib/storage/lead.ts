// Lead storage utilities - shared between /api/lead and checkout system
import type { LeadPayload } from '../types/lead';

// In-memory storage for development (use database in production)
const leadStore = new Map<string, LeadPayload>();
const idempotencyStore = new Map<string, boolean>();

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

// Store lead data
export const storeLead = async (payload: LeadPayload): Promise<boolean> => {
  try {
    // Store in memory (use database in production)
    leadStore.set(payload.sessionId, payload);
    
    console.log('Lead stored:', {
      sessionId: payload.sessionId,
      hasEmail: !!payload.email,
      hasName: !!payload.nome,
      consent: payload.consent,
      variant: payload.meta.variant,
      source: payload.meta.source
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
    const lead = leadStore.get(sessionId);
    if (!lead) {
      return null;
    }
    
    return {
      sessionId: lead.sessionId,
      nome: lead.nome,
      email: lead.email,
      consent: lead.consent,
      answers: lead.answers,
      flags: lead.flags,
      meta: lead.meta,
      completedAt: new Date(lead.completedAt),
      createdAt: new Date() // Placeholder since we don't store this
    };
  } catch (error) {
    console.error('Failed to retrieve lead:', error);
    return null;
  }
};

// Retrieve lead by email
export const getLeadByEmail = async (email: string): Promise<StoredLead | null> => {
  try {
    for (const [sessionId, lead] of leadStore) {
      if (lead.email === email) {
        return {
          sessionId: lead.sessionId,
          nome: lead.nome,
          email: lead.email,
          consent: lead.consent,
          answers: lead.answers,
          flags: lead.flags,
          meta: lead.meta,
          completedAt: new Date(lead.completedAt),
          createdAt: new Date()
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve lead by email:', error);
    return null;
  }
};

// Check idempotency for events/requests
export const checkIdempotency = (key: string): boolean => {
  return !idempotencyStore.has(key);
};

// Mark as processed for idempotency
export const markProcessed = (key: string): void => {
  idempotencyStore.set(key, true);
  
  // Clean up old entries (keep for 24h)
  setTimeout(() => {
    idempotencyStore.delete(key);
  }, 24 * 60 * 60 * 1000);
};

// Mask email for logging (e.g., test@example.com -> t***@example.com)
export const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@');
  if (user.length <= 1) return email;
  return `${user[0]}${'*'.repeat(Math.min(user.length - 1, 3))}@${domain}`;
};
