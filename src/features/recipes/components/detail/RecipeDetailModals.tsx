/**
 * RecipeDetail bottom modals cluster — publish sheet, lightbox, 3 confirm
 * dialogs, variant picker sheet.
 *
 * Extracted from RecipeDetail.tsx (Phase 3.1, ADR-015). Pure orchestration:
 * each modal is conditionally rendered from open/state flags owned by the
 * parent. Confirmation handlers come in via props because they read from
 * the parent's full state graph (recipe data, swap targets, etc.).
 */
import PublishRecipeSheet from '../../../social/components/PublishRecipeSheet';
import MediaLightbox from '../MediaLightbox';
import VariantPickerSheet from '../../../food/components/VariantPickerSheet';
import ConfirmDialog from '../../../../components/ConfirmDialog';
import { useI18n } from '@/i18n';
import type { FoodFamily, FoodVariant } from '../../../../types/food-family';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecipeData = any;

interface RecipeDetailModalsProps {
  data: RecipeData;
  /** Returns the recipe with swaps + extras + scaling applied. */
  getModifiedRecipe: () => RecipeData;
  galleryPhotos: string[];
  // ── Publish sheet
  showPublishSheet: boolean;
  setShowPublishSheet: (open: boolean) => void;
  // ── Lightbox
  lightboxIdx: number | null;
  setLightboxIdx: (idx: number | null) => void;
  // ── Delete confirm
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (open: boolean) => void;
  handleDeleteRecipe: (recipeId: string | number) => void;
  // ── Duplicate confirm
  showDuplicateConfirm: boolean;
  setShowDuplicateConfirm: (open: boolean) => void;
  handleDuplicateRecipe: (recipe: RecipeData) => void;
  // ── Unsave confirm
  showUnsaveConfirm: boolean;
  setShowUnsaveConfirm: (open: boolean) => void;
  onSaveRecipe?: (recipe: RecipeData) => void;
  // ── Brand-variant swap picker
  swapTarget: { rowId: string; family: FoodFamily } | null;
  setSwapTarget: (target: null) => void;
  mergedVariants: FoodVariant[];
  userVariants: FoodVariant[];
  applyVariantSwap: (variant: FoodVariant) => void;
}

export default function RecipeDetailModals({
  data,
  getModifiedRecipe,
  galleryPhotos,
  showPublishSheet, setShowPublishSheet,
  lightboxIdx, setLightboxIdx,
  showDeleteConfirm, setShowDeleteConfirm, handleDeleteRecipe,
  showDuplicateConfirm, setShowDuplicateConfirm, handleDuplicateRecipe,
  showUnsaveConfirm, setShowUnsaveConfirm, onSaveRecipe,
  swapTarget, setSwapTarget, mergedVariants, userVariants, applyVariantSwap,
}: RecipeDetailModalsProps) {
  const { t } = useI18n();

  return (
    <>
      {showPublishSheet && (
        <PublishRecipeSheet
          recipe={getModifiedRecipe()}
          onClose={() => setShowPublishSheet(false)}
        />
      )}

      <MediaLightbox
        photos={galleryPhotos}
        startIndex={lightboxIdx ?? 0}
        open={lightboxIdx !== null}
        onOpenChange={(o) => { if (!o) setLightboxIdx(null); }}
        alt={data.title}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={t.confirm.deleteRecipe}
        description={t.confirm.deleteRecipeDesc}
        confirmLabel={t.confirm.yes}
        cancelLabel={t.confirm.cancel}
        variant="destructive"
        onConfirm={() => handleDeleteRecipe(data.id)}
      />

      <ConfirmDialog
        open={showDuplicateConfirm}
        onOpenChange={setShowDuplicateConfirm}
        title={t.recipeDetail.createVersion || 'Crear mi versión'}
        description={`${t.recipeDetail.duplicateConfirmDesc || 'Se creará una copia editable de'} "${data.title}"${data.publishedByName ? ` ${t.recipeDetail.by || 'de'} ${data.publishedByName}` : ''}. ${t.recipeDetail.duplicateConfirmHint || 'Podrás modificarla y hacerla tuya.'}`}
        confirmLabel={t.recipeDetail.duplicate || 'Duplicar'}
        cancelLabel={t.confirm.cancel}
        onConfirm={() => handleDuplicateRecipe(getModifiedRecipe())}
      />

      <ConfirmDialog
        open={showUnsaveConfirm}
        onOpenChange={setShowUnsaveConfirm}
        title={t.confirm.unsaveRecipe || '¿Desguardar esta receta?'}
        description={t.confirm.unsaveRecipeDesc || 'La receta saldrá de tu Bóveda. Podrás volver a guardarla en cualquier momento.'}
        confirmLabel={t.confirm.yes}
        cancelLabel={t.confirm.cancel}
        variant="destructive"
        onConfirm={() => onSaveRecipe && onSaveRecipe(getModifiedRecipe())}
      />

      {swapTarget && (
        <VariantPickerSheet
          family={swapTarget.family}
          allVariants={mergedVariants}
          userVariants={userVariants}
          open={Boolean(swapTarget)}
          onOpenChange={(open) => { if (!open) setSwapTarget(null); }}
          onSelect={applyVariantSwap}
        />
      )}
    </>
  );
}
