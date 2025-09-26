import type { APIRoute } from 'astro';
import type { LeadSubmission } from '../../lib/quiz/types';
import { EMAIL_REGEX, MIN_NAME_LENGTH } from '../../lib/quiz/types';
import fs from 'fs/promises';
import path from 'path';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes

// Validation helpers
function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateName(nome: string): boolean {
  return nome.trim().length >= MIN_NAME_LENGTH;
}

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const lastSubmission = rateLimitMap.get(sessionId);

  if (lastSubmission && (now - lastSubmission) < RATE_LIMIT_WINDOW) {
    return false;
  }

  rateLimitMap.set(sessionId, now);
  return true;
}

// Dev storage helper - writes to .data/leads.jsonl
async function saveLeadToDev(lead: LeadSubmission): Promise<void> {
  try {
    const dataDir = path.join(process.cwd(), '.data');
    await fs.mkdir(dataDir, { recursive: true });

    const filePath = path.join(dataDir, 'leads.jsonl');
    const leadLine = JSON.stringify({
      ...lead,
      savedAt: new Date().toISOString()
    }) + '\n';

    await fs.appendFile(filePath, leadLine, 'utf-8');

    // Also log to console with clear formatting
    console.log('🔥 [LEAD CAPTURED]', {
      sessionId: lead.sessionId,
      nome: lead.nome,
      email: lead.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving lead to dev storage:', error);
    throw error;
  }
}

// Future: Replace with real provider
async function saveLead(lead: LeadSubmission): Promise<void> {
  // In development, save to local file
  if (import.meta.env.DEV) {
    return saveLeadToDev(lead);
  }

  // TODO: Implement production provider
  // Examples:
  // - Send to CRM (HubSpot, Pipedrive, etc.)
  // - Save to database (Supabase, PostgreSQL, etc.)
  // - Send to webhook endpoint
  // - Queue for processing (Redis, etc.)

  console.log('[PRODUCTION] Lead would be saved:', lead);
  throw new Error('Production lead storage not implemented yet');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Extract and validate required fields
    const {
      sessionId,
      nome,
      email,
      consent,
      answers,
      startedAt,
      completedAt,
      source,
      utmParams,
      honeypot // Bot detection
    } = body;

    // Bot detection - reject if honeypot field is filled
    if (honeypot && honeypot.trim()) {
      console.warn('[SECURITY] Honeypot triggered for sessionId:', sessionId);
      return new Response(JSON.stringify({
        ok: false,
        error: 'Invalid request'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Rate limiting
    if (!checkRateLimit(sessionId)) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Rate limit exceeded. Please try again in a few minutes.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validation
    const errors: string[] = [];

    if (!sessionId || typeof sessionId !== 'string') {
      errors.push('Session ID is required');
    }

    if (!nome || typeof nome !== 'string' || !validateName(nome)) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }

    if (!email || typeof email !== 'string' || !validateEmail(email)) {
      errors.push('Email inválido');
    }

    if (!consent) {
      errors.push('Consentimento é obrigatório');
    }

    if (errors.length > 0) {
      return new Response(JSON.stringify({
        ok: false,
        errors,
        error: errors.join(', ')
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare lead submission
    const lead: LeadSubmission = {
      sessionId: sessionId.trim(),
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      consent,
      answers: answers || {},
      startedAt: startedAt || Date.now(),
      completedAt: completedAt || Date.now(),
      source: source || 'quiz',
      utmParams: utmParams || {}
    };

    // Save lead
    await saveLead(lead);

    // Success response
    return new Response(JSON.stringify({
      ok: true,
      message: 'Lead captured successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[API] Error processing lead:', error);

    return new Response(JSON.stringify({
      ok: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Health check endpoint
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    ok: true,
    service: 'Lead Capture API',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};