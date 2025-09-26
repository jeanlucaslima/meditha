import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import type { CheckoutRequest, CheckoutResponse } from '../../../lib/types/lead';
import { getLeadBySessionId, checkIdempotency, markProcessed } from '../../../lib/storage/lead';

// Initialize Stripe (conditional for build-time)
const getStripe = () => {
  const secretKey = import.meta.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia'
  });
};

const validateRequest = (body: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!body.sessionId || typeof body.sessionId !== 'string') {
    errors.push('sessionId is required');
  }
  
  if (!body.variant || typeof body.variant !== 'string') {
    errors.push('variant is required');
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { sessionId, variant }: CheckoutRequest = body;
    
    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check idempotency
    const idempotencyKey = `checkout:${sessionId}`;
    if (!checkIdempotency(idempotencyKey)) {
      return new Response(JSON.stringify({
        error: 'Duplicate request'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Look up lead by sessionId
    const lead = await getLeadBySessionId(sessionId);
    if (!lead) {
      return new Response(JSON.stringify({
        error: 'Session not found or invalid'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify consent
    if (!lead.consent) {
      return new Response(JSON.stringify({
        error: 'Consent required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create Stripe Checkout Session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: import.meta.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      customer_creation: 'if_required',
      customer_email: lead.email, // Pre-fill with stored email
      metadata: {
        sessionId: sessionId,
        variant: variant,
        source: 'quiz',
        quiz_version: '1.0',
        leadEmail: lead.email, // Store for fallback in webhook
        leadNome: lead.nome
      },
      success_url: `${import.meta.env.APP_ORIGIN}/durma/sucesso?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${import.meta.env.APP_ORIGIN}/durma/quiz?cancel=1`
    }, {
      idempotencyKey: `sid:${sessionId}` // Stripe's idempotency
    });
    
    // Mark as processed
    markProcessed(idempotencyKey);
    
    // Log creation (without PII)
    console.log('Checkout session created:', {
      sessionId: sessionId,
      stripeSessionId: session.id,
      variant: variant,
      amount: 6700,
      currency: 'BRL'
    });
    
    const response: CheckoutResponse = {
      url: session.url!
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Checkout creation error:', error);
    
    // Handle Stripe errors gracefully
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(JSON.stringify({
        error: 'Payment provider error',
        code: error.code
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Method not allowed for other methods
export const GET: APIRoute = () => {
  return new Response('Method not allowed', { status: 405 });
};
