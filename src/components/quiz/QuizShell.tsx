import { useEffect, useRef, useState } from 'preact/hooks';
import type { QuizState } from '../../lib/quiz/types';
import { quizEngine } from '../../lib/quiz/engine';
import { CTA_TEXTS } from '../../lib/quiz/content';

interface QuizShellProps {
  children: any;
  currentStep: number;
  state: QuizState;
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isLoading?: boolean;
  validationError?: string;
}

export default function QuizShell({
  children,
  currentStep,
  state,
  onBack,
  onNext,
  canGoBack = false,
  canGoNext = true,
  isLoading = false,
  validationError
}: QuizShellProps) {
  const stepHeaderRef = useRef<HTMLHeadingElement>(null);
  const [showError, setShowError] = useState(false);

  // Calculate progress
  const progress = quizEngine.getProgress(currentStep);
  const isFinalStep = quizEngine.isFinalStep(currentStep);

  // Focus management - move focus to step header on change
  useEffect(() => {
    if (stepHeaderRef.current) {
      stepHeaderRef.current.focus();
    }
  }, [currentStep]);

  // Show validation error with delay
  useEffect(() => {
    if (validationError) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowError(false);
    }
  }, [validationError]);

  const handleNext = () => {
    if (onNext && canGoNext && !isLoading) {
      onNext();
    }
  };

  const handleBack = () => {
    if (onBack && canGoBack && !isLoading) {
      onBack();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canGoNext && !isLoading) {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="quiz-shell">
      {/* Fixed Progress Bar */}
      <div className="quiz-progress-bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="quiz-progress-bg">
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="quiz-progress-text">
          {progress}% completo
        </div>
      </div>

      {/* Main Quiz Content */}
      <main className="quiz-main">
        <div className="quiz-container">

          {/* Quiz Form */}
          <form
            className="quiz-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            onKeyDown={handleKeyDown}
          >
            {/* Step Content Area */}
            <div
              className="quiz-content"
              role="region"
              aria-live="polite"
              aria-label={`Passo ${currentStep} de 18`}
            >
              {/* Step Header - hidden but focusable for screen readers */}
              <h1
                ref={stepHeaderRef}
                tabIndex={-1}
                className="sr-only"
              >
                Passo {currentStep} de 18
              </h1>

              {/* Step Content */}
              {children}
            </div>

            {/* Validation Error */}
            {showError && validationError && (
              <div
                className="quiz-error"
                role="alert"
                aria-live="assertive"
              >
                {validationError}
              </div>
            )}

            {/* Navigation Controls */}
            {!isFinalStep && (
              <div className="quiz-navigation">
                {/* Back Button */}
                {canGoBack && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="quiz-btn quiz-btn-back"
                    aria-label="Voltar ao passo anterior"
                  >
                    {CTA_TEXTS.back}
                  </button>
                )}

                {/* Next/Continue Button */}
                <button
                  type="submit"
                  disabled={!canGoNext || isLoading}
                  className={`quiz-btn quiz-btn-primary ${!canGoNext ? 'quiz-btn-disabled' : ''}`}
                  aria-label={currentStep === 18 ? "Finalizar questionário" : "Continuar para próximo passo"}
                >
                  {isLoading ? CTA_TEXTS.loading : CTA_TEXTS.primary}
                </button>
              </div>
            )}
          </form>

          {/* Step Counter */}
          <div className="quiz-step-counter">
            Passo {currentStep} de 18
          </div>
        </div>
      </main>
    </div>
  );
}