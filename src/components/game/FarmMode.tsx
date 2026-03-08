import { useState, useCallback, useMemo } from 'react';
import { weeds, weedMap } from '@/data/weeds';
import { crops, cropMap } from '@/data/crops';
import { fieldEnvironments, getFieldCount, getScoutingPhases, fieldMap } from '@/data/fields';
import type { GradeLevel, Weed } from '@/types/game';
import { GRADE_NAMES, GRADE_RANGES } from '@/data/phases';
import WeedImage from './WeedImage';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────
interface FoundWeed {
  weedId: string;
  fieldId: string;
  scoutPhase: string;
  identified: boolean;
  answer?: string;
  correct?: boolean;
}

interface WeedGroup {
  label: string;
  weedIds: string[];
}

interface ManagementAction {
  groupLabel: string;
  method: string;
  timing: string;
}

type FarmPhase = 'avatar' | 'overview' | 'scouting' | 'basket' | 'categorize' | 'invasive-report' | 'management' | 'results';

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

// ── Financial constants ────────────────────────────────────
const FARM_EXPENSES = 12000;
const FAMILY_EXPENSES = 8000;
const TOTAL_EXPENSES = FARM_EXPENSES + FAMILY_EXPENSES;

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

function getWeedsForField(fieldId: string, count: number): Weed[] {
  const env = fieldMap[fieldId];
  if (!env) return pickRandom(weeds, count);
  // Prefer weeds whose habitat matches field tags
  const matching = weeds.filter(w =>
    env.habitatTags.some(tag =>
      w.primaryHabitat.toLowerCase().includes(tag.toLowerCase()) ||
      w.habitat.toLowerCase().includes(tag.toLowerCase())
    )
  );
  if (matching.length >= count) return pickRandom(matching, count);
  // Fill remainder from all weeds
  const rest = weeds.filter(w => !matching.includes(w));
  return shuffle([...matching, ...pickRandom(rest, count - matching.length)]).slice(0, count);
}

function getIdentificationOptions(weed: Weed, grade: GradeLevel): { options: string[]; correct: string; prompt: string } {
  switch (grade) {
    case 'elementary':
      return {
        prompt: 'Is this a Monocot or Dicot?',
        options: shuffle(['🌾 Monocot', '🍀 Dicot']),
        correct: weed.plantType === 'Monocot' ? '🌾 Monocot' : '🍀 Dicot',
      };
    case 'middle': {
      const others = weeds.filter(w => w.id !== weed.id);
      const opts = shuffle([weed.commonName, ...pickRandom(others, 3).map(w => w.commonName)]);
      return { prompt: 'What is this weed?', options: opts, correct: weed.commonName };
    }
    case 'high': {
      const others = weeds.filter(w => w.id !== weed.id);
      const opts = shuffle([weed.scientificName, ...pickRandom(others, 3).map(w => w.scientificName)]);
      return { prompt: 'What is the scientific name?', options: opts, correct: weed.scientificName };
    }
  }
}

const MANAGEMENT_METHODS = [
  'Pre-emergent Herbicide (Group 15)',
  'Post-emergent Broadleaf Herbicide',
  'Post-emergent Grass Herbicide',
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
interface Props {
  onClose: () => void;
}

export default function FarmMode({ onClose }: Props) {
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [phase, setPhase] = useState<FarmPhase>('avatar');
  const [year, setYear] = useState(1);
  const [money, setMoney] = useState(25000);

  // Field management
  const [activeFields, setActiveFields] = useState<string[]>([]);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [fieldCrops, setFieldCrops] = useState<Record<string, string>>({});

  // Scouting
  const [currentScoutPhaseIdx, setCurrentScoutPhaseIdx] = useState(0);
  const [scoutingWeedIdx, setScoutingWeedIdx] = useState(0);
  const [fieldWeeds, setFieldWeeds] = useState<Record<string, Weed[]>>({});
  const [foundWeeds, setFoundWeeds] = useState<FoundWeed[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showIdFeedback, setShowIdFeedback] = useState(false);

  // Categorization
  const [groups, setGroups] = useState<WeedGroup[]>([]);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [dragWeed, setDragWeed] = useState<string | null>(null);

  // Invasive report
  const [reportedInvasives, setReportedInvasives] = useState<string[]>([]);

  // Management
  const [managementActions, setManagementActions] = useState<ManagementAction[]>([]);
  const [currentMgmtGroup, setCurrentMgmtGroup] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedTiming, setSelectedTiming] = useState('');

  // Results
  const [yieldResults, setYieldResults] = useState<{ fieldId: string; crop: string; baseYield: number; adjustedYield: number; weedPenalty: number }[]>([]);

  // ── Grade selection + avatar ─────────────────────────────
  const handleGradeSelect = useCallback((g: GradeLevel) => {
    setGrade(g);
    const count = getFieldCount(g);
    const fields = pickRandom(fieldEnvironments, count).map(f => f.id);
    setActiveFields(fields);
    // Auto-assign crops to fields that have suggestions
    const cropAssign: Record<string, string> = {};
    fields.forEach(fId => {
      const env = fieldMap[fId];
      if (env?.suggestedCrops.length) {
        cropAssign[fId] = env.suggestedCrops[0];
      }
    });
    setFieldCrops(cropAssign);

    // Pre-generate weeds for each field
    const weedsPerField = Math.ceil(weeds.length / count);
    const allWeedIds = new Set<string>();
    const fwMap: Record<string, Weed[]> = {};
    fields.forEach((fId, i) => {
      const remaining = weeds.filter(w => !allWeedIds.has(w.id));
      const isLast = i === fields.length - 1;
      const assigned = isLast ? remaining : pickRandom(remaining, weedsPerField);
      assigned.forEach(w => allWeedIds.add(w.id));
      fwMap[fId] = assigned;
    });
    setFieldWeeds(fwMap);
  }, []);

  const scoutPhases = useMemo(() => grade ? getScoutingPhases(grade) : [], [grade]);

  // ── Scouting logic ──────────────────────────────────────
  const currentFieldWeeds = selectedField ? (fieldWeeds[selectedField] || []) : [];
  const currentWeed = currentFieldWeeds[scoutingWeedIdx];
  const currentScoutPhase = scoutPhases[currentScoutPhaseIdx];

  const idOptions = useMemo(() => {
    if (!currentWeed || !grade) return null;
    return getIdentificationOptions(currentWeed, grade);
  }, [currentWeed, grade]);

  const handleIdentify = useCallback(() => {
    if (!currentWeed || !selectedAnswer || !idOptions || !selectedField || !currentScoutPhase) return;
    const correct = selectedAnswer === idOptions.correct;
    setShowIdFeedback(true);

    const found: FoundWeed = {
      weedId: currentWeed.id,
      fieldId: selectedField,
      scoutPhase: currentScoutPhase.id,
      identified: true,
      answer: selectedAnswer,
      correct,
    };
    setFoundWeeds(prev => [...prev, found]);

    if (correct) {
      setMoney(m => m + 50);
      toast.success(`+$50 — Correctly identified!`);
    } else {
      toast.error(`That was ${grade === 'high' ? currentWeed.scientificName : currentWeed.commonName}`);
    }
  }, [currentWeed, selectedAnswer, idOptions, selectedField, currentScoutPhase, grade]);

  const handleNextWeed = useCallback(() => {
    setSelectedAnswer(null);
    setShowIdFeedback(false);
    if (scoutingWeedIdx < currentFieldWeeds.length - 1) {
      setScoutingWeedIdx(i => i + 1);
    } else {
      // Done with this field's current scout phase
      const nextFieldIdx = activeFields.indexOf(selectedField!) + 1;
      if (nextFieldIdx < activeFields.length) {
        setSelectedField(activeFields[nextFieldIdx]);
        setScoutingWeedIdx(0);
      } else if (currentScoutPhaseIdx < scoutPhases.length - 1) {
        // Next scouting phase
        setCurrentScoutPhaseIdx(i => i + 1);
        setSelectedField(activeFields[0]);
        setScoutingWeedIdx(0);
        toast('🔄 Season advancing...', { description: scoutPhases[currentScoutPhaseIdx + 1]?.name });
      } else {
        // All scouting done → basket
        setPhase('basket');
        toast.success('Scouting complete! Review your findings.');
      }
    }
  }, [scoutingWeedIdx, currentFieldWeeds.length, activeFields, selectedField, currentScoutPhaseIdx, scoutPhases]);

  // ── Categorization logic ────────────────────────────────
  const startCategorization = useCallback(() => {
    const correctWeeds = foundWeeds.filter(fw => fw.correct);
    const uniqueIds = [...new Set(correctWeeds.map(fw => fw.weedId))];

    // Build category groups
    const monocots = uniqueIds.filter(id => weedMap[id]?.plantType === 'Monocot');
    const dicots = uniqueIds.filter(id => weedMap[id]?.plantType === 'Dicot');
    const perennials = uniqueIds.filter(id => weedMap[id]?.lifeCycle?.toLowerCase().includes('perennial'));
    const annuals = uniqueIds.filter(id => !weedMap[id]?.lifeCycle?.toLowerCase().includes('perennial'));
    const invasives = uniqueIds.filter(id => weedMap[id]?.origin === 'Introduced' && weedMap[id]?.actImmediately);
    const families = new Map<string, string[]>();
    uniqueIds.forEach(id => {
      const fam = weedMap[id]?.family || 'Unknown';
      if (!families.has(fam)) families.set(fam, []);
      families.get(fam)!.push(id);
    });

    const groupList: WeedGroup[] = [
      { label: '🌾 Monocots (Grasses)', weedIds: monocots },
      { label: '🍀 Dicots (Broadleaves)', weedIds: dicots },
      { label: '🔄 Perennials', weedIds: perennials },
      { label: '📅 Annuals / Biennials', weedIds: annuals },
      { label: '⚠️ Priority Invasives', weedIds: invasives },
    ];

    // Add top families
    const sortedFams = [...families.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 4);
    sortedFams.forEach(([fam, ids]) => {
      if (ids.length >= 2) groupList.push({ label: `🏷️ ${fam}`, weedIds: ids });
    });

    setGroups(groupList.filter(g => g.weedIds.length > 0));
    setActiveGroupIdx(0);
    setPhase('categorize');
  }, [foundWeeds]);

  // ── Invasive reporting ──────────────────────────────────
  const invasiveWeeds = useMemo(() => {
    const correctIds = [...new Set(foundWeeds.filter(fw => fw.correct).map(fw => fw.weedId))];
    return correctIds.filter(id => weedMap[id]?.origin === 'Introduced' && weedMap[id]?.actImmediately);
  }, [foundWeeds]);

  const handleReportInvasive = useCallback((weedId: string) => {
    setReportedInvasives(prev => [...prev, weedId]);
    setMoney(m => m + 200);
    toast.success(`+$200 — Invasive species reported to authorities!`);
  }, []);

  // ── Management decisions ────────────────────────────────
  const startManagement = useCallback(() => {
    setCurrentMgmtGroup(0);
    setPhase('management');
  }, []);

  const submitManagement = useCallback(() => {
    if (!selectedMethod || !selectedTiming) return;
    const group = groups[currentMgmtGroup];
    if (!group) return;

    setManagementActions(prev => [...prev, {
      groupLabel: group.label,
      method: selectedMethod,
      timing: selectedTiming,
    }]);

    // Score management quality
    const goodMatch = group.weedIds.some(id => {
      const w = weedMap[id];
      return w?.management.toLowerCase().includes(selectedMethod.toLowerCase().split(' ')[0]) ||
        selectedMethod.includes('Integrated');
    });
    if (goodMatch) {
      setMoney(m => m + 300);
      toast.success('+$300 — Effective management strategy!');
    } else {
      setMoney(m => m - 100);
      toast.error('-$100 — Suboptimal strategy, some crop loss.');
    }

    setSelectedMethod('');
    setSelectedTiming('');

    if (currentMgmtGroup < groups.length - 1) {
      setCurrentMgmtGroup(i => i + 1);
    } else {
      // Calculate final results
      calculateResults();
    }
  }, [selectedMethod, selectedTiming, groups, currentMgmtGroup]);

  const calculateResults = useCallback(() => {
    const results = activeFields.map(fId => {
      const cropId = fieldCrops[fId];
      const crop = cropId ? cropMap[cropId] : null;
      const baseYield = crop?.baseYieldValue || 0;
      const fWeeds = fieldWeeds[fId] || [];
      const correctCount = foundWeeds.filter(fw => fw.fieldId === fId && fw.correct).length;
      const identRate = fWeeds.length > 0 ? correctCount / fWeeds.length : 0;
      const mgmtBonus = managementActions.length / Math.max(groups.length, 1);
      const penalty = Math.round(baseYield * (1 - (identRate * 0.6 + mgmtBonus * 0.4)));
      const adjusted = Math.max(0, baseYield - penalty);
      return { fieldId: fId, crop: crop?.name || 'No crop', baseYield, adjustedYield: adjusted, weedPenalty: penalty };
    });
    setYieldResults(results);
    setPhase('results');
  }, [activeFields, fieldCrops, fieldWeeds, foundWeeds, managementActions, groups]);

  // ── Year progression ────────────────────────────────────
  const handleNextYear = useCallback(() => {
    if (!grade) return;
    setYear(y => y + 1);
    const totalYield = yieldResults.reduce((s, r) => s + r.adjustedYield, 0);
    setMoney(m => m + totalYield - TOTAL_EXPENSES);
    setPhase('overview');
    setFoundWeeds([]);
    setGroups([]);
    setManagementActions([]);
    setReportedInvasives([]);
    setCurrentScoutPhaseIdx(0);
    setScoutingWeedIdx(0);
    setSelectedField(null);
    setShowIdFeedback(false);
    setSelectedAnswer(null);
    setYieldResults([]);

    // Re-generate weeds for each field (simulate year change)
    const count = activeFields.length;
    const weedsPerField = Math.ceil(weeds.length / count);
    const allWeedIds = new Set<string>();
    const fwMap: Record<string, Weed[]> = {};
    activeFields.forEach((fId, i) => {
      const remaining = weeds.filter(w => !allWeedIds.has(w.id));
      const isLast = i === activeFields.length - 1;
      const assigned = isLast ? remaining : pickRandom(remaining, weedsPerField);
      assigned.forEach(w => allWeedIds.add(w.id));
      fwMap[fId] = assigned;
    });
    setFieldWeeds(fwMap);
    toast('🗓️ New Year!', { description: `Year ${year + 1} — new weeds are emerging` });
  }, [grade, year, yieldResults, activeFields]);

  // ── Render helpers ──────────────────────────────────────
  const correctCount = foundWeeds.filter(fw => fw.correct).length;
  const totalFound = foundWeeds.length;
  const totalWeedsAllFields = Object.values(fieldWeeds).reduce((s, arr) => s + arr.length, 0);

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
            <p className="text-muted-foreground">Manage your farm, identify weeds, protect your crops, and turn a profit!</p>
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
  // FARM OVERVIEW MAP
  // ═══════════════════════════════════════════════════════════
  if (phase === 'overview') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-4xl mx-auto">
          {/* Header */}
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

          {/* Goal reminder */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-foreground">
              <span className="font-bold text-primary">🎯 Goal:</span> Scout your fields, identify all weeds, categorize threats, apply management, and earn enough to cover ${TOTAL_EXPENSES.toLocaleString()} in expenses.
            </p>
          </div>

          {/* Farm Map Grid */}
          <h2 className="font-display font-bold text-lg text-foreground mb-4">🗺️ Your Farm</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {activeFields.map(fId => {
              const env = fieldMap[fId];
              const crop = fieldCrops[fId] ? cropMap[fieldCrops[fId]] : null;
              const weedCount = fieldWeeds[fId]?.length || 0;
              return (
                <div key={fId} className={`border-2 rounded-xl p-5 transition-all ${env?.color || 'bg-card border-border'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-2xl">{env?.emoji}</div>
                      <h3 className="font-display font-bold text-foreground mt-1">{env?.name}</h3>
                    </div>
                    {crop && <span className="text-2xl">{crop.emoji}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{env?.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{weedCount} weeds to scout</span>
                    {crop && <span className="text-foreground font-medium">{crop.name.split('(')[0].trim()}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Crop legend */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">📋 Crop–Weed Relationships</h3>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              {Object.values(fieldCrops).map(cId => {
                const c = cropMap[cId];
                return c ? (
                  <div key={c.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                    <span className="text-lg">{c.emoji}</span>
                    <div>
                      <div className="font-semibold text-foreground">{c.name.split('(')[0].trim()} ({c.type})</div>
                      <div className="text-muted-foreground">{c.description.slice(0, 80)}...</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          {/* Start Scouting */}
          <button
            onClick={() => { setSelectedField(activeFields[0]); setScoutingWeedIdx(0); setCurrentScoutPhaseIdx(0); setPhase('scouting'); }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 transition-opacity">
            🔍 Begin Scouting — {scoutPhases[0]?.name}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SCOUTING PHASE
  // ═══════════════════════════════════════════════════════════
  if (phase === 'scouting' && currentWeed && idOptions && currentScoutPhase) {
    const fieldEnv = selectedField ? fieldMap[selectedField] : null;
    const progress = ((activeFields.indexOf(selectedField!) * currentFieldWeeds.length + scoutingWeedIdx) /
      (activeFields.length * Math.max(currentFieldWeeds.length, 1))) * 100;

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-3xl mx-auto">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">{avatar?.portrait}</span>
              <div>
                <div className="font-display font-bold text-foreground text-sm">{fieldEnv?.emoji} {fieldEnv?.name}</div>
                <div className="text-xs text-muted-foreground">{currentScoutPhase.name} • Weed {scoutingWeedIdx + 1}/{currentFieldWeeds.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-accent">${money.toLocaleString()}</div>
              <div className="bg-muted rounded-lg px-3 py-1 text-xs">
                {correctCount}/{totalFound} correct
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          {/* Weed identification card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
            <div className="h-64 bg-muted flex items-center justify-center overflow-hidden">
              <WeedImage weedId={currentWeed.id} stage={currentScoutPhase.imageStage} className="w-full h-full" />
            </div>
            <div className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">🔍 Scouting — Identify this weed</div>
              <ul className="space-y-1 mb-4">
                {currentWeed.traits.slice(0, 3).map((t, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>{t}
                  </li>
                ))}
              </ul>

              <p className="font-display font-semibold text-foreground mb-3">{idOptions.prompt}</p>

              {!showIdFeedback ? (
                <div className="space-y-3">
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {idOptions.options.map((opt, i) => (
                      <button key={i} onClick={() => setSelectedAnswer(opt)}
                        className={`px-4 py-3 rounded-lg border text-left text-sm transition-all ${
                          selectedAnswer === opt
                            ? 'border-primary bg-primary/15 ring-2 ring-primary/30'
                            : 'border-border bg-secondary/50 hover:bg-secondary'
                        }`}>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 ${
                          selectedAnswer === opt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                  {selectedAnswer && (
                    <button onClick={handleIdentify}
                      className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                      Confirm ✓
                    </button>
                  )}
                </div>
              ) : (
                <div className={`rounded-lg p-4 space-y-2 ${
                  foundWeeds[foundWeeds.length - 1]?.correct ? 'bg-accent/15 border border-accent/50' : 'bg-destructive/15 border border-destructive/50'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{foundWeeds[foundWeeds.length - 1]?.correct ? '✅' : '❌'}</span>
                    <span className="font-display font-bold">{foundWeeds[foundWeeds.length - 1]?.correct ? 'Correct!' : 'Incorrect'}</span>
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">This is:</span>{' '}
                    <span className="font-bold text-primary">{currentWeed.commonName}</span>{' '}
                    <span className="text-muted-foreground italic">({currentWeed.scientificName})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{currentWeed.plantType} • {currentWeed.family} • {currentWeed.lifeCycle} • {currentWeed.origin}</p>

                  {/* Look-alike comparison */}
                  {currentWeed.lookAlike && (
                    <div className="bg-muted/50 rounded-lg p-3 text-xs">
                      <span className="font-semibold text-foreground">👀 Look-alike:</span>{' '}
                      <span className="text-muted-foreground">Often confused with <strong>{currentWeed.lookAlike.species}</strong> — {currentWeed.lookAlike.difference}</span>
                    </div>
                  )}

                  <p className="text-xs text-primary">💡 {currentWeed.memoryHook}</p>

                  <button onClick={handleNextWeed}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 mt-2">
                    Next Weed →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Basket preview */}
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-display font-bold text-foreground">🧺 Collection Basket</span>
              <span className="text-xs text-muted-foreground">{correctCount} identified</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {foundWeeds.filter(fw => fw.correct).slice(-20).map((fw, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-accent/15 text-accent rounded-full">
                  {grade === 'elementary' ? (weedMap[fw.weedId]?.plantType === 'Monocot' ? '🌾' : '🍀') : weedMap[fw.weedId]?.commonName.slice(0, 12)}
                </span>
              ))}
              {correctCount > 20 && <span className="text-xs text-muted-foreground">+{correctCount - 20} more</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // BASKET REVIEW
  // ═══════════════════════════════════════════════════════════
  if (phase === 'basket') {
    const correctIds = [...new Set(foundWeeds.filter(fw => fw.correct).map(fw => fw.weedId))];
    const missedIds = [...new Set(foundWeeds.filter(fw => !fw.correct).map(fw => fw.weedId))];

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-2xl text-foreground">🧺 Field Collection</h1>
            <div className="text-sm font-bold text-accent">${money.toLocaleString()}</div>
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6 text-center">
            <div className="text-3xl font-display font-extrabold text-accent">{correctIds.length}</div>
            <div className="text-sm text-muted-foreground">species correctly identified out of {totalWeedsAllFields}</div>
            {missedIds.length > 0 && (
              <div className="text-xs text-destructive mt-1">{missedIds.length} misidentified</div>
            )}
          </div>

          {/* Group by field */}
          {activeFields.map(fId => {
            const env = fieldMap[fId];
            const fieldFound = foundWeeds.filter(fw => fw.fieldId === fId && fw.correct);
            return (
              <div key={fId} className="mb-4">
                <h3 className="font-display font-bold text-sm text-foreground mb-2">{env?.emoji} {env?.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {fieldFound.map((fw, i) => {
                    const w = weedMap[fw.weedId];
                    return (
                      <div key={i} className="bg-card border border-border rounded-lg p-3 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          <WeedImage weedId={fw.weedId} stage="whole" className="w-full h-full" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">{w?.commonName}</div>
                          <div className="text-[10px] text-muted-foreground">{w?.plantType} • {w?.lifeCycle}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button onClick={startCategorization}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 mt-4">
            📊 Categorize & Group Weeds
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // CATEGORIZE
  // ═══════════════════════════════════════════════════════════
  if (phase === 'categorize') {
    const currentGroup = groups[activeGroupIdx];
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-xl text-foreground">📊 Weed Categories</h1>
            <div className="text-sm text-muted-foreground">Group {activeGroupIdx + 1}/{groups.length}</div>
          </div>

          {/* Progress through groups */}
          <div className="flex gap-1 mb-6">
            {groups.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i <= activeGroupIdx ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>

          {currentGroup && (
            <div className="space-y-4">
              <div className="bg-card border-2 border-primary/30 rounded-xl p-5 text-center">
                <h2 className="font-display font-bold text-2xl text-foreground mb-1">{currentGroup.label}</h2>
                <p className="text-sm text-muted-foreground">{currentGroup.weedIds.length} species in this group</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {currentGroup.weedIds.map(wId => {
                  const w = weedMap[wId];
                  return (
                    <div key={wId} className="bg-card border border-border rounded-lg p-3 text-center">
                      <div className="w-16 h-16 mx-auto rounded-lg overflow-hidden bg-muted mb-2">
                        <WeedImage weedId={wId} stage="whole" className="w-full h-full" />
                      </div>
                      <div className="text-xs font-semibold text-foreground">{w?.commonName}</div>
                      <div className="text-[10px] text-muted-foreground">{w?.family}</div>
                      {w?.origin === 'Introduced' && w?.actImmediately && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-destructive/15 text-destructive rounded-full">⚠️ Invasive</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Info about this category */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                {currentGroup.label.includes('Monocot') && <p>Monocots (grasses) have parallel leaf veins, fibrous roots, and are often harder to control in grass crops like corn and wheat.</p>}
                {currentGroup.label.includes('Dicot') && <p>Dicots (broadleaves) have branching veins, taproots, and can be selectively targeted in grass crops with broadleaf herbicides.</p>}
                {currentGroup.label.includes('Perennial') && <p>Perennials regrow from root systems year after year. They require persistent management and often systemic herbicides.</p>}
                {currentGroup.label.includes('Annual') && <p>Annuals complete their life cycle in one season. Pre-emergent herbicides and timely cultivation are key.</p>}
                {currentGroup.label.includes('Invasive') && <p>These introduced species spread aggressively and must be reported and controlled immediately to prevent ecological damage.</p>}
              </div>

              <button
                onClick={() => {
                  if (activeGroupIdx < groups.length - 1) {
                    setActiveGroupIdx(i => i + 1);
                  } else {
                    // Check for invasives
                    if (invasiveWeeds.length > 0) {
                      setPhase('invasive-report');
                    } else {
                      startManagement();
                    }
                  }
                }}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90">
                {activeGroupIdx < groups.length - 1 ? 'Next Category →' : invasiveWeeds.length > 0 ? '🚨 Report Invasives →' : '🛠️ Plan Management →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // INVASIVE SPECIES REPORT
  // ═══════════════════════════════════════════════════════════
  if (phase === 'invasive-report') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">🚨 Invasive Species Report</h1>
          <p className="text-sm text-muted-foreground mb-6">These invasive species require immediate action. File a report with your local extension office for each one.</p>

          <div className="space-y-4">
            {invasiveWeeds.map(wId => {
              const w = weedMap[wId];
              const reported = reportedInvasives.includes(wId);
              return (
                <div key={wId} className={`border-2 rounded-xl p-4 transition-all ${reported ? 'border-accent/50 bg-accent/10' : 'border-destructive/50 bg-destructive/10'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      <WeedImage weedId={wId} stage="whole" className="w-full h-full" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-foreground">{w?.commonName}</div>
                      <div className="text-xs text-muted-foreground italic">{w?.scientificName}</div>
                      <div className="text-xs text-destructive mt-1">⚠️ {w?.actReason}</div>
                    </div>
                    {!reported ? (
                      <button onClick={() => handleReportInvasive(wId)}
                        className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 shrink-0">
                        📋 Report
                      </button>
                    ) : (
                      <span className="text-accent text-sm font-bold shrink-0">✅ Reported</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={startManagement}
            disabled={reportedInvasives.length < invasiveWeeds.length}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
            {reportedInvasives.length < invasiveWeeds.length ? `Report all ${invasiveWeeds.length} invasives first` : '🛠️ Plan Management →'}
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
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-xl text-foreground">🛠️ Management Plan</h1>
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
                <h2 className="font-display font-bold text-lg text-foreground mb-1">{group.label}</h2>
                <div className="flex flex-wrap gap-1 mb-3">
                  {group.weedIds.slice(0, 8).map(wId => (
                    <span key={wId} className="px-2 py-1 text-xs bg-muted text-foreground rounded-full">{weedMap[wId]?.commonName}</span>
                  ))}
                  {group.weedIds.length > 8 && <span className="text-xs text-muted-foreground">+{group.weedIds.length - 8} more</span>}
                </div>

                {/* Key species info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  {group.weedIds.slice(0, 2).map(wId => (
                    <p key={wId}><span className="font-semibold text-foreground">{weedMap[wId]?.commonName}:</span> {weedMap[wId]?.management}</p>
                  ))}
                </div>
              </div>

              {/* Method selection */}
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

              {/* Timing selection */}
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
  // RESULTS / YIELD
  // ═══════════════════════════════════════════════════════════
  if (phase === 'results') {
    const totalYield = yieldResults.reduce((s, r) => s + r.adjustedYield, 0);
    const projectedBalance = money + totalYield - TOTAL_EXPENSES;
    const profitable = projectedBalance >= 0;

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">{profitable ? '🎉' : '😓'}</div>
            <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">
              Year {year} Results
            </h1>
            <p className="text-muted-foreground">
              {profitable ? `Great work, ${avatar?.label}! Your farm turned a profit!` : `Tough year, ${avatar?.label}. Review your strategy for next year.`}
            </p>
          </div>

          {/* Financial summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground">Crop Revenue</div>
              <div className="font-display font-bold text-xl text-accent">${totalYield.toLocaleString()}</div>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground">Expenses</div>
              <div className="font-display font-bold text-xl text-destructive">-${TOTAL_EXPENSES.toLocaleString()}</div>
            </div>
            <div className={`border rounded-lg p-4 text-center ${profitable ? 'bg-accent/15 border-accent/40' : 'bg-destructive/15 border-destructive/40'}`}>
              <div className="text-xs text-muted-foreground">Net</div>
              <div className={`font-display font-bold text-xl ${profitable ? 'text-accent' : 'text-destructive'}`}>
                ${(totalYield - TOTAL_EXPENSES).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Per-field breakdown */}
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

          {/* Session stats */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">📊 Scouting Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-accent">{correctCount}</div>
                <div className="text-xs text-muted-foreground">Correct IDs</div>
              </div>
              <div>
                <div className="text-lg font-bold text-destructive">{totalFound - correctCount}</div>
                <div className="text-xs text-muted-foreground">Missed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary">{groups.length}</div>
                <div className="text-xs text-muted-foreground">Groups Sorted</div>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{reportedInvasives.length}</div>
                <div className="text-xs text-muted-foreground">Invasives Reported</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleNextYear}
              className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90">
              🗓️ Continue to Year {year + 1}
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

  // Fallback
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Loading...</p>
        <button onClick={onClose} className="mt-4 text-primary underline">Go Back</button>
      </div>
    </div>
  );
}
