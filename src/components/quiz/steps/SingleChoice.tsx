import { useState, useEffect } from 'preact/hooks';
import type { QuizOption } from '../../../lib/quiz/types';

interface SingleChoiceProps {
  title: string;
  options: QuizOption[];
  value?: any;
  onChange: (value: any) => void;
  onAutoAdvance?: () => void;
  autoAdvanceDelay?: number;
}

export default function SingleChoice({
  title,
  options,
  value,
  onChange,
  onAutoAdvance,
  autoAdvanceDelay = 1200
}: SingleChoiceProps) {
  const [selectedValue, setSelectedValue] = useState(value);

  const handleChange = (optionValue: any, autoAdvance = false) => {
    setSelectedValue(optionValue);
    onChange(optionValue);

    // Auto-advance for single choice with autoAdvance flag
    if (autoAdvance && onAutoAdvance) {
      setTimeout(onAutoAdvance, autoAdvanceDelay);
    }
  };

  // Update local state when external value changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  return (
    <div className="quiz-step quiz-step-single-choice">
      <div className="quiz-step-content">
        <h2 className="quiz-title">
          {title}
        </h2>

        <div className="quiz-options" role="radiogroup" aria-label={title}>
          {options.map((option) => {
            const isSelected = selectedValue === option.value;
            const optionId = `option-${option.id}`;

            return (
              <label
                key={option.id}
                htmlFor={optionId}
                className={`quiz-option quiz-option-single ${isSelected ? 'quiz-option-selected' : ''}`}
              >
                <input
                  type="radio"
                  id={optionId}
                  name="single-choice"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleChange(option.value, option.autoAdvance)}
                  className="quiz-option-input"
                  aria-describedby={title}
                />

                <div className="quiz-option-content">
                  <div className="quiz-option-radio" />
                  <span className="quiz-option-label">
                    {option.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}