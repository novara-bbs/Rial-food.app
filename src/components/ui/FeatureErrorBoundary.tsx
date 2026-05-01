/**
 * FeatureErrorBoundary — thin wrapper over ErrorBoundary for feature-scope.
 *
 * Sprint [1.5.175]. Use to wrap a tab/screen subtree (Home, Cocina, Recipes,
 * Discovery, Wellness, Profile…) so a crash inside one feature does NOT kill
 * the whole app — the user can switch tabs and recover. The fallback hides
 * "Recargar app" (innecesario at this scope; the rest of the app is alive)
 * and uses the compact layout.
 */
import { useI18n } from '../../i18n';
import ErrorBoundary from '../ErrorBoundary';

interface Props {
  /** Localised feature name shown in the message ("Hubo un problema en {feature}"). */
  featureName: string;
  /** App.tsx wires this to navigate home + close any modal. */
  onReset?: () => void;
  children: React.ReactNode;
}

export default function FeatureErrorBoundary({ featureName, onReset, children }: Props) {
  // Hook called solely to ensure the component re-renders when locale changes
  // (the underlying ErrorBoundary already calls useI18n internally).
  useI18n();
  return (
    <ErrorBoundary featureName={featureName} onReset={onReset} hideReload compact>
      {children}
    </ErrorBoundary>
  );
}
