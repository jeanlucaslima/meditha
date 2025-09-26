import { useState, useEffect, useRef } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import ProgressBarTop from './ui/ProgressBarTop';
import CTAButton from './ui/CTAButton';
import type { QuizState } from '../../lib/quiz/types';

interface QuizShellUpdatedProps {
  currentStep: number;
  totalSteps?: number;
  state: QuizState;
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isLoading?: boolean;
  validationError?: string;
  children: ComponentChildren;
  className?: string;
}

export default function QuizShellUpdated({
  currentStep,
  totalSteps = 18,
  state,
  onBack,
  onNext,
  canGoBack = false,
  canGoNext = false,
  isLoading = false,
  validationError,
  children,
  className = ''
}: QuizShellUpdatedProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousStep, setPreviousStep] = useState(currentStep);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle step transitions
  useEffect(() => {
    if (currentStep !== previousStep) {
      setIsTransitioning(true);
      
      // Scroll to top smoothly
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }

      const transitionTimeout = setTimeout(() => {
        setIsTransitioning(false);
        setPreviousStep(currentStep);
      }, 220);

      return () => clearTimeout(transitionTimeout);
    }
  }, [currentStep, previousStep]);

  // Calculate progress percentage based on adaptive flow
  const calculateProgress = (): number => {
    // Base progress on actual user path, not total possible steps
    const baseProgress = (currentStep / totalSteps) * 100;
    
    // Add weighting based on step complexity
    let weightedProgress = baseProgress;
    
    if (currentStep >= 6) weightedProgress += 5; // Lead capture bonus
    if (currentStep >= 16) weightedProgress += 10; // Near completion bonus
    if (currentStep === 18) weightedProgress = 100; // Completion
    
    return Math.min(100, Math.round(weightedProgress));
  };

  const progressPercentage = calculateProgress();
  const stepLabel = currentStep === 18 
    ? 'Completo' 
    : `Etapa ${currentStep} de ${totalSteps}`;

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && canGoBack) {
      onBack?.();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && canGoNext && !isLoading) {
      onNext?.();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, canGoNext, isLoading]);

  // Determine if we should show navigation (not for auto-advance steps or final step)
  const showNavigation = currentStep !== 18 && !isAutoAdvanceStep(currentStep);
  
  function isAutoAdvanceStep(step: number): boolean {
    // Single choice steps that auto-advance
    return [2, 4, 5, 7, 8, 13, 14].includes(step);
  }

  return (
    <div 
      ref={containerRef}
      className={`quiz-shell ${className}`}
      role="main"
      aria-labelledby="quiz-progress-label"
    >
      {/* Progress Bar */}
      <ProgressBarTop
        currentStep={currentStep}
        totalSteps={totalSteps}
        percentage={progressPercentage}
        stepLabel={stepLabel}
      />

      {/* Main Content */}
      <div className="quiz-shell__main">
        <div className="quiz-shell__container">
          <div className="quiz-shell__card">
            <div 
              ref={contentRef}
              className={`quiz-shell__content ${isTransitioning ? 'quiz-shell__content--transitioning' : ''}`}
              style={{ '--transition-delay': '0ms' } as any}
            >
              {children}
            </div>

            {/* Error Message */}
            {validationError && (
              <div className="quiz-shell__error" role="alert">
                <svg className="quiz-shell__error-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 4v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {validationError}
              </div>
            )}

            {/* Navigation */}
            {showNavigation && (
              <div className="quiz-shell__navigation">
                {canGoBack && (
                  <CTAButton
                    onClick={onBack}
                    variant="outline"
                    size="md"
                    disabled={isLoading}
                    ariaLabel="Voltar para etapa anterior"
                  >
                    Voltar
                  </CTAButton>
                )}

                {/* Only show continue for non-auto-advance steps */}
                {!isAutoAdvanceStep(currentStep) && (
                  <CTAButton
                    onClick={onNext}
                    variant="primary"
                    size="md"
                    disabled={!canGoNext}
                    loading={isLoading}
                    className="quiz-shell__continue-btn"
                    ariaLabel="Continuar para próxima etapa"
                  >
                    {isLoading ? 'Carregando...' : 'Continuar'}
                  </CTAButton>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Screen Reader Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        <span id="quiz-progress-label">
          Quiz de sono, etapa {currentStep} de {totalSteps}, {progressPercentage}% completo
        </span>
      </div>
    </div>
  );
}
