import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getAllReferencesGrouped, INATURALIST_DEFAULT_CITATION } from '@/data/imageReferences';

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
          All images used in this application are credited below, organized by species. Images not listed
          individually were sourced from iNaturalist.
        </p>

        {/* iNaturalist general citation */}
        <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-8">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Default Source
          </h2>
          <p className="text-sm text-foreground">{INATURALIST_DEFAULT_CITATION}</p>
        </div>

        <div className="space-y-6">
          {speciesList.map(species => (
            <div key={species} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-secondary/30 px-4 py-2.5 border-b border-border">
                <h2 className="font-display font-semibold text-sm text-foreground">
                  {species.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </h2>
              </div>
              <div className="divide-y divide-border/50">
                {grouped[species].map((entry, i) => (
                  <div key={i} className="px-4 py-2.5 flex gap-3">
                    <span className="text-xs text-primary font-mono shrink-0 pt-0.5 w-28">
                      {entry.image}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed break-words">
                      {entry.citation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pb-8 text-center text-xs text-muted-foreground">
          Total species with specific citations: {speciesList.length}
        </div>
      </div>
    </div>
  );
}
