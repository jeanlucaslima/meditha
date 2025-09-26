export type Variant = 'A' | 'B';

export function getVariant(seed: string): Variant {
  // Create a simple hash from the seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use absolute value to ensure positive number
  const positiveHash = Math.abs(hash);

  // Return A or B based on hash (50/50 split)
  return positiveHash % 2 === 0 ? 'A' : 'B';
}

export function getStoredVariant(): Variant | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('ab_variant');
  return (stored === 'A' || stored === 'B') ? stored : null;
}

export function storeVariant(variant: Variant): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('ab_variant', variant);

  // Also set cookie for 90 days
  const expires = new Date();
  expires.setDate(expires.getDate() + 90);
  document.cookie = `ab_v=${variant}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

export function getUserVariant(): Variant {
  // Try to get from storage first
  const stored = getStoredVariant();
  if (stored) return stored;

  // Generate new variant based on user agent + timestamp
  const seed = typeof window !== 'undefined'
    ? navigator.userAgent + Date.now().toString()
    : 'server-' + Math.random().toString();

  const variant = getVariant(seed);
  storeVariant(variant);

  return variant;
}

export const COPY = {
  heroH1: {
    A: 'Durma melhor em apenas 7 dias.',
    B: 'Durma naturalmente em 7 dias — sem melatonina.'
  },
  heroCTA: {
    A: 'Começar teste',
    B: 'Fazer teste de 1 minuto'
  }
} as const;