import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { 
  checkIdempotency, 
  getLeadBySessionId, 
  maskEmail, 
  storeWebhookEvent, 
  markWebhookProcessed,
  storePayment,
  getStripeCheckout 
} from '../../../lib/storage/supabase';
import { createMagicToken, upsertUser, createEnrollment } from '../../../lib/auth/supabase';
import { sendEmail } from '../../../lib/email/supabase';
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

const WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET!;

// Verify Stripe webhook signature
const verifySignature = (body: string, signature: string): Stripe.Event | null => {
  try {
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
};

// Process checkout completion
const handleCheckoutCompleted = async (session: Stripe.Checkout.Session): Promise<boolean> => {
  try {
    const { id: stripeSessionId, customer_email, metadata, amount_total, payment_intent } = session;
    
    if (!metadata) {
      console.error('No metadata found in checkout session:', stripeSessionId);
      return false;
    }
    
    const { sessionId, variant, leadEmail, leadNome } = metadata;
    
    if (!sessionId) {
      console.error('No sessionId in metadata:', stripeSessionId);
      return false;
    }
    
    console.log('Processing checkout completion:', {
      stripeSessionId,
      sessionId,
      variant,
      hasCustomerEmail: !!customer_email,
      hasLeadEmail: !!leadEmail,
      amount: amount_total
    });
    
    // Get lead data from our storage
    const lead = await getLeadBySessionId(sessionId);
    
    // Determine email and name to use (prefer our stored data)
    let email = lead?.email || leadEmail || customer_email;
    let nome = lead?.nome || leadNome || 'Cliente';
    
    if (!email) {
      console.error('No email found for session:', sessionId);
      return false;
    }
    
    console.log('Fulfilling for:', { 
      sessionId, 
      email: maskEmail(email), 
      nome: nome.split(' ')[0] 
    });
    
    // Store payment record
    const paymentId = typeof payment_intent === 'string' ? payment_intent : payment_intent?.id || stripeSessionId;
    const paymentStored = await storePayment(
      paymentId,
      stripeSessionId,
      sessionId,
      'succeeded',
      amount_total || 6700,
      email,
      'BRL'
    );
    
    if (!paymentStored) {
      console.error('Failed to store payment record');
      // Continue anyway since we still need to fulfill
    }
    
    // Upsert user and create enrollment
    const user = await upsertUser(email, nome);
    const enrollmentSuccess = await createEnrollment(user.id, 'desafio_7_dias', sessionId, paymentId);
    
    if (!enrollmentSuccess) {
      console.error('Failed to create enrollment for user:', user.id);
      return false;
    }
    
    // Generate magic link
    const magicToken = await createMagicToken(email, nome);
    
    // Send access email with logging
    const emailTemplate = getAccessEmailTemplate(nome, magicToken.url);
    const emailResult = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
      template: 'access_email',
      userId: user.id,
      meta: {
        sessionId,
        stripeSessionId,
        variant,
        paymentId
      }
    });
    
    if (!emailResult.success) {
      console.error('Failed to send access email:', emailResult.error);
      return false;
    }
    
    console.log('Fulfillment completed:', {
      sessionId,
      userId: user.id,
      emailSent: true,
      messageId: emailResult.messageId,
      paymentId
    });
    
    // Log success analytics (server-side, no PII)
    console.log('purchase_succeeded', {
      sessionId,
      amount: amount_total || 6700,
      currency: 'BRL',
      variant,
      timestamp: Date.now()
    });
    
    return true;
    
  } catch (error) {
    console.error('Error processing checkout completion:', error);
    return false;
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Missing signature', { status: 400 });
    }
    
    // Verify webhook signature
    const event = verifySignature(body, signature);
    if (!event) {
      return new Response('Invalid signature', { status: 400 });
    }
    
    console.log('Webhook received:', event.type, event.id);
    
    // Check idempotency
    const alreadyProcessed = !(await checkIdempotency(event.id));
    if (alreadyProcessed) {
      console.log('Webhook already processed:', event.id);
      return new Response('OK', { status: 200 });
    }
    
    // Store webhook event
    const eventStored = await storeWebhookEvent(event.id, event.type, event.data);
    if (!eventStored) {
      console.error('Failed to store webhook event:', event.id);
      return new Response('Event storage failed', { status: 500 });
    }
    
    // Handle the event
    let processed = false;
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        processed = await handleCheckoutCompleted(session);
        break;
      }
      
      case 'payment_intent.succeeded': {
        // Backup handler - could implement if needed
        console.log('Payment intent succeeded:', event.data.object.id);
        processed = true; // Just acknowledge for now
        break;
      }
      
      default:
        console.log('Unhandled webhook event:', event.type);
        processed = true; // Acknowledge unknown events
    }
    
    if (processed) {
      // Mark as processed for idempotency
      await markWebhookProcessed(event.id);
      
      // Respond quickly to Stripe
      return new Response('OK', { status: 200 });
    } else {
      console.error('Failed to process webhook:', event.id, event.type);
      await markWebhookProcessed(event.id, 'Processing failed');
      return new Response('Processing failed', { status: 500 });
    }
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal error', { status: 500 });
  }
};

// Method not allowed for other methods
export const GET: APIRoute = () => {
  return new Response('Method not allowed', { status: 405 });
};
