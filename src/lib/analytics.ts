import { hasConsent } from './consent';

interface AnalyticsEvent {
  event: string;
  [key: string]: any;
}

class Analytics {
  private ga4Id: string | null = null;
  private metaPixelId: string | null = null;
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.ga4Id = import.meta.env.PUBLIC_GA4_ID || null;
      this.metaPixelId = import.meta.env.PUBLIC_META_PIXEL_ID || null;

      // Listen for consent changes
      window.addEventListener('consentChanged', this.handleConsentChange.bind(this));
    }
  }

  private handleConsentChange = (event: CustomEvent) => {
    if (event.detail.status === 'accepted') {
      this.init();
    }
  };

  private init(): void {
    if (!hasConsent() || this.initialized) return;

    // Initialize Google Analytics 4
    if (this.ga4Id) {
      this.initGA4();
    }

    // Initialize Meta Pixel
    if (this.metaPixelId) {
      this.initMetaPixel();
    }

    this.initialized = true;
  }

  private initGA4(): void {
    if (!this.ga4Id) return;

    // Load gtag script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.ga4Id}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() {
      (window as any).dataLayer.push(arguments);
    };

    (window as any).gtag('js', new Date());
    (window as any).gtag('config', this.ga4Id, {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  private initMetaPixel(): void {
    if (!this.metaPixelId) return;

    // Initialize Meta Pixel
    (window as any).fbq = (window as any).fbq || function() {
      ((window as any).fbq.q = (window as any).fbq.q || []).push(arguments);
    };

    if (!(window as any)._fbq) (window as any)._fbq = (window as any).fbq;
    (window as any).fbq.push = (window as any).fbq;
    (window as any).fbq.loaded = !0;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.queue = [];

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.async = true;
    document.head.appendChild(script);

    (window as any).fbq('init', this.metaPixelId);
    (window as any).fbq('track', 'PageView');
  }

  track(eventName: string, parameters: Record<string, any> = {}): void {
    if (!hasConsent()) return;

    // Initialize if not already done
    if (!this.initialized) {
      this.init();
    }

    // Track with GA4
    if (this.ga4Id && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }

    // Track with Meta Pixel
    if (this.metaPixelId && (window as any).fbq) {
      (window as any).fbq('track', eventName, parameters);
    }

    // Console log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventName, parameters);
    }
  }

  // Specific tracking methods for Durma events
  trackPageView(): void {
    this.track('durma_view', {
      page_title: document.title,
      page_location: window.location.href
    });
  }

  trackCTAClick(position: string): void {
    this.track('durma_cta_click', { position });
  }

  trackScrollDepth(percentage: number): void {
    this.track('durma_scroll_depth', { pct: percentage });
  }

  trackSectionView(section: string): void {
    this.track(`durma_${section}_view`, {
      section,
      page_location: window.location.href
    });
  }

  trackQuizStart(): void {
    this.track('quiz_start', {
      source: 'durma_landing',
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Convenience methods
export const trackPageView = () => analytics.trackPageView();
export const trackCTAClick = (position: string) => analytics.trackCTAClick(position);
export const trackScrollDepth = (percentage: number) => analytics.trackScrollDepth(percentage);
export const trackSectionView = (section: string) => analytics.trackSectionView(section);
export const trackQuizStart = () => analytics.trackQuizStart();