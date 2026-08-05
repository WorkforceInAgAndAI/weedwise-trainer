import { useState } from 'react';
import { MapPin, Check, ChevronDown } from 'lucide-react';
import { useRegion } from '@/hooks/useRegion';

/**
 * Home-page region selector. Choosing a region prioritizes the weed species
 * that are most prevalent in that part of the U.S. / Canada across the
 * Grades 9-12 and Collegiate learning modules and practice games.
 */
export default function RegionPicker() {
  const { region, regions, setRegion } = useRegion();
  const [open, setOpen] = useState(false);

  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-10 pt-10">
      <div className="rounded-lg border border-border bg-card shadow-card p-5 sm:p-6">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-[240px]">
            <h2 className="font-display font-bold text-foreground text-lg">
              Choose your region
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              {region
                ? `You are studying the ${region.name} region. ${region.blurb} Grades 9-12 and Collegiate content prioritizes the ${region.priorityWeedIds.length} species reported most often here — other species still appear.`
                : 'Pick the part of the U.S. or Canada you farm or study in. Grades 9-12 and Collegiate content will prioritize the weed species most prevalent in that region.'}
            </p>
          </div>
          <button
            onClick={() => setOpen(o => !o)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-border bg-background text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
            aria-expanded={open}
          >
            {region ? region.name : 'Select region'}
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {open && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regions.map(r => {
              const active = region?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRegion(active ? null : r.id)}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    active
                      ? 'border-primary bg-primary/5 shadow-card'
                      : 'border-border bg-background hover:border-primary/30 hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground">{r.name}</span>
                    {active && <Check className="w-4 h-4 text-primary ml-auto" />}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.blurb}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {r.areas.slice(0, 6).join(', ')}
                    {r.areas.length > 6 ? ` +${r.areas.length - 6} more` : ''}
                  </p>
                  <p className="text-[11px] text-primary font-semibold mt-1">
                    {r.priorityWeedIds.length} priority species
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
