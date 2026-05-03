/**
 * RealFeelSheet — Sprint K-fix3 [1.5.207].
 *
 * BottomSheet wrapper around `<RealFeelInline bare />`. Triggered ~3s after
 * a meal is logged (see Home.tsx). Replaces the in-flow card that used to
 * sit between QuickActions and SmartInsights — owner feedback: "que sea un
 * popup que sale de abajo arriba al loguear comida y luego desaparezca".
 *
 * Auto-dismiss timer (60s) lives inside RealFeelInline; the sheet honors it
 * via its `onDismiss` callback which closes the sheet AND calls the parent
 * dismiss handler.
 */
import BottomSheet from '../../../components/ui/bottom-sheet';
import RealFeelInline, { type RealFeelEntry } from './RealFeelInline';
import { useI18n } from '../../../i18n';

export interface RealFeelSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (entry: RealFeelEntry) => void;
  onDismiss: () => void;
}

export default function RealFeelSheet({ open, onOpenChange, onSubmit, onDismiss }: RealFeelSheetProps) {
  const { t } = useI18n();

  const handleSubmit = (entry: RealFeelEntry) => {
    onSubmit(entry);
    onOpenChange(false);
  };

  const handleDismiss = () => {
    onDismiss();
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) handleDismiss();
        onOpenChange(next);
      }}
      title={t.realFeel.howDoYouFeel}
      size="focus"
    >
      <div className="px-4 pb-6" data-testid="real-feel-sheet-body">
        {/* Re-mount on each open so internal form state resets */}
        {open && (
          <RealFeelInline
            bare
            onSubmit={handleSubmit}
            onDismiss={handleDismiss}
          />
        )}
      </div>
    </BottomSheet>
  );
}
