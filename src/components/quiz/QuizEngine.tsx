import { useEffect, useState } from 'preact/hooks';
import { quizStore } from '../../lib/quiz/store';
import { quizEngine } from '../../lib/quiz/engine';
import { getPersonalizedContent, CTA_TEXTS, OFFER_DETAILS } from '../../lib/quiz/content';
import { initQuizAnalytics, getQuizAnalytics } from '../../lib/quiz/analytics';
import type { QuizState } from '../../lib/quiz/types';

// Step Components
import QuizShell from './QuizShell';
import Presentation from './steps/Presentation';
import SingleChoice from './steps/SingleChoice';
import MultipleChoice from './steps/MultipleChoice';
import LeadForm from './steps/LeadForm';
import Loading from './steps/Loading';
import BeforeAfterGraph from './BeforeAfterGraph';

interface QuizEngineProps {
  onComplete?: (state: QuizState) => void;
  onLeadCapture?: (leadData: any) => void;
}

export default function QuizEngine({ onComplete, onLeadCapture }: QuizEngineProps) {
  const [state, setState] = useState<QuizState>(quizStore.getState());
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>();

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = quizStore.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Initialize analytics
  useEffect(() => {
    initQuizAnalytics(state.sessionId);
  }, [state.sessionId]);

  // Analytics tracking
  const track = (eventName: string, data: Record<string, any> = {}) => {
    const event = new CustomEvent(eventName, {
      detail: {
        sessionId: state.sessionId,
        step: state.step,
        timestamp: Date.now(),
        ...data
      }
    });
    window.dispatchEvent(event);
  };

  // Track quiz start on mount
  useEffect(() => {
    track('quiz_start');
  }, []);

  // Track step changes
  useEffect(() => {
    track('quiz_step', { step: state.step });
  }, [state.step]);

  // Navigation handlers
  const handleNext = async () => {
    setIsLoading(true);
    setValidationError(undefined);

    try {
      const navResult = quizEngine.nextStep(state);

      if (!navResult.canProceed) {
        setValidationError(navResult.validationError);
        setIsLoading(false);
        return;
      }

      // Special handling for lead submission
      if (state.step === 6 && navResult.targetStep !== 6) {
        await handleLeadSubmission();
      }

      // Update step
      quizStore.setStep(navResult.targetStep);

      // Complete quiz if final step
      if (navResult.targetStep === 18) {
        quizStore.complete();
        track('quiz_complete');
        onComplete?.(state);
      }
    } catch (error) {
      console.error('Error navigating to next step:', error);
      setValidationError('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const navResult = quizEngine.prevStep(state);
    if (navResult.canProceed) {
      quizStore.setStep(navResult.targetStep);
    }
  };

  // Lead submission
  const handleLeadSubmission = async () => {
    if (!state.nome || !state.email || !state.consent) {
      throw new Error('Lead data incomplete');
    }

    try {
      const leadData = {
        sessionId: state.sessionId,
        nome: state.nome,
        email: state.email,
        consent: state.consent,
        answers: state,
        startedAt: state.startedAt,
        completedAt: Date.now(),
        source: 'quiz',
        utmParams: getUtmParams()
      };

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit lead');
      }

      track('quiz_lead_submitted', { email: state.email });
      onLeadCapture?.(leadData);
    } catch (error) {
      console.error('Lead submission error:', error);
      throw error;
    }
  };

  // Get UTM parameters from URL
  const getUtmParams = () => {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
      if (key.startsWith('utm_')) {
        utmParams[key] = value;
      }
    }

    return utmParams;
  };

  // Step-specific handlers
  const handleStepChange = (field: string, value: any) => {
    const setterName = `set${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof typeof quizStore;
    if (typeof quizStore[setterName] === 'function') {
      (quizStore[setterName] as any)(value);
    }
  };

  const handleLeadChange = ({ nome, email, consent }: any) => {
    if (nome !== undefined) quizStore.setNome(nome);
    if (email !== undefined) quizStore.setEmail(email);
    if (consent !== undefined) quizStore.setConsent(consent);
  };

  // Render current step
  const renderStep = () => {
    const stepContent = getPersonalizedContent(state.step, state);
    const stepType = quizEngine.getStepType(state.step);

    switch (stepType) {
      case 'presentation':
        if (state.step === 18) {
          // Final offer step
          return (
            <div>
              <Presentation
                title={stepContent.title}
                content={stepContent.content}
                showCTA={false}
              />
              <BeforeAfterGraph showAnimation={true} />
              <div className="offer-details">
                <div className="offer-price">
                  <div className="offer-price-main">{OFFER_DETAILS.price}</div>
                  <div className="offer-price-original">{OFFER_DETAILS.originalPrice}</div>
                  <div className="offer-discount">{OFFER_DETAILS.discount}</div>
                </div>
                <div className="offer-deliverables">
                  {OFFER_DETAILS.deliverables.map((item, index) => (
                    <div key={index} className="offer-item">{item}</div>
                  ))}
                </div>
                <div className="offer-bonus">
                  {OFFER_DETAILS.bonus.map((item, index) => (
                    <div key={index} className="offer-bonus-item">{item}</div>
                  ))}
                </div>
                <div className="offer-guarantee">{OFFER_DETAILS.guarantee}</div>
                <button
                  className="offer-cta"
                  data-event="offer_click"
                  onClick={() => {
                    track('offer_click');
                    // Handle checkout redirect
                  }}
                >
                  {CTA_TEXTS.final}
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <Presentation
              title={stepContent.title}
              content={stepContent.content}
            />
          );
        }

      case 'single_choice':
        return (
          <SingleChoice
            title={stepContent.title}
            options={stepContent.options || []}
            value={getStateValue(state.step)}
            onChange={(value) => handleStepChange(getFieldName(state.step), value)}
            onAutoAdvance={handleNext}
          />
        );

      case 'multiple_choice':
        return (
          <MultipleChoice
            title={stepContent.title}
            content={stepContent.content}
            options={stepContent.options || []}
            value={getStateValue(state.step)}
            onChange={(values) => handleStepChange(getFieldName(state.step), values)}
            minSelections={stepContent.validation?.minSelections}
            maxSelections={stepContent.validation?.maxSelections}
          />
        );

      case 'form':
        return (
          <LeadForm
            title={stepContent.title}
            content={stepContent.content}
            nome={state.nome}
            email={state.email}
            consent={state.consent}
            onChange={handleLeadChange}
          />
        );

      case 'loading':
        return (
          <Loading
            title={stepContent.title}
            content={stepContent.content}
            onComplete={handleNext}
            duration={2000}
          />
        );

      default:
        return <div>Unknown step type</div>;
    }
  };

  // Get field value from state
  const getStateValue = (step: number) => {
    const fieldName = getFieldName(step);
    return state[fieldName as keyof QuizState];
  };

  // Map step to state field
  const getFieldName = (step: number): string => {
    const stepFieldMap: Record<number, string> = {
      2: 'idade',
      4: 'diagnostico',
      5: 'horas',
      7: 'remedios',
      8: 'ansiedade',
      9: 'impactos',
      10: 'consequencias',
      11: 'desejos',
      13: 'conhecimento',
      14: 'direcionamento',
      16: 'micro'
    };
    return stepFieldMap[step] || '';
  };

  // Check if can proceed/go back
  const canGoNext = quizStore.isStepValid(state.step);
  const canGoBack = quizEngine.canGoBack(state.step);

  // Track offer view when step 18 is reached
  useEffect(() => {
    if (state.step === 18) {
      track('offer_view');
    }
  }, [state.step]);

  return (
    <QuizShell
      currentStep={state.step}
      state={state}
      onBack={handleBack}
      onNext={handleNext}
      canGoBack={canGoBack}
      canGoNext={canGoNext}
      isLoading={isLoading}
      validationError={validationError}
    >
      {renderStep()}
    </QuizShell>
  );
}