export type ConsentStatus = 'pending' | 'accepted' | 'rejected';

export interface ConsentState {
  status: ConsentStatus;
  timestamp: number;
}

export function getConsentStatus(): ConsentState {
  if (typeof window === 'undefined') {
    return { status: 'pending', timestamp: 0 };
  }

  const stored = localStorage.getItem('cookie_consent');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { status: 'pending', timestamp: 0 };
    }
  }

  return { status: 'pending', timestamp: 0 };
}

export function setConsentStatus(status: 'accepted' | 'rejected'): void {
  if (typeof window === 'undefined') return;

  const consentState: ConsentState = {
    status,
    timestamp: Date.now()
  };

  localStorage.setItem('cookie_consent', JSON.stringify(consentState));

  // Set cookie for 365 days
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `consent=${status}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;

  // Dispatch custom event for analytics initialization
  window.dispatchEvent(new CustomEvent('consentChanged', {
    detail: { status, timestamp: consentState.timestamp }
  }));
}

export function hasConsent(): boolean {
  return getConsentStatus().status === 'accepted';
}

export function shouldShowConsentBanner(): boolean {
  return getConsentStatus().status === 'pending';
}