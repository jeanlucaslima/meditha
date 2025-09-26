import type { QuizStep, QuizState } from './types';

// Step content definitions in Portuguese (PT-BR)
export const QUIZ_STEPS: Record<number, QuizStep> = {
  1: {
    id: 1,
    type: 'presentation',
    title: 'Durma naturalmente e acorde cheio de energia em apenas 7 dias',
    content: 'Descubra se você pode eliminar a insônia naturalmente (Questionário de 1 minuto).',
  },

  2: {
    id: 2,
    type: 'single_choice',
    title: 'Qual é a sua faixa etária?',
    options: [
      { id: '18-28', label: '18 a 28 anos', value: '18-28', autoAdvance: true },
      { id: '29-38', label: '29 a 38 anos', value: '29-38', autoAdvance: true },
      { id: '39-49', label: '39 a 49 anos', value: '39-49', autoAdvance: true },
      { id: '50+', label: '50 anos ou mais', value: '50+', autoAdvance: true },
    ],
  },

  3: {
    id: 3,
    type: 'presentation',
    title: 'Você não está sozinho(a)',
    content: 'Mais de 1.000 pessoas já voltaram a dormir naturalmente com este método.',
  },

  4: {
    id: 4,
    type: 'single_choice',
    title: 'Qual situação descreve melhor o seu sono?',
    options: [
      { id: 'demoro', label: 'Demoro mais de 30 min para adormecer', value: 'demoro', autoAdvance: true },
      { id: 'acordo_varias', label: 'Acordo várias vezes durante a noite', value: 'acordo_varias', autoAdvance: true },
      { id: 'acordo_cansado', label: 'Acordo cansado(a), mesmo dormindo 7-8h', value: 'acordo_cansado', autoAdvance: true },
      { id: 'sem_problemas', label: 'Não tenho problemas para dormir', value: 'sem_problemas', autoAdvance: true },
    ],
  },

  5: {
    id: 5,
    type: 'single_choice',
    title: 'Quantas horas você dorme por noite?',
    options: [
      { id: '<5', label: 'Menos de 5 horas', value: '<5', autoAdvance: true },
      { id: '5-6', label: '5 a 6 horas', value: '5-6', autoAdvance: true },
      { id: '7-8', label: '7 a 8 horas', value: '7-8', autoAdvance: true },
      { id: '>8', label: 'Mais de 8 horas', value: '>8', autoAdvance: true },
    ],
  },

  6: {
    id: 6,
    type: 'form',
    title: 'Para personalizar seus resultados...',
    content: 'Precisamos de algumas informações básicas:',
    validation: {
      required: true,
    },
  },

  7: {
    id: 7,
    type: 'single_choice',
    title: 'Você já tentou remédios para dormir?',
    options: [
      { id: 'frequente', label: 'Uso frequentemente (melatonina, rivotril, etc.)', value: 'frequente', autoAdvance: true },
      { id: 'tentei_nao_resolveu', label: 'Já tentei mas não resolveu', value: 'tentei_nao_resolveu', autoAdvance: true },
      { id: 'pensei', label: 'Já pensei em tentar', value: 'pensei', autoAdvance: true },
      { id: 'nunca', label: 'Nunca tentei', value: 'nunca', autoAdvance: true },
    ],
  },

  8: {
    id: 8,
    type: 'single_choice',
    title: 'Com que frequência você sente ansiedade?',
    options: [
      { id: 'sempre', label: 'Sempre', value: 'sempre', autoAdvance: true },
      { id: 'muitas', label: 'Muitas vezes', value: 'muitas', autoAdvance: true },
      { id: 'raramente', label: 'Raramente', value: 'raramente', autoAdvance: true },
      { id: 'nunca', label: 'Nunca', value: 'nunca', autoAdvance: true },
    ],
  },

  9: {
    id: 9,
    type: 'multiple_choice',
    title: 'Como a falta de sono tem afetado você?',
    content: 'Selecione todas as opções que se aplicam:',
    options: [
      { id: 'concentracao', label: 'Dificuldade de concentração', value: 'concentracao' },
      { id: 'memoria', label: 'Problemas de memória', value: 'memoria' },
      { id: 'humor', label: 'Mudanças de humor/irritabilidade', value: 'humor' },
      { id: 'energia', label: 'Falta de energia durante o dia', value: 'energia' },
      { id: 'trabalho', label: 'Queda na produtividade no trabalho', value: 'trabalho' },
      { id: 'relacionamentos', label: 'Impacto nos relacionamentos', value: 'relacionamentos' },
    ],
    validation: {
      minSelections: 1,
    },
  },

  10: {
    id: 10,
    type: 'multiple_choice',
    title: 'Quais consequências mais te preocupam?',
    content: 'Selecione suas principais preocupações:',
    options: [
      { id: 'saude_mental', label: 'Problemas de saúde mental (depressão, ansiedade)', value: 'saude_mental' },
      { id: 'sistema_imune', label: 'Sistema imunológico enfraquecido', value: 'sistema_imune' },
      { id: 'ganho_peso', label: 'Ganho de peso', value: 'ganho_peso' },
      { id: 'envelhecimento', label: 'Envelhecimento precoce', value: 'envelhecimento' },
      { id: 'performance', label: 'Queda na performance física/mental', value: 'performance' },
      { id: 'doencas', label: 'Risco de doenças crônicas', value: 'doencas' },
    ],
    validation: {
      minSelections: 1,
    },
  },

  11: {
    id: 11,
    type: 'multiple_choice',
    title: 'O que você mais deseja alcançar?',
    content: 'Selecione seus objetivos principais:',
    options: [
      { id: 'adormecer_rapido', label: 'Adormecer rapidamente (em até 10 minutos)', value: 'adormecer_rapido' },
      { id: 'sono_profundo', label: 'Ter um sono profundo e reparador', value: 'sono_profundo' },
      { id: 'acordar_disposto', label: 'Acordar disposto(a) e com energia', value: 'acordar_disposto' },
      { id: 'parar_remedios', label: 'Parar de depender de remédios', value: 'parar_remedios' },
      { id: 'reduzir_ansiedade', label: 'Reduzir a ansiedade naturalmente', value: 'reduzir_ansiedade' },
      { id: 'melhorar_humor', label: 'Melhorar o humor e disposição', value: 'melhorar_humor' },
    ],
    validation: {
      minSelections: 1,
    },
  },

  12: {
    id: 12,
    type: 'presentation',
    title: 'Depoimentos Reais',
    content: '"Em apenas 5 dias consegui dormir sem melatonina pela primeira vez em 2 anos. O método é simples e realmente funciona!" - Maria, 34 anos',
  },

  13: {
    id: 13,
    type: 'single_choice',
    title: 'Quanto você conhece sobre higiene do sono?',
    options: [
      { id: 'nada', label: 'Nada, é a primeira vez que ouço falar', value: 'nada', autoAdvance: true },
      { id: 'pouco', label: 'Já ouvi falar, mas não sei aplicar', value: 'pouco', autoAdvance: true },
      { id: 'tentei', label: 'Já tentei algumas técnicas sem sucesso', value: 'tentei', autoAdvance: true },
    ],
  },

  14: {
    id: 14,
    type: 'single_choice',
    title: 'O que você prefere para melhorar seu sono?',
    options: [
      { id: 'profundo', label: 'Programa completo e aprofundado', value: 'profundo', autoAdvance: true },
      { id: 'rapido_sem_remedio', label: 'Solução rápida sem remédios', value: 'rapido_sem_remedio', autoAdvance: true },
      { id: 'energia', label: 'Foco em acordar com mais energia', value: 'energia', autoAdvance: true },
      { id: 'reduzir_ansiedade', label: 'Reduzir ansiedade para dormir melhor', value: 'reduzir_ansiedade', autoAdvance: true },
    ],
  },

  15: {
    id: 15,
    type: 'presentation',
    title: '{{nome}}, sua jornada para dormir melhor começa agora',
    content: 'Baseado nas suas respostas, identificamos exatamente o que está sabotando seu sono.',
  },

  16: {
    id: 16,
    type: 'single_choice',
    title: 'Como você se sente sobre mudar seus hábitos de sono?',
    options: [
      { id: 'decidido', label: 'Estou decidido(a) a mudar agora', value: 'decidido', autoAdvance: true },
      { id: 'mudar_habitos', label: 'Quero mudar mas preciso de ajuda', value: 'mudar_habitos', autoAdvance: true },
      { id: 'medo_falhar', label: 'Tenho medo de tentar e falhar novamente', value: 'medo_falhar', autoAdvance: true },
    ],
  },

  17: {
    id: 17,
    type: 'loading',
    title: 'Estamos analisando suas respostas… ⏳',
    content: 'Preparando seu plano personalizado para dormir naturalmente...',
  },

  18: {
    id: 18,
    type: 'presentation',
    title: '{{nome}}, seu plano personalizado para dormir naturalmente está pronto!',
    content: 'Descubra o método que já ajudou mais de 1.000 pessoas a voltarem a dormir naturalmente.',
  },
};

// Dynamic content based on branching
export function getPersonalizedContent(step: number, state: QuizState): QuizStep {
  const baseStep = { ...QUIZ_STEPS[step] };

  // Personalization with nome
  if (state.nome && baseStep.title) {
    baseStep.title = baseStep.title.replace(/\{\{nome\}\}/g, state.nome);
  }
  if (state.nome && baseStep.content) {
    baseStep.content = baseStep.content.replace(/\{\{nome\}\}/g, state.nome);
  }

  // Step-specific personalization
  switch (step) {
    case 12: // Depoimentos - vary by branch
      if (state.flags.branch_heavy_remedios) {
        baseStep.content = '"Consegui parar com a melatonina em 1 semana! Agora durmo naturalmente e acordo muito mais descansada." - Ana, 29 anos';
      } else if (state.flags.branch_high_ansiedade) {
        baseStep.content = '"A ansiedade era o que mais atrapalhava meu sono. Com as técnicas do método, consegui relaxar e dormir profundamente." - Carlos, 42 anos';
      }
      break;

    case 15: // Promessa - personalize based on answers
      if (state.flags.branch_heavy_remedios) {
        baseStep.content = 'Identificamos que você pode parar de depender de remédios para dormir. Vamos mostrar exatamente como fazer isso de forma segura e natural.';
      } else if (state.flags.branch_high_ansiedade) {
        baseStep.content = 'A ansiedade está sabotando seu sono. Nosso método inclui técnicas específicas para acalmar sua mente antes de dormir.';
      } else if (state.flags.experienced) {
        baseStep.content = 'Você já tentou outras técnicas sem sucesso. Nosso método é diferente - baseado em ciência e resultados comprovados.';
      }
      break;

    case 18: // Oferta - final personalization
      let offerDescription = 'Método completo para dormir naturalmente';

      if (state.direcionamento === 'rapido_sem_remedio') {
        offerDescription = 'Solução rápida para dormir sem remédios';
      } else if (state.direcionamento === 'energia') {
        offerDescription = 'Programa focado em acordar com energia';
      } else if (state.direcionamento === 'reduzir_ansiedade') {
        offerDescription = 'Método para reduzir ansiedade e melhorar o sono';
      }

      baseStep.content = `${offerDescription}. Acesso imediato por apenas R$ 67.`;
      break;
  }

  return baseStep;
}

// CTA texts
export const CTA_TEXTS = {
  primary: 'Continuar',
  final: 'Quero dormir naturalmente agora',
  back: 'Voltar',
  loading: 'Aguarde...',
};

// Validation messages
export const VALIDATION_MESSAGES = {
  required: 'Este campo é obrigatório',
  email: 'Por favor, insira um email válido',
  name: 'Nome deve ter pelo menos 2 caracteres',
  consent: 'É necessário concordar com o tratamento de dados para continuar',
  minSelections: 'Por favor, selecione pelo menos uma opção',
  maxSelections: 'Você pode selecionar no máximo {{max}} opções',
};

// Lead form fields
export const LEAD_FORM = {
  nome: {
    label: 'Seu nome completo',
    placeholder: 'Digite seu nome',
    type: 'text' as const,
    required: true,
  },
  email: {
    label: 'Seu melhor email',
    placeholder: 'Digite seu email',
    type: 'email' as const,
    required: true,
  },
  consent: {
    label: 'Concordo com o tratamento de dados conforme a Política de Privacidade.',
    type: 'checkbox' as const,
    required: true,
    linkText: 'Política de Privacidade',
    linkUrl: '/privacy',
  },
  honeypot: {
    label: '', // Hidden field for bot detection
    type: 'text' as const,
    required: false,
    hidden: true,
  },
};

// Progress messages
export const PROGRESS_MESSAGES = {
  completing: 'Finalizando...',
  analyzing: 'Analisando respostas...',
  personalizing: 'Personalizando plano...',
};

// Before/After graph data
export const BEFORE_AFTER_DATA = {
  antes: {
    label: 'ANTES',
    items: [
      { label: 'Demora para dormir', value: '45+ min', color: '#ef4444' },
      { label: 'Qualidade do sono', value: '3/10', color: '#ef4444' },
      { label: 'Energia ao acordar', value: '2/10', color: '#ef4444' },
      { label: 'Uso de remédios', value: 'Diário', color: '#ef4444' },
    ],
  },
  depois: {
    label: 'DEPOIS (7 dias)',
    items: [
      { label: 'Demora para dormir', value: '<10 min', color: '#22c55e' },
      { label: 'Qualidade do sono', value: '9/10', color: '#22c55e' },
      { label: 'Energia ao acordar', value: '9/10', color: '#22c55e' },
      { label: 'Uso de remédios', value: 'Zero', color: '#22c55e' },
    ],
  },
};

export const OFFER_DETAILS = {
  price: 'R$ 67',
  originalPrice: 'R$ 197',
  discount: '66% OFF',
  guarantee: '30 dias de garantia incondicional',
  deliverables: [
    '✅ Método Lux completo (7 dias)',
    '✅ Kit de ferramentas práticas',
    '✅ Plano personalizado baseado no seu perfil',
    '✅ Checklist de higiene do sono',
    '✅ Técnicas de relaxamento',
  ],
  bonus: [
    '🎁 BÔNUS: Guia de suplementos naturais',
    '🎁 BÔNUS: Playlist para relaxamento',
  ],
};