import { useState, useEffect, useRef } from 'preact/hooks';

interface TextFieldProps {
  label: string;
  type?: 'text' | 'email';
  value?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  validation?: {
    minLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  onChange: (value: string, isValid: boolean) => void;
  onBlur?: () => void;
  className?: string;
  autoComplete?: string;
}

export default function TextField({
  label,
  type = 'text',
  value = '',
  placeholder,
  helperText,
  required = false,
  validation,
  onChange,
  onBlur,
  className = '',
  autoComplete
}: TextFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validation function
  const validateValue = (val: string): string | null => {
    const trimmedVal = val.trim();
    
    if (required && !trimmedVal) {
      return 'Este campo é obrigatório.';
    }

    if (!trimmedVal) {
      return null; // Empty non-required field is valid
    }

    if (validation?.minLength && trimmedVal.length < validation.minLength) {
      return `Mínimo de ${validation.minLength} caracteres.`;
    }

    if (type === 'email') {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmedVal)) {
        return 'Digite um e-mail válido (ex.: nome@domínio.com).';
      }
    }

    if (validation?.pattern && !validation.pattern.test(trimmedVal)) {
      return 'Formato inválido.';
    }

    if (validation?.custom) {
      return validation.custom(trimmedVal);
    }

    return null;
  };

  // Capitalize words for name field
  const formatName = (name: string): string => {
    if (type !== 'text') return name;
    
    return name
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  // Handle input change
  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    let newValue = target.value;

    setInputValue(newValue);
    
    // Real-time validation only after first touch
    if (touched) {
      const validationError = validateValue(newValue);
      setError(validationError);
      onChange(newValue, !validationError);
    } else {
      onChange(newValue, true); // Assume valid until touched
    }
  };

  // Handle blur
  const handleBlur = () => {
    setTouched(true);
    setFocused(false);
    
    let finalValue = inputValue;
    
    // Format name on blur (don't alter during typing)
    if (type === 'text' && inputValue) {
      finalValue = formatName(inputValue);
      setInputValue(finalValue);
    }
    
    // Validate on blur
    const validationError = validateValue(finalValue);
    setError(validationError);
    onChange(finalValue, !validationError);
    
    onBlur?.();
  };

  // Handle focus
  const handleFocus = () => {
    setFocused(true);
  };

  // Update local state when external value changes
  useEffect(() => {
    setInputValue(value);
    // Also validate the initial value
    if (value) {
      const validationError = validateValue(value);
      setError(validationError);
      onChange(value, !validationError);
    }
  }, [value]);

  // Generate unique ID for accessibility
  const fieldId = `text-field-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  const hasError = touched && error;
  const showHelperText = helperText && !hasError;

  return (
    <div className={`text-field ${className} ${hasError ? 'text-field--error' : ''} ${focused ? 'text-field--focused' : ''}`}>
      <label htmlFor={fieldId} className="text-field__label">
        {label}
        {required && <span className="text-field__required" aria-label="obrigatório"> *</span>}
      </label>

      <div className="text-field__input-container">
        <input
          ref={inputRef}
          type={type}
          id={fieldId}
          value={inputValue}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="text-field__input"
          aria-invalid={hasError}
          aria-describedby={`${showHelperText ? helperId : ''} ${hasError ? errorId : ''}`.trim() || undefined}
        />
        
        {/* Input validation icon */}
        {touched && (
          <div className="text-field__icon" aria-hidden="true">
            {error ? (
              <svg className="text-field__icon--error" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 4v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : inputValue ? (
              <svg className="text-field__icon--success" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 8l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : null}
          </div>
        )}
      </div>

      {/* Helper text */}
      {showHelperText && (
        <div id={helperId} className="text-field__helper">
          {helperText}
        </div>
      )}

      {/* Error message */}
      {hasError && (
        <div id={errorId} className="text-field__error" role="alert">
          <svg className="text-field__error-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 4v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
