import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getAllReferencesGrouped, INATURALIST_DEFAULT_CITATION } from '@/data/imageReferences';
import {
  CONTROL_METHOD_REFS,
  BOTANY_TERM_REFS,
  CROP_REFS,
  WEED_INJURY_REFS,
  CROP_INJURY_REFS,
  CitedImage,
} from '@/data/otherImageReferences';

function CitedImageTable({ items }: { items: CitedImage[] }) {
  return (
    <div className="divide-y divide-border/50">
      {items.map((entry, i) => (
        <div key={i} className="px-4 py-2.5 flex gap-3">
          <span className="text-xs text-primary font-mono shrink-0 pt-0.5 w-36">
            {entry.image}
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed break-words">
            <span className="font-medium text-foreground">{entry.label}: </span>
            {entry.citation}
          </p>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-secondary/30 px-4 py-2.5 border-b border-border">
        <h2 className="font-display font-semibold text-sm text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function ReferencesPage({ onClose }: { onClose: () => void }) {
  const grouped = useMemo(() => getAllReferencesGrouped(), []);
  const speciesList = Object.keys(grouped);

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-6">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="font-display font-bold text-xl text-foreground">Image References</h1>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          All images used in this application are credited below, organized by category. Any image
          not listed individually was sourced from iNaturalist.
        </p>

        {/* iNaturalist general citation */}
        <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Default Source
          </h2>
          <p className="text-sm text-foreground">{INATURALIST_DEFAULT_CITATION}</p>
        </div>

        {/* Weed species images */}
        <h2 className="font-display font-semibold text-base text-foreground mb-3">Weed Species</h2>
        <div className="space-y-6 mb-12">
          {speciesList.map(species => (
            <Section key={species} title={species.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}>
              <div className="divide-y divide-border/50">
                {grouped[species].map((entry, i) => (
                  <div key={i} className="px-4 py-2.5 flex gap-3">
                    <span className="text-xs text-primary font-mono shrink-0 pt-0.5 w-36">
                      {entry.image}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">
                      {entry.citation}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          ))}
        </div>

        {/* Control methods */}
        <h2 className="font-display font-semibold text-base text-foreground mb-3">Control Methods</h2>
        <div className="mb-12">
          <Section title="Control Method Illustrations">
            <CitedImageTable items={CONTROL_METHOD_REFS} />
          </Section>
        </div>

        {/* Botany terms */}
        <h2 className="font-display font-semibold text-base text-foreground mb-3">Botany &amp; Plant Structures</h2>
        <div className="mb-12">
          <Section title="Botanical Term Illustrations">
            <CitedImageTable items={BOTANY_TERM_REFS} />
          </Section>
        </div>

        {/* Crop images */}
        <h2 className="font-display font-semibold text-base text-foreground mb-3">Crop Images</h2>
        <div className="space-y-6 mb-12">
          {CROP_REFS.map(group => (
            <Section key={group.crop} title={group.crop}>
              <CitedImageTable items={group.images} />
            </Section>
          ))}
        </div>

        {/* Weed herbicide injury */}
        <h2 className="font-display font-semibold text-base text-foreground mb-3">Weed Herbicide Injury</h2>
        <div className="mb-12">
          <Section title="Herbicide Injury on Weeds">
            <CitedImageTable items={WEED_INJURY_REFS} />
          </Section>
        </div>

        {/* Crop herbicide injury */}
        <h2 className="font-display font-semibold text-base text-foreground mb-3">Crop Herbicide Injury</h2>
        <div className="mb-12">
          <Section title="Herbicide Injury on Crops">
            <div className="divide-y divide-border/50">
              {CROP_INJURY_REFS.map((entry, i) => (
                <div key={i} className="px-4 py-2.5">
                  <p className="text-xs text-foreground font-medium">
                    {entry.herbicide} — {entry.crop} ({entry.activeIngredient})
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed break-words mt-0.5">
                    {entry.citation}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        <div className="mt-12 pb-8 text-center text-xs text-muted-foreground">
          Total species with specific citations: {speciesList.length}
        </div>
      </div>
    </div>
  );
}
