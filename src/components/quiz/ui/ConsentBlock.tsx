import { useState, useEffect, useRef } from 'preact/hooks';

interface ConsentBlockProps {
  value?: boolean;
  onChange: (consent: boolean, isValid: boolean) => void;
  required?: boolean;
  className?: string;
  policyUrl?: string;
}

export default function ConsentBlock({
  value = false,
  onChange,
  required = true,
  className = '',
  policyUrl = '/privacy'
}: ConsentBlockProps) {
  const [isChecked, setIsChecked] = useState(value);
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  // Handle checkbox change
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const newValue = target.checked;
    
    setIsChecked(newValue);
    setTouched(true);
    
    // Validate
    const validationError = required && !newValue ? 'Você precisa aceitar para continuar.' : null;
    setError(validationError);
    
    onChange(newValue, !validationError);
  };

  // Handle tooltip toggle
  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  // Handle click outside tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showTooltip &&
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTooltip]);

  // Handle escape key to close tooltip
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showTooltip) {
        setShowTooltip(false);
        iconRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showTooltip]);

  // Update local state when external value changes
  useEffect(() => {
    setIsChecked(value);
  }, [value]);

  const fieldId = 'consent-checkbox';
  const errorId = 'consent-error';
  const tooltipId = 'consent-tooltip';

  const hasError = touched && error;

  return (
    <div className={`consent-block ${className} ${hasError ? 'consent-block--error' : ''}`}>
      <div className="consent-block__content">
        <label htmlFor={fieldId} className="consent-block__label">
          <input
            type="checkbox"
            id={fieldId}
            checked={isChecked}
            onChange={handleChange}
            className="consent-block__checkbox"
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            required={required}
          />
          
          <div className="consent-block__indicator">
            <svg 
              className="consent-block__check" 
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
          
          <span className="consent-block__text">
            <strong>Concordo com o tratamento de dados conforme a </strong>
            <a 
              href={policyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="consent-block__link"
              onClick={(e) => e.stopPropagation()}
            >
              Política
            </a>
            <strong>.</strong>
          </span>
        </label>

        <button
          ref={iconRef}
          type="button"
          className="consent-block__info"
          onClick={toggleTooltip}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTooltip();
            }
          }}
          aria-label="Mais informações sobre o tratamento de dados"
          aria-expanded={showTooltip}
          aria-controls={tooltipId}
        >
          <svg className="consent-block__info-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 7.5V12M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div 
            ref={tooltipRef}
            id={tooltipId}
            className="consent-block__tooltip"
            role="tooltip"
            aria-live="polite"
          >
            <div className="consent-block__tooltip-content">
              Seus dados serão usados apenas para personalizar sua experiência e enviar o material solicitado.
            </div>
            <div className="consent-block__tooltip-arrow" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <div id={errorId} className="consent-block__error" role="alert">
          <svg className="consent-block__error-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 4v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
