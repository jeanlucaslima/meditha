import type { QuizState } from './types';

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Session storage key
const STORAGE_KEY = 'dormir_quiz_state';

// Default initial state
function createInitialState(): QuizState {
  return {
    sessionId: generateUUID(),
    startedAt: Date.now(),
    step: 1,
    flags: {}
  };
}

class QuizStore {
  private state: QuizState;
  private listeners: Set<(state: QuizState) => void> = new Set();

  constructor() {
    this.state = this.loadFromStorage() || createInitialState();

    // Save initial state
    this.saveToStorage();
  }

  // State accessors
  getState(): QuizState {
    return { ...this.state };
  }

  getCurrentStep(): number {
    return this.state.step;
  }

  getSessionId(): string {
    return this.state.sessionId;
  }

  // Subscribe to state changes
  subscribe(listener: (state: QuizState) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Error in quiz store listener:', error);
      }
    });
  }

  // Update state
  setState(updates: Partial<QuizState>): void {
    this.state = {
      ...this.state,
      ...updates
    };

    this.saveToStorage();
    this.notify();
  }

  // Update specific field
  setField<K extends keyof QuizState>(key: K, value: QuizState[K]): void {
    this.setState({ [key]: value } as Partial<QuizState>);
  }

  // Step navigation
  setStep(step: number): void {
    this.setState({ step });
    
    // Auto-complete when reaching Step 18 (offer)
    if (step === 18 && !this.state.completedAt) {
      this.complete();
    }
  }

  // Answer setters with type safety
  setIdade(idade: QuizState['idade']): void {
    this.setState({ idade });
  }

  setDiagnostico(diagnostico: QuizState['diagnostico']): void {
    this.setState({ diagnostico });

    // Set branching flags
    if (diagnostico === 'sem_problemas') {
      this.setState({
        flags: {
          ...this.state.flags,
          branch_no_problems: true
        }
      });
    }
  }

  setHoras(horas: QuizState['horas']): void {
    this.setState({ horas });
  }

  setRemedios(remedios: QuizState['remedios']): void {
    this.setState({ remedios });

    // Set branching flags
    if (remedios === 'frequente') {
      this.setState({
        flags: {
          ...this.state.flags,
          branch_heavy_remedios: true
        }
      });
    }
  }

  setAnsiedade(ansiedade: QuizState['ansiedade']): void {
    this.setState({ ansiedade });

    // Set branching flags
    if (ansiedade === 'sempre' || ansiedade === 'muitas') {
      this.setState({
        flags: {
          ...this.state.flags,
          branch_high_ansiedade: true
        }
      });
    }
  }

  setImpactos(impactos: string[]): void {
    this.setState({ impactos });
  }

  setConsequencias(consequencias: string[]): void {
    this.setState({ consequencias });
  }

  setDesejos(desejos: string[]): void {
    this.setState({ desejos });
  }

  setConhecimento(conhecimento: QuizState['conhecimento']): void {
    this.setState({ conhecimento });

    // Set experience flag
    if (conhecimento === 'tentei') {
      this.setState({
        flags: {
          ...this.state.flags,
          experienced: true
        }
      });
    }
  }

  setDirecionamento(direcionamento: QuizState['direcionamento']): void {
    this.setState({ direcionamento });
  }

  setMicro(micro: QuizState['micro']): void {
    this.setState({ micro });

    // Set reassurance flag
    if (micro === 'medo_falhar') {
      this.setState({
        flags: {
          ...this.state.flags,
          reassurance: true
        }
      });
    }
  }

  // Lead capture
  setLead(nome: string, email: string, consent: boolean): void {
    this.setState({ nome, email, consent });
  }

  setNome(nome: string): void {
    this.setState({ nome });
  }

  setEmail(email: string): void {
    this.setState({ email });
  }

  setConsent(consent: boolean): void {
    this.setState({ consent });
  }

  // Mark quiz as completed
  complete(): void {
    this.setState({ completedAt: Date.now() });
  }

  // Reset quiz (for testing or restart)
  reset(): void {
    const freshState = createInitialState();
    this.state = freshState;
    this.saveToStorage();
    this.notify();
  }

  // Validation helpers
  isStepValid(step: number): boolean {
    switch (step) {
      case 2: // Idade
        return !!this.state.idade;

      case 4: // Diagnóstico
        return !!this.state.diagnostico;

      case 5: // Horas (only if not skipped)
        return this.shouldSkipStep(5) || !!this.state.horas;

      case 6: // Lead + Consent
        return !!(this.state.nome && this.state.email && this.state.consent);

      case 7: // Remédios
        return this.shouldSkipStep(7) || !!this.state.remedios;

      case 8: // Ansiedade
        return this.shouldSkipStep(8) || !!this.state.ansiedade;

      case 9: // Impactos
        return this.shouldSkipStep(9) || (this.state.impactos && this.state.impactos.length > 0);

      case 10: // Consequências
        return !!(this.state.consequencias && this.state.consequencias.length > 0);

      case 11: // Desejos
        return !!(this.state.desejos && this.state.desejos.length > 0);

      case 13: // Conhecimento
        return !!this.state.conhecimento;

      case 14: // Direcionamento
        return !!this.state.direcionamento;

      case 16: // Micro-compromisso
        return !!this.state.micro;

      default:
        return true; // Presentation steps are always valid
    }
  }

  // Check if step should be skipped based on branching
  shouldSkipStep(step: number): boolean {
    const flags = this.state.flags;

    switch (step) {
      case 5: // Horas - skip if no problems
        return !!flags.branch_no_problems;

      case 7: // Remédios - skip if no problems
        return !!flags.branch_no_problems;

      case 8: // Ansiedade - skip if no problems
        return !!flags.branch_no_problems;

      case 9: // Impactos - skip if no problems OR never anxious
        return !!flags.branch_no_problems || this.state.ansiedade === 'nunca';

      case 10: // Consequências - skip if no problems
        return !!flags.branch_no_problems;

      default:
        return false;
    }
  }

  // Storage persistence
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const serialized = JSON.stringify(this.state);
        sessionStorage.setItem(STORAGE_KEY, serialized);
      } catch (error) {
        console.warn('Failed to save quiz state to sessionStorage:', error);
      }
    }
  }

  private loadFromStorage(): QuizState | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Validate that we have a valid state structure
      if (parsed.sessionId && parsed.startedAt && typeof parsed.step === 'number') {
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to load quiz state from sessionStorage:', error);
    }

    return null;
  }

  // Clear storage (for testing)
  clearStorage(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}

// Export singleton instance
export const quizStore = new QuizStore();

// Export class for testing
export { QuizStore };