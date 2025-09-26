import { useState, useEffect, useRef } from 'preact/hooks';
import type { QuizState } from '../../../lib/quiz/types';

interface OfferStepProps {
  state: QuizState;
  onNext: () => void;
  onError: (error: string) => void;
}

// Copy variants based on flags
const getCopyVariants = (flags: QuizState['flags']) => {
  const variants: string[] = [];
  
  if (flags.branch_heavy_remedios) {
    variants.push('Sem depender de remédios todas as noites.');
  }
  
  if (flags.branch_high_ansiedade) {
    variants.push('Rotina anti-ansiedade para deitar mais tranquilo(a).');
  }
  
  if (flags.experienced) {
    variants.push('Método estruturado > técnicas soltas.');
  }
  
  if (flags.reassurance) {
    variants.push('Se não funcionar, você não paga.');
  }
  
  // Return max 3 variants
  return variants.slice(0, 3);
};

// Build variant string for analytics/checkout
const buildVariantString = (flags: QuizState['flags']) => {
  const activeFlags = [];
  
  if (flags.branch_heavy_remedios) activeFlags.push('remedios');
  if (flags.branch_high_ansiedade) activeFlags.push('ansiedade');
  if (flags.experienced) activeFlags.push('experienced');
  if (flags.reassurance) activeFlags.push('reassurance');
  
  return activeFlags.join('+') || 'default';
};

// Get personalized "Antes" bullets based on answers
const getAntesBullets = (state: QuizState) => {
  const bullets: string[] = [];
  
  // Based on diagnostico
  if (state.diagnostico === 'demoro') {
    bullets.push('Demora para adormecer');
  }
  if (state.diagnostico === 'acordo_varias') {
    bullets.push('Acorda várias vezes durante a noite');
  }
  if (state.diagnostico === 'acordo_cansado') {
    bullets.push('Acorda cansado(a) e sem energia');
  }
  
  // Based on ansiedade
  if (state.ansiedade === 'sempre' || state.ansiedade === 'muitas') {
    bullets.push('Ansiedade na hora de deitar');
  }
  
  // Based on remedios
  if (state.remedios === 'frequente' || state.remedios === 'tentei_nao_resolveu') {
    bullets.push('Medo de depender de remédio');
  }
  
  // From impactos if available
  if (state.impactos?.includes('produtividade')) {
    bullets.push('Produtividade em queda');
  }
  
  // Fallback bullets if not enough
  if (bullets.length < 3) {
    const fallbacks = [
      'Noites mal dormidas',
      'Cansaço durante o dia',
      'Dificuldade para relaxar'
    ];
    fallbacks.forEach(fallback => {
      if (bullets.length < 4 && !bullets.includes(fallback)) {
        bullets.push(fallback);
      }
    });
  }
  
  return bullets.slice(0, 4);
};

// Get personalized "Depois" bullets based on desires and flags
const getDepoisBullets = (state: QuizState) => {
  const bullets: string[] = [];
  
  // From desejos
  if (state.desejos?.includes('dormir_rapido')) {
    bullets.push('Dormir rápido e profundamente');
  }
  if (state.desejos?.includes('energia')) {
    bullets.push('Acordar leve e com energia');
  }
  
  // Flag-based additions
  if (state.flags.branch_high_ansiedade) {
    bullets.push('Rotina anti-ansiedade para deitar tranquilo(a)');
  }
  if (state.flags.branch_heavy_remedios) {
    bullets.push('Sem depender de remédios todas as noites');
  }
  
  // Generic positive outcomes
  const fallbacks = [
    'Sono regulado em poucos dias',
    'Noites tranquilas e reparadoras',
    'Mente relaxada na hora de dormir',
    'Despertar renovado(a)'
  ];
  
  fallbacks.forEach(fallback => {
    if (bullets.length < 4 && !bullets.includes(fallback)) {
      bullets.push(fallback);
    }
  });
  
  return bullets.slice(0, 4);
};

export default function OfferStep({ state, onNext, onError }: OfferStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Track if events have been fired to prevent duplicates
  const eventsFired = useRef({
    quiz_complete: false,
    offer_view: false
  });
  
  // Analytics function
  const trackEvent = async (event: string, data: Record<string, any>) => {
    try {
      // In a real app, replace this with your analytics service
      console.log(`Analytics: ${event}`, data);
      
      // Example: send to your analytics service
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ event, ...data })
      // });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };
  
  // On load actions
  useEffect(() => {
    const sessionId = state.sessionId;
    const completedKey = `quiz_complete_fired:${sessionId}`;
    const offerViewKey = `offer_view_fired:${sessionId}`;
    
    // Ensure completedAt is set
    if (!state.completedAt) {
      // This should be handled by the quiz store, but as fallback:
      console.warn('completedAt not set on Step 18, setting now');
    }
    
    // Fire quiz_complete event once
    if (!eventsFired.current.quiz_complete && !sessionStorage.getItem(completedKey)) {
      trackEvent('quiz_complete', {
        sessionId,
        completedAt: state.completedAt || Date.now(),
        path: '/durma/quiz'
      });
      
      eventsFired.current.quiz_complete = true;
      sessionStorage.setItem(completedKey, 'true');
    }
    
    // Fire offer_view event once
    if (!eventsFired.current.offer_view && !sessionStorage.getItem(offerViewKey)) {
      const variant = buildVariantString(state.flags);
      
      trackEvent('offer_view', {
        sessionId,
        flags: state.flags,
        path: '/durma/quiz',
        variant
      });
      
      eventsFired.current.offer_view = true;
      sessionStorage.setItem(offerViewKey, 'true');
    }
  }, [state.sessionId, state.completedAt, state.flags]);
  
  // Validate prerequisites
  const hasPrerequisites = state.nome && state.email && state.consent && state.sessionId;
  
  if (!hasPrerequisites) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Dados incompletos
          </h2>
          <p className="text-red-700 mb-4">
            Precisamos do seu e-mail e consentimento para enviar seu plano.
          </p>
          <button
            onClick={() => window.location.href = '/durma/quiz?step=5'}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Completar cadastro
          </button>
        </div>
      </div>
    );
  }
  
  const variants = getCopyVariants(state.flags);
  const antesBullets = getAntesBullets(state);
  const depoisBullets = getDepoisBullets(state);
  const variantString = buildVariantString(state.flags);
  
  // Send final snapshot to API
  const sendFinalSnapshot = async () => {
    const snapshotKey = `final_snapshot_sent:${state.sessionId}`;
    if (sessionStorage.getItem(snapshotKey)) {
      return; // Already sent
    }
    
    try {
      const payload = {
        sessionId: state.sessionId,
        completedAt: state.completedAt || Date.now(),
        nome: state.nome,
        email: state.email,
        consent: state.consent,
        answers: {
          idade: state.idade,
          diagnostico: state.diagnostico,
          horas: state.horas,
          remedios: state.remedios,
          ansiedade: state.ansiedade,
          impactos: state.impactos,
          consequencias: state.consequencias,
          desejos: state.desejos,
          conhecimento: state.conhecimento,
          direcionamento: state.direcionamento,
          micro: state.micro
        },
        flags: state.flags,
        meta: {
          variant: variantString,
          source: 'quiz',
          issuedAt: Date.now()
        }
      };
      
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      sessionStorage.setItem(snapshotKey, 'true');
    } catch (error) {
      console.warn('Failed to send final snapshot:', error);
      
      // Show non-blocking warning but continue to checkout
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          sendFinalSnapshot();
        }, 2000 * Math.pow(2, retryCount)); // Exponential backoff
      }
      
      // Don't block checkout flow
      return;
    }
  };
  
  // Handle CTA click
  const handleCTAClick = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Track click event
      await trackEvent('offer_click', {
        sessionId: state.sessionId,
        step: 18,
        source: 'primary',
        variant: variantString
      });
      
      // Send final snapshot
      await sendFinalSnapshot();
      
      // Build checkout URL (Mode B - External Provider)
      const checkoutResponse = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          variant: variantString,
          source: 'quiz'
        })
      });
      
      if (!checkoutResponse.ok) {
        throw new Error('Checkout creation failed');
      }
      
      const { url } = await checkoutResponse.json();
      
      // Redirect to checkout
      window.location.href = url;
      
    } catch (error) {
      console.error('Checkout handoff failed:', error);
      setIsLoading(false);
      onError('Erro ao processar checkout. Tente novamente.');
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Headline */}
      <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
        <strong>{state.nome}</strong>, seu plano personalizado para dormir naturalmente está pronto!
      </h1>
      
      {/* Antes × Depois Panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Antes */}
          <div>
            <h3 className="text-lg font-semibold text-red-600 mb-4 text-center">
              Antes
            </h3>
            <ul className="space-y-2">
              {antesBullets.map((bullet, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span className="text-gray-700">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Depois */}
          <div>
            <h3 className="text-lg font-semibold text-green-600 mb-4 text-center">
              Depois
            </h3>
            <ul className="space-y-2">
              {depoisBullets.map((bullet, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Variant messages */}
        {variants.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              {variants.map((variant, index) => (
                <p key={index} className="text-blue-700 font-medium">
                  {variant}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* O que você vai receber */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-blue-900 mb-4">
          O que você vai receber
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-3">📱</span>
            <span className="text-gray-700">7 áudios guiados (5–10 min/noite)</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-3">✅</span>
            <span className="text-gray-700">Checklist diário de 7 dias</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-3">🧘</span>
            <span className="text-gray-700">Técnicas naturais anti-ansiedade</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-3">🎥</span>
            <span className="text-gray-700">Videoaulas curtas (opcional)</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-3">💬</span>
            <span className="text-gray-700">Suporte básico por e-mail (7 dias)</span>
          </li>
        </ul>
      </div>
      
      {/* Preço + Garantia */}
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-green-600 mb-2">R$67</div>
        <div className="text-gray-600 mb-4">acesso completo ao Desafio 7 Dias</div>
        <div className="text-lg font-semibold text-blue-700">
          <strong>Garantia:</strong> se não funcionar, você não paga.
        </div>
      </div>
      
      {/* Primary CTA */}
      <div className="mb-8">
        <button
          onClick={handleCTAClick}
          disabled={isLoading}
          className="w-full bg-green-600 text-white text-lg font-bold py-4 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          data-event="offer_click"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </span>
          ) : (
            'Quero dormir naturalmente agora'
          )}
        </button>
      </div>
      
      {/* Trust row */}
      <div className="text-center text-sm text-gray-500 space-x-4">
        <span className="inline-flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
          </svg>
          Pagamento seguro
        </span>
        
        <a href="/privacidade" target="_blank" className="hover:text-blue-600">
          Política de Privacidade
        </a>
        <a href="/termos" target="_blank" className="hover:text-blue-600">
          Termos
        </a>
        <a href="/reembolso" target="_blank" className="hover:text-blue-600">
          Política de Reembolso
        </a>
      </div>
      
      {/* FAQ Section - Below the fold */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Perguntas Frequentes
        </h3>
        
        <div className="space-y-4">
          <details className="bg-white border border-gray-200 rounded-lg p-4">
            <summary className="font-medium cursor-pointer">
              Quanto tempo por dia preciso dedicar?
            </summary>
            <p className="mt-2 text-gray-600">
              5–10 minutos por noite. É um método simples que se encaixa facilmente na sua rotina.
            </p>
          </details>
          
          <details className="bg-white border border-gray-200 rounded-lg p-4">
            <summary className="font-medium cursor-pointer">
              Quando vou ver resultados?
            </summary>
            <p className="mt-2 text-gray-600">
              Em poucos dias! Muitos participantes relatam melhorias já no Dia 3–5.
            </p>
          </details>
          
          <details className="bg-white border border-gray-200 rounded-lg p-4">
            <summary className="font-medium cursor-pointer">
              Posso usar junto com medicações?
            </summary>
            <p className="mt-2 text-gray-600">
              Sim, é um método natural e complementar. Nunca pare medicação sem orientação médica.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
