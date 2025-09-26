import type { APIRoute } from 'astro';
import type { LeadPayload } from '../../lib/types/lead';
import { storeLead } from '../../lib/storage/lead';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 1 // 1 request per session per 5 minutes
};

// Simple honeypot check
const isHoneypot = (body: any): boolean => {
  // Check for common bot indicators
  if (body.website || body.url || body.link) {
    return true;
  }
  
  // Check for suspicious timing (too fast)
  const now = Date.now();
  const completedAt = body.completedAt;
  const timeDiff = now - completedAt;
  
  if (timeDiff < 30000) { // Less than 30 seconds
    return true;
  }
  
  return false;
};

// Rate limiting check
const checkRateLimit = (sessionId: string): boolean => {
  const now = Date.now();
  const key = `lead:${sessionId}`;
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return true;
  }
  
  if (record.count >= RATE_LIMIT.maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

// Validation function
const validatePayload = (body: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Required fields
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.push('sessionId is required');
  }
  
  if (!body.nome || typeof body.nome !== 'string' || body.nome.trim().length < 2) {
    errors.push('nome must be at least 2 characters');
  }
  
  if (!body.email || typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email)) {
    errors.push('valid email is required');
  }
  
  if (body.consent !== true) {
    errors.push('consent must be true');
  }
  
  if (!body.completedAt || typeof body.completedAt !== 'number') {
    errors.push('completedAt is required');
  }
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (body.sessionId && !uuidRegex.test(body.sessionId)) {
    errors.push('sessionId must be valid UUID v4');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Store lead now handled by shared utility function

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();
    
    // Honeypot check
    if (isHoneypot(body)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Rate limiting
    if (!checkRateLimit(body.sessionId)) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Validate payload
    const validation = validatePayload(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed', 
        details: validation.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Store the lead
    const stored = await storeLead(body as LeadPayload);
    
    if (!stored) {
      return new Response(JSON.stringify({ error: 'Storage failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Success response
    return new Response(JSON.stringify({ 
      ok: true, 
      stored: true 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Lead API error:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// For testing - return method not allowed for other methods
export const GET: APIRoute = () => {
  return new Response('Method not allowed', { status: 405 });
};

export const PUT: APIRoute = () => {
  return new Response('Method not allowed', { status: 405 });
};

export const DELETE: APIRoute = () => {
  return new Response('Method not allowed', { status: 405 });
};
