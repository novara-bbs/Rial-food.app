/**
 * GlobalLogSnapshotModal — mount once at App root.
 *
 * Q13 — single, app-wide instance of LogSnapshotModal. Any component can
 * open it via `useLogSnapshot().openWithDate(date?)`. Consolidates the
 * weight/snapshot entry points so there's one form of record.
 */
import LogSnapshotModal from './LogSnapshotModal';
import { useLogSnapshot } from '../hooks/useLogSnapshot';
import { useAppState } from '../../../contexts/AppStateContext';
import type { UnitSystem } from '../../food/utils/units';

export default function GlobalLogSnapshotModal() {
  const { isOpen, initialDate, close } = useLogSnapshot();
  const { userProfile } = useAppState();
  const unitSystem: UnitSystem = userProfile?.unitSystem ?? 'metric';

  return (
    <LogSnapshotModal
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      unitSystem={unitSystem}
      initialDate={initialDate}
    />
  );
}
