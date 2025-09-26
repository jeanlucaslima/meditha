import { useEffect, useState } from 'preact/hooks';
import { PROGRESS_MESSAGES } from '../../../lib/quiz/content';

interface LoadingProps {
  title: string;
  content?: string;
  onComplete: () => void;
  duration?: number; // milliseconds
}

export default function Loading({
  title,
  content,
  onComplete,
  duration = 2000 // 2 seconds default
}: LoadingProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    PROGRESS_MESSAGES.analyzing,
    PROGRESS_MESSAGES.personalizing,
    PROGRESS_MESSAGES.completing
  ];

  useEffect(() => {
    const totalSteps = 100;
    const stepDuration = duration / totalSteps;
    const messageDuration = duration / messages.length;

    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= totalSteps) {
          clearInterval(progressTimer);
          // Complete with slight delay for UX
          setTimeout(onComplete, 200);
          return totalSteps;
        }
        return newProgress;
      });
    }, stepDuration);

    // Message rotation
    const messageTimer = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, messageDuration);

    return () => {
      clearInterval(progressTimer);
      clearInterval(messageTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className="quiz-step quiz-step-loading">
      <div className="quiz-step-content">
        <h2 className="quiz-title">
          {title}
        </h2>

        {content && (
          <div className="quiz-description">
            <p>{content}</p>
          </div>
        )}

        {/* Loading Animation */}
        <div className="quiz-loading-container">
          {/* Spinner */}
          <div className="quiz-loading-spinner" aria-hidden="true">
            <div className="quiz-spinner-ring"></div>
            <div className="quiz-spinner-ring"></div>
            <div className="quiz-spinner-ring"></div>
          </div>

          {/* Progress Bar */}
          <div className="quiz-loading-progress">
            <div className="quiz-loading-progress-bar">
              <div
                className="quiz-loading-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="quiz-loading-percentage">
              {progress}%
            </div>
          </div>

          {/* Dynamic Message */}
          <div
            className="quiz-loading-message"
            aria-live="polite"
            aria-atomic="true"
          >
            {messages[messageIndex]}
          </div>
        </div>

        {/* Accessibility: Screen reader only progress updates */}
        <div className="sr-only" aria-live="polite" aria-atomic="false">
          {progress > 0 && progress % 25 === 0 && (
            `Progresso: ${progress}% completo`
          )}
        </div>
      </div>
    </div>
  );
}