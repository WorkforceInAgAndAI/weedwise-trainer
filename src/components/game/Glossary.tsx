import { useState, useMemo, useCallback } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';
import type { Weed } from '@/types/game';

interface FilterOption {
  key: string;
  label: string;
  icon: string;
  group: string;
}

const FILTERS: FilterOption[] = [
  // Plant type
  { key: 'monocot', label: 'Monocots', icon: '🌾', group: 'Plant Type' },
  { key: 'dicot', label: 'Dicots', icon: '🍀', group: 'Plant Type' },
  { key: 'non-flowering', label: 'Non-flowering', icon: '🌱', group: 'Plant Type' },
  // Origin
  { key: 'native', label: 'Native', icon: '🏡', group: 'Origin' },
  { key: 'introduced', label: 'Introduced', icon: '🚢', group: 'Origin' },
  // Habitat
  { key: 'warm', label: 'Warm-Season', icon: '☀️', group: 'Habitat' },
  { key: 'cool', label: 'Cool-Season', icon: '❄️', group: 'Habitat' },
  { key: 'wet', label: 'Wet / Moist', icon: '💧', group: 'Habitat' },
  { key: 'dry', label: 'Dry / Disturbed', icon: '🏜️', group: 'Habitat' },
  // Life Cycle
  { key: 'annual', label: 'Annual', icon: '🔄', group: 'Life Cycle' },
  { key: 'perennial', label: 'Perennial', icon: '♾️', group: 'Life Cycle' },
  { key: 'biennial', label: 'Biennial', icon: '2️⃣', group: 'Life Cycle' },
  { key: 'winter-annual', label: 'Winter Annual', icon: '❄️🔄', group: 'Life Cycle' },
  // Life Stage (image stage)
  { key: 'stage:seedling', label: 'Seedling', icon: '🌱', group: 'Life Stage' },
  { key: 'stage:vegetative', label: 'Vegetative', icon: '🌿', group: 'Life Stage' },
  { key: 'stage:flower', label: 'Reproductive', icon: '🌸', group: 'Life Stage' },
  { key: 'stage:whole', label: 'Whole Plant', icon: '🪴', group: 'Life Stage' },
];

const families = [...new Set(weeds.map(w => w.family))].sort();
const familyFilters: FilterOption[] = families.map(f => ({
  key: `family:${f}`, label: f, icon: '🌿', group: 'Family',
}));

const ALL_FILTERS = [...FILTERS, ...familyFilters];

function matchesFilter(w: Weed, key: string): boolean {
  if (key === 'monocot') return w.plantType === 'Monocot';
  if (key === 'dicot') return w.plantType === 'Dicot';
  if (key === 'non-flowering') return w.plantType === 'Non-flowering';
  if (key === 'native') return w.origin === 'Native';
  if (key === 'introduced') return w.origin === 'Introduced';
  if (key === 'warm') return w.primaryHabitat.toLowerCase().includes('warm');
  if (key === 'cool') return w.primaryHabitat.toLowerCase().includes('cool');
  if (key === 'wet') return w.primaryHabitat.toLowerCase().includes('wet') || w.primaryHabitat.toLowerCase().includes('moist') || w.primaryHabitat.toLowerCase().includes('aquatic');
  if (key === 'dry') return w.primaryHabitat.toLowerCase().includes('dry') || w.primaryHabitat.toLowerCase().includes('disturbed') || w.primaryHabitat.toLowerCase().includes('arid');
  if (key === 'annual') return w.lifeCycle.includes('Annual') && !w.lifeCycle.toLowerCase().includes('winter');
  if (key === 'perennial') return w.lifeCycle === 'Perennial';
  if (key === 'biennial') return w.lifeCycle === 'Biennial';
  if (key === 'winter-annual') return w.lifeCycle.toLowerCase().includes('winter');
  if (key.startsWith('family:')) return w.family === key.replace('family:', '');
  if (key.startsWith('lookalike:')) {
    const weedId = key.replace('lookalike:', '');
    const target = weeds.find(x => x.id === weedId);
    if (!target) return false;
    return w.id === weedId || w.id === target.lookAlike.id;
  }
  // Life stage filters don't filter weeds — they change the displayed image
  if (key.startsWith('stage:')) return true;
  return true;
}

interface Props {
  onClose: () => void;
}

export default function Glossary({ onClose }: Props) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [selectedWeed, setSelectedWeed] = useState<Weed | null>(null);

  const toggleFilter = useCallback((key: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        // If toggling a lookalike, clear other lookalikes
        if (key.startsWith('lookalike:')) {
          for (const k of next) { if (k.startsWith('lookalike:')) next.delete(k); }
        }
        next.add(key);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => setActiveFilters(new Set()), []);

  // Determine which life stage to show images for
  const displayStage = useMemo(() => {
    for (const f of activeFilters) {
      if (f.startsWith('stage:')) return f.replace('stage:', '');
    }
    return 'whole';
  }, [activeFilters]);

  const filtered = useMemo(() => {
    let result = weeds;

    // Apply all active filters (AND logic)
    const nonStageFilters = [...activeFilters].filter(f => !f.startsWith('stage:'));
    if (nonStageFilters.length > 0) {
      result = result.filter(w => nonStageFilters.every(f => matchesFilter(w, f)));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(w =>
        w.commonName.toLowerCase().includes(q) ||
        w.scientificName.toLowerCase().includes(q) ||
        w.family.toLowerCase().includes(q) ||
        w.eppoCode.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeFilters, search]);

  const groups = useMemo(() => {
    const map = new Map<string, FilterOption[]>();
    ALL_FILTERS.forEach(f => {
      const existing = map.get(f.group) || [];
      existing.push(f);
      map.set(f.group, existing);
    });
    return map;
  }, []);

  const activeLabel = activeFilters.size === 0
    ? 'All Species'
    : [...activeFilters].map(k => ALL_FILTERS.find(f => f.key === k)?.label || k).join(' + ');

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-primary">📖 Weed Glossary</h1>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">✕ Close</button>
        </div>

        <div className="mb-4">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, scientific name, family, or EPPO code..."
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Active filters bar */}
        {activeFilters.size > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Active:</span>
            {[...activeFilters].map(k => {
              const f = ALL_FILTERS.find(x => x.key === k);
              return (
                <button key={k} onClick={() => toggleFilter(k)}
                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground flex items-center gap-1">
                  {f?.icon} {f?.label || k} ✕
                </button>
              );
            })}
            <button onClick={clearFilters} className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/15 text-destructive hover:bg-destructive/25 transition-colors">
              Clear all
            </button>
          </div>
        )}

        {/* Filter groups */}
        <div className="mb-4 space-y-2">
          {Array.from(groups.entries()).map(([groupName, options]) => (
            <div key={groupName}>
              <button
                onClick={() => setExpandedGroup(expandedGroup === groupName ? null : groupName)}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 hover:text-foreground transition-colors flex items-center gap-1"
              >
                <span>{expandedGroup === groupName ? '▾' : '▸'}</span>
                {groupName} ({options.length})
              </button>
              {expandedGroup === groupName && (
                <div className="flex flex-wrap gap-1.5">
                  {options.map(f => (
                    <button
                      key={f.key}
                      onClick={() => toggleFilter(f.key)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        activeFilters.has(f.key)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {f.icon} {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Look-alike clusters */}
          <div>
            <button
              onClick={() => setExpandedGroup(expandedGroup === 'Look-Alikes' ? null : 'Look-Alikes')}
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>{expandedGroup === 'Look-Alikes' ? '▾' : '▸'}</span>
              Look-Alike Pairs
            </button>
            {expandedGroup === 'Look-Alikes' && (
              <div className="flex flex-wrap gap-1.5">
                {weeds.filter(w => weeds.findIndex(x => x.id === w.id) < weeds.findIndex(x => x.id === w.lookAlike.id) || !weeds.find(x => x.id === w.lookAlike.id)).map(w => (
                  <button
                    key={w.id}
                    onClick={() => toggleFilter(`lookalike:${w.id}`)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      activeFilters.has(`lookalike:${w.id}`)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    🔀 {w.commonName} / {w.lookAlike.species}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-3">
          Showing <span className="text-foreground font-semibold">{filtered.length}</span> of {weeds.length} species • {activeLabel}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(w => (
            <button key={w.id} onClick={() => setSelectedWeed(w)}
              className="bg-card border border-border rounded-lg p-4 space-y-2 animate-fade-in text-left hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage={displayStage} className="w-full h-full" />
                </div>
                <div>
                  <div className="font-display font-bold text-foreground">{w.commonName}</div>
                  <div className="text-xs text-primary italic">{w.scientificName}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground">{w.plantType}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground">{w.lifeCycle}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground">{w.origin}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>{w.family} • {w.primaryHabitat}</p>
                <p className="text-primary mt-0.5">💡 {w.memoryHook}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Species Detail Popup */}
      {selectedWeed && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur flex items-center justify-center p-4" onClick={() => setSelectedWeed(null)}>
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">{selectedWeed.commonName}</h2>
                <p className="text-sm text-primary italic">{selectedWeed.scientificName}</p>
                <p className="text-xs text-muted-foreground">EPPO: {selectedWeed.eppoCode} • {selectedWeed.family}</p>
              </div>
              <button onClick={() => setSelectedWeed(null)} className="px-3 py-1 rounded-lg border border-border hover:bg-secondary text-sm">✕</button>
            </div>

            {/* Image gallery - all stages */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['whole', 'seedling', 'vegetative', 'flower'] as const).map(stage => (
                <div key={stage} className="space-y-1">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase text-center">
                    {stage === 'whole' ? 'Whole Plant' : stage === 'flower' ? 'Reproductive' : stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <WeedImage weedId={selectedWeed.id} stage={stage} className="w-full h-full" />
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-medium">{selectedWeed.plantType}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-medium">{selectedWeed.lifeCycle}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-primary/15 text-primary font-medium">{selectedWeed.origin}</span>
              <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground font-medium">{selectedWeed.primaryHabitat}</span>
            </div>

            {selectedWeed.safetyNote && (
              <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-3 text-sm text-destructive-foreground">
                {selectedWeed.safetyNote}
              </div>
            )}

            {/* Traits */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Identifying Traits</h3>
              <ul className="space-y-1">
                {selectedWeed.traits.map((t, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>{t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Habitat */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Habitat</h3>
              <p className="text-sm text-muted-foreground">{selectedWeed.habitat}</p>
            </div>

            {/* Management */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Management</h3>
              <p className="text-sm text-muted-foreground">{selectedWeed.management}</p>
              <p className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">Timing:</span> {selectedWeed.controlTiming}</p>
              {selectedWeed.actImmediately && (
                <p className="text-sm text-destructive mt-1">⚠️ Act Immediately: {selectedWeed.actReason}</p>
              )}
            </div>

            {/* Look-alike */}
            <div className="bg-secondary/50 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-foreground mb-1">🔀 Look-Alike: {selectedWeed.lookAlike.species}</h3>
              <p className="text-sm text-muted-foreground">{selectedWeed.lookAlike.difference}</p>
            </div>

            {/* Memory Hook */}
            <div className="bg-primary/10 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-primary mb-1">💡 Memory Hook</h3>
              <p className="text-sm text-foreground">{selectedWeed.memoryHook}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
