import type { QuizState, NavigationResult, StepDirection } from './types';

/*
ASCII Branch Flow for Reference:
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ 1: Intro│────▶│ 2: Idade│────▶│ 3: Prova│────▶│4:Diagn. │
└─────────┘     └─────────┘     │ Social  │     └─────────┘
                                └─────────┘           │
                                                     │
                              ┌─"sem_problemas"──────┘
                              │  [skip 5,7,8,9]
                              ▼                    ┌──── Others
                        ┌─────────┐                │
                        │6: Lead+ │◀───────┬───────┼──5: Horas
                        │ Consent │        │       │
                        └─────────┘        │       ▼
                              │            │ ┌─────────┐
                              ▼            │ │7:Remédio│
                        ┌─────────┐        │ └─────────┘
                    ┌──▶│10:Desejos│       │       │
                    │   └─────────┘       │       ▼
                    │         │           │ ┌─────────┐
              "nunca"│         ▼           │ │8:Ansieda│
              ansied │   ┌─────────┐       │ └─────────┘
                    │   │11:Depoim│       │       │
                    │   └─────────┘       │ "nunca"│─────┐
                    │         │           │       │     │
                    │         ▼           │   "outras"  │skip 9
        ┌─────────┐ │   ┌─────────┐       │       │     │
        │9:Impacto│─┘   │12:Conhec│       │       ▼     │
        └─────────┘     └─────────┘       │ ┌─────────┐ │
              │               │           └─│9:Impacto│◀┘
              ▼               ▼             └─────────┘
        ┌─────────┐     ┌─────────┐               │
        │10:Conseg│     │13:Direcio│              │
        └─────────┘     └─────────┘               │
              │               │                   │
              └───────┬───────┘                   │
                      │                           │
                      ▼                           │
                ┌─────────┐                       │
                │14:Promes│◀──────────────────────┘
                └─────────┘
                      │
                      ▼
                ┌─────────┐
                │15:Micro │
                └─────────┘
                      │
                      ▼
                ┌─────────┐     ┌─────────┐     ┌─────────┐
                │16:Load  │────▶│17:Prepar│────▶│18:Oferta│
                └─────────┘     └─────────┘     └─────────┘
*/

export class QuizEngine {
  constructor() {}

  /**
   * Determine the next step based on current state and branching logic
   */
  nextStep(state: QuizState): NavigationResult {
    const currentStep = state.step;

    // Validate current step before proceeding
    const validation = this.validateStep(state, currentStep);
    if (!validation.isValid) {
      return {
        targetStep: currentStep,
        canProceed: false,
        validationError: validation.errorMessage
      };
    }

    let targetStep: number;

    switch (currentStep) {
      case 1: // Intro → Idade
        targetStep = 2;
        break;

      case 2: // Idade → Prova Social
        targetStep = 3;
        break;

      case 3: // Prova Social → Diagnóstico
        targetStep = 4;
        break;

      case 4: // Diagnóstico → branching point
        if (state.diagnostico === 'sem_problemas') {
          // Fast path: skip 5(horas), 7(remedios), 8(ansiedade), 9(impactos) → go to 6(lead)
          targetStep = 6;
        } else {
          // Normal flow: go to 5 (horas)
          targetStep = 5;
        }
        break;

      case 5: // Horas → Lead (in fast path) or Remedios
        targetStep = 6; // Always go to Lead after Horas
        break;

      case 6: // Lead + Consent → Remedios (or skip if no problems)
        if (state.flags.branch_no_problems) {
          targetStep = 10; // Skip to Desejos
        } else {
          targetStep = 7; // Go to Remedios
        }
        break;

      case 7: // Remedios → Ansiedade
        targetStep = 8;
        break;

      case 8: // Ansiedade → Impactos (or skip if "nunca")
        if (state.ansiedade === 'nunca') {
          targetStep = 10; // Skip Impactos → go to Consequências
        } else {
          targetStep = 9;
        }
        break;

      case 9: // Impactos → Consequências
        targetStep = 10;
        break;

      case 10: // Consequências → Desejos
        targetStep = 11;
        break;

      case 11: // Desejos → Depoimentos
        targetStep = 12;
        break;

      case 12: // Depoimentos → Conhecimento
        targetStep = 13;
        break;

      case 13: // Conhecimento → Direcionamento
        targetStep = 14;
        break;

      case 14: // Direcionamento → Promessa
        targetStep = 15;
        break;

      case 15: // Promessa → Micro-compromisso
        targetStep = 16;
        break;

      case 16: // Micro-compromisso → Loading
        targetStep = 17;
        break;

      case 17: // Loading → Preparação
        targetStep = 18;
        break;

      case 18: // Preparação → Oferta (final step)
        targetStep = 18; // Stay on final step
        break;

      default:
        targetStep = Math.min(currentStep + 1, 18);
    }

    return {
      targetStep,
      canProceed: true
    };
  }

  /**
   * Determine the previous step (for back navigation)
   */
  prevStep(state: QuizState): NavigationResult {
    const currentStep = state.step;

    // Don't allow going back from the first step
    if (currentStep <= 1) {
      return {
        targetStep: 1,
        canProceed: false
      };
    }

    let targetStep: number;

    switch (currentStep) {
      case 6: // Lead → back to Diagnostico or Horas
        if (state.flags.branch_no_problems) {
          targetStep = 4; // Back to Diagnostico (fast path)
        } else {
          targetStep = 5; // Back to Horas
        }
        break;

      case 7: // Remedios → back to Lead
        targetStep = 6;
        break;

      case 8: // Ansiedade → back to Remedios (or Lead if no problems)
        targetStep = 7;
        break;

      case 9: // Impactos → back to Ansiedade
        targetStep = 8;
        break;

      case 10: // Consequências/Desejos → back handling
        if (state.flags.branch_no_problems) {
          targetStep = 6; // Back to Lead (fast path)
        } else if (state.ansiedade === 'nunca') {
          targetStep = 8; // Back to Ansiedade (skipped Impactos)
        } else {
          targetStep = 9; // Back to Impactos (normal flow)
        }
        break;

      default:
        targetStep = currentStep - 1;
    }

    return {
      targetStep: Math.max(targetStep, 1),
      canProceed: true
    };
  }

  /**
   * Navigate to a specific step (with validation)
   */
  navigateToStep(state: QuizState, targetStep: number, direction: StepDirection = 'next'): NavigationResult {
    if (direction === 'prev') {
      return this.prevStep(state);
    }

    // For forward navigation, ensure all intermediate steps are valid
    let currentState = { ...state };
    let currentStep = state.step;

    while (currentStep < targetStep) {
      const nextResult = this.nextStep(currentState);
      if (!nextResult.canProceed) {
        return nextResult;
      }

      currentStep = nextResult.targetStep;
      currentState = { ...currentState, step: currentStep };

      // Safety check to prevent infinite loops
      if (currentStep >= 18) break;
    }

    return {
      targetStep: currentStep,
      canProceed: true
    };
  }

  /**
   * Validate that a step has all required data
   */
  validateStep(state: QuizState, step: number): { isValid: boolean; errorMessage?: string } {
    switch (step) {
      case 1: // Intro - always valid
      case 3: // Prova Social - always valid
      case 12: // Depoimentos - always valid
      case 15: // Promessa - always valid
      case 17: // Loading - always valid
      case 18: // Preparação/Oferta - always valid
        return { isValid: true };

      case 2: // Idade
        if (!state.idade) {
          return { isValid: false, errorMessage: 'Por favor, selecione sua faixa etária' };
        }
        return { isValid: true };

      case 4: // Diagnóstico
        if (!state.diagnostico) {
          return { isValid: false, errorMessage: 'Por favor, selecione uma opção' };
        }
        return { isValid: true };

      case 5: // Horas
        if (!state.horas && !state.flags.branch_no_problems) {
          return { isValid: false, errorMessage: 'Por favor, selecione quantas horas você dorme' };
        }
        return { isValid: true };

      case 6: // Lead + Consent
        if (!state.nome || state.nome.trim().length < 2) {
          return { isValid: false, errorMessage: 'Nome deve ter pelo menos 2 caracteres' };
        }
        if (!state.email || !this.isValidEmail(state.email)) {
          return { isValid: false, errorMessage: 'Por favor, insira um email válido' };
        }
        if (!state.consent) {
          return { isValid: false, errorMessage: 'É necessário concordar com o tratamento de dados para continuar' };
        }
        return { isValid: true };

      case 7: // Remédios
        if (!state.remedios && !state.flags.branch_no_problems) {
          return { isValid: false, errorMessage: 'Por favor, selecione uma opção' };
        }
        return { isValid: true };

      case 8: // Ansiedade
        if (!state.ansiedade && !state.flags.branch_no_problems) {
          return { isValid: false, errorMessage: 'Por favor, selecione uma opção' };
        }
        return { isValid: true };

      case 9: // Impactos
        if (!state.impactos || state.impactos.length === 0) {
          if (!state.flags.branch_no_problems && state.ansiedade !== 'nunca') {
            return { isValid: false, errorMessage: 'Por favor, selecione pelo menos uma opção' };
          }
        }
        return { isValid: true };

      case 10: // Consequências
        if (!state.consequencias || state.consequencias.length === 0) {
          return { isValid: false, errorMessage: 'Por favor, selecione pelo menos uma opção' };
        }
        return { isValid: true };

      case 11: // Desejos
        if (!state.desejos || state.desejos.length === 0) {
          return { isValid: false, errorMessage: 'Por favor, selecione pelo menos uma opção' };
        }
        return { isValid: true };

      case 13: // Conhecimento
        if (!state.conhecimento) {
          return { isValid: false, errorMessage: 'Por favor, selecione uma opção' };
        }
        return { isValid: true };

      case 14: // Direcionamento
        if (!state.direcionamento) {
          return { isValid: false, errorMessage: 'Por favor, selecione uma opção' };
        }
        return { isValid: true };

      case 16: // Micro-compromisso
        if (!state.micro) {
          return { isValid: false, errorMessage: 'Por favor, selecione uma opção' };
        }
        return { isValid: true };

      default:
        return { isValid: true };
    }
  }

  /**
   * Calculate progress percentage
   */
  getProgress(currentStep: number): number {
    return Math.round((currentStep / 18) * 100);
  }

  /**
   * Check if user can go back from current step
   */
  canGoBack(currentStep: number): boolean {
    return currentStep > 1;
  }

  /**
   * Check if current step is the final step
   */
  isFinalStep(currentStep: number): boolean {
    return currentStep === 18;
  }

  /**
   * Get step type for rendering
   */
  getStepType(step: number): 'presentation' | 'single_choice' | 'multiple_choice' | 'form' | 'loading' {
    switch (step) {
      case 1: case 3: case 12: case 15: case 18:
        return 'presentation';
      case 6:
        return 'form';
      case 9: case 10: case 11:
        return 'multiple_choice';
      case 17:
        return 'loading';
      default:
        return 'single_choice';
    }
  }

  /**
   * Utility: Email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Debug: Get branch path for current state
   */
  getBranchInfo(state: QuizState): string {
    const branches: string[] = [];

    if (state.flags.branch_no_problems) branches.push('no_problems');
    if (state.flags.branch_heavy_remedios) branches.push('heavy_remedios');
    if (state.flags.branch_high_ansiedade) branches.push('high_ansiedade');
    if (state.flags.experienced) branches.push('experienced');
    if (state.flags.reassurance) branches.push('reassurance');

    return branches.length > 0 ? branches.join(', ') : 'default';
  }
}

// Export singleton instance
export const quizEngine = new QuizEngine();