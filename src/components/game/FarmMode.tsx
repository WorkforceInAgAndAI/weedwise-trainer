import { useState, useCallback, useMemo, useRef } from 'react';
import { weeds, weedMap } from '@/data/weeds';
import { crops, cropMap } from '@/data/crops';
import { fieldEnvironments, getFieldCount, getScoutingPhases, fieldMap } from '@/data/fields';
import type { GradeLevel, Weed } from '@/types/game';
import { GRADE_NAMES, GRADE_RANGES } from '@/data/phases';
import WeedImage from './WeedImage';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

// ── Types ──────────────────────────────────────────────────
interface WeedDot {
  id: string;           // unique per dot
  weedId: string;       // which weed species
  x: number;            // 0-100 percent position on field
  y: number;
  found: boolean;
  category?: 'monocot' | 'dicot';
}

interface FieldState {
  fieldId: string;
  dots: WeedDot[];
  cropId?: string;
}

interface ManagementAction {
  groupLabel: string;
  method: string;
  timing: string;
  effective: boolean;
}

interface InvasiveReport {
  weedId: string;
  fieldId: string;
  count: number;
  density: string;
  notes: string;
  submitted: boolean;
}

type FarmPhase = 'avatar' | 'overview' | 'scouting' | 'categorize-review' | 'invasive-report' | 'management' | 'results';

interface Avatar {
  id: string;
  label: string;
  emoji: string;
  portrait: string;
}

const AVATARS: Avatar[] = [
  { id: 'male-1', label: 'Jake', emoji: '👨‍🌾', portrait: '🧑' },
  { id: 'male-2', label: 'Marcus', emoji: '👨‍🌾', portrait: '👨' },
  { id: 'female-1', label: 'Sarah', emoji: '👩‍🌾', portrait: '👩' },
  { id: 'female-2', label: 'Elena', emoji: '👩‍🌾', portrait: '🧑‍🦱' },
];

// ── Constants ──────────────────────────────────────────────
const FARM_EXPENSES = 12000;
const FAMILY_EXPENSES = 8000;
const TOTAL_EXPENSES = FARM_EXPENSES + FAMILY_EXPENSES;
const WEEDS_PER_GAME = 20;

// ── Helpers ────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

/** Generate dot positions with some species clustered, others scattered */
function generateDots(weedPool: Weed[], fieldId: string): WeedDot[] {
  const dots: WeedDot[] = [];
  let dotId = 0;

  weedPool.forEach(weed => {
    // Some weeds appear multiple times (1-3 occurrences) to represent distribution
    const isInvasive = weed.origin === 'Introduced' && weed.actImmediately;
    const occurrences = isInvasive ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2);
    
    // Decide if clustered or scattered
    const clustered = Math.random() > 0.4;
    const baseX = 10 + Math.random() * 80;
    const baseY = 10 + Math.random() * 80;

    for (let i = 0; i < occurrences; i++) {
      let x: number, y: number;
      if (clustered) {
        x = Math.max(5, Math.min(95, baseX + (Math.random() - 0.5) * 12));
        y = Math.max(5, Math.min(95, baseY + (Math.random() - 0.5) * 12));
      } else {
        x = 5 + Math.random() * 90;
        y = 5 + Math.random() * 90;
      }
      dots.push({
        id: `${fieldId}-${dotId++}`,
        weedId: weed.id,
        x,
        y,
        found: false,
      });
    }
  });
  return dots;
}

function getWeedLabel(weed: Weed, grade: GradeLevel): string {
  switch (grade) {
    case 'elementary': return weed.plantType === 'Monocot' ? '🌾 Monocot' : '🍀 Dicot';
    case 'middle': return weed.commonName;
    case 'high': return weed.scientificName;
  }
}

function getCategoryLabel(type: 'monocot' | 'dicot', grade: GradeLevel): string {
  switch (grade) {
    case 'elementary': return type === 'monocot' ? '🌾 Monocot Basket' : '🍀 Dicot Basket';
    case 'middle': return type === 'monocot' ? '🌾 Grasses' : '🍀 Broadleaves';
    case 'high': return type === 'monocot' ? '🌾 Monocotyledons' : '🍀 Dicotyledons';
  }
}

/** Check if a management method is effective for a given weed group */
function isMethodEffective(method: string, groupLabel: string, weedIds: string[]): boolean {
  const isGrassGroup = groupLabel.includes('Monocot') || groupLabel.includes('Grass');
  const isBroadleafGroup = groupLabel.includes('Dicot') || groupLabel.includes('Broadlea');
  const isPerennialGroup = groupLabel.includes('Perennial');
  const isInvasiveGroup = groupLabel.includes('Invasive') || groupLabel.includes('Priority');

  if (method.includes('Grass Herbicide') && isBroadleafGroup) return false;
  if (method.includes('Broadleaf Herbicide') && isGrassGroup) return false;
  if (method.includes('Pre-emergent') && isPerennialGroup) return false;
  if (method === 'Mowing & Cutting' && !isPerennialGroup) return false;
  if (method.includes('Integrated')) return true;
  if (method.includes('Grass Herbicide') && isGrassGroup) return true;
  if (method.includes('Broadleaf Herbicide') && isBroadleafGroup) return true;
  if (method.includes('Mechanical') && !isInvasiveGroup) return true;
  if (method.includes('Cover Crops')) return true;
  if (method.includes('Hand Removal') && weedIds.length <= 3) return true;
  if (method.includes('Pre-emergent') && groupLabel.includes('Annual')) return true;
  return false;
}

const MANAGEMENT_METHODS = [
  'Pre-emergent Herbicide (Group 15)',
  'Post-emergent Broadleaf Herbicide (2,4-D)',
  'Post-emergent Grass Herbicide (Clethodim)',
  'Mechanical Cultivation',
  'Cover Crops',
  'Mowing & Cutting',
  'Hand Removal',
  'Integrated Multi-MOA Program',
];

const MANAGEMENT_TIMING = [
  'Before planting (Pre-plant)',
  'At planting (Pre-emerge)',
  'Early post-emerge (< 4 inches)',
  'Mid-season',
  'End of season',
  'Year-round monitoring',
];

// ── Component ──────────────────────────────────────────────
interface Props { onClose: () => void; }

export default function FarmMode({ onClose }: Props) {
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [phase, setPhase] = useState<FarmPhase>('avatar');
  const [year, setYear] = useState(1);
  const [money, setMoney] = useState(25000);

  // Field state
  const [fields, setFields] = useState<FieldState[]>([]);
  const [activeFieldIdx, setActiveFieldIdx] = useState(0);
  const [scoutPhaseIdx, setScoutPhaseIdx] = useState(0);

  // Scouting popup
  const [selectedDot, setSelectedDot] = useState<WeedDot | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Categorization
  const [groups, setGroups] = useState<{ label: string; weedIds: string[] }[]>([]);

  // Invasive reports
  const [invasiveReports, setInvasiveReports] = useState<InvasiveReport[]>([]);

  // Management
  const [managementActions, setManagementActions] = useState<ManagementAction[]>([]);
  const [currentMgmtGroup, setCurrentMgmtGroup] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedTiming, setSelectedTiming] = useState('');

  // Results
  const [yieldResults, setYieldResults] = useState<{ fieldId: string; crop: string; baseYield: number; adjustedYield: number; weedPenalty: number }[]>([]);

  const scoutPhases = useMemo(() => grade ? getScoutingPhases(grade) : [], [grade]);
  const currentScoutPhase = scoutPhases[scoutPhaseIdx];

  // ── Computed ─────────────────────────────────────────────
  const activeField = fields[activeFieldIdx];
  const totalDotsFound = fields.reduce((s, f) => s + f.dots.filter(d => d.found).length, 0);
  const totalDots = fields.reduce((s, f) => s + f.dots.length, 0);
  const correctDots = fields.reduce((s, f) => s + f.dots.filter(d => d.found && d.category).length, 0);

  // Collect all found unique weed IDs with their categories
  const monocotBasket = useMemo(() => {
    const ids = new Set<string>();
    fields.forEach(f => f.dots.filter(d => d.found && d.category === 'monocot').forEach(d => ids.add(d.weedId)));
    return [...ids];
  }, [fields]);
  
  const dicotBasket = useMemo(() => {
    const ids = new Set<string>();
    fields.forEach(f => f.dots.filter(d => d.found && d.category === 'dicot').forEach(d => ids.add(d.weedId)));
    return [...ids];
  }, [fields]);

  // ── Grade + avatar ──────────────────────────────────────
  const handleGradeSelect = useCallback((g: GradeLevel) => {
    setGrade(g);
    const count = getFieldCount(g);
    const selectedFields = pickRandom(fieldEnvironments, count);
    
    // Pick a random sample of WEEDS_PER_GAME weeds total, distributed across fields
    const weedSample = pickRandom(weeds, WEEDS_PER_GAME);
    const perField = Math.ceil(weedSample.length / count);
    
    const fieldStates: FieldState[] = selectedFields.map((env, i) => {
      const start = i * perField;
      const fieldWeeds = weedSample.slice(start, Math.min(start + perField, weedSample.length));
      const cropId = env.suggestedCrops.length ? env.suggestedCrops[0] : undefined;
      return {
        fieldId: env.id,
        dots: generateDots(fieldWeeds, env.id),
        cropId,
      };
    });
    
    setFields(fieldStates);
  }, []);

  // ── Scouting: click dot → popup ────────────────────────
  const handleDotClick = useCallback((dot: WeedDot) => {
    if (dot.found) return;
    setSelectedDot(dot);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, []);

  const getIdOptions = useCallback((weed: Weed): { options: string[]; correct: string; prompt: string } => {
    if (!grade) return { options: [], correct: '', prompt: '' };
    switch (grade) {
      case 'elementary':
        return {
          prompt: 'Is this a Monocot or Dicot?',
          options: ['🌾 Monocot', '🍀 Dicot'],
          correct: weed.plantType === 'Monocot' ? '🌾 Monocot' : '🍀 Dicot',
        };
      case 'middle': {
        const others = weeds.filter(w => w.id !== weed.id);
        return {
          prompt: 'Identify this weed:',
          options: shuffle([weed.commonName, ...pickRandom(others, 3).map(w => w.commonName)]),
          correct: weed.commonName,
        };
      }
      case 'high': {
        const others = weeds.filter(w => w.id !== weed.id);
        return {
          prompt: 'Scientific name:',
          options: shuffle([weed.scientificName, ...pickRandom(others, 3).map(w => w.scientificName)]),
          correct: weed.scientificName,
        };
      }
    }
  }, [grade]);

  const handleIdentifyDot = useCallback(() => {
    if (!selectedDot || !selectedAnswer || !grade) return;
    const weed = weedMap[selectedDot.weedId];
    if (!weed) return;
    
    const opts = getIdOptions(weed);
    const correct = selectedAnswer === opts.correct;
    setShowFeedback(true);

    // Determine category
    const category: 'monocot' | 'dicot' = weed.plantType === 'Monocot' ? 'monocot' : 'dicot';

    // Update the dot
    setFields(prev => prev.map(f => ({
      ...f,
      dots: f.dots.map(d =>
        d.id === selectedDot.id
          ? { ...d, found: true, category: correct ? category : undefined }
          : d
      ),
    })));

    if (correct) {
      setMoney(m => m + 50);
      toast.success(`+$50 — Sorted into ${getCategoryLabel(category, grade)}!`);
    } else {
      toast.error(`Incorrect — that was ${getWeedLabel(weed, grade)}`);
    }
  }, [selectedDot, selectedAnswer, grade, getIdOptions]);

  const closeDotPopup = useCallback(() => {
    setSelectedDot(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, []);

  // ── Move to next field or next scout phase ──────────────
  const handleFinishField = useCallback(() => {
    if (activeFieldIdx < fields.length - 1) {
      setActiveFieldIdx(i => i + 1);
      setSelectedDot(null);
    } else if (scoutPhaseIdx < scoutPhases.length - 1) {
      setScoutPhaseIdx(i => i + 1);
      setActiveFieldIdx(0);
      setSelectedDot(null);
      // Reset found status for next scouting phase (weeds regrow / new stage)
      setFields(prev => prev.map(f => ({
        ...f,
        dots: f.dots.map(d => ({ ...d, found: false, category: undefined })),
      })));
      toast('🔄 Season advancing...', { description: scoutPhases[scoutPhaseIdx + 1]?.name });
    } else {
      finishScouting();
    }
  }, [activeFieldIdx, fields.length, scoutPhaseIdx, scoutPhases]);

  const finishScouting = useCallback(() => {
    // Build categorization groups from found weeds
    const allFoundIds = new Set<string>();
    fields.forEach(f => f.dots.filter(d => d.found && d.category).forEach(d => allFoundIds.add(d.weedId)));
    const uniqueIds = [...allFoundIds];

    const monocots = uniqueIds.filter(id => weedMap[id]?.plantType === 'Monocot');
    const dicots = uniqueIds.filter(id => weedMap[id]?.plantType === 'Dicot');
    const perennials = uniqueIds.filter(id => weedMap[id]?.lifeCycle?.toLowerCase().includes('perennial'));
    const annuals = uniqueIds.filter(id => !weedMap[id]?.lifeCycle?.toLowerCase().includes('perennial'));
    const invasives = uniqueIds.filter(id => weedMap[id]?.origin === 'Introduced' && weedMap[id]?.actImmediately);

    const groupList = [
      { label: '🌾 Monocots (Grasses)', weedIds: monocots },
      { label: '🍀 Dicots (Broadleaves)', weedIds: dicots },
      { label: '🔄 Perennials', weedIds: perennials },
      { label: '📅 Annuals / Biennials', weedIds: annuals },
      { label: '⚠️ Priority Invasives', weedIds: invasives },
    ].filter(g => g.weedIds.length > 0);

    setGroups(groupList);

    // Build invasive reports
    const reports: InvasiveReport[] = invasives.map(wId => {
      const dotCount = fields.reduce((s, f) => s + f.dots.filter(d => d.weedId === wId && d.found).length, 0);
      const fieldId = fields.find(f => f.dots.some(d => d.weedId === wId && d.found))?.fieldId || '';
      return { weedId: wId, fieldId, count: dotCount, density: '', notes: '', submitted: false };
    });
    setInvasiveReports(reports);

    setPhase('categorize-review');
    toast.success('Scouting complete! Review your findings.');
  }, [fields]);

  // ── Management ──────────────────────────────────────────
  const startManagement = useCallback(() => {
    setCurrentMgmtGroup(0);
    setSelectedMethod('');
    setSelectedTiming('');
    setPhase('management');
  }, []);

  const submitManagement = useCallback(() => {
    if (!selectedMethod || !selectedTiming) return;
    const group = groups[currentMgmtGroup];
    if (!group) return;

    const effective = isMethodEffective(selectedMethod, group.label, group.weedIds);

    setManagementActions(prev => [...prev, {
      groupLabel: group.label,
      method: selectedMethod,
      timing: selectedTiming,
      effective,
    }]);

    if (effective) {
      setMoney(m => m + 300);
      toast.success('+$300 — Effective management strategy!');
    } else {
      setMoney(m => m - 200);
      toast.error('-$200 — That method is not effective for this group!');
    }

    setSelectedMethod('');
    setSelectedTiming('');

    if (currentMgmtGroup < groups.length - 1) {
      setCurrentMgmtGroup(i => i + 1);
    } else {
      calculateResults();
    }
  }, [selectedMethod, selectedTiming, groups, currentMgmtGroup]);

  const calculateResults = useCallback(() => {
    const effectiveCount = managementActions.filter(a => a.effective).length + (selectedMethod ? 1 : 0);
    const totalGroups = Math.max(groups.length, 1);
    const mgmtRate = effectiveCount / totalGroups;

    const results = fields.map(f => {
      const crop = f.cropId ? cropMap[f.cropId] : null;
      const baseYield = crop?.baseYieldValue || 0;
      const foundRate = f.dots.length > 0 ? f.dots.filter(d => d.found && d.category).length / f.dots.length : 0;
      const penalty = Math.round(baseYield * (1 - (foundRate * 0.5 + mgmtRate * 0.5)));
      const adjusted = Math.max(0, baseYield - penalty);
      return { fieldId: f.fieldId, crop: crop?.name || 'No crop (conservation)', baseYield, adjustedYield: adjusted, weedPenalty: penalty };
    });
    setYieldResults(results);
    setPhase('results');
  }, [fields, managementActions, groups, selectedMethod]);

  // ── Year progression ────────────────────────────────────
  const handleNextYear = useCallback(() => {
    if (!grade) return;
    const totalYield = yieldResults.reduce((s, r) => s + r.adjustedYield, 0);
    setMoney(m => m + totalYield - TOTAL_EXPENSES);
    setYear(y => y + 1);

    // Re-generate with new random sample
    const weedSample = pickRandom(weeds, WEEDS_PER_GAME);
    const perField = Math.ceil(weedSample.length / fields.length);
    setFields(prev => prev.map((f, i) => {
      const start = i * perField;
      const fieldWeeds = weedSample.slice(start, Math.min(start + perField, weedSample.length));
      return { ...f, dots: generateDots(fieldWeeds, f.fieldId) };
    }));

    setPhase('overview');
    setGroups([]);
    setManagementActions([]);
    setInvasiveReports([]);
    setScoutPhaseIdx(0);
    setActiveFieldIdx(0);
    setSelectedDot(null);
    setYieldResults([]);
    toast('🗓️ New Year!', { description: `Year ${year + 1} — new weeds are emerging` });
  }, [grade, year, yieldResults, fields]);

  // ═══════════════════════════════════════════════════════════
  // AVATAR SELECT
  // ═══════════════════════════════════════════════════════════
  if (phase === 'avatar') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-2xl mx-auto">
          <button onClick={onClose} className="absolute top-4 left-4 text-muted-foreground hover:text-foreground text-sm">← Back</button>
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-extrabold text-primary mb-2">🌾 Farm Manager</h1>
            <p className="text-muted-foreground">Scout fields, identify weeds, manage your farm, and turn a profit!</p>
          </div>

          {!grade ? (
            <div className="w-full space-y-4">
              <h2 className="font-display font-bold text-lg text-foreground text-center">Select Your Grade Level</h2>
              <div className="grid gap-3">
                {(['elementary', 'middle', 'high'] as GradeLevel[]).map(g => (
                  <button key={g} onClick={() => handleGradeSelect(g)}
                    className="bg-card border-2 border-border rounded-lg p-5 text-left hover:border-primary hover:scale-[1.01] transition-all flex items-center gap-4">
                    <span className="text-3xl">{g === 'elementary' ? '🌱' : g === 'middle' ? '🔬' : '🧪'}</span>
                    <div>
                      <div className="font-display font-bold text-foreground">{GRADE_NAMES[g]}</div>
                      <div className="text-sm text-muted-foreground">Grades {GRADE_RANGES[g]} • {getFieldCount(g)} fields • {getScoutingPhases(g).length} scouting {getScoutingPhases(g).length === 1 ? 'phase' : 'phases'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <h2 className="font-display font-bold text-lg text-foreground text-center">Choose Your Farmer</h2>
              <div className="grid grid-cols-2 gap-4">
                {AVATARS.map(av => (
                  <button key={av.id} onClick={() => { setAvatar(av); setPhase('overview'); }}
                    className={`bg-card border-2 rounded-xl p-6 text-center transition-all hover:scale-[1.02] ${
                      avatar?.id === av.id ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                    }`}>
                    <div className="text-5xl mb-3">{av.portrait}</div>
                    <div className="font-display font-bold text-foreground">{av.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{av.emoji} Farmer</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!grade) return null;

  // ═══════════════════════════════════════════════════════════
  // FARM OVERVIEW
  // ═══════════════════════════════════════════════════════════
  if (phase === 'overview') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">← Exit</button>
              <div className="w-px h-6 bg-border" />
              <span className="text-2xl">{avatar?.portrait}</span>
              <div>
                <div className="font-display font-bold text-foreground">{avatar?.label}'s Farm</div>
                <div className="text-xs text-muted-foreground">Year {year} • {GRADE_NAMES[grade]}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-accent/15 border border-accent/30 rounded-lg px-4 py-2 text-center">
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className={`font-display font-bold ${money >= TOTAL_EXPENSES ? 'text-accent' : 'text-destructive'}`}>
                  ${money.toLocaleString()}
                </div>
              </div>
              <div className="bg-muted rounded-lg px-4 py-2 text-center">
                <div className="text-xs text-muted-foreground">Expenses</div>
                <div className="font-display font-bold text-destructive">${TOTAL_EXPENSES.toLocaleString()}/yr</div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-foreground">
              <span className="font-bold text-primary">🎯 Goal:</span> Scout your fields to find and identify weeds, sort them, apply management, and earn enough to cover ${TOTAL_EXPENSES.toLocaleString()} in annual expenses.
            </p>
          </div>

          {/* Farm Map */}
          <h2 className="font-display font-bold text-lg text-foreground mb-4">🗺️ Your Farm</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {fields.map(f => {
              const env = fieldMap[f.fieldId];
              const crop = f.cropId ? cropMap[f.cropId] : null;
              return (
                <div key={f.fieldId} className={`border-2 rounded-xl p-5 transition-all ${env?.color || 'bg-card border-border'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-2xl">{env?.emoji}</div>
                      <h3 className="font-display font-bold text-foreground mt-1">{env?.name}</h3>
                    </div>
                    {crop && <span className="text-2xl">{crop.emoji}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{env?.description}</p>
                  {crop && (
                    <div className="text-xs text-foreground font-medium">{crop.name.split('(')[0].trim()}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Crop-Weed Info */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">📋 Crop–Weed Relationships</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {[...new Set(fields.map(f => f.cropId).filter(Boolean))].map(cId => {
                const c = cropMap[cId!];
                return c ? (
                  <div key={c.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{c.emoji}</span>
                      <span className="font-semibold text-foreground text-sm">{c.name.split('(')[0].trim()}</span>
                      <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">{c.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.vulnerableTo.map(v => (
                        <span key={v} className="text-[10px] px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                          Vulnerable to {v}s
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <button
            onClick={() => { setActiveFieldIdx(0); setScoutPhaseIdx(0); setPhase('scouting'); }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 transition-opacity">
            🔍 Begin Scouting — {scoutPhases[0]?.name}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SCOUTING — Interactive Field Map with Dots
  // ═══════════════════════════════════════════════════════════
  if (phase === 'scouting' && activeField) {
    const env = fieldMap[activeField.fieldId];
    const foundInField = activeField.dots.filter(d => d.found).length;
    const totalInField = activeField.dots.length;
    const currentWeed = selectedDot ? weedMap[selectedDot.weedId] : null;
    const idOptions = currentWeed ? getIdOptions(currentWeed) : null;

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted">← Exit</button>
            <div className="w-px h-5 bg-border" />
            <span className="text-lg">{avatar?.portrait}</span>
            <div>
              <div className="font-display font-bold text-foreground text-sm">{env?.emoji} {env?.name}</div>
              <div className="text-xs text-muted-foreground">{currentScoutPhase?.name} • Year {year}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-accent">${money.toLocaleString()}</span>
            <span className="text-xs bg-muted px-2 py-1 rounded">{foundInField} found</span>
          </div>
        </div>

        {/* Main content: field map + baskets side by side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Field Map */}
          <div className="flex-1 relative bg-gradient-to-b from-emerald-900/20 to-emerald-800/10 overflow-hidden">
            {/* Field grid lines for visual effect */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={`h-${i}`} className="absolute w-full border-b border-foreground/20" style={{ top: `${(i + 1) * 10}%` }} />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={`v-${i}`} className="absolute h-full border-r border-foreground/20" style={{ left: `${(i + 1) * 10}%` }} />
              ))}
            </div>

            {/* Crop rows visual */}
            <div className="absolute inset-4 opacity-20">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-[8%] flex items-center justify-center text-2xl tracking-[1em] opacity-30">
                  {activeField.cropId ? (cropMap[activeField.cropId]?.emoji || '🌿') : '🌿'}
                </div>
              ))}
            </div>

            {/* Weed dots */}
            {activeField.dots.map(dot => {
              const weed = weedMap[dot.weedId];
              const isMonocot = weed?.plantType === 'Monocot';
              return (
                <button
                  key={dot.id}
                  onClick={() => handleDotClick(dot)}
                  disabled={dot.found}
                  className={`absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                    dot.found
                      ? dot.category
                        ? 'bg-accent/60 scale-75 cursor-default ring-2 ring-accent/30'
                        : 'bg-destructive/60 scale-75 cursor-default ring-2 ring-destructive/30'
                      : `${isMonocot ? 'bg-primary/40 hover:bg-primary/80' : 'bg-amber-600/40 hover:bg-amber-600/80'} cursor-pointer hover:scale-150 animate-pulse hover:animate-none shadow-lg`
                  }`}
                  style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
                  title={dot.found ? 'Already scouted' : 'Click to scout'}
                />
              );
            })}

            {/* Field navigation */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
                Click colored dots to scout weeds in this field
              </div>
              <button
                onClick={handleFinishField}
                className="bg-primary/90 backdrop-blur text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
                {activeFieldIdx < fields.length - 1 ? 'Next Field →' : scoutPhaseIdx < scoutPhases.length - 1 ? 'Next Season →' : 'Finish Scouting →'}
              </button>
            </div>

            {/* Field selector tabs */}
            <div className="absolute top-3 left-3 flex gap-1">
              {fields.map((f, i) => {
                const fEnv = fieldMap[f.fieldId];
                return (
                  <button key={f.fieldId}
                    onClick={() => { setActiveFieldIdx(i); setSelectedDot(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      i === activeFieldIdx ? 'bg-primary text-primary-foreground' : 'bg-card/80 backdrop-blur text-foreground hover:bg-card'
                    }`}>
                    {fEnv?.emoji} {fEnv?.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side panel: Baskets */}
          <div className="w-64 border-l border-border bg-card flex flex-col shrink-0">
            <div className="p-3 border-b border-border">
              <h3 className="font-display font-bold text-sm text-foreground">🧺 Collection</h3>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {/* Monocot basket */}
                <div className="border border-primary/30 rounded-lg p-2 bg-primary/5">
                  <div className="text-xs font-bold text-primary mb-2">{getCategoryLabel('monocot', grade)}</div>
                  <div className="flex flex-wrap gap-1">
                    {monocotBasket.length === 0 && (
                      <span className="text-[10px] text-muted-foreground italic">Empty</span>
                    )}
                    {monocotBasket.map(wId => (
                      <div key={wId} className="w-9 h-9 rounded-md overflow-hidden bg-muted border border-primary/20" title={weedMap[wId]?.commonName}>
                        <WeedImage weedId={wId} stage={currentScoutPhase?.imageStage || 'whole'} className="w-full h-full" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{monocotBasket.length} species</div>
                </div>

                {/* Dicot basket */}
                <div className="border border-amber-600/30 rounded-lg p-2 bg-amber-600/5">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">{getCategoryLabel('dicot', grade)}</div>
                  <div className="flex flex-wrap gap-1">
                    {dicotBasket.length === 0 && (
                      <span className="text-[10px] text-muted-foreground italic">Empty</span>
                    )}
                    {dicotBasket.map(wId => (
                      <div key={wId} className="w-9 h-9 rounded-md overflow-hidden bg-muted border border-amber-600/20" title={weedMap[wId]?.commonName}>
                        <WeedImage weedId={wId} stage={currentScoutPhase?.imageStage || 'whole'} className="w-full h-full" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{dicotBasket.length} species</div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Identification popup overlay */}
        {selectedDot && currentWeed && idOptions && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget && !showFeedback) closeDotPopup(); }}>
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
              <div className="h-48 bg-muted overflow-hidden">
                <WeedImage weedId={currentWeed.id} stage={currentScoutPhase?.imageStage || 'whole'} className="w-full h-full" />
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">🔍 Identify this weed</div>
                <ul className="space-y-1 mb-3">
                  {currentWeed.traits.slice(0, 3).map((t, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-accent">•</span>{t}
                    </li>
                  ))}
                </ul>

                <p className="font-display font-semibold text-foreground text-sm mb-3">{idOptions.prompt}</p>

                {!showFeedback ? (
                  <div className="space-y-2">
                    <div className="grid gap-2 grid-cols-1">
                      {idOptions.options.map((opt, i) => (
                        <button key={i} onClick={() => setSelectedAnswer(opt)}
                          className={`px-3 py-2.5 rounded-lg border text-left text-sm transition-all ${
                            selectedAnswer === opt
                              ? 'border-primary bg-primary/15 ring-2 ring-primary/30'
                              : 'border-border bg-secondary/50 hover:bg-secondary'
                          }`}>
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mr-2 ${
                            selectedAnswer === opt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>{String.fromCharCode(65 + i)}</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                    {selectedAnswer && (
                      <button onClick={handleIdentifyDot}
                        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90">
                        Confirm ✓
                      </button>
                    )}
                    <button onClick={closeDotPopup} className="w-full py-2 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  </div>
                ) : (
                  <div className={`rounded-lg p-3 ${
                    selectedAnswer === idOptions.correct ? 'bg-accent/15 border border-accent/50' : 'bg-destructive/15 border border-destructive/50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{selectedAnswer === idOptions.correct ? '✅' : '❌'}</span>
                      <span className="font-display font-bold text-sm">{selectedAnswer === idOptions.correct ? 'Correct!' : 'Incorrect'}</span>
                    </div>
                    <p className="text-xs text-foreground mb-1">
                      <span className="font-bold text-primary">{currentWeed.commonName}</span>{' '}
                      <span className="text-muted-foreground italic">({currentWeed.scientificName})</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{currentWeed.plantType} • {currentWeed.family} • {currentWeed.lifeCycle}</p>

                    {currentWeed.lookAlike && (
                      <div className="bg-muted/50 rounded p-2 text-[10px] mt-2">
                        <span className="font-semibold">👀 Look-alike:</span> {currentWeed.lookAlike.species} — {currentWeed.lookAlike.difference}
                      </div>
                    )}

                    <button onClick={closeDotPopup}
                      className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 mt-2">
                      Back to Field
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // CATEGORIZE REVIEW
  // ═══════════════════════════════════════════════════════════
  if (phase === 'categorize-review') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-2xl text-foreground">📊 Scouting Summary</h1>
            <span className="text-sm font-bold text-accent">${money.toLocaleString()}</span>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-extrabold text-accent">{correctDots}</div>
              <div className="text-xs text-muted-foreground">Correctly ID'd</div>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-extrabold text-primary">{monocotBasket.length}</div>
              <div className="text-xs text-muted-foreground">{getCategoryLabel('monocot', grade)}</div>
            </div>
            <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-extrabold text-amber-700 dark:text-amber-400">{dicotBasket.length}</div>
              <div className="text-xs text-muted-foreground">{getCategoryLabel('dicot', grade)}</div>
            </div>
          </div>

          {/* Category groups */}
          <div className="space-y-4 mb-6">
            {groups.map((g, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-display font-bold text-sm text-foreground mb-2">{g.label}</h3>
                <div className="flex flex-wrap gap-2">
                  {g.weedIds.map(wId => {
                    const w = weedMap[wId];
                    return (
                      <div key={wId} className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
                        <div className="w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                          <WeedImage weedId={wId} stage="whole" className="w-full h-full" />
                        </div>
                        <div className="text-xs">
                          <div className="font-semibold text-foreground">{w?.commonName}</div>
                          <div className="text-[10px] text-muted-foreground">{w?.family}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {g.label.includes('Monocot') && 'Parallel leaf veins, fibrous roots. Target with grass-specific herbicides.'}
                  {g.label.includes('Dicot') && 'Branching veins, taproots. Target with broadleaf herbicides.'}
                  {g.label.includes('Perennial') && 'Regrow from roots yearly. Require systemic herbicides.'}
                  {g.label.includes('Annual') && 'Complete life cycle in one season. Pre-emergent herbicides are key.'}
                  {g.label.includes('Invasive') && 'Must be reported and controlled immediately!'}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (invasiveReports.length > 0) {
                setPhase('invasive-report');
              } else {
                startManagement();
              }
            }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90">
            {invasiveReports.length > 0 ? '🚨 File Invasive Reports →' : '🛠️ Plan Management →'}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // INVASIVE REPORT — Detailed Form
  // ═══════════════════════════════════════════════════════════
  if (phase === 'invasive-report') {
    const allSubmitted = invasiveReports.every(r => r.submitted);

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">🚨 Invasive Species Report</h1>
          <p className="text-sm text-muted-foreground mb-6">Complete a field report for each invasive species found. This information helps local authorities manage invasive threats.</p>

          <div className="space-y-6">
            {invasiveReports.map((report, idx) => {
              const w = weedMap[report.weedId];
              const fEnv = fieldMap[report.fieldId];

              return (
                <div key={report.weedId} className={`border-2 rounded-xl p-5 transition-all ${report.submitted ? 'border-accent/50 bg-accent/5' : 'border-destructive/30 bg-card'}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <WeedImage weedId={report.weedId} stage="whole" className="w-full h-full" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-foreground">{w?.commonName}</div>
                      <div className="text-xs text-muted-foreground italic">{w?.scientificName}</div>
                      <div className="text-xs text-destructive mt-1">⚠️ {w?.actReason}</div>
                    </div>
                  </div>

                  {!report.submitted ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Field Location</label>
                        <div className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">{fEnv?.emoji} {fEnv?.name}</div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Plants Found</label>
                        <div className="text-sm text-foreground bg-muted rounded-lg px-3 py-2">{report.count} individual(s)</div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Distribution Pattern</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Scattered', 'Clustered', 'Dense patch'].map(d => (
                            <button key={d}
                              onClick={() => setInvasiveReports(prev => prev.map((r, i) => i === idx ? { ...r, density: d } : r))}
                              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                                report.density === d ? 'border-primary bg-primary/15' : 'border-border hover:bg-secondary'
                              }`}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-foreground block mb-1">Additional Notes</label>
                        <textarea
                          value={report.notes}
                          onChange={(e) => setInvasiveReports(prev => prev.map((r, i) => i === idx ? { ...r, notes: e.target.value } : r))}
                          className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm resize-none"
                          rows={2}
                          placeholder="Proximity to waterways, neighboring fields, growth stage..."
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!report.density) { toast.error('Select a distribution pattern'); return; }
                          setInvasiveReports(prev => prev.map((r, i) => i === idx ? { ...r, submitted: true } : r));
                          setMoney(m => m + 200);
                          toast.success(`+$200 — Report filed for ${w?.commonName}!`);
                        }}
                        className="w-full py-2.5 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90">
                        📋 Submit Report
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-accent font-bold text-sm">✅ Report Filed</span>
                      <p className="text-xs text-muted-foreground mt-1">{report.density} distribution • {report.count} plants</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={startManagement}
            disabled={!allSubmitted}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
            {allSubmitted ? '🛠️ Plan Management →' : `Report all ${invasiveReports.length} species first`}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // MANAGEMENT PLANNING
  // ═══════════════════════════════════════════════════════════
  if (phase === 'management') {
    const group = groups[currentMgmtGroup];
    const isGrassGroup = group?.label.includes('Monocot') || group?.label.includes('Grass');
    const isBroadleafGroup = group?.label.includes('Dicot') || group?.label.includes('Broadlea');

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">🛠️ Management Plan</h1>
              <p className="text-xs text-muted-foreground">Choose the right method for each weed group</p>
            </div>
            <div className="text-sm text-muted-foreground">Group {currentMgmtGroup + 1}/{groups.length}</div>
          </div>

          <div className="flex gap-1 mb-6">
            {groups.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i <= currentMgmtGroup ? 'bg-accent' : 'bg-muted'}`} />
            ))}
          </div>

          {group && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <h2 className="font-display font-bold text-lg text-foreground mb-2">{group.label}</h2>
                <div className="flex flex-wrap gap-1 mb-3">
                  {group.weedIds.map(wId => (
                    <span key={wId} className="px-2 py-1 text-xs bg-muted text-foreground rounded-full">{weedMap[wId]?.commonName}</span>
                  ))}
                </div>

                {/* Hint about what works */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                  💡 <span className="font-semibold text-foreground">Tip:</span>{' '}
                  {isGrassGroup && 'Grass weeds require grass-specific herbicides. Broadleaf herbicides will NOT work on these species.'}
                  {isBroadleafGroup && 'Broadleaf weeds are controlled with broadleaf herbicides. Grass herbicides will NOT be effective.'}
                  {!isGrassGroup && !isBroadleafGroup && 'Consider the life cycle and growth habit when choosing your approach.'}
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm text-foreground mb-2">Choose Management Method</h3>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {MANAGEMENT_METHODS.map(m => (
                    <button key={m} onClick={() => setSelectedMethod(m)}
                      className={`px-4 py-3 rounded-lg border text-left text-sm transition-all ${
                        selectedMethod === m ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                      }`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm text-foreground mb-2">Choose Application Timing</h3>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {MANAGEMENT_TIMING.map(t => (
                    <button key={t} onClick={() => setSelectedTiming(t)}
                      className={`px-4 py-3 rounded-lg border text-left text-sm transition-all ${
                        selectedTiming === t ? 'border-accent bg-accent/15 ring-2 ring-accent/30' : 'border-border bg-card hover:bg-secondary'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effectiveness preview */}
              {selectedMethod && (
                <div className={`rounded-lg p-3 text-sm ${
                  isMethodEffective(selectedMethod, group.label, group.weedIds)
                    ? 'bg-accent/10 border border-accent/30 text-accent'
                    : 'bg-destructive/10 border border-destructive/30 text-destructive'
                }`}>
                  {isMethodEffective(selectedMethod, group.label, group.weedIds)
                    ? '✅ This method should be effective for this weed group.'
                    : '⚠️ This method may not be effective for this weed group. Consider your choice carefully.'}
                </div>
              )}

              <button
                onClick={submitManagement}
                disabled={!selectedMethod || !selectedTiming}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                Apply Management ✓
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════════════
  if (phase === 'results') {
    const totalYield = yieldResults.reduce((s, r) => s + r.adjustedYield, 0);
    const netIncome = totalYield - TOTAL_EXPENSES;
    const profitable = netIncome >= 0;

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">{profitable ? '🎉' : '😓'}</div>
            <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">Year {year} Results</h1>
            <p className="text-muted-foreground">
              {profitable ? `Great work, ${avatar?.label}! Your farm turned a profit!` : `Tough year, ${avatar?.label}. You need to cover $${TOTAL_EXPENSES.toLocaleString()} in expenses.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground">Revenue</div>
              <div className="font-display font-bold text-xl text-accent">${totalYield.toLocaleString()}</div>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground">Expenses</div>
              <div className="font-display font-bold text-xl text-destructive">-${TOTAL_EXPENSES.toLocaleString()}</div>
            </div>
            <div className={`border rounded-lg p-4 text-center ${profitable ? 'bg-accent/15 border-accent/40' : 'bg-destructive/15 border-destructive/40'}`}>
              <div className="text-xs text-muted-foreground">{profitable ? 'Profit' : 'Loss'}</div>
              <div className={`font-display font-bold text-xl ${profitable ? 'text-accent' : 'text-destructive'}`}>
                {profitable ? '+' : '-'}${Math.abs(netIncome).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {yieldResults.map(r => {
              const env = fieldMap[r.fieldId];
              const yieldPct = r.baseYield > 0 ? Math.round((r.adjustedYield / r.baseYield) * 100) : 0;
              return (
                <div key={r.fieldId} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-foreground">{env?.emoji} {env?.name}</span>
                    <span className="text-sm font-bold text-foreground">${r.adjustedYield.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{r.crop}</div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${yieldPct > 70 ? 'bg-accent' : yieldPct > 40 ? 'bg-primary' : 'bg-destructive'}`}
                      style={{ width: `${yieldPct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-muted-foreground">{yieldPct}% yield</span>
                    <span className="text-destructive">-${r.weedPenalty.toLocaleString()} weed damage</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">📊 Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-accent">{correctDots}</div>
                <div className="text-xs text-muted-foreground">Correct IDs</div>
              </div>
              <div>
                <div className="text-lg font-bold text-destructive">{totalDotsFound - correctDots}</div>
                <div className="text-xs text-muted-foreground">Missed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{managementActions.filter(a => a.effective).length}</div>
                <div className="text-xs text-muted-foreground">Effective Mgmt</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{invasiveReports.filter(r => r.submitted).length}</div>
                <div className="text-xs text-muted-foreground">Invasives Reported</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleNextYear}
              className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90">
              🗓️ Year {year + 1}
            </button>
            <button onClick={onClose}
              className="px-6 py-4 rounded-xl border-2 border-border text-foreground font-display font-bold hover:bg-secondary">
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Loading...</p>
        <button onClick={onClose} className="mt-4 text-primary underline">Go Back</button>
      </div>
    </div>
  );
}
