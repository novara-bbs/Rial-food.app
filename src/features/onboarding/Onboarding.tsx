/**
 * Onboarding — modal flow shell.
 *
 * Composes header (back + counter + progress), the active step body, and a
 * sticky footer CTA. Owns the reducer + persistence + escape handling, but
 * delegates per-step rendering to the matching component in `./steps`.
 *
 * Lifecycle:
 *  1. Mount with `isOpen=true` → hydrate state from localStorage if a valid
 *     draft exists (resumable mid-flow). Render the matching step.
 *  2. User taps cards / fills inputs → reducer updates draft, dirty=true.
 *     Effect debounces a 250ms write to localStorage.
 *  3. Primary CTA → `dispatch({ type: 'NEXT' })` (validator-gated).
 *  4. On `done`, primary CTA computes `deriveOutput(draft)`, calls
 *     `onComplete`, clears the draft, and closes.
 *
 * The output contract is exactly what `App.tsx:233` expects:
 *   { userProfile, targets, initialWeightKg }
 */
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { Text } from '@/components/ui/Typography';
import { useI18n } from '@/i18n';
import { recordConsent } from '@/features/legal/components/GdprConsent';

import OnboardingFooter from './components/OnboardingFooter';
import OnboardingHeader from './components/OnboardingHeader';
import { deriveOutput } from './derive/derive-targets';
import { useFocusTrap } from './hooks/useFocusTrap';
import { onboardingReducer } from './state/onboardingReducer';
import {
  clearDraft,
  loadDraft,
  loadInitialState,
  saveDraft,
} from './state/persist';
import {
  PROGRESS_TOTAL,
  STEP_INDEX_MAP,
  type StepId,
} from './state/types';
import { isDraftComplete, validateStep } from './state/validators';
import {
  buildSummary,
  mapErrorKeyToCopy,
  pickPrimaryLabel,
} from './utils/copy';

import ActivityStep from './steps/ActivityStep';
import BodyStep from './steps/BodyStep';
import DietStep from './steps/DietStep';
import DoneStep from './steps/DoneStep';
import GoalStep from './steps/GoalStep';
import IdentityStep from './steps/IdentityStep';
import PlanRevealStep from './steps/PlanRevealStep';
import WelcomeStep from './steps/WelcomeStep';

export interface OnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: {
    userProfile: {
      name: string;
      age: number;
      height: number;
      weight: number;
      sex: 'male' | 'female';
      goal: string;
      activity: string;
      trains: boolean;
      dietaryPreferences: string[];
    };
    targets: { cal: number; pro: number; carbs: number; fats: number };
    initialWeightKg?: number;
  }) => void;
  /**
   * Called when the user taps "Continue with email" in WelcomeStep.
   * The host (App.tsx) should open the Login screen while keeping the
   * onboarding draft alive in localStorage so the flow can resume on return.
   */
  onNavigateToLogin?: () => void;
}

const TITLE_ID = 'onb-step-title';

/** Debounce window before flushing a dirty draft to localStorage. */
const DRAFT_DEBOUNCE_MS = 250;
/** Time on screen for the "we're picking up where you left off" banner. */
const RESUME_BANNER_MS = 2500;

export default function Onboarding({ isOpen, onClose, onComplete, onNavigateToLogin }: OnboardingProps) {
  const { t } = useI18n();
  const [state, dispatch] = useReducer(onboardingReducer, undefined, loadInitialState);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Show a brief "continue where you left off" banner when a saved draft is
  // resumed. The flag is computed once at mount — `loadDraft()` returns null
  // for a fresh session and non-null when a persisted draft was found.
  const [showResumeBanner, setShowResumeBanner] = useState(
    () => loadDraft() !== null,
  );
  useEffect(() => {
    if (!showResumeBanner) return;
    const id = window.setTimeout(() => setShowResumeBanner(false), RESUME_BANNER_MS);
    return () => window.clearTimeout(id);
  }, [showResumeBanner]);

  useFocusTrap(containerRef, isOpen);

  // Debounced persistence: write `DRAFT_DEBOUNCE_MS` after the last dirty mutation.
  useEffect(() => {
    if (!state.dirty) return;
    const id = window.setTimeout(() => saveDraft(state), DRAFT_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [state]);

  // Escape closes (draft is auto-saved, so it's safe).
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Auto-focus the step heading on step change. OnboardingScaffold renders
  // the heading with tabIndex={-1}, so focus is silent for mouse/touch users
  // but correctly relocates the reading cursor for screen-reader users.
  useEffect(() => {
    const heading = mainRef.current?.querySelector<HTMLElement>('[tabindex="-1"]');
    heading?.focus({ preventScroll: true });
  }, [state.stepId]);

  const stepIndex = STEP_INDEX_MAP[state.stepId];
  // Only show inline errors (red borders, footer hint) after the user has
  // explicitly tapped the primary CTA on a step that failed validation.
  // "Silent-by-default" per the INDYA / progressive-disclosure pattern.
  const showErrors = !!state.submitAttemptedFor[state.stepId];
  const errors = useMemo(
    () => validateStep(state.stepId, state.draft).errors,
    [state.stepId, state.draft],
  );
  const stepValid = Object.keys(errors).length === 0;

  const handleFinish = useCallback(() => {
    if (!isDraftComplete(state.draft)) return;
    const output = deriveOutput(state.draft);
    // Defensive: ensure consent is recorded if a persisted draft skipped welcome.
    recordConsent();
    clearDraft();
    onComplete?.({
      userProfile: output.userProfile,
      targets: output.targets,
      initialWeightKg: output.initialWeightKg,
    });
    onClose();
  }, [state.draft, onComplete, onClose]);

  const handlePrimary = useCallback(() => {
    if (state.stepId === 'done') {
      handleFinish();
      return;
    }
    dispatch({ type: 'NEXT' });
  }, [state.stepId, handleFinish]);

  const handleBack = useCallback(() => {
    dispatch({ type: 'BACK' });
  }, []);

  const handleSkipDiet = useCallback(() => {
    dispatch({ type: 'NEXT' });
  }, []);

  // Progress summary chips — must be before the early return to satisfy
  // Rules of Hooks. Helper handles the per-step thresholds + label resolution.
  const summary = useMemo(
    () => buildSummary(state.draft, stepIndex, t),
    [state.draft, stepIndex, t],
  );

  if (!isOpen) return null;

  // ── Per-step body ─────────────────────────────────────────────────────────
  const stepBody = renderStep(
    state.stepId,
    { draft: state.draft, dispatch, errors, titleId: TITLE_ID },
    showErrors,
    onNavigateToLogin,
  );

  // ── Footer label + skip ───────────────────────────────────────────────────
  // WelcomeStep has its own inline CTAs — the shell footer is hidden there.
  const isWelcome = state.stepId === 'welcome';
  const primaryLabel = pickPrimaryLabel(state.stepId, t);
  // Show the footer hint only after the user has explicitly tapped the CTA.
  const firstError = showErrors && !stepValid ? Object.values(errors)[0] : undefined;
  const localizedHint = firstError
    ? mapErrorKeyToCopy(firstError, t.onboarding.errors)
    : undefined;
  const showSkip = state.stepId === 'diet';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in duration-200"
    >
      <OnboardingHeader
        stepIndex={stepIndex}
        progressTotal={PROGRESS_TOTAL}
        canGoBack={state.stepId !== 'welcome'}
        onBack={handleBack}
        summary={summary}
      />

      <main
        ref={mainRef}
        key={state.stepId}
        className="flex-1 overflow-y-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        {showResumeBanner && (
          <div className="max-w-md mx-auto w-full mb-4 px-3 py-2 rounded-sm bg-primary/10 text-center">
            <Text variant="caption" className="text-primary">
              {t.onboarding.shell.resumeBanner}
            </Text>
          </div>
        )}
        <section
          aria-labelledby={TITLE_ID}
          className="max-w-md mx-auto w-full"
        >
          {stepBody}
        </section>
      </main>

      {/* WelcomeStep has its own inline CTAs so the footer is hidden there. */}
      {!isWelcome && (
        <OnboardingFooter
          primaryLabel={primaryLabel}
          primaryDisabled={!stepValid}
          onPrimary={handlePrimary}
          skipLabel={showSkip ? t.onboarding.shell.skip : undefined}
          onSkip={showSkip ? handleSkipDiet : undefined}
          hint={localizedHint}
        />
      )}
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────────────

interface RenderProps {
  draft: import('./state/types').OnboardingDraft;
  dispatch: React.Dispatch<import('./state/types').OnboardingAction>;
  errors: Record<string, string>;
  titleId: string;
}

function renderStep(
  stepId: StepId,
  props: RenderProps,
  showErrors: boolean,
  onNavigateToLogin?: () => void,
) {
  switch (stepId) {
    case 'welcome':
      return (
        <WelcomeStep
          titleId={props.titleId}
          dispatch={props.dispatch}
          onNavigateToLogin={onNavigateToLogin}
        />
      );
    case 'goal':     return <GoalStep {...props} />;
    case 'identity': return <IdentityStep {...props} showErrors={showErrors} />;
    case 'body':     return <BodyStep {...props} showErrors={showErrors} />;
    case 'activity': return <ActivityStep {...props} />;
    case 'plan':     return <PlanRevealStep draft={props.draft} titleId={props.titleId} />;
    case 'diet':     return <DietStep {...props} />;
    case 'done':     return <DoneStep draft={props.draft} titleId={props.titleId} />;
  }
}

