Below is a **ready-to-paste Coding Agent Prompt** to implement the Dormir Natural Quiz. It’s opinionated, end-to-end, and avoids file-by-file instructions while enforcing responsibilities, ACs, and tracking.

---

# Coding Agent Prompt — Dormir Natural Quiz (Astro)

You are an expert full-stack engineer. Implement the **Dormir Natural Quiz** with adaptive branching, built-in consent, analytics events, and a polished mobile-first UI.

## Ground Rules

* **All end-user copy in Portuguese (PT-BR).**
* Tech stack: **Astro** (content site already exists), **TypeScript**, **vanilla CSS** (no Tailwind here), **islands/partial hydration** for interactive components.
* Route base: **`/durma`** (LP) and **`/durma/quiz`** (quiz). The LP already exists; add the quiz and necessary shared components.
* Organize code by **responsibility**, not file paths (you choose filenames).
* Commit frequently with meaningful messages (e.g., `feat(quiz): add branching engine`).
* Do not introduce external analytics SDKs; expose **event hooks** (`dispatchEvent`, `data-*` attrs) so the host can wire to their analytics later.

---

## Goals

1. Ship a **1-minute quiz** (18 steps max) with **branching** as specified.
2. Capture **Nome + Email + Consentimento** within the quiz.
3. Persist a **session UUID** and answers in memory; expose a submit endpoint to store leads (mock in dev).
4. Transition to the **internal offer screen** (R$67 CTA) at the end.
5. Enforce **performance** (≤1.5s P50 LCP on mobile), **a11y**, and **clean design** that matches brand.

---

## Structure Overview

* **Page** `/durma/quiz`: renders the interactive quiz island (hydrated).
* **Quiz Engine (island)**: state machine controlling steps, branching, validation, and progress bar.
* **Store**: in-memory state + `sessionStorage` sync; session id (UUID v4).
* **Lead submission**: POST to `/api/lead` (Astro endpoint). For dev, write to a JSON file in `.data/` or log; provide a `saveLead` function stub for future provider.
* **Design tokens**: CSS custom properties using brand palette.

---

## Brand & UI

Palette (CSS custom properties):

```
--color-primary: #2E5077;
--color-secondary: #4DA1A9;
--color-accent: #79D7BE;
--color-base: #F6F4F0;
--color-text: #0f172a;
--radius: 14px;
--shadow: 0 6px 24px rgba(0,0,0,.08);
```

Style:

* Calm, clean, high-contrast, mobile-first.
* Max width 640px center, generous spacing.
* **Progress bar fixed at top** with percent indicator.
* Controls: large tappable radios/checkboxes; single-choice auto-advance; multiple-choice require “Continuar”.
* Buttons: Primary (solid), Secondary (ghost). Disabled until valid.
* Loading step has non-blocking animation (CSS keyframes), 1.8–2.2s before result.

Accessibility:

* All steps inside a `<form>` region with `aria-live="polite"` for step transitions.
* Focus management: send focus to step header on change.
* Labels bound to inputs; 44px min hit targets.
* High contrast and visible focus ring.

---

## Steps & Branching (Logic)

**Canonical order** (numbers for reference, engine can skip):

1. Abertura (Presentation)
2. Faixa Etária (SC)
3. Prova Social (Presentation)
4. Diagnóstico Sono (SC)
   4b. Horas Dormidas (SC)
5. Lead + Consent (Form: Nome, Email, checkbox consent)
6. Remédios (SC, personalized)
7. Ansiedade (SC)
8. Impactos (MC)
9. Consequências (MC)
10. Desejo (MC)
11. Depoimentos (Presentation)
12. Conhecimento (SC, personalized)
13. Direcionamento (SC)
14. Promessa (Presentation, personalized)
15. Micro-Compromisso (SC)
16. Carregando (Loading)
17. Preparação (Presentation, personalized + gráfico antes/depois)
18. Oferta + CTA (Presentation)

**Branch rules** (exactly as implemented in engine):

* Step 4 “Não tenho problemas” → **skip 4b, 6, 7, 8, 9** → go to 10.
* Step 4b “>8h” → still ask 7 (Ansiedade). If Ansiedade = “Nunca”, **skip 8** and go to 9.
* Step 7 “Nunca” → **skip 8** → go to 9.
* Steps 11 & 14 content order/copy adapt based on:

  * Remédios: “Uso frequentemente” (tag `branch_heavy_remedios`) vs “Nunca”.
  * Ansiedade: “Sempre/Muitas vezes” (tag `branch_high_anxiety`) vs outras.
  * Conhecimento: “Nada” vs “Já tentei” (adds nuance in Step 14).
* Step 15 “Tenho medo de falhar” sets reassurance flag for Step 17 copy (garantia).

**ASCII branch included in comments** within the engine for dev reference.

---

## Data Model (TypeScript)

```ts
type AgeRange = "18-28" | "29-38" | "39-49" | "50+";
type Diagnostico = "demoro" | "acordo_varias" | "acordo_cansado" | "sem_problemas";
type Horas = "<5" | "5-6" | "7-8" | ">8";
type Remedios = "frequente" | "tentei_nao_resolveu" | "pensei" | "nunca";
type Ansiedade = "sempre" | "muitas" | "raramente" | "nunca";

interface QuizState {
  sessionId: string;               // uuid v4
  startedAt: number;               // epoch ms
  completedAt?: number;
  step: number;                    // 1..18
  nome?: string;
  email?: string;
  consent?: boolean;

  idade?: AgeRange;
  diagnostico?: Diagnostico;
  horas?: Horas;
  remedios?: Remedios;
  ansiedade?: Ansiedade;
  impactos?: string[];             // keys from Step 8
  consequencias?: string[];        // Step 9
  desejos?: string[];              // Step 10
  conhecimento?: "nada" | "pouco" | "tentei";
  direcionamento?: "profundo" | "rapido_sem_remedio" | "energia" | "reduzir_ansiedade";
  micro?: "decidido" | "mudar_habitos" | "medo_falhar";

  flags: {
    branch_no_problems?: boolean;
    branch_heavy_remedios?: boolean;
    branch_high_ansiedade?: boolean;
    experienced?: boolean;         // conhecimento = "tentei"
    reassurance?: boolean;         // micro = "medo_falhar"
  };
}
```

**Validation**

* Email basic RFC pattern; Nome min 2 chars; **Consent obrigatório** para avançar.
* On submit to `/api/lead`, include `sessionId`, timestamps, and answers.

---

## Analytics Hooks (no external SDK)

Fire **CustomEvents** on `window` and add `data-*` markers on clickable CTAs:

Events (payload includes `sessionId`, `step`, and any changed fields):

* `quiz_start`
* `quiz_step` (every step change)
* `quiz_lead_submitted`
* `quiz_complete`
* `offer_view`
* `offer_click` (CTA “Quero dormir naturalmente agora”)
* (Optional) `checkout_start`, `purchase` will be wired later by host app.

Implementation:

```ts
function track(name: string, detail: Record<string, any>) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}
```

Add `data-event="offer_click"` to CTA button; also call `track('offer_click', {...})` on click.

---

## Copy (PT-BR) — Key Strings

Use exactly (you may inline variations for personalization):

* H1 (Step 1): **“Durma naturalmente e acorde cheio de energia em apenas 7 dias”**
* Sub (Step 1): **“Descubra se você pode eliminar a insônia naturalmente (Questionário de 1 minuto).”**
* Prova social: **“Mais de 1.000 pessoas já voltaram a dormir naturalmente com este método.”**
* Lead + Consent label: **“Concordo com o tratamento de dados conforme a Política.”** (linkar “Política”)
* Loading: **“Estamos analisando suas respostas… ⏳”**
* Oferta headline: **“{{nome}}, seu plano personalizado para dormir naturalmente está pronto!”**
* CTA: **“Quero dormir naturalmente agora”**

All other question/option strings follow the previously approved spec.

Personalization tokens:

* `{{nome}}` in Steps 6, 12, 14, 17, 18.
* Conditional phrases per branch rules (remédios/ansiedade/experiência/micro).

---

## Components (by responsibility)

* `QuizShell` — form wrapper, progress bar, navigation controls, focus management.
* `Step` views — tiny pure components (Presentation | SC | MC | Form | Loading).
* `QuizEngine` — state machine + branching resolver (`nextStep(state)`, `prevStep(state)`).
* `Store` — state + sessionStorage hydration; guards to prevent skipping required fields.
* `LeadAPI` — POST helper to `/api/lead`.
* `BeforeAfterGraph` — simple CSS “antes/depois” card with icons/bars (no external charts).

---

## Branching Engine — Pseudocode

```ts
function nextStep(s: QuizState): number {
  switch (s.step) {
    case 4:
      if (s.diagnostico === "sem_problemas") { s.flags.branch_no_problems = true; return 10; }
      return 4.5; // alias for 4b
    case 4.5: // 4b
      if (s.horas === ">8") return 7; // still ask ansiedade
      return 5;

    case 7:
      if (s.ansiedade === "nunca") return 9; // skip impactos
      return 8;

    case 11:
      // presentation, always -> 12
      return 12;

    // default fallthrough: +1
    default:
      return s.step + 1;
  }
}
```

(Implement with integer steps; 4.5 shown for clarity — you’ll map to 5 and reorder so validation still runs for Lead/Consent.)

**Important**: Keep **Step 5 (Lead + Consent)** early in the B/C/D flows; in the A fast-path (sem problemas), show Lead+Consent **no later than Step 10 → 11** to capture the contact before the offer.

---

## API Endpoint (Astro)

* `POST /api/lead` accepts JSON `{ sessionId, nome, email, consent, answers, timestamps }`
* Validate server-side; return `{ ok: true }` on success.
* In dev, write to a local JSON lines file (e.g., `.data/leads.jsonl`) or console.log with a clear tag. Provide the write helper but keep it easy to swap to real provider later.

Security:

* Basic bot mitigation: hidden honeypot field; reject if present.
* Rate-limit (best effort): one lead per `sessionId` per 5 minutes (in-memory map).

---

## Performance Budgets

* **LCP ≤ 2.5s** (mobile, P50); **CLS < 0.1**.
* Quiz island ≤ **30KB gz** JS initial (aim); lazy-hydrate heavy parts (images in presentations).
* Use `loading="lazy"` on non-initial images; inline critical CSS for the quiz shell.

---

## QA & Acceptance Criteria

* ✅ Branching behaves exactly as spec (including skips on “sem problemas” and “ansiedade = nunca”).
* ✅ Single-choice auto-avança; multiple-choice exige “Continuar”.
* ✅ Consent **obrigatório**; sem consent não avança do passo de Lead.
* ✅ `sessionId` (UUID) created at start; events (`quiz_start`, `quiz_step`, `quiz_complete`, `offer_view`, `offer_click`) dispatched with correct payloads.
* ✅ Personalization renders `{{nome}}` where required.
* ✅ Offer screen shows: Antes×Depois, entregáveis, **R$67**, bônus, garantia, CTA.
* ✅ A11y: keyboard-only flow works; focus visible; labels e leitura por leitor de tela ok.
* ✅ No console errors; API returns 200 on valid lead; dev storage file grows on submits.
* ✅ Visuals match palette; progress bar updates correctly.

---

## Developer Experience

* Provide `README` section inside the quiz component source header with:

  * Events list and example payload.
  * How to swap `/api/lead` to a real provider.
  * Where to tweak copy tokens and branch copy variants.

---

## Git Commit Cadence (examples)

* `chore(quiz): scaffold quiz route and shell`
* `feat(quiz): state machine + progress bar`
* `feat(quiz): steps 1–6 with lead+consent validation`
* `feat(quiz): branching for diagnostico/ansiedade`
* `feat(quiz): offer screen + event hooks`
* `fix(quiz): a11y focus + keyboard nav`
* `perf(quiz): trim island bundle + lazy images`
* `test(quiz): happy paths + consent enforcement`

---

**Deliver the implementation now**, following this prompt.
