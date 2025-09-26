// Magic link authentication utilities
import { createHash, randomBytes } from 'node:crypto';

// In-memory storage for development (use Redis/database in production)
const tokenStore = new Map<string, {
  userId: string;
  email: string;
  expiresAt: number;
  used: boolean;
}>();

const userStore = new Map<string, {
  id: string;
  email: string;
  nome: string;
  createdAt: Date;
  enrollments: string[];
}>();

interface MagicTokenData {
  token: string;
  url: string;
  expiresAt: Date;
}

interface User {
  id: string;
  email: string;
  nome: string;
  createdAt: Date;
  enrollments: string[];
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
  // Check if user exists
  for (const [id, user] of userStore) {
    if (user.email === email) {
      // Update nome if provided
      if (nome && user.nome !== nome) {
        user.nome = nome;
        userStore.set(id, user);
      }
      return user;
    }
  }
  
  // Create new user
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newUser: User = {
    id: userId,
    email,
    nome,
    createdAt: new Date(),
    enrollments: []
  };
  
  userStore.set(userId, newUser);
  return newUser;
};

// Create enrollment for user
export const createEnrollment = async (userId: string, program: string): Promise<boolean> => {
  const user = userStore.get(userId);
  if (!user) {
    return false;
  }
  
  // Add enrollment if not already enrolled
  if (!user.enrollments.includes(program)) {
    user.enrollments.push(program);
    userStore.set(userId, user);
    
    console.log('Enrollment created:', {
      userId,
      program,
      enrollmentCount: user.enrollments.length
    });
  }
  
  return true;
};

// Generate magic link
export const createMagicToken = async (email: string, nome: string): Promise<MagicTokenData> => {
  const user = await upsertUser(email, nome);
  const token = generateToken();
  const hashedToken = hashToken(token);
  
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  tokenStore.set(hashedToken, {
    userId: user.id,
    email: user.email,
    expiresAt,
    used: false
  });
  
  const url = `${import.meta.env.APP_ORIGIN}/auth/magic?token=${token}`;
  
  // Clean up expired tokens
  cleanupExpiredTokens();
  
  return {
    token,
    url,
    expiresAt: new Date(expiresAt)
  };
};

// Validate and consume magic token
export const validateMagicToken = async (token: string): Promise<{ valid: boolean; user?: User; error?: string }> => {
  const hashedToken = hashToken(token);
  const tokenData = tokenStore.get(hashedToken);
  
  if (!tokenData) {
    return { valid: false, error: 'Token not found' };
  }
  
  if (tokenData.used) {
    return { valid: false, error: 'Token already used' };
  }
  
  if (Date.now() > tokenData.expiresAt) {
    tokenStore.delete(hashedToken);
    return { valid: false, error: 'Token expired' };
  }
  
  // Mark as used
  tokenData.used = true;
  tokenStore.set(hashedToken, tokenData);
  
  const user = userStore.get(tokenData.userId);
  if (!user) {
    return { valid: false, error: 'User not found' };
  }
  
  return { valid: true, user };
};

// Clean up expired tokens
const cleanupExpiredTokens = (): void => {
  const now = Date.now();
  for (const [hashedToken, data] of tokenStore) {
    if (now > data.expiresAt) {
      tokenStore.delete(hashedToken);
    }
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  return userStore.get(userId) || null;
};

// Create session token (simplified)
export const createSessionToken = (userId: string): string => {
  const sessionData = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  // In production, use proper JWT or encrypted session tokens
  return Buffer.from(JSON.stringify(sessionData)).toString('base64');
};

// Validate session token
export const validateSession = (token: string): { valid: boolean; userId?: string } => {
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
