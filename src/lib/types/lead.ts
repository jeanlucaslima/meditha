// Shared types for lead data
export interface LeadPayload {
  sessionId: string;
  completedAt: number;
  nome: string;
  email: string;
  consent: boolean;
  answers: {
    idade?: string;
    diagnostico?: string;
    horas?: string;
    remedios?: string;
    ansiedade?: string;
    impactos?: string[];
    consequencias?: string[];
    desejos?: string[];
    conhecimento?: string;
    direcionamento?: string;
    micro?: string;
  };
  flags: {
    branch_no_problems?: boolean;
    branch_heavy_remedios?: boolean;
    branch_high_ansiedade?: boolean;
    experienced?: boolean;
    reassurance?: boolean;
  };
  meta: {
    variant: string;
    source: string;
    issuedAt: number;
  };
}

export interface CheckoutRequest {
  sessionId: string;
  variant: string;
}

export interface CheckoutResponse {
  url: string;
}
