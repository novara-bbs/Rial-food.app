/**
 * BodyConstantsGrid — PR 7 (ADR-009 V2 §4.10).
 *
 * Renders a 2-column grid of `<ConstantTile>` for the 6 biometrics we track
 * (weight / BMI / body fat / waist / hips / chest). Per-tile state is derived
 * by `computeBodyConstants`, so the grid is purely presentational.
 */
import { Scale, Calculator, Percent, Ruler } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import ConstantTile, { type ConstantTileCopy } from '../../../components/ConstantTile';
import { computeBodyConstants, type ConstantTileSpec } from '../utils/body-constants';
import type { BodySnapshot } from '../../../types/wellness';
import type { UnitSystem } from '../../food/utils/units';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const ICON_MAP: Record<ConstantTileSpec['id'], IconComponent> = {
  weight: Scale,
  bmi: Calculator,
  bodyFat: Percent,
  waist: Ruler,
  hips: Ruler,
  chest: Ruler,
};

interface Props {
  snapshots: BodySnapshot[];
  heightCm: number | undefined;
  unitSystem: UnitSystem;
  labels: Record<ConstantTileSpec['id'], string>;
  copy?: ConstantTileCopy;
}

export default function BodyConstantsGrid({
  snapshots,
  heightCm,
  unitSystem,
  labels,
  copy,
}: Props) {
  const specs = computeBodyConstants(snapshots, heightCm, unitSystem);

  return (
    <div className="grid grid-cols-2 gap-2">
      {specs.map(spec => (
        <ConstantTile
          key={spec.id}
          icon={ICON_MAP[spec.id]}
          label={labels[spec.id]}
          state={spec.state}
          value={spec.value}
          unit={spec.unit}
          trendValue={spec.trendValue}
          copy={copy}
        />
      ))}
    </div>
  );
}
