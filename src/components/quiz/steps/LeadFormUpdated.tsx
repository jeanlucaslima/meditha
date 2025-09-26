import { useState, useEffect, useRef } from 'preact/hooks';
import TextField from '../ui/TextField';
import ConsentBlock from '../ui/ConsentBlock';
import CTAButton from '../ui/CTAButton';

interface LeadFormUpdatedProps {
  title: string;
  content?: string;
  nome?: string;
  email?: string;
  consent?: boolean;
  onChange: (data: { nome?: string; email?: string; consent?: boolean }) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export default function LeadFormUpdated({
  title,
  content,
  nome = '',
  email = '',
  consent = false,
  onChange,
  onSubmit,
  isSubmitting = false,
  className = ''
}: LeadFormUpdatedProps) {
  const [formState, setFormState] = useState({
    nome: { value: nome, isValid: false },
    email: { value: email, isValid: false },
    consent: { value: consent, isValid: false }
  });
  const [firstInvalidField, setFirstInvalidField] = useState<string | null>(null);
  
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nomeRef = useRef<HTMLInputElement>(null);

  // Focus management - focus title when component mounts
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus();
    }
  }, []);

  // Update form state when props change
  useEffect(() => {
    setFormState(prev => ({
      nome: { ...prev.nome, value: nome },
      email: { ...prev.email, value: email },
      consent: { ...prev.consent, value: consent }
    }));
  }, [nome, email, consent]);

  // Initialize validation states on mount
  useEffect(() => {
    // Validate initial values
    const nomeValid = nome.trim().length >= 2;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const consentValid = consent;

    setFormState({
      nome: { value: nome, isValid: nomeValid },
      email: { value: email, isValid: emailValid },
      consent: { value: consent, isValid: consentValid }
    });
  }, []); // Run once on mount

  // Validate and update field
  const updateField = (field: 'nome' | 'email' | 'consent', value: any, isValid: boolean) => {
    setFormState(prev => ({
      ...prev,
      [field]: { value, isValid }
    }));

    onChange({ [field]: value });
  };

  // Check if form is valid
  const isFormValid = formState.nome.isValid && formState.email.isValid && formState.consent.isValid;

  // Handle form submission
  const handleSubmit = () => {
    // Find first invalid field
    let firstInvalid: string | null = null;
    
    if (!formState.nome.isValid) {
      firstInvalid = 'nome';
    } else if (!formState.email.isValid) {
      firstInvalid = 'email';
    } else if (!formState.consent.isValid) {
      firstInvalid = 'consent';
    }

    if (firstInvalid) {
      setFirstInvalidField(firstInvalid);
      
      // Focus first invalid field
      setTimeout(() => {
        if (firstInvalid === 'nome' && nomeRef.current) {
          nomeRef.current.focus();
        } else if (firstInvalid === 'email') {
          // Email field will be focused by TextField component
        }
        // Consent block will be focused by ConsentBlock component
      }, 100);
      
      return;
    }

    if (isFormValid && onSubmit) {
      onSubmit();
    }
  };

  // Handle Enter key in form
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && isFormValid) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div 
      className={`quiz-step quiz-step--lead-form ${className}`}
      onKeyDown={handleKeyDown as any}
    >
      <div className="quiz-step__content">
        <h2 
          ref={titleRef}
          className="quiz-step__title"
          tabIndex={-1}
          aria-live="polite"
        >
          {title}
        </h2>

        {content && (
          <p className="quiz-step__description">
            {content}
          </p>
        )}

        <div className="quiz-step__form">
          <TextField
            label="Seu nome completo"
            type="text"
            value={formState.nome.value}
            placeholder="Digite seu nome"
            required={true}
            validation={{
              minLength: 2,
              custom: (value: string) => {
                const trimmed = value.trim();
                if (trimmed.length < 2) return 'Informe seu nome (mín. 2 letras).';
                if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(trimmed)) return 'Nome deve conter apenas letras.';
                return null;
              }
            }}
            onChange={(value, isValid) => updateField('nome', value, isValid)}
            autoComplete="name"
          />

          <TextField
            label="Seu melhor e-mail"
            type="email"
            value={formState.email.value}
            placeholder="nome@exemplo.com"
            helperText="Onde você quer receber seu plano personalizado"
            required={true}
            onChange={(value, isValid) => updateField('email', value, isValid)}
            autoComplete="email"
          />

          <ConsentBlock
            value={formState.consent.value}
            onChange={(value, isValid) => updateField('consent', value, isValid)}
            required={true}
            policyUrl="/privacy"
          />
        </div>

        <div className="quiz-step__actions">
          <CTAButton
            onClick={handleSubmit}
            disabled={!isFormValid}
            loading={isSubmitting}
            fullWidth
            variant="primary"
            size="lg"
            type="submit"
            ariaLabel="Continuar para receber seu plano personalizado"
          >
            {isSubmitting ? 'Processando...' : 'Receber Meu Plano Personalizado'}
          </CTAButton>
        </div>

        {firstInvalidField && (
          <div className="quiz-step__validation-hint" role="alert">
            Por favor, preencha todos os campos obrigatórios corretamente.
          </div>
        )}
      </div>
    </div>
  );
}
