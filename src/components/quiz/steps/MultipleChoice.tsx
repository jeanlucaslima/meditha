import { useState, useEffect } from 'preact/hooks';
import type { QuizOption } from '../../../lib/quiz/types';

interface MultipleChoiceProps {
  title: string;
  content?: string;
  options: QuizOption[];
  value?: string[];
  onChange: (values: string[]) => void;
  minSelections?: number;
  maxSelections?: number;
}

export default function MultipleChoice({
  title,
  content,
  options,
  value = [],
  onChange,
  minSelections = 1,
  maxSelections
}: MultipleChoiceProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(value);

  const handleChange = (optionValue: string, checked: boolean) => {
    let newValues: string[];

    if (checked) {
      // Add value
      if (maxSelections && selectedValues.length >= maxSelections) {
        return; // Don't add if max reached
      }
      newValues = [...selectedValues, optionValue];
    } else {
      // Remove value
      newValues = selectedValues.filter(v => v !== optionValue);
    }

    setSelectedValues(newValues);
    onChange(newValues);
  };

  // Update local state when external value changes
  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  const isMinMet = selectedValues.length >= minSelections;
  const isMaxReached = maxSelections && selectedValues.length >= maxSelections;

  return (
    <div className="quiz-step quiz-step-multiple-choice">
      <div className="quiz-step-content">
        <h2 className="quiz-title">
          {title}
        </h2>

        {content && (
          <div className="quiz-description">
            <p>{content}</p>
          </div>
        )}

        <div className="quiz-options" role="group" aria-label={title}>
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            const isDisabled = !isSelected && isMaxReached;
            const optionId = `option-${option.id}`;

            return (
              <label
                key={option.id}
                htmlFor={optionId}
                className={`quiz-option quiz-option-multiple ${isSelected ? 'quiz-option-selected' : ''} ${isDisabled ? 'quiz-option-disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  id={optionId}
                  value={option.value}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={(e) => handleChange(option.value, (e.target as HTMLInputElement).checked)}
                  className="quiz-option-input"
                  aria-describedby={title}
                />

                <div className="quiz-option-content">
                  <div className="quiz-option-checkbox" />
                  <span className="quiz-option-label">
                    {option.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Selection counter/helper */}
        <div className="quiz-selection-helper">
          {minSelections > 1 && (
            <p className="quiz-helper-text">
              {isMinMet
                ? `${selectedValues.length} opção${selectedValues.length !== 1 ? 'ões' : ''} selecionada${selectedValues.length !== 1 ? 's' : ''}`
                : `Selecione pelo menos ${minSelections} opções`
              }
            </p>
          )}

          {maxSelections && (
            <p className="quiz-helper-text quiz-helper-max">
              {selectedValues.length}/{maxSelections} opções
            </p>
          )}
        </div>
      </div>
    </div>
  );
}