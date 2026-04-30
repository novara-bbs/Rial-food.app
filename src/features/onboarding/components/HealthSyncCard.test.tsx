/**
 * HealthSyncCard — inline toggle for Apple Health / Health Connect.
 *
 * Locks: OFF state shows the off-hint, the toggle has correct aria-checked,
 * tapping the toggle in OFF state calls onEnable, and the (i) info button
 * opens the privacy BottomSheet.
 */
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/helpers/renderWithProviders';

import HealthSyncCard from './HealthSyncCard';

describe('HealthSyncCard', () => {
  it('renders the off-state hint and an aria-checked=false switch', () => {
    renderWithProviders(
      <HealthSyncCard
        enabled={false}
        loading={false}
        onEnable={vi.fn()}
        onDisable={vi.fn()}
      />,
    );
    // EN locale: "Connect to autofill your data" is the off-state hint.
    expect(screen.getByText(/connect to autofill/i)).toBeInTheDocument();
    const toggle = screen.getByRole('switch');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('calls onEnable when the toggle is tapped from OFF state', async () => {
    const user = userEvent.setup();
    const onEnable = vi.fn();
    const onDisable = vi.fn();
    renderWithProviders(
      <HealthSyncCard
        enabled={false}
        loading={false}
        onEnable={onEnable}
        onDisable={onDisable}
      />,
    );
    await user.click(screen.getByRole('switch'));
    expect(onEnable).toHaveBeenCalledTimes(1);
    expect(onDisable).not.toHaveBeenCalled();
  });

  it('opens the privacy BottomSheet when the info button is tapped', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <HealthSyncCard
        enabled={false}
        loading={false}
        onEnable={vi.fn()}
        onDisable={vi.fn()}
      />,
    );
    // The (i) icon button uses the privacy title as its aria-label.
    // EN locale: "What we read".
    const infoButton = screen.getByRole('button', { name: /what we read/i });
    await user.click(infoButton);
    // The sheet portals; the title appears in the document twice (button label
    // + sheet header). Either way: at least one match means the sheet opened.
    expect(screen.getAllByText(/what we read/i).length).toBeGreaterThanOrEqual(1);
    // The privacy action button ("Got it") should be visible inside the sheet.
    expect(screen.getByRole('button', { name: /got it/i })).toBeInTheDocument();
  });
});
