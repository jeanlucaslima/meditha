// Quiz TypeScript interfaces and data models
// Dormir Natural Quiz - Data Structure

export type AgeRange = "18-28" | "29-38" | "39-49" | "50+";

export type Diagnostico = "demoro" | "acordo_varias" | "acordo_cansado" | "sem_problemas";

export type Horas = "<5" | "5-6" | "7-8" | ">8";

export type Remedios = "frequente" | "tentei_nao_resolveu" | "pensei" | "nunca";

export type Ansiedade = "sempre" | "muitas" | "raramente" | "nunca";

export type Conhecimento = "nada" | "pouco" | "tentei";

export type Direcionamento = "profundo" | "rapido_sem_remedio" | "energia" | "reduzir_ansiedade";

export type MicroCompromisso = "decidido" | "mudar_habitos" | "medo_falhar";

export interface QuizState {
  // Session data
  sessionId: string;               // uuid v4
  startedAt: number;               // epoch ms
  completedAt?: number;
  step: number;                    // 1..18

  // Lead capture
  nome?: string;
  email?: string;
  consent?: boolean;

  // Quiz answers
  idade?: AgeRange;
  diagnostico?: Diagnostico;
  horas?: Horas;
  remedios?: Remedios;
  ansiedade?: Ansiedade;
  impactos?: string[];             // keys from Step 8
  consequencias?: string[];        // Step 9
  desejos?: string[];              // Step 10
  conhecimento?: Conhecimento;
  direcionamento?: Direcionamento;
  micro?: MicroCompromisso;

  // Branching flags
  flags: {
    branch_no_problems?: boolean;
    branch_heavy_remedios?: boolean;
    branch_high_ansiedade?: boolean;
    experienced?: boolean;         // conhecimento = "tentei"
    reassurance?: boolean;         // micro = "medo_falhar"
  };
}

export interface QuizStep {
  id: number;
  type: 'presentation' | 'single_choice' | 'multiple_choice' | 'form' | 'loading' | 'offer';
  title: string;
  content?: string;
  question?: string;
  options?: QuizOption[];
  validation?: {
    required?: boolean;
    minSelections?: number;
    maxSelections?: number;
  };
}

export interface QuizOption {
  id: string;
  label: string;
  value: any;
  autoAdvance?: boolean;
}

export interface LeadSubmission {
  sessionId: string;
  nome: string;
  email: string;
  consent: boolean;
  answers: Partial<QuizState>;
  startedAt: number;
  completedAt: number;
  source?: string;
  utmParams?: Record<string, string>;
}

export interface AnalyticsPayload {
  sessionId: string;
  step: number;
  timestamp: number;
  [key: string]: any;
}

// Utility type for step validation
export type StepValidation = {
  isValid: boolean;
  missingFields?: string[];
  errorMessage?: string;
};

// Constants for validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_NAME_LENGTH = 2;

// Step progression helpers
export type StepDirection = 'next' | 'prev';
export type NavigationResult = {
  targetStep: number;
  canProceed: boolean;
  validationError?: string;
};