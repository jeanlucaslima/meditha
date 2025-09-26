import { useEffect, useRef } from 'preact/hooks';
import RadioTile from '../ui/RadioTile';
import type { QuizOption } from '../../../lib/quiz/types';

interface SingleChoiceUpdatedProps {
  title: string;
  options: QuizOption[];
  value?: any;
  onChange: (value: any) => void;
  onAutoAdvance?: () => void;
  autoAdvanceDelay?: number;
  className?: string;
}

export default function SingleChoiceUpdated({
  title,
  options,
  value,
  onChange,
  onAutoAdvance,
  autoAdvanceDelay = 150,
  className = ''
}: SingleChoiceUpdatedProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Focus management - focus title when component mounts
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  return (
    <div className={`quiz-step quiz-step--single-choice ${className}`}>
      <div className="quiz-step__content">
        <h2 
          ref={titleRef}
          className="quiz-step__title"
          tabIndex={-1}
          aria-live="polite"
        >
          {title}
        </h2>

        <RadioTile
          title=""
          options={options}
          value={value}
          onChange={onChange}
          onAutoAdvance={() => {
            // Add small delay to ensure state is updated before advancing
            setTimeout(() => {
              onAutoAdvance?.();
            }, 100);
          }}
          autoAdvanceDelay={autoAdvanceDelay}
          columns={options.length <= 4 ? 1 : 2}
        />
      </div>
    </div>
  );
}
