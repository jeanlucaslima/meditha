import { useState, useEffect } from 'preact/hooks';

export default function QuizEngineSimple() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  console.log('[QuizEngineSimple] Rendering step:', step);

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1>Quiz Engine Simple Test</h1>
        <p>Current step: {step}</p>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        
        <button 
          onClick={() => setStep(step + 1)}
          style={{ 
            padding: '12px 24px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          Next Step
        </button>
        
        <button 
          onClick={() => setLoading(!loading)}
          style={{ 
            padding: '12px 24px', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}
        >
          Toggle Loading
        </button>

        <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Step Content</h3>
          {step === 1 && <p>This is step 1 - Introduction</p>}
          {step === 2 && <p>This is step 2 - Age Selection</p>}
          {step === 6 && <p>This is step 6 - Lead Form</p>}
          {step > 6 && <p>Step {step} content would go here</p>}
        </div>
      </div>
    </div>
  );
}
