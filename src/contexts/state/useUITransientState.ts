/**
 * UI transient state slice — owns ephemeral selection state.
 *
 * Part of the Phase 2.5 AppStateContext decomposition (ADR-015).
 * This hook owns 8 selection vars that drive screen-to-screen navigation
 * but do NOT persist across reloads:
 *   - selectedRecipe        — currently viewed recipe (recipe-detail)
 *   - selectedCreatorId     — currently viewed creator profile
 *   - selectedPostId        — currently viewed community post
 *   - selectedStoryAuthorId — initial story shown when opening StoryViewer
 *   - selectedChallengeId   — currently viewed challenge detail
 *   - targetPlanDay         — pre-selected day index when opening AddMeal from planner
 *   - openScannerOnAddMeal  — flag: AddMeal mounts the barcode scanner immediately
 *   - recipeToEdit          — recipe passed from RecipeDetail → CreateRecipe (Edit)
 *
 * No external deps — pure ephemeral state.
 */
import { useState } from 'react';
import type { Recipe } from '../../types';

export function useUITransientState() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedStoryAuthorId, setSelectedStoryAuthorId] = useState<string | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [targetPlanDay, setTargetPlanDay] = useState<number | null>(null);
  const [openScannerOnAddMeal, setOpenScannerOnAddMeal] = useState<boolean>(false);
  // Untyped on purpose: recipeToEdit shape mirrors any in-flight edit (partial Recipe).
  // Tightening requires a dedicated EditableRecipe type — V2.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recipeToEdit, setRecipeToEdit] = useState<any>(null);

  return {
    selectedRecipe, setSelectedRecipe,
    selectedCreatorId, setSelectedCreatorId,
    selectedPostId, setSelectedPostId,
    selectedStoryAuthorId, setSelectedStoryAuthorId,
    selectedChallengeId, setSelectedChallengeId,
    targetPlanDay, setTargetPlanDay,
    openScannerOnAddMeal, setOpenScannerOnAddMeal,
    recipeToEdit, setRecipeToEdit,
  };
}

export type UITransientState = ReturnType<typeof useUITransientState>;
