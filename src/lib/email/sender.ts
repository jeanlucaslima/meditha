// Email sending utilities supporting multiple providers
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
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
    bodyLength: options.html.length
  });
  
  return { 
    success: true, 
    messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
  };
};

// Main send function
export const sendEmail = async (options: EmailOptions): Promise<EmailResult> => {
  const provider = import.meta.env.EMAIL_PROVIDER?.toLowerCase() || 'mock';
  
  console.log('Sending email via', provider, 'to', options.to.replace(/(.{1,3}).*@/, '$1***@'));
  
  switch (provider) {
    case 'postmark':
      return sendWithPostmark(options);
    case 'sendgrid':
      return sendWithSendGrid(options);
    case 'ses':
      return sendWithSES(options);
    case 'mock':
    default:
      return sendWithMock(options);
  }
};

// Rate limiting for email sending (anti-spam)
const emailRateLimit = new Map<string, { count: number; resetTime: number }>();

export const checkEmailRateLimit = (email: string, maxEmails: number = 3, windowMs: number = 60 * 60 * 1000): boolean => {
  const now = Date.now();
  const key = `email:${email}`;
  const record = emailRateLimit.get(key);
  
  if (!record || now > record.resetTime) {
    emailRateLimit.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxEmails) {
    return false;
  }
  
  record.count++;
  return true;
};
