// Email sending utilities with Supabase logging
import { supabaseAdmin } from '../supabase';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  template?: string;
  userId?: number;
  meta?: any;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Postmark implementation
const sendWithPostmark = async (options: EmailOptions): Promise<EmailResult> => {
  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': import.meta.env.EMAIL_API_KEY!
      },
      body: JSON.stringify({
        From: options.from || import.meta.env.EMAIL_FROM!,
        To: options.to,
        Subject: options.subject,
        HtmlBody: options.html,
        TextBody: options.text
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Postmark error: ${error}` };
    }
    
    const result = await response.json();
    return { success: true, messageId: result.MessageID };
    
  } catch (error) {
    return { success: false, error: `Postmark error: ${error}` };
  }
};

// SendGrid implementation
const sendWithSendGrid = async (options: EmailOptions): Promise<EmailResult> => {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.EMAIL_API_KEY!}`
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: options.to }]
        }],
        from: { 
          email: options.from || import.meta.env.EMAIL_FROM!,
          name: 'Dormir Natural'
        },
        subject: options.subject,
        content: [
          { type: 'text/plain', value: options.text },
          { type: 'text/html', value: options.html }
        ]
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `SendGrid error: ${error}` };
    }
    
    const messageId = response.headers.get('x-message-id') || 'unknown';
    return { success: true, messageId };
    
  } catch (error) {
    return { success: false, error: `SendGrid error: ${error}` };
  }
};

// AWS SES implementation (simplified)
const sendWithSES = async (options: EmailOptions): Promise<EmailResult> => {
  // Note: This would require AWS SDK and proper credentials
  // For now, return a mock implementation
  console.warn('SES provider not implemented, use Postmark or SendGrid');
  return { success: false, error: 'SES provider not implemented' };
};

// Mock implementation for development
const sendWithMock = async (options: EmailOptions): Promise<EmailResult> => {
  console.log('📧 Mock email sent:', {
    to: options.to,
    subject: options.subject,
    bodyLength: options.html.length,
    template: options.template
  });
  
  return { 
    success: true, 
    messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
  };
};

// Log email to database
const logEmail = async (
  options: EmailOptions,
  result: EmailResult,
  provider: string
): Promise<void> => {
  try {
    const supabase = supabaseAdmin();
    
    await supabase
      .from('email_log')
      .insert({
        user_id: options.userId || null,
        to_email: options.to,
        template: options.template || 'unknown',
        provider: provider,
        message_id: result.messageId || null,
        sent_at: new Date().toISOString(),
        meta: {
          success: result.success,
          error: result.error || null,
          subject: options.subject,
          ...options.meta
        }
      });
  } catch (error) {
    console.error('Failed to log email:', error);
    // Don't throw - email logging failure shouldn't break email sending
  }
};

// Main send function with logging
export const sendEmail = async (options: EmailOptions): Promise<EmailResult> => {
  const provider = import.meta.env.EMAIL_PROVIDER?.toLowerCase() || 'mock';
  
  console.log('Sending email via', provider, 'to', options.to.replace(/(.{1,3}).*@/, '$1***@'));
  
  let result: EmailResult;
  
  switch (provider) {
    case 'postmark':
      result = await sendWithPostmark(options);
      break;
    case 'sendgrid':
      result = await sendWithSendGrid(options);
      break;
    case 'ses':
      result = await sendWithSES(options);
      break;
    case 'mock':
    default:
      result = await sendWithMock(options);
  }
  
  // Log to database (async, don't wait)
  logEmail(options, result, provider).catch(() => {});
  
  return result;
};

// Rate limiting for email sending (anti-spam) - now using Supabase
export const checkEmailRateLimit = async (
  email: string, 
  maxEmails: number = 3, 
  windowMs: number = 60 * 60 * 1000
): Promise<boolean> => {
  try {
    const supabase = supabaseAdmin();
    const cutoff = new Date(Date.now() - windowMs);
    
    const { data, error } = await supabase
      .from('email_log')
      .select('id')
      .eq('to_email', email)
      .gte('sent_at', cutoff.toISOString());
    
    if (error) {
      console.error('Failed to check email rate limit:', error);
      return true; // Allow on error to prevent blocking legitimate emails
    }
    
    return (data?.length || 0) < maxEmails;
  } catch (error) {
    console.error('Failed to check email rate limit:', error);
    return true; // Allow on error
  }
};

// Get email logs for a user
export const getUserEmailLog = async (
  userId: number,
  limit: number = 10
): Promise<any[]> => {
  try {
    const supabase = supabaseAdmin();
    
    const { data, error } = await supabase
      .from('email_log')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Failed to get user email log:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to get user email log:', error);
    return [];
  }
};

// Get email logs for an email address
export const getEmailLog = async (
  email: string,
  limit: number = 10
): Promise<any[]> => {
  try {
    const supabase = supabaseAdmin();
    
    const { data, error } = await supabase
      .from('email_log')
      .select('*')
      .eq('to_email', email)
      .order('sent_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Failed to get email log:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to get email log:', error);
    return [];
  }
};
