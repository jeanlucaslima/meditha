// Client-side telemetry utilities (optional, non-PII only)
import { supabasePublic } from '../supabase';

// Log event to product_events table (client-side, no PII)
export async function logEvent(sessionId: string, event: string, detail?: any): Promise<void> {
  // Skip if no session ID
  if (!sessionId || typeof sessionId !== 'string') {
    return;
  }
  
  try {
    // Ensure we never send PII in client telemetry
    const sanitizedDetail = sanitizeDetail(detail);
    
    const supabase = supabasePublic();
    await supabase
      .from('product_events')
      .insert({
        session_id: sessionId,
        event: event,
        detail: sanitizedDetail
      });
  } catch (error) {
    // Silently fail on client side to avoid blocking user experience
    console.debug('Failed to log telemetry event:', error);
  }
}

// Sanitize detail object to remove PII
function sanitizeDetail(detail: any): any {
  if (!detail || typeof detail !== 'object') {
    return detail || {};
  }
  
  const sanitized = { ...detail };
  
  // Remove common PII fields
  const piiFields = [
    'email', 'nome', 'name', 'firstName', 'lastName',
    'phone', 'address', 'ip', 'userAgent',
    'password', 'token', 'key', 'secret'
  ];
  
  piiFields.forEach(field => {
    delete sanitized[field];
  });
  
  // Recursively sanitize nested objects
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeDetail(sanitized[key]);
    }
  });
  
  return sanitized;
}

// Common telemetry events
export const TelemetryEvents = {
  // Quiz events
  QUIZ_STARTED: 'quiz_started',
  QUIZ_STEP_VIEWED: 'quiz_step_viewed',
  QUIZ_STEP_COMPLETED: 'quiz_step_completed',
  QUIZ_COMPLETED: 'quiz_completed',
  QUIZ_ABANDONED: 'quiz_abandoned',
  
  // Lead events
  LEAD_FORM_VIEWED: 'lead_form_viewed',
  LEAD_FORM_SUBMITTED: 'lead_form_submitted',
  CONSENT_GIVEN: 'consent_given',
  
  // Checkout events
  CHECKOUT_INITIATED: 'checkout_initiated',
  CHECKOUT_REDIRECT: 'checkout_redirect',
  CHECKOUT_CANCELLED: 'checkout_cancelled',
  
  // Page events
  PAGE_VIEW: 'page_view',
  PAGE_EXIT: 'page_exit',
  
  // Error events
  CLIENT_ERROR: 'client_error',
  API_ERROR: 'api_error'
} as const;

// Helper functions for common events
export const telemetry = {
  // Quiz telemetry
  quizStarted: (sessionId: string, variant?: string) => 
    logEvent(sessionId, TelemetryEvents.QUIZ_STARTED, { variant }),
  
  quizStepViewed: (sessionId: string, step: number, variant?: string) =>
    logEvent(sessionId, TelemetryEvents.QUIZ_STEP_VIEWED, { step, variant }),
  
  quizStepCompleted: (sessionId: string, step: number, answer?: any, variant?: string) =>
    logEvent(sessionId, TelemetryEvents.QUIZ_STEP_COMPLETED, { 
      step, 
      answer: sanitizeDetail(answer),
      variant 
    }),
  
  quizCompleted: (sessionId: string, totalSteps: number, variant?: string) =>
    logEvent(sessionId, TelemetryEvents.QUIZ_COMPLETED, { totalSteps, variant }),
  
  quizAbandoned: (sessionId: string, lastStep: number, variant?: string) =>
    logEvent(sessionId, TelemetryEvents.QUIZ_ABANDONED, { lastStep, variant }),
  
  // Lead form telemetry
  leadFormViewed: (sessionId: string, variant?: string) =>
    logEvent(sessionId, TelemetryEvents.LEAD_FORM_VIEWED, { variant }),
  
  leadFormSubmitted: (sessionId: string, variant?: string) =>
    logEvent(sessionId, TelemetryEvents.LEAD_FORM_SUBMITTED, { variant }),
  
  consentGiven: (sessionId: string, consentVersion?: string) =>
    logEvent(sessionId, TelemetryEvents.CONSENT_GIVEN, { consentVersion }),
  
  // Checkout telemetry
  checkoutInitiated: (sessionId: string, variant?: string, amount?: number) =>
    logEvent(sessionId, TelemetryEvents.CHECKOUT_INITIATED, { variant, amount }),
  
  checkoutRedirect: (sessionId: string, provider: string, variant?: string) =>
    logEvent(sessionId, TelemetryEvents.CHECKOUT_REDIRECT, { provider, variant }),
  
  checkoutCancelled: (sessionId: string, variant?: string) =>
    logEvent(sessionId, TelemetryEvents.CHECKOUT_CANCELLED, { variant }),
  
  // Page telemetry
  pageView: (sessionId: string, page: string, variant?: string) =>
    logEvent(sessionId, TelemetryEvents.PAGE_VIEW, { page, variant }),
  
  pageExit: (sessionId: string, page: string, timeOnPage?: number) =>
    logEvent(sessionId, TelemetryEvents.PAGE_EXIT, { page, timeOnPage }),
  
  // Error telemetry
  clientError: (sessionId: string, error: string, context?: string) =>
    logEvent(sessionId, TelemetryEvents.CLIENT_ERROR, { error, context }),
  
  apiError: (sessionId: string, endpoint: string, status: number, error?: string) =>
    logEvent(sessionId, TelemetryEvents.API_ERROR, { endpoint, status, error })
};

// Session ID management for client-side
let currentSessionId: string | null = null;

export function setSessionId(sessionId: string): void {
  currentSessionId = sessionId;
}

export function getSessionId(): string | null {
  return currentSessionId;
}

// Auto-track page views (call from page components)
export function trackPageView(page: string, variant?: string): void {
  if (currentSessionId) {
    telemetry.pageView(currentSessionId, page, variant);
  }
}

// Auto-track page exits (call from cleanup/unmount)
export function trackPageExit(page: string, startTime?: number): void {
  if (currentSessionId) {
    const timeOnPage = startTime ? Date.now() - startTime : undefined;
    telemetry.pageExit(currentSessionId, page, timeOnPage);
  }
}
