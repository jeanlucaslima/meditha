// Magic link authentication utilities using Supabase
import { createHash, randomBytes } from 'node:crypto';
import { supabaseAdmin } from '../supabase';

interface MagicTokenData {
  token: string;
  url: string;
  expiresAt: Date;
}

interface User {
  id: number;
  email: string;
  nome: string;
  createdAt: Date;
}

// Generate secure token
const generateToken = (): string => {
  return randomBytes(32).toString('hex');
};

// Hash token for storage
const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

// Create or get user
export const upsertUser = async (email: string, nome: string): Promise<User> => {
  try {
    const supabase = supabaseAdmin();
    
    // Try to update existing user first
    const { data: existing, error: selectError } = await supabase
      .from('users_app')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existing && !selectError) {
      // Update nome if provided and different
      if (nome && existing.nome !== nome) {
        const { data: updated, error: updateError } = await supabase
          .from('users_app')
          .update({ nome })
          .eq('user_id', existing.user_id)
          .select('*')
          .single();
        
        if (updateError) {
          console.error('Failed to update user nome:', updateError);
          // Return existing user even if update fails
        } else if (updated) {
          return {
            id: updated.user_id,
            email: updated.email,
            nome: updated.nome || '',
            createdAt: new Date(updated.created_at)
          };
        }
      }
      
      return {
        id: existing.user_id,
        email: existing.email,
        nome: existing.nome || '',
        createdAt: new Date(existing.created_at)
      };
    }
    
    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users_app')
      .insert({
        email,
        nome,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (insertError || !newUser) {
      console.error('Failed to create user:', insertError);
      throw new Error('Failed to create user');
    }
    
    return {
      id: newUser.user_id,
      email: newUser.email,
      nome: newUser.nome || '',
      createdAt: new Date(newUser.created_at)
    };
  } catch (error) {
    console.error('Failed to upsert user:', error);
    throw error;
  }
};

// Create enrollment for user
export const createEnrollment = async (
  userId: number, 
  productCode: string = 'desafio_7_dias',
  sessionId?: string,
  paymentId?: string
): Promise<boolean> => {
  try {
    const supabase = supabaseAdmin();
    
    // Use upsert to handle duplicate enrollments
    const { error } = await supabase
      .from('enrollments')
      .upsert({
        user_id: userId,
        product_code: productCode,
        origin_session_id: sessionId || null,
        payment_id: paymentId || null,
        status: 'active',
        fulfilled_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,product_code'
      });
    
    if (error) {
      console.error('Failed to create enrollment:', error);
      return false;
    }
    
    console.log('Enrollment created:', {
      userId,
      productCode,
      sessionId: sessionId || 'none',
      paymentId: paymentId || 'none'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to create enrollment:', error);
    return false;
  }
};

// Generate magic link
export const createMagicToken = async (email: string, nome: string): Promise<MagicTokenData> => {
  try {
    const user = await upsertUser(email, nome);
    const token = generateToken();
    const tokenHash = hashToken(token);
    
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
    
    const supabase = supabaseAdmin();
    
    // Store hashed token
    const { error } = await supabase
      .from('magic_links')
      .insert({
        token_hash: tokenHash,
        user_id: user.id,
        expires_at: expiresAt.toISOString()
      });
    
    if (error) {
      console.error('Failed to store magic token:', error);
      throw new Error('Failed to create magic link');
    }
    
    const url = `${import.meta.env.APP_ORIGIN}/auth/magic?token=${token}`;
    
    // Clean up expired tokens (best effort)
    cleanupExpiredTokens();
    
    return {
      token,
      url,
      expiresAt
    };
  } catch (error) {
    console.error('Failed to create magic token:', error);
    throw error;
  }
};

// Validate and consume magic token
export const validateMagicToken = async (token: string): Promise<{ valid: boolean; user?: User; error?: string }> => {
  try {
    const tokenHash = hashToken(token);
    const supabase = supabaseAdmin();
    
    // Get token data with user info
    const { data: tokenData, error: selectError } = await supabase
      .from('magic_links')
      .select(`
        *,
        users_app (
          user_id,
          email,
          nome,
          created_at
        )
      `)
      .eq('token_hash', tokenHash)
      .single();
    
    if (selectError || !tokenData) {
      return { valid: false, error: 'Token not found' };
    }
    
    if (tokenData.used_at) {
      return { valid: false, error: 'Token already used' };
    }
    
    if (new Date() > new Date(tokenData.expires_at)) {
      // Clean up expired token
      await supabase
        .from('magic_links')
        .delete()
        .eq('token_hash', tokenHash);
      
      return { valid: false, error: 'Token expired' };
    }
    
    // Mark as used
    const { error: updateError } = await supabase
      .from('magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('token_hash', tokenHash);
    
    if (updateError) {
      console.error('Failed to mark token as used:', updateError);
      return { valid: false, error: 'Token processing failed' };
    }
    
    const userData = tokenData.users_app;
    if (!userData) {
      return { valid: false, error: 'User not found' };
    }
    
    // Update last login
    await supabase
      .from('users_app')
      .update({ last_login_at: new Date().toISOString() })
      .eq('user_id', userData.user_id);
    
    return {
      valid: true,
      user: {
        id: userData.user_id,
        email: userData.email,
        nome: userData.nome || '',
        createdAt: new Date(userData.created_at)
      }
    };
  } catch (error) {
    console.error('Failed to validate magic token:', error);
    return { valid: false, error: 'Token validation failed' };
  }
};

// Clean up expired tokens
const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const supabase = supabaseAdmin();
    
    const { error } = await supabase
      .from('magic_links')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('Failed to cleanup expired tokens:', error);
    }
  } catch (error) {
    console.error('Failed to cleanup expired tokens:', error);
  }
};

// Get user by ID
export const getUserById = async (userId: number): Promise<User | null> => {
  try {
    const supabase = supabaseAdmin();
    
    const { data, error } = await supabase
      .from('users_app')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error('Failed to get user by ID:', error);
      }
      return null;
    }
    
    return {
      id: data.user_id,
      email: data.email,
      nome: data.nome || '',
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Failed to get user by ID:', error);
    return null;
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const supabase = supabaseAdmin();
    
    const { data, error } = await supabase
      .from('users_app')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      if (error.code !== 'PGRST116') { // Not found error
        console.error('Failed to get user by email:', error);
      }
      return null;
    }
    
    return {
      id: data.user_id,
      email: data.email,
      nome: data.nome || '',
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Failed to get user by email:', error);
    return null;
  }
};

// Create session token (simplified)
export const createSessionToken = (userId: number): string => {
  const sessionData = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  // In production, use proper JWT or encrypted session tokens
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
};

// Validate session token
export const validateSession = (token: string): { valid: boolean; userId?: number } => {
  try {
    const sessionData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (Date.now() > sessionData.expiresAt) {
      return { valid: false };
    }
    
    return { valid: true, userId: sessionData.userId };
  } catch {
    return { valid: false };
  }
};
