import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';

type FilterKey = 'all' | 'monocot' | 'dicot' | 'native' | 'introduced' | 'warm' | 'cool' | 'wet' | 'dry' | string;

interface FilterOption {
  key: FilterKey;
  label: string;
  icon: string;
  group: string;
}

const FILTERS: FilterOption[] = [
  { key: 'all', label: 'All Species', icon: '📋', group: 'View' },
  // Plant type
  { key: 'monocot', label: 'Monocots', icon: '🌾', group: 'Plant Type' },
  { key: 'dicot', label: 'Dicots', icon: '🍀', group: 'Plant Type' },
  // Origin
  { key: 'native', label: 'Native', icon: '🏡', group: 'Origin' },
  { key: 'introduced', label: 'Introduced', icon: '🚢', group: 'Origin' },
  // Habitat
  { key: 'warm', label: 'Warm-Season', icon: '☀️', group: 'Habitat' },
  { key: 'cool', label: 'Cool-Season', icon: '❄️', group: 'Habitat' },
  { key: 'wet', label: 'Wet / Poorly Drained', icon: '💧', group: 'Habitat' },
  { key: 'dry', label: 'Dry / Disturbed', icon: '🏜️', group: 'Habitat' },
  // Life Cycle
  { key: 'annual', label: 'Annual', icon: '🔄', group: 'Life Cycle' },
  { key: 'perennial', label: 'Perennial', icon: '♾️', group: 'Life Cycle' },
  { key: 'biennial', label: 'Biennial', icon: '2️⃣', group: 'Life Cycle' },
];

// Get unique families for family filter
const families = [...new Set(weeds.map(w => w.family))].sort();
const familyFilters: FilterOption[] = families.map(f => ({
  key: `family:${f}`, label: f, icon: '🌿', group: 'Family',
}));

const ALL_FILTERS = [...FILTERS, ...familyFilters];

function filterWeeds(activeFilter: FilterKey) {
  if (activeFilter === 'all') return weeds;
  if (activeFilter === 'monocot') return weeds.filter(w => w.plantType === 'Monocot');
  if (activeFilter === 'dicot') return weeds.filter(w => w.plantType === 'Dicot');
  if (activeFilter === 'native') return weeds.filter(w => w.origin === 'Native');
  if (activeFilter === 'introduced') return weeds.filter(w => w.origin === 'Introduced');
  if (activeFilter === 'warm') return weeds.filter(w => w.primaryHabitat === 'Warm-Season / Full Sun');
  if (activeFilter === 'cool') return weeds.filter(w => w.primaryHabitat === 'Cool-Season / Early Spring');
  if (activeFilter === 'wet') return weeds.filter(w => w.primaryHabitat === 'Wet / Poorly Drained');
  if (activeFilter === 'dry') return weeds.filter(w => w.primaryHabitat === 'Dry / Disturbed');
  if (activeFilter === 'annual') return weeds.filter(w => w.lifeCycle.includes('Annual'));
  if (activeFilter === 'perennial') return weeds.filter(w => w.lifeCycle === 'Perennial');
  if (activeFilter === 'biennial') return weeds.filter(w => w.lifeCycle === 'Biennial');
  if (activeFilter.startsWith('family:')) {
    const fam = activeFilter.replace('family:', '');
    return weeds.filter(w => w.family === fam);
  }
  // Look-alike cluster
  if (activeFilter.startsWith('lookalike:')) {
    const weedId = activeFilter.replace('lookalike:', '');
    const weed = weeds.find(w => w.id === weedId);
    if (!weed) return [];
    return weeds.filter(w => w.id === weedId || w.id === weed.lookAlike.id);
  }
  return weeds;
}

interface Props {
  onClose: () => void;
}

export default function Glossary({ onClose }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = filterWeeds(activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(w =>
        w.commonName.toLowerCase().includes(q) ||
        w.scientificName.toLowerCase().includes(q) ||
        w.family.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeFilter, search]);

  const groups = useMemo(() => {
    const map = new Map<string, FilterOption[]>();
    ALL_FILTERS.forEach(f => {
      const existing = map.get(f.group) || [];
      existing.push(f);
      map.set(f.group, existing);
    });
    return map;
  }, []);

  const activeLabel = ALL_FILTERS.find(f => f.key === activeFilter)?.label || 'All Species';

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-display font-bold text-primary">📖 Weed Glossary</h1>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">✕ Close</button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, scientific name, or family..."
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

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
              {(expandedGroup === groupName || groupName === 'View') && (
                <div className="flex flex-wrap gap-1.5">
                  {options.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setActiveFilter(f.key)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        activeFilter === f.key
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
                    onClick={() => setActiveFilter(`lookalike:${w.id}`)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      activeFilter === `lookalike:${w.id}`
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
          Showing <span className="text-foreground font-semibold">{filtered.length}</span> species • {activeLabel}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(w => (
            <div key={w.id} className="bg-card border border-border rounded-lg p-4 space-y-2 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                  <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
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
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-foreground">{w.primaryHabitat}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <p>EPPO: <span className="text-foreground">{w.eppoCode}</span> | Family: <span className="text-foreground">{w.family}</span></p>
                <p className="text-foreground">Habitat: {w.habitat}</p>
                <p className="text-primary">💡 {w.memoryHook}</p>
                <p className="text-muted-foreground">🔀 Look-alike: {w.lookAlike.species} — {w.lookAlike.difference}</p>
              </div>
              {w.safetyNote && <div className="text-xs bg-destructive/15 text-destructive-foreground p-2 rounded">{w.safetyNote}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
