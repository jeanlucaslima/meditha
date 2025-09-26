import { useState, useEffect } from 'preact/hooks';
import type { QuizOption } from '../../../lib/quiz/types';

interface CheckboxPillProps {
  title: string;
  content?: string;
  options: QuizOption[];
  value?: any[];
  onChange: (values: any[]) => void;
  minSelections?: number;
  maxSelections?: number;
  className?: string;
}

export default function CheckboxPill({
  title,
  content,
  options = [],
  value = [],
  onChange,
  minSelections = 0,
  maxSelections,
  className = ''
}: CheckboxPillProps) {
  
  // Debug logging  
  console.log('[CheckboxPill] Rendering with:', { title, options: options?.length, value: value?.length });
  const [selectedValues, setSelectedValues] = useState<any[]>(value);
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  const handleChange = (optionValue: any, optionId: string | number) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];

    // Check max selections
    if (maxSelections && newValues.length > maxSelections) {
      return;
    }

    setSelectedValues(newValues);
    onChange(newValues);

    // Add micro-interaction animation
    setAnimatingId(String(optionId));
    setTimeout(() => setAnimatingId(null), 90);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent, optionValue: any, optionId: string | number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleChange(optionValue, optionId);
    }
  };

  // Update local state when external value changes
  useEffect(() => {
    setSelectedValues(value);
  }, [value]);

  const selectedCount = selectedValues.length;
  const isMinReached = selectedCount >= minSelections;
  const isMaxReached = maxSelections ? selectedCount >= maxSelections : false;

  return (
    <div className={`checkbox-pill ${className}`}>
      {(title || content) && (
        <div className="checkbox-pill__header">
          {title && (
            <h2 className="checkbox-pill__title">
              {title}
            </h2>
          )}
          {content && (
            <p className="checkbox-pill__content">
              {content}
            </p>
          )}
        </div>
      )}

      <div 
        className="checkbox-pill__options" 
        role="group" 
        aria-label={title}
        aria-describedby={maxSelections ? `selection-limit-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined}
      >
        {options?.map?.((option, index) => {
          if (!option) return null;
          
          const isSelected = selectedValues.includes(option.value);
          const pillId = `checkbox-pill-${option.id || index}`;
          const isDisabled = !isSelected && isMaxReached;
          const isAnimating = animatingId === String(option.id || index);

          return (
            <label
              key={option.id || index}
              htmlFor={pillId}
              className={`checkbox-pill__option ${isSelected ? 'checkbox-pill__option--selected' : ''} ${isDisabled ? 'checkbox-pill__option--disabled' : ''} ${isAnimating ? 'checkbox-pill__option--animating' : ''}`}
              onKeyDown={(e) => handleKeyDown(e as KeyboardEvent, option.value, option.id || index)}
              tabIndex={isDisabled ? -1 : 0}
            >
              <input
                type="checkbox"
                id={pillId}
                name={`checkbox-pill-${title.replace(/\s+/g, '-').toLowerCase()}`}
                value={option.value}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => handleChange(option.value, option.id || index)}
                className="checkbox-pill__input"
                aria-describedby={title}
                tabIndex={-1}
              />

              <div className="checkbox-pill__content">
                <div className="checkbox-pill__indicator">
                  <svg 
                    className="checkbox-pill__check" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    aria-hidden="true"
                  >
                    <path 
                      d="M13 4L6 11L3 8" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="checkbox-pill__label">
                  {option.label}
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {/* Selection Helper */}
      <div className="checkbox-pill__helper">
        {maxSelections && (
          <div 
            id={`selection-limit-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className={`checkbox-pill__helper-text ${isMaxReached ? 'checkbox-pill__helper-text--max' : ''}`}
            aria-live="polite"
          >
            {selectedCount} de {maxSelections} selecionados
            {isMaxReached && <span className="checkbox-pill__helper-max"> (máximo)</span>}
          </div>
        )}
        {minSelections > 0 && selectedCount < minSelections && (
          <div className="checkbox-pill__helper-text checkbox-pill__helper-text--min" aria-live="polite">
            Selecione pelo menos {minSelections} opção{minSelections > 1 ? 'es' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
