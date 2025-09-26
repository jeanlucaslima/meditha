import { useEffect, useRef } from 'preact/hooks';
import CheckboxPill from '../ui/CheckboxPill';
import CTAButton from '../ui/CTAButton';
import type { QuizOption } from '../../../lib/quiz/types';

interface MultipleChoiceUpdatedProps {
  title: string;
  content?: string;
  options: QuizOption[];
  value?: any[];
  onChange: (values: any[]) => void;
  onContinue?: () => void;
  minSelections?: number;
  maxSelections?: number;
  isValid?: boolean;
  className?: string;
}

export default function MultipleChoiceUpdated({
  title,
  content,
  options,
  value = [],
  onChange,
  onContinue,
  minSelections = 1,
  maxSelections,
  isValid = false,
  className = ''
}: MultipleChoiceUpdatedProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const selectedCount = value.length;

  // Focus management - focus title when component mounts
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  // Check if minimum selections are met
  const canContinue = selectedCount >= minSelections;

  const handleContinue = () => {
    if (canContinue && onContinue) {
      onContinue();
    }
  };

  return (
    <div className={`quiz-step quiz-step--multiple-choice ${className}`}>
      <div className="quiz-step__content">
        <h2 
          ref={titleRef}
          className="quiz-step__title"
          tabIndex={-1}
          aria-live="polite"
        >
          {title}
        </h2>

        <CheckboxPill
          title=""
          content={content}
          options={options}
          value={value}
          onChange={onChange}
          minSelections={minSelections}
          maxSelections={maxSelections}
        />

        <div className="quiz-step__actions">
          <CTAButton
            onClick={handleContinue}
            disabled={!canContinue}
            fullWidth
            variant="primary"
            size="lg"
            count={selectedCount}
            ariaLabel={`Continuar com ${selectedCount} opção${selectedCount !== 1 ? 'es' : ''} selecionada${selectedCount !== 1 ? 's' : ''}`}
          >
            Continuar
          </CTAButton>
        </div>
      </div>
    </div>
  );
}
