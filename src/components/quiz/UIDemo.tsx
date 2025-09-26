import { useState } from 'preact/hooks';
import { RadioTile, CheckboxPill, TextField, ConsentBlock, ProgressBarTop, CTAButton } from './ui';

// Demo component to test all UI components
export default function UIDemo() {
  const [radioValue, setRadioValue] = useState('');
  const [checkboxValues, setCheckboxValues] = useState<string[]>([]);
  const [nameValue, setNameValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [consent, setConsent] = useState(false);
  const [progress, setProgress] = useState(30);

  const radioOptions = [
    { id: '1', label: 'Menos de 30 anos', value: 'young' },
    { id: '2', label: '30-50 anos', value: 'middle' },
    { id: '3', label: 'Mais de 50 anos', value: 'mature' },
  ];

  const checkboxOptions = [
    { id: '1', label: 'Ansiedade', value: 'anxiety' },
    { id: '2', label: 'Estresse', value: 'stress' },
    { id: '3', label: 'Preocupações', value: 'worries' },
    { id: '4', label: 'Dores físicas', value: 'pain' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <h1>UI Components Demo</h1>
      
      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem', position: 'sticky', top: 0, zIndex: 100 }}>
        <ProgressBarTop
          currentStep={3}
          totalSteps={10}
          percentage={progress}
          stepLabel="Etapa 3 de 10"
        />
      </div>

      {/* Radio Tile */}
      <div style={{ marginBottom: '3rem' }}>
        <RadioTile
          title="Qual a sua faixa etária?"
          options={radioOptions}
          value={radioValue}
          onChange={(value) => setRadioValue(value)}
          onAutoAdvance={() => console.log('Auto-advancing...')}
        />
      </div>

      {/* Checkbox Pills */}
      <div style={{ marginBottom: '3rem' }}>
        <CheckboxPill
          title="O que mais atrapalha seu sono?"
          content="Selecione todas as opções que se aplicam a você"
          options={checkboxOptions}
          value={checkboxValues}
          onChange={(values) => setCheckboxValues(values)}
          minSelections={1}
          maxSelections={3}
        />
      </div>

      {/* Text Fields */}
      <div style={{ marginBottom: '3rem' }}>
        <TextField
          label="Seu nome"
          type="text"
          value={nameValue}
          placeholder="Digite seu nome completo"
          required
          validation={{ minLength: 2 }}
          onChange={(value, isValid) => {
            setNameValue(value);
            console.log('Name valid:', isValid);
          }}
          autoComplete="name"
        />

        <TextField
          label="Seu e-mail"
          type="email"
          value={emailValue}
          placeholder="exemplo@email.com"
          helperText="Onde você quer receber seu plano personalizado"
          required
          onChange={(value, isValid) => {
            setEmailValue(value);
            console.log('Email valid:', isValid);
          }}
          autoComplete="email"
        />
      </div>

      {/* Consent Block */}
      <div style={{ marginBottom: '3rem' }}>
        <ConsentBlock
          value={consent}
          onChange={(value, isValid) => {
            setConsent(value);
            console.log('Consent valid:', isValid);
          }}
          required
        />
      </div>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <CTAButton
          variant="primary"
          size="lg"
          onClick={() => console.log('Primary clicked')}
          count={checkboxValues.length}
        >
          Continuar
        </CTAButton>

        <CTAButton
          variant="outline"
          size="md"
          onClick={() => console.log('Back clicked')}
        >
          Voltar
        </CTAButton>

        <CTAButton
          variant="secondary"
          size="sm"
          loading={true}
          onClick={() => console.log('Loading clicked')}
        >
          Carregando
        </CTAButton>

        <CTAButton
          variant="danger"
          disabled={true}
          onClick={() => console.log('Disabled clicked')}
        >
          Desabilitado
        </CTAButton>
      </div>

      {/* Progress Control */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <label htmlFor="progress-slider">Progress: {progress}%</label>
        <input
          id="progress-slider"
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number((e.target as HTMLInputElement).value))}
          style={{ width: '100%', marginTop: '0.5rem' }}
        />
      </div>

      {/* Debug Info */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px', fontSize: '0.875rem' }}>
        <h3>State Debug:</h3>
        <p>Radio: {radioValue}</p>
        <p>Checkboxes: {checkboxValues.join(', ')}</p>
        <p>Name: {nameValue}</p>
        <p>Email: {emailValue}</p>
        <p>Consent: {consent.toString()}</p>
      </div>
    </div>
  );
}
