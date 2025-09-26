import { useState, useEffect } from 'preact/hooks';
import { LEAD_FORM, VALIDATION_MESSAGES } from '../../../lib/quiz/content';
import { EMAIL_REGEX, MIN_NAME_LENGTH } from '../../../lib/quiz/types';

interface LeadFormProps {
  title: string;
  content?: string;
  nome?: string;
  email?: string;
  consent?: boolean;
  onChange: (data: { nome?: string; email?: string; consent?: boolean }) => void;
}

export default function LeadForm({
  title,
  content,
  nome = '',
  email = '',
  consent = false,
  onChange
}: LeadFormProps) {
  const [formData, setFormData] = useState({
    nome,
    email,
    consent,
    honeypot: '' // Bot detection
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update parent component
  useEffect(() => {
    onChange({
      nome: formData.nome,
      email: formData.email,
      consent: formData.consent
    });
  }, [formData.nome, formData.email, formData.consent]);

  // Update local state when props change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      nome,
      email,
      consent
    }));
  }, [nome, email, consent]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'nome':
        if (!value || value.trim().length < MIN_NAME_LENGTH) {
          return VALIDATION_MESSAGES.name;
        }
        break;

      case 'email':
        if (!value || !EMAIL_REGEX.test(value.trim())) {
          return VALIDATION_MESSAGES.email;
        }
        break;

      case 'consent':
        if (!value) {
          return VALIDATION_MESSAGES.consent;
        }
        break;
    }
    return '';
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const isFieldInvalid = (name: string) => {
    return touched[name] && errors[name];
  };

  return (
    <div className="quiz-step quiz-step-form">
      <div className="quiz-step-content">
        <h2 className="quiz-title">
          {title}
        </h2>

        {content && (
          <div className="quiz-description">
            <p>{content}</p>
          </div>
        )}

        <div className="quiz-form-fields">
          {/* Nome Field */}
          <div className="quiz-field">
            <label
              htmlFor="quiz-nome"
              className="quiz-field-label"
            >
              {LEAD_FORM.nome.label}
              {LEAD_FORM.nome.required && <span className="quiz-field-required">*</span>}
            </label>

            <input
              type={LEAD_FORM.nome.type}
              id="quiz-nome"
              name="nome"
              value={formData.nome}
              placeholder={LEAD_FORM.nome.placeholder}
              onChange={(e) => handleChange('nome', (e.target as HTMLInputElement).value)}
              onBlur={() => handleBlur('nome')}
              className={`quiz-field-input ${isFieldInvalid('nome') ? 'quiz-field-error' : ''}`}
              aria-invalid={isFieldInvalid('nome')}
              aria-describedby={isFieldInvalid('nome') ? 'nome-error' : undefined}
              required={LEAD_FORM.nome.required}
            />

            {isFieldInvalid('nome') && (
              <div
                id="nome-error"
                className="quiz-field-error-message"
                role="alert"
              >
                {errors.nome}
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="quiz-field">
            <label
              htmlFor="quiz-email"
              className="quiz-field-label"
            >
              {LEAD_FORM.email.label}
              {LEAD_FORM.email.required && <span className="quiz-field-required">*</span>}
            </label>

            <input
              type={LEAD_FORM.email.type}
              id="quiz-email"
              name="email"
              value={formData.email}
              placeholder={LEAD_FORM.email.placeholder}
              onChange={(e) => handleChange('email', (e.target as HTMLInputElement).value)}
              onBlur={() => handleBlur('email')}
              className={`quiz-field-input ${isFieldInvalid('email') ? 'quiz-field-error' : ''}`}
              aria-invalid={isFieldInvalid('email')}
              aria-describedby={isFieldInvalid('email') ? 'email-error' : undefined}
              required={LEAD_FORM.email.required}
            />

            {isFieldInvalid('email') && (
              <div
                id="email-error"
                className="quiz-field-error-message"
                role="alert"
              >
                {errors.email}
              </div>
            )}
          </div>

          {/* Honeypot Field (hidden) */}
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={(e) => handleChange('honeypot', (e.target as HTMLInputElement).value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Consent Checkbox */}
          <div className="quiz-field quiz-field-consent">
            <label
              htmlFor="quiz-consent"
              className={`quiz-consent-label ${isFieldInvalid('consent') ? 'quiz-field-error' : ''}`}
            >
              <input
                type="checkbox"
                id="quiz-consent"
                name="consent"
                checked={formData.consent}
                onChange={(e) => handleChange('consent', (e.target as HTMLInputElement).checked)}
                onBlur={() => handleBlur('consent')}
                className="quiz-consent-input"
                aria-invalid={isFieldInvalid('consent')}
                aria-describedby={isFieldInvalid('consent') ? 'consent-error' : undefined}
                required={LEAD_FORM.consent.required}
              />

              <div className="quiz-consent-checkbox" />

              <span className="quiz-consent-text">
                {LEAD_FORM.consent.label.split('Política')[0]}
                <a
                  href={LEAD_FORM.consent.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quiz-consent-link"
                >
                  {LEAD_FORM.consent.linkText}
                </a>
                .
              </span>
            </label>

            {isFieldInvalid('consent') && (
              <div
                id="consent-error"
                className="quiz-field-error-message"
                role="alert"
              >
                {errors.consent}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}