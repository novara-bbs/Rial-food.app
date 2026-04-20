/**
 * P10 `[1.5.67]` — info button next to a subcategory header that explains
 * the technical term (crucíferas, solanáceas, …) when tapped.
 *
 * Owner directive 2026-04-21: *«Mantener la jerga técnica [botánica] porque
 * el usuario quiere aprender — pero que puedan consultar qué significa»*.
 * Small info icon (i) keeps the header clean; tap opens a Dialog with the
 * canonical definition + familiar examples as chips.
 *
 * Only renders when the slug exists in `GLOSSARY` — headers of subcategories
 * with self-explanatory names (yogur, leche, café-té) don't get the button.
 */
import { useState } from 'react';
import { Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '../../../i18n';
import { getGlossaryEntry } from '../data/glossary';

interface Props {
  /** Subcategory slug (matches FAMILY_SUBCATEGORY values). */
  slug: string;
  /** Display name of the subcategory (shown as Dialog title). */
  label: string;
}

export default function GlossaryButton({ slug, label }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const entry = getGlossaryEntry(slug);
  if (!entry) return null;

  const definitions = t.foodDictionary.glossary.definitions as Record<string, string>;
  const definition = definitions[slug] ?? slug;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${t.foodDictionary.glossary.infoLabel} — ${label}`}
        data-glossary-button={slug}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
      >
        <Info className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-body text-on-surface leading-relaxed">
              {definition}
            </p>
            {entry.examples.length > 0 && (
              <div>
                <p className="text-micro font-label uppercase tracking-widest text-on-surface-variant mb-1.5">
                  {t.foodDictionary.glossary.examplesLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.examples.map((example) => (
                    <span
                      key={example}
                      className="text-caption text-on-surface bg-surface-container-high rounded-full px-2.5 py-1"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
