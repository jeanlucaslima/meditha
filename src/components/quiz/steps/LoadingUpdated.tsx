import { useEffect, useRef } from 'preact/hooks';

interface LoadingUpdatedProps {
  title: string;
  content?: string;
  duration?: number;
  onComplete?: () => void;
  className?: string;
}

export default function LoadingUpdated({
  title,
  content,
  duration = 2000,
  onComplete,
  className = ''
}: LoadingUpdatedProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const completedRef = useRef(false);

  // Focus management - focus title when component mounts
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  // Auto-complete after duration
  useEffect(() => {
    if (completedRef.current) return;

    const timer = setTimeout(() => {
      completedRef.current = true;
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <div className={`quiz-step quiz-step--loading ${className}`}>
      <div className="quiz-step__content">
        <h2 
          ref={titleRef}
          className="quiz-step__title"
          tabIndex={-1}
          aria-live="polite"
        >
          {title}
        </h2>

        {content && (
          <p className="quiz-step__description">
            {content}
          </p>
        )}

        {/* Animated Loading Dots */}
        <div className="loading-dots" aria-label="Carregando" role="status">
          <div className="loading-dots__dot" />
          <div className="loading-dots__dot" />
          <div className="loading-dots__dot" />
        </div>

        {/* Screen reader announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Analisando suas respostas e criando seu plano personalizado...
        </div>
      </div>
    </div>
  );
}
