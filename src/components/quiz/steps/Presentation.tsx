import { useEffect } from 'preact/hooks';

interface PresentationProps {
  title: string;
  content?: string;
  onAutoAdvance?: () => void;
  autoAdvanceDelay?: number;
  showCTA?: boolean;
}

export default function Presentation({
  title,
  content,
  onAutoAdvance,
  autoAdvanceDelay = 0,
  showCTA = true
}: PresentationProps) {
  // Auto-advance for loading steps
  useEffect(() => {
    if (onAutoAdvance && autoAdvanceDelay > 0) {
      const timer = setTimeout(onAutoAdvance, autoAdvanceDelay);
      return () => clearTimeout(timer);
    }
  }, [onAutoAdvance, autoAdvanceDelay]);

  return (
    <div className="quiz-step quiz-step-presentation">
      <div className="quiz-step-content">
        <h2 className="quiz-title">
          {title}
        </h2>

        {content && (
          <div className="quiz-description">
            <p>{content}</p>
          </div>
        )}

        {!showCTA && (
          <div className="quiz-presentation-visual">
            {/* Can be extended with icons, images, or other visual elements */}
          </div>
        )}
      </div>
    </div>
  );
}