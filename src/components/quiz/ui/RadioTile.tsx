import { useState, useEffect } from 'preact/hooks';
import type { QuizOption } from '../../../lib/quiz/types';

interface RadioTileProps {
  title: string;
  options: QuizOption[];
  value?: any;
  onChange: (value: any) => void;
  onAutoAdvance?: () => void;
  autoAdvanceDelay?: number;
  className?: string;
  columns?: 1 | 2;
}

export default function RadioTile({
  title,
  options = [],
  value,
  onChange,
  onAutoAdvance,
  autoAdvanceDelay = 150,
  className = '',
  columns = 1
}: RadioTileProps) {
  
  // Debug logging
  console.log('[RadioTile] Rendering with:', { title, options: options?.length, value, columns });
  const [selectedValue, setSelectedValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleChange = (optionValue: any, autoAdvance = true) => {
    if (selectedValue === optionValue) return;

    setSelectedValue(optionValue);
    onChange(optionValue);
    
    // Add micro-interaction animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 90);

    // Auto-advance for single choice
    if (autoAdvance && onAutoAdvance) {
      setTimeout(onAutoAdvance, autoAdvanceDelay);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent, optionValue: any) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleChange(optionValue);
    }
  };

  // Update local state when external value changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const tileGrid = columns === 2 ? 'radio-tile__grid--two-cols' : 'radio-tile__grid--one-col';

  return (
    <div className={`radio-tile ${className}`}>
      {title && (
        <h2 className="radio-tile__title">
          {title}
        </h2>
      )}

      <div 
        className={`radio-tile__grid ${tileGrid}`} 
        role="radiogroup" 
        aria-label={title || 'Opções'}
      >
        {options?.map?.((option, index) => {
          if (!option) return null;
          
          const isSelected = selectedValue === option.value;
          const tileId = `radio-tile-${option.id || index}`;

          return (
            <label
              key={option.id || index}
              htmlFor={tileId}
              className={`radio-tile__option ${isSelected ? 'radio-tile__option--selected' : ''} ${isAnimating && isSelected ? 'radio-tile__option--animating' : ''}`}
              onKeyDown={(e) => handleKeyDown(e as KeyboardEvent, option.value)}
              tabIndex={0}
            >
              <input
                type="radio"
                id={tileId}
                name={`radio-tile-${title.replace(/\s+/g, '-').toLowerCase()}`}
                value={option.value}
                checked={isSelected}
                onChange={() => handleChange(option.value)}
                className="radio-tile__input"
                aria-describedby={title}
                tabIndex={-1}
              />

              <div className="radio-tile__content">
                <div className="radio-tile__indicator">
                  <svg 
                    className="radio-tile__check" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle 
                      cx="8" 
                      cy="8" 
                      r="3" 
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="radio-tile__label">
                  {option.label}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
