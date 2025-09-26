import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { getLeadBySessionId, maskEmail, getStripeCheckout } from '../../../lib/storage/supabase';
import { createMagicToken, getUserByEmail } from '../../../lib/auth/supabase';
import { sendEmail, checkEmailRateLimit } from '../../../lib/email/supabase';
import { getAccessEmailTemplate } from '../../../lib/email/templates';

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

interface ResendRequest {
  checkoutSessionId: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { checkoutSessionId }: ResendRequest = body;
    
    if (!checkoutSessionId || typeof checkoutSessionId !== 'string') {
      return new Response(JSON.stringify({
        error: 'checkoutSessionId is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!checkoutSessionId.startsWith('cs_')) {
      return new Response(JSON.stringify({
        error: 'Invalid checkout session ID format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Retrieve Stripe checkout session
    let stripeSession: Stripe.Checkout.Session;
    try {
      const stripe = getStripe();
      stripeSession = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    } catch (error) {
      console.error('Failed to retrieve Stripe session:', error);
      return new Response(JSON.stringify({
        error: 'Session not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify session was completed
    if (stripeSession.payment_status !== 'paid') {
      return new Response(JSON.stringify({
        error: 'Payment not completed'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get our sessionId from metadata
    const sessionId = stripeSession.metadata?.sessionId;
    if (!sessionId) {
      return new Response(JSON.stringify({
        error: 'Original session not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get lead data
    const lead = await getLeadBySessionId(sessionId);
    
    // Determine email and name (prefer stored data)
    const email = lead?.email || stripeSession.metadata?.leadEmail || stripeSession.customer_email;
    const nome = lead?.nome || stripeSession.metadata?.leadNome || 'Cliente';
    
    if (!email) {
      return new Response(JSON.stringify({
        error: 'Email not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check rate limiting
    const rateLimitOk = await checkEmailRateLimit(email, 3, 60 * 60 * 1000); // 3 emails per hour
    if (!rateLimitOk) {
      return new Response(JSON.stringify({
        error: 'Too many resend attempts. Please try again later.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Resending access for:', {
      sessionId,
      email: maskEmail(email),
      checkoutSessionId
    });
    
    // Generate new magic link
    const magicToken = await createMagicToken(email, nome);
    
    // Get user for logging
    const user = await getUserByEmail(email);
    
    // Send email with logging
    const emailTemplate = getAccessEmailTemplate(nome, magicToken.url);
    const emailResult = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      template: 'access_email_resend',
      userId: user?.id,
      meta: {
        sessionId,
        checkoutSessionId,
        resend: true
      }
    });
    
    if (!emailResult.success) {
      console.error('Failed to resend access email:', emailResult.error);
      return new Response(JSON.stringify({
        error: 'Failed to send email'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Access resent successfully:', {
      sessionId,
      messageId: emailResult.messageId
    });
    
    return new Response(JSON.stringify({
      ok: true,
      message: 'Access email resent successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Resend API error:', error);
    
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
