import type { QuizState, AnalyticsPayload } from './types';

/**
 * Quiz Analytics Tracker
 * Integrates with existing analytics system and provides quiz-specific tracking
 */
class QuizAnalytics {
  private sessionId: string;
  private startTime: number;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.startTime = Date.now();
  }

  /**
   * Track quiz event with standardized payload
   */
  track(eventName: string, data: Record<string, any> = {}): void {
    const payload: AnalyticsPayload = {
      sessionId: this.sessionId,
      step: data.step || 0,
      timestamp: Date.now(),
      ...data
    };

    // Dispatch custom event for internal listeners
    this.dispatchEvent(eventName, payload);

    // Send to external analytics if available
    this.sendToAnalytics(eventName, payload);

    // Console log in development
    if (import.meta.env.DEV) {
      console.log(`[Quiz Analytics] ${eventName}:`, payload);
    }
  }

  /**
   * Quiz-specific tracking methods
   */
  trackQuizStart(state: QuizState): void {
    this.track('quiz_start', {
      sessionId: state.sessionId,
      startedAt: state.startedAt,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      utmParams: this.getUtmParams()
    });
  }

  trackStepView(step: number, stepType: string, state: QuizState): void {
    this.track('quiz_step', {
      step,
      stepType,
      timeSpent: this.getTimeSpent(),
      progress: Math.round((step / 18) * 100),
      branchFlags: state.flags,
      answers: this.sanitizeAnswers(state)
    });
  }

  trackAnswerGiven(step: number, field: string, value: any, state: QuizState): void {
    this.track('quiz_answer', {
      step,
      field,
      value: this.sanitizeValue(value),
      timeToAnswer: this.getTimeSpent(),
      branchTriggered: this.checkBranchTrigger(field, value, state)
    });
  }

  trackLeadSubmitted(leadData: any): void {
    this.track('quiz_lead_submitted', {
      step: 6,
      email: leadData.email,
      nome: leadData.nome,
      timeToCapture: this.getTimeSpent(),
      answers: this.sanitizeAnswers(leadData.answers),
      source: leadData.source,
      utmParams: leadData.utmParams
    });
  }

  trackBranchTaken(fromStep: number, toStep: number, reason: string): void {
    this.track('quiz_branch_taken', {
      fromStep,
      toStep,
      reason,
      skippedSteps: toStep - fromStep - 1
    });
  }

  trackValidationError(step: number, error: string): void {
    this.track('quiz_validation_error', {
      step,
      error,
      timeSpent: this.getTimeSpent()
    });
  }

  trackBackNavigation(fromStep: number, toStep: number): void {
    this.track('quiz_back_navigation', {
      fromStep,
      toStep,
      stepsBack: fromStep - toStep
    });
  }

  trackQuizAbandoned(step: number, timeSpent: number): void {
    this.track('quiz_abandoned', {
      step,
      completionPercent: Math.round((step / 18) * 100),
      timeSpent,
      lastAction: Date.now()
    });
  }

  trackQuizCompleted(state: QuizState): void {
    const completionTime = Date.now();
    const totalTime = completionTime - state.startedAt;

    this.track('quiz_complete', {
      completedAt: completionTime,
      totalTime,
      totalSteps: 18,
      branchPath: this.getBranchPath(state),
      finalAnswers: this.sanitizeAnswers(state)
    });
  }

  trackOfferViewed(state: QuizState): void {
    this.track('offer_view', {
      step: 18,
      timeToReachOffer: this.getTimeSpent(),
      userProfile: this.generateUserProfile(state),
      personalization: this.getPersonalizationFlags(state)
    });
  }

  trackOfferClicked(state: QuizState): void {
    this.track('offer_click', {
      step: 18,
      timeFromView: this.getTimeSpent(),
      clickTimestamp: Date.now(),
      userProfile: this.generateUserProfile(state),
      offerId: this.getOfferIdFromState(state)
    });
  }

  /**
   * Utility methods
   */
  private dispatchEvent(eventName: string, payload: AnalyticsPayload): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: payload,
        bubbles: true
      }));
    }
  }

  private sendToAnalytics(eventName: string, payload: AnalyticsPayload): void {
    // Integration with existing analytics
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      if ((window as any).gtag) {
        (window as any).gtag('event', eventName, {
          event_category: 'Quiz',
          event_label: `Step ${payload.step}`,
          custom_parameters: payload
        });
      }

      // Meta Pixel
      if ((window as any).fbq) {
        (window as any).fbq('trackCustom', eventName, payload);
      }
    }
  }

  private getUtmParams(): Record<string, string> {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
      if (key.startsWith('utm_') || key === 'variant') {
        utmParams[key] = value;
      }
    }

    return utmParams;
  }

  private getTimeSpent(): number {
    return Date.now() - this.startTime;
  }

  private sanitizeAnswers(state: QuizState): Record<string, any> {
    // Remove sensitive data and keep only relevant answers
    return {
      idade: state.idade,
      diagnostico: state.diagnostico,
      horas: state.horas,
      remedios: state.remedios,
      ansiedade: state.ansiedade,
      impactos: state.impactos?.length || 0,
      consequencias: state.consequencias?.length || 0,
      desejos: state.desejos?.length || 0,
      conhecimento: state.conhecimento,
      direcionamento: state.direcionamento,
      micro: state.micro,
      flags: state.flags
    };
  }

  private sanitizeValue(value: any): any {
    if (Array.isArray(value)) {
      return value.length;
    }
    return value;
  }

  private checkBranchTrigger(field: string, value: any, state: QuizState): boolean {
    switch (field) {
      case 'diagnostico':
        return value === 'sem_problemas';
      case 'ansiedade':
        return value === 'nunca';
      case 'remedios':
        return value === 'frequente';
      case 'micro':
        return value === 'medo_falhar';
      default:
        return false;
    }
  }

  private getBranchPath(state: QuizState): string {
    const branches: string[] = [];

    if (state.flags.branch_no_problems) branches.push('no_problems');
    if (state.flags.branch_heavy_remedios) branches.push('heavy_remedios');
    if (state.flags.branch_high_ansiedade) branches.push('high_ansiedade');
    if (state.flags.experienced) branches.push('experienced');
    if (state.flags.reassurance) branches.push('reassurance');

    return branches.join(',') || 'default';
  }

  private generateUserProfile(state: QuizState): Record<string, any> {
    return {
      ageGroup: state.idade,
      sleepProblem: state.diagnostico,
      anxietyLevel: state.ansiedade,
      medicationUse: state.remedios,
      sleepKnowledge: state.conhecimento,
      primaryGoal: state.direcionamento,
      commitment: state.micro
    };
  }

  private getPersonalizationFlags(state: QuizState): Record<string, boolean> {
    return {
      showRemediosContent: !!state.flags.branch_heavy_remedios,
      showAnxietyContent: !!state.flags.branch_high_ansiedade,
      showReassurance: !!state.flags.reassurance,
      isExperienced: !!state.flags.experienced,
      fastTrack: !!state.flags.branch_no_problems
    };
  }

  private getOfferIdFromState(state: QuizState): string {
    // Generate offer ID based on user profile for tracking
    const profile = this.generateUserProfile(state);
    const flags = this.getPersonalizationFlags(state);

    let offerId = 'base';

    if (flags.fastTrack) offerId += '_fast';
    if (flags.showRemediosContent) offerId += '_remedios';
    if (flags.showAnxietyContent) offerId += '_anxiety';
    if (flags.showReassurance) offerId += '_reassurance';

    return offerId;
  }
}

/**
 * Session management for quiz analytics
 */
class QuizAnalyticsManager {
  private static instance: QuizAnalyticsManager;
  private analytics: QuizAnalytics | null = null;

  static getInstance(): QuizAnalyticsManager {
    if (!QuizAnalyticsManager.instance) {
      QuizAnalyticsManager.instance = new QuizAnalyticsManager();
    }
    return QuizAnalyticsManager.instance;
  }

  initSession(sessionId: string): QuizAnalytics {
    this.analytics = new QuizAnalytics(sessionId);

    // Set up abandonment tracking
    this.setupAbandonmentTracking();

    return this.analytics;
  }

  getAnalytics(): QuizAnalytics | null {
    return this.analytics;
  }

  private setupAbandonmentTracking(): void {
    if (typeof window === 'undefined' || !this.analytics) return;

    let lastActivity = Date.now();
    let currentStep = 1;

    // Track user activity
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // Listen for quiz step changes
    window.addEventListener('quiz_step', (e: Event) => {
      const customEvent = e as CustomEvent;
      currentStep = customEvent.detail.step;
      updateActivity();
    });

    // Track mouse and keyboard activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check for abandonment every 30 seconds
    const abandonmentCheck = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity;

      // Consider abandoned if inactive for 5 minutes
      if (timeSinceActivity > 5 * 60 * 1000) {
        this.analytics?.trackQuizAbandoned(currentStep, timeSinceActivity);
        clearInterval(abandonmentCheck);
      }
    }, 30000);

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // User switched tabs/minimized - potential abandonment
        setTimeout(() => {
          if (document.hidden) {
            const timeSinceActivity = Date.now() - lastActivity;
            this.analytics?.trackQuizAbandoned(currentStep, timeSinceActivity);
          }
        }, 30000);
      } else {
        updateActivity();
      }
    });
  }
}

// Export convenience functions
export const initQuizAnalytics = (sessionId: string): QuizAnalytics => {
  return QuizAnalyticsManager.getInstance().initSession(sessionId);
};

export const getQuizAnalytics = (): QuizAnalytics | null => {
  return QuizAnalyticsManager.getInstance().getAnalytics();
};

export { QuizAnalytics };