/**
 * Tests for RecipeServingsControls — Phase 3.1 (ADR-015).
 *
 * Pure presentation: counter widget + family multiselect chips.
 * Locks: counter increment/decrement bounds, disabled-at-1, family
 * member toggling, "only me" reset.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/helpers/renderWithProviders';
import RecipeServingsControls from './RecipeServingsControls';

const familyMembers = [
  { id: 'm-1', name: 'Ana', age: 8, goal: 'health' },
  { id: 'm-2', name: 'Luis', age: 35, goal: 'maintain' },
];

beforeEach(() => {
  window.localStorage.clear();
});

describe('RecipeServingsControls — counter', () => {
  it('renders the current servings count', () => {
    const setServings = vi.fn();
    renderWithProviders(
      <RecipeServingsControls
        servings={4}
        setServings={setServings}
        familyMembers={[]}
        selectedFamily={[]}
        toggleFamilyMember={vi.fn()}
        setSelectedFamily={vi.fn()}
        totalDiners={1}
      />,
    );
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('disables the decrement button at servings=1', () => {
    renderWithProviders(
      <RecipeServingsControls
        servings={1}
        setServings={vi.fn()}
        familyMembers={[]}
        selectedFamily={[]}
        toggleFamilyMember={vi.fn()}
        setSelectedFamily={vi.fn()}
        totalDiners={1}
      />,
    );
    const dec = screen.getByLabelText(/decrease/i);
    expect(dec.hasAttribute('disabled')).toBe(true);
  });

  it('calls setServings(prev-1) when decrement is clicked at servings>1', async () => {
    const setServings = vi.fn();
    renderWithProviders(
      <RecipeServingsControls
        servings={3}
        setServings={setServings}
        familyMembers={[]}
        selectedFamily={[]}
        toggleFamilyMember={vi.fn()}
        setSelectedFamily={vi.fn()}
        totalDiners={1}
      />,
    );
    await userEvent.click(screen.getByLabelText(/decrease/i));
    expect(setServings).toHaveBeenCalledWith(2);
  });

  it('calls setServings(prev+1) when increment is clicked', async () => {
    const setServings = vi.fn();
    renderWithProviders(
      <RecipeServingsControls
        servings={3}
        setServings={setServings}
        familyMembers={[]}
        selectedFamily={[]}
        toggleFamilyMember={vi.fn()}
        setSelectedFamily={vi.fn()}
        totalDiners={1}
      />,
    );
    await userEvent.click(screen.getByLabelText(/increase/i));
    expect(setServings).toHaveBeenCalledWith(4);
  });
});

describe('RecipeServingsControls — family multiselect', () => {
  it('hides the family panel when no family members exist', () => {
    renderWithProviders(
      <RecipeServingsControls
        servings={2}
        setServings={vi.fn()}
        familyMembers={[]}
        selectedFamily={[]}
        toggleFamilyMember={vi.fn()}
        setSelectedFamily={vi.fn()}
        totalDiners={1}
      />,
    );
    expect(screen.queryByText(/Ana|Luis/)).toBeNull();
  });

  it('renders one chip per family member when family exists', () => {
    renderWithProviders(
      <RecipeServingsControls
        servings={2}
        setServings={vi.fn()}
        familyMembers={familyMembers}
        selectedFamily={[]}
        toggleFamilyMember={vi.fn()}
        setSelectedFamily={vi.fn()}
        totalDiners={1}
      />,
    );
    expect(screen.getByText(/\+ Ana/)).toBeTruthy();
    expect(screen.getByText(/\+ Luis/)).toBeTruthy();
  });

  it('clicking an "Only me" chip resets selectedFamily via setSelectedFamily([])', async () => {
    const setSelectedFamily = vi.fn();
    renderWithProviders(
      <RecipeServingsControls
        servings={2}
        setServings={vi.fn()}
        familyMembers={familyMembers}
        selectedFamily={['m-1']}
        toggleFamilyMember={vi.fn()}
        setSelectedFamily={setSelectedFamily}
        totalDiners={2}
      />,
    );
    // EN: "Just Me" · ES: "Solo Yo" — match either via /just|solo/i.
    const onlyMe = screen.getByText(/just me|solo yo/i);
    await userEvent.click(onlyMe);
    expect(setSelectedFamily).toHaveBeenCalledWith([]);
  });

  it('clicking a family-member chip calls toggleFamilyMember(id)', async () => {
    const toggleFamilyMember = vi.fn();
    renderWithProviders(
      <RecipeServingsControls
        servings={2}
        setServings={vi.fn()}
        familyMembers={familyMembers}
        selectedFamily={[]}
        toggleFamilyMember={toggleFamilyMember}
        setSelectedFamily={vi.fn()}
        totalDiners={1}
      />,
    );
    await userEvent.click(screen.getByText(/\+ Ana/));
    expect(toggleFamilyMember).toHaveBeenCalledWith('m-1');
  });

  it('shows totalDiners in the scaling caption', () => {
    renderWithProviders(
      <RecipeServingsControls
        servings={2}
        setServings={vi.fn()}
        familyMembers={familyMembers}
        selectedFamily={['m-1']}
        toggleFamilyMember={vi.fn()}
        setSelectedFamily={vi.fn()}
        totalDiners={2}
      />,
    );
    // "Scaling for 2 people" — locale-stable via /2/
    expect(screen.getByText(/2.*peop/i)).toBeTruthy();
  });
});
