import { useState, useMemo, useCallback } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';
import WeedDetailPopup from './WeedDetailPopup';
import HomeButton from './HomeButton';
import type { Weed } from '@/types/game';
import { ArrowLeft, Search, X } from 'lucide-react';

interface FilterOption {
 key: string;
 label: string;
 group: string;
}

const FILTERS: FilterOption[] = [
 { key: 'monocot', label: 'Monocots', group: 'Plant Type' },
 { key: 'dicot', label: 'Dicots', group: 'Plant Type' },
 { key: 'non-flowering', label: 'Non-flowering', group: 'Plant Type' },
 { key: 'native', label: 'Native', group: 'Origin' },
 { key: 'introduced', label: 'Introduced', group: 'Origin' },
 { key: 'warm', label: 'Warm-Season', group: 'Habitat' },
 { key: 'cool', label: 'Cool-Season', group: 'Habitat' },
 { key: 'wet', label: 'Wet / Poorly Drained', group: 'Habitat' },
 { key: 'dry', label: 'Dry / Disturbed', group: 'Habitat' },
 { key: 'annual', label: 'Annual', group: 'Life Cycle' },
 { key: 'perennial', label: 'Perennial', group: 'Life Cycle' },
 { key: 'biennial', label: 'Biennial', group: 'Life Cycle' },
 { key: 'winter-annual', label: 'Winter Annual', group: 'Life Cycle' },
 { key: 'stage:seedling', label: 'Seedling', group: 'Life Stage' },
 { key: 'stage:vegetative', label: 'Vegetative', group: 'Life Stage' },
 { key: 'stage:flower', label: 'Reproductive', group: 'Life Stage' },
 { key: 'stage:whole', label: 'Whole Plant', group: 'Life Stage' },
];

const families = [...new Set(weeds.map(w => w.family))].sort();
const familyFilters: FilterOption[] = families.map(f => ({
 key: `family:${f}`, label: f, group: 'Family',
}));

const ALL_FILTERS = [...FILTERS, ...familyFilters];

function matchesFilter(w: Weed, key: string): boolean {
 if (key === 'monocot') return w.plantType === 'Monocot';
 if (key === 'dicot') return w.plantType === 'Dicot';
 if (key === 'non-flowering') return w.plantType === 'Non-flowering';
 if (key === 'native') return w.origin === 'Native';
 if (key === 'introduced') return w.origin === 'Introduced';
 if (key === 'warm') return w.primaryHabitat.startsWith('Warm-Season');
 if (key === 'cool') return w.primaryHabitat.startsWith('Cool-Season');
 if (key === 'wet') return w.primaryHabitat.startsWith('Wet');
 if (key === 'dry') return w.primaryHabitat.startsWith('Dry');
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
 if (key.startsWith('lookalike:')) {
 for (const k of next) { if (k.startsWith('lookalike:')) next.delete(k); }
 }
 next.add(key);
 }
 return next;
 });
 }, []);

 const clearFilters = useCallback(() => setActiveFilters(new Set()), []);

 const displayStage = useMemo(() => {
 for (const f of activeFilters) {
 if (f.startsWith('stage:')) return f.replace('stage:', '');
 }
 return 'whole';
 }, [activeFilters]);

 const filtered = useMemo(() => {
 let result = weeds;
 const nonStageFilters = [...activeFilters].filter(f => !f.startsWith('stage:'));
 if (nonStageFilters.length > 0) {
 result = result.filter(w => nonStageFilters.every(f => matchesFilter(w, f)));
 }
 if (search.trim()) {
 const q = search.toLowerCase();
 result = result.filter(w =>
 w.commonName.toLowerCase().includes(q) ||
 w.scientificName.toLowerCase().includes(q) ||
 w.family.toLowerCase().includes(q)
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

  return (
  <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
  <div className="max-w-[1200px] mx-auto px-5 sm:px-10 py-6">
  <div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
  <HomeButton onClose={onClose} />
  <span className="text-border mx-1">|</span>
  <button onClick={onClose}
  className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
  <ArrowLeft className="w-4 h-4" />
  </button>
  <h1 className="text-xl font-display font-bold text-foreground">Weed Glossary</h1>
  </div>
 <span className="text-sm text-muted-foreground">{filtered.length} of {weeds.length} species</span>
 </div>

 <div className="relative mb-5">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
 <input
 type="text" value={search} onChange={e => setSearch(e.target.value)}
 placeholder="Search by name, scientific name, or family..."
 className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm"
 />
 </div>

 {activeFilters.size > 0 && (
 <div className="mb-4 flex flex-wrap items-center gap-1.5">
 <span className="text-xs text-muted-foreground">Active:</span>
 {[...activeFilters].map(k => {
 const f = ALL_FILTERS.find(x => x.key === k);
 return (
 <button key={k} onClick={() => toggleFilter(k)}
 className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary text-primary-foreground flex items-center gap-1">
 {f?.label || k} <X className="w-3 h-3" />
 </button>
 );
 })}
 <button onClick={clearFilters} className="px-2 py-0.5 rounded-md text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
 Clear all
 </button>
 </div>
 )}

 <div className="mb-5 space-y-2">
 {Array.from(groups.entries()).map(([groupName, options]) => (
 <div key={groupName}>
 <button
 onClick={() => setExpandedGroup(expandedGroup === groupName ? null : groupName)}
 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 hover:text-foreground transition-colors flex items-center gap-1"
 >
 <span>{expandedGroup === groupName ? '' : ''}</span>
 {groupName} ({options.length})
 </button>
 {expandedGroup === groupName && (
 <div className="flex flex-wrap gap-1.5 mt-1">
 {options.map(f => (
 <button
 key={f.key}
 onClick={() => toggleFilter(f.key)}
 className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
 activeFilters.has(f.key)
 ? 'bg-primary text-primary-foreground'
 : 'bg-card border border-border text-foreground hover:bg-secondary'
 }`}
 >
 {f.label}
 </button>
 ))}
 </div>
 )}
 </div>
 ))}

 <div>
 <button
 onClick={() => setExpandedGroup(expandedGroup === 'Look-Alikes' ? null : 'Look-Alikes')}
 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 hover:text-foreground transition-colors flex items-center gap-1"
 >
 <span>{expandedGroup === 'Look-Alikes' ? '' : ''}</span>
 Look-Alike Pairs
 </button>
 {expandedGroup === 'Look-Alikes' && (
 <div className="flex flex-wrap gap-1.5 mt-1">
 {weeds.filter(w => weeds.findIndex(x => x.id === w.id) < weeds.findIndex(x => x.id === w.lookAlike.id) || !weeds.find(x => x.id === w.lookAlike.id)).map(w => (
 <button
 key={w.id}
 onClick={() => toggleFilter(`lookalike:${w.id}`)}
 className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
 activeFilters.has(`lookalike:${w.id}`)
 ? 'bg-primary text-primary-foreground'
 : 'bg-card border border-border text-foreground hover:bg-secondary'
 }`}
 >
 {w.commonName} / {w.lookAlike.species}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {filtered.map(w => (
 <button key={w.id} onClick={() => setSelectedWeed(w)}
 className="bg-card border border-border rounded-lg p-4 space-y-2 animate-fade-in text-left shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-200 cursor-pointer">
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-md overflow-hidden shrink-0">
 <WeedImage weedId={w.id} stage={displayStage} className="w-full h-full" />
 </div>
 <div>
 <div className="font-display font-bold text-foreground">{w.commonName}</div>
 <div className="text-xs text-primary italic">{w.scientificName}</div>
 </div>
 </div>
 <div className="flex flex-wrap gap-1 mb-1">
 <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-foreground">{w.plantType}</span>
 <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-foreground">{w.lifeCycle}</span>
 <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-foreground">{w.origin}</span>
 </div>
 <div className="text-xs text-muted-foreground">
 <p>{w.family} · {w.primaryHabitat}</p>
 <p className="text-primary mt-0.5">{w.memoryHook}</p>
 </div>
 </button>
 ))}
 </div>
 </div>

 {selectedWeed && <WeedDetailPopup weed={selectedWeed} onClose={() => setSelectedWeed(null)} />}
 </div>
 );
}
