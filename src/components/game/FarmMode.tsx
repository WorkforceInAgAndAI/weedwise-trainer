import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { weeds, weedMap } from '@/data/weeds';
import { crops, cropMap } from '@/data/crops';
import { fieldEnvironments, getFieldCount, getScoutingPhases, fieldMap } from '@/data/fields';
import type { GradeLevel, Weed } from '@/types/game';
import { GRADE_NAMES, GRADE_RANGES } from '@/data/phases';
import WeedImage from './WeedImage';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ── Types ──────────────────────────────────────────────────
interface WeedDot {
  id: string;
  weedId: string;
  x: number;
  y: number;
  found: boolean;
  category?: 'monocot' | 'dicot';
  imageVariant: 1 | 2;
  imageStage: string;
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
  bestChoice: boolean;
}

interface InvasiveReport {
  weedId: string;
  fieldId: string;
  count: number;
  density: string;
  notes: string;
  submitted: boolean;
}

interface UnsortedWeed {
  weedId: string;
  dotId: string;
}

interface SortResult {
  weedId: string;
  selectedCats: SortCategory[];
  correctCats: SortCategory[];
  status: 'correct' | 'partial' | 'incorrect';
}

interface ElemSortResult {
  weedId: string;
  dotImageStage: string;
  plantType: { selected: string; correct: string; isCorrect: boolean };
  origin: { selected: string; correct: string; isCorrect: boolean };
  lifeStage: { selected: string; correct: string; isCorrect: boolean };
  status: 'correct' | 'partial' | 'incorrect';
}

interface MiddleSortResult {
  weedId: string;
  plantType: { selected: string; correct: string; isCorrect: boolean };
  origin: { selected: string; correct: string; isCorrect: boolean };
  lifeCycle: { selected: string; correct: string; isCorrect: boolean };
  habitat: { selected: string; correct: string; isCorrect: boolean };
  status: 'correct' | 'partial' | 'incorrect';
}

type SortCategory = 'monocot' | 'dicot' | 'annual' | 'perennial' | 'invasive';

type FarmPhase = 'avatar' | 'overview' | 'scouting' | 'sorting' | 'sort-results' | 'categorize-review' | 'invasive-report' | 'management' | 'mgmt-feedback' | 'results';

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
const FARM_EXPENSES = 6000;
const FAMILY_EXPENSES = 4000;
const TOTAL_EXPENSES = FARM_EXPENSES + FAMILY_EXPENSES; // $10,000
const WEEDS_PER_GAME = 20;
const FIELD_TIME_LIMIT_MS = 120_000; // 2 minutes per field for upper levels

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

/** Get image stage based on season index for upper levels */
function getSeasonStage(seasonIdx: number, totalSeasons: number): string {
  if (totalSeasons <= 1) return 'whole';
  const ratio = seasonIdx / (totalSeasons - 1);
  if (ratio <= 0.25) return 'seedling';
  if (ratio <= 0.5) return 'vegetative';
  if (ratio <= 0.75) return 'flower';
  return 'whole';
}

function generateDots(weedPool: Weed[], fieldId: string, imageStage: string): WeedDot[] {
  const dots: WeedDot[] = [];
  let dotId = 0;
  weedPool.forEach(weed => {
    const isInvasive = weed.origin === 'Introduced' && weed.actImmediately;
    const occurrences = isInvasive ? 2 + Math.floor(Math.random() * 2) : 1 + Math.floor(Math.random() * 2);
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
      const imageVariant: 1 | 2 = Math.random() < 0.5 ? 1 : 2;
      const actualStage = imageStage === 'random'
        ? (['seedling', 'vegetative', 'flower', 'whole'])[Math.floor(Math.random() * 4)]
        : imageStage;
      dots.push({ id: `${fieldId}-${dotId++}`, weedId: weed.id, x, y, found: false, imageVariant, imageStage: actualStage });
    }
  });
  return dots;
}

function getWeedLabel(weed: Weed, _grade: GradeLevel): string {
  // Always show the weed name, not Monocot/Dicot
  return weed.commonName;
}

function getCategoryLabel(type: 'monocot' | 'dicot', grade: GradeLevel): string {
  switch (grade) {
    case 'elementary': return type === 'monocot' ? '🌾 Monocot Basket' : '🍀 Dicot Basket';
    case 'middle': return type === 'monocot' ? '🌾 Grasses' : '🍀 Broadleaves';
    case 'high': return type === 'monocot' ? '🌾 Monocotyledons' : '🍀 Dicotyledons';
  }
}

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

/** Determine the BEST method+timing for a group */
function getBestManagement(groupLabel: string, weedIds: string[]): { method: string; timing: string; explanation: string } {
  const isGrassGroup = groupLabel.includes('Monocot') || groupLabel.includes('Grass');
  const isBroadleafGroup = groupLabel.includes('Dicot') || groupLabel.includes('Broadlea');
  const isPerennialGroup = groupLabel.includes('Perennial');
  const isAnnualGroup = groupLabel.includes('Annual');
  const isInvasiveGroup = groupLabel.includes('Invasive') || groupLabel.includes('Priority');

  if (isInvasiveGroup) {
    return {
      method: 'Integrated Multi-MOA Program',
      timing: 'Year-round monitoring',
      explanation: 'Invasive species require a comprehensive, multi-mode-of-action approach with year-round vigilance to prevent establishment and spread.'
    };
  }
  if (isGrassGroup && isAnnualGroup) {
    return {
      method: 'Pre-emergent Herbicide (Group 15)',
      timing: 'At planting (Pre-emerge)',
      explanation: 'Annual grasses are best controlled with pre-emergent herbicides applied at planting, preventing seedling establishment before they compete with crops.'
    };
  }
  if (isGrassGroup && isPerennialGroup) {
    return {
      method: 'Post-emergent Grass Herbicide (Clethodim)',
      timing: 'Early post-emerge (< 4 inches)',
      explanation: 'Perennial grasses need post-emergent grass-specific herbicides applied early when plants are small and actively growing for maximum uptake.'
    };
  }
  if (isGrassGroup) {
    return {
      method: 'Post-emergent Grass Herbicide (Clethodim)',
      timing: 'Early post-emerge (< 4 inches)',
      explanation: 'Grass weeds respond best to grass-specific herbicides like Clethodim applied early when weeds are small and actively growing.'
    };
  }
  if (isBroadleafGroup && isAnnualGroup) {
    return {
      method: 'Post-emergent Broadleaf Herbicide (2,4-D)',
      timing: 'Early post-emerge (< 4 inches)',
      explanation: 'Annual broadleaf weeds are effectively controlled with post-emergent broadleaf herbicides applied when plants are young and actively growing.'
    };
  }
  if (isBroadleafGroup && isPerennialGroup) {
    return {
      method: 'Post-emergent Broadleaf Herbicide (2,4-D)',
      timing: 'Mid-season',
      explanation: 'Perennial broadleaf weeds need systemic herbicides applied mid-season when plants are translocating nutrients to roots, maximizing herbicide movement.'
    };
  }
  if (isBroadleafGroup) {
    return {
      method: 'Post-emergent Broadleaf Herbicide (2,4-D)',
      timing: 'Early post-emerge (< 4 inches)',
      explanation: 'Broadleaf weeds are best managed with broadleaf-specific herbicides applied early in the growth stage.'
    };
  }
  if (isPerennialGroup) {
    return {
      method: 'Mowing & Cutting',
      timing: 'Mid-season',
      explanation: 'Perennial weeds can be managed through repeated mowing during mid-season to deplete root reserves over time.'
    };
  }
  return {
    method: 'Integrated Multi-MOA Program',
    timing: 'Year-round monitoring',
    explanation: 'A diverse weed group benefits from an integrated approach combining multiple control methods throughout the season.'
  };
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

const ELEM_MANAGEMENT_METHODS = [
  'Hand weeding',
  'Ignore the weed',
  'Apply general herbicides',
  'Mulch over the weed',
  'Water the weed',
];

const MID_MANAGEMENT_METHODS = [
  'Hand weeding',
  'Pre-Emergent Herbicide',
  'Post-Emergent Herbicide',
  'Cover Crop/Mulch',
  'Wait to act',
  'Fertilize',
];

function isMidMethodEffective(method: string, groupLabel: string, weedIds: string[]): boolean {
  const isGrassGroup = groupLabel.includes('Monocot') || groupLabel.includes('Grass');
  const isBroadleafGroup = groupLabel.includes('Dicot') || groupLabel.includes('Broadlea');
  const isPerennialGroup = groupLabel.includes('Perennial');
  const isAnnualGroup = groupLabel.includes('Annual');
  // Fertilize is never effective as weed management
  if (method === 'Fertilize') return false;
  if (method === 'Pre-Emergent Herbicide' && isAnnualGroup) return true;
  if (method === 'Pre-Emergent Herbicide' && isPerennialGroup) return false;
  if (method === 'Post-Emergent Herbicide') return true;
  if (method === 'Hand weeding' && weedIds.length <= 3) return true;
  if (method === 'Hand weeding') return true;
  if (method === 'Cover Crop/Mulch') return true;
  if (method === 'Wait to act' && weedIds.length <= 2) return true;
  if (method === 'Wait to act') return false;
  return false;
}

function getMidBestMethod(groupLabel: string, weedIds: string[]): { method: string; explanation: string } {
  const isPerennialGroup = groupLabel.includes('Perennial');
  const isAnnualGroup = groupLabel.includes('Annual');
  if (isAnnualGroup) return { method: 'Pre-Emergent Herbicide', explanation: 'Annual weeds are best stopped before they emerge. A pre-emergent herbicide prevents seeds from germinating.' };
  if (isPerennialGroup) return { method: 'Post-Emergent Herbicide', explanation: 'Perennial weeds regrow from roots, so post-emergent herbicides applied to actively growing plants are most effective.' };
  if (weedIds.length <= 2) return { method: 'Hand weeding', explanation: 'With only a few weeds, hand weeding is the most targeted and cost-effective approach.' };
  return { method: 'Post-Emergent Herbicide', explanation: 'Post-emergent herbicides target actively growing weeds and are effective across many weed types.' };
}

function getCorrectHabitat(weed: Weed): string {
  const h = weed.habitat.toLowerCase();
  if (h.startsWith('warm-season') || h.startsWith('warm')) return 'warm';
  if (h.startsWith('cool-season') || h.startsWith('cool')) return 'cool';
  if (h.startsWith('wet') || h.includes('poorly drained')) return 'wet';
  if (h.startsWith('dry') || h.includes('disturbed')) return 'dry';
  return 'warm';
}

function getCorrectLifeCycle(weed: Weed): string {
  const lc = weed.lifeCycle.toLowerCase();
  if (lc.includes('perennial')) return 'perennial';
  if (lc.includes('biennial')) return 'biennial';
  return 'annual';
}

function habitatLabel(h: string): string {
  switch (h) {
    case 'warm': return 'Warm-Season / Full Sun';
    case 'cool': return 'Cool-Season / Early Spring';
    case 'wet': return 'Wet / Poorly Drained';
    case 'dry': return 'Dry / Disturbed';
    default: return h;
  }
}

function isElemMethodEffective(method: string): boolean {
  return ['Hand weeding', 'Apply general herbicides', 'Mulch over the weed'].includes(method);
}

function getElemBestMethod(weedIds: string[]): { method: string; explanation: string } {
  if (weedIds.length <= 2) return { method: 'Hand weeding', explanation: 'With only a few weeds, hand weeding is the most targeted and environmentally friendly approach.' };
  return { method: 'Apply general herbicides', explanation: 'With many weeds present, applying herbicides is the most efficient way to control them across the field.' };
}

function imageStageToLifeStage(stage: string): string {
  if (stage === 'seedling') return 'seedling';
  if (stage === 'vegetative') return 'vegetative';
  if (stage === 'flower') return 'reproductive';
  return 'plant';
}

function lifeStageLabel(ls: string): string {
  switch (ls) {
    case 'seedling': return '🌱 Seedling';
    case 'vegetative': return '🌿 Vegetative';
    case 'reproductive': return '🌸 Reproductive';
    case 'plant': return '🌳 Mature Plant';
    default: return ls;
  }
}

const SORT_CATEGORIES: { id: SortCategory; label: string; description: string; color: string }[] = [
  { id: 'monocot', label: '🌾 Monocots (Grasses)', description: 'Parallel veins, fibrous roots', color: 'border-primary/50 bg-primary/10' },
  { id: 'dicot', label: '🍀 Dicots (Broadleaves)', description: 'Branching veins, taproots', color: 'border-amber-600/50 bg-amber-600/10' },
  { id: 'annual', label: '📅 Annuals / Biennials', description: 'Complete life cycle in 1–2 years', color: 'border-blue-500/50 bg-blue-500/10' },
  { id: 'perennial', label: '🔄 Perennials', description: 'Regrow from roots each year', color: 'border-purple-500/50 bg-purple-500/10' },
  { id: 'invasive', label: '⚠️ Invasive / Priority', description: 'Non-native, spread aggressively', color: 'border-destructive/50 bg-destructive/10' },
];

function getCorrectCategories(weed: Weed): SortCategory[] {
  const cats: SortCategory[] = [];
  cats.push(weed.plantType === 'Monocot' ? 'monocot' : 'dicot');
  if (weed.lifeCycle?.toLowerCase().includes('perennial')) cats.push('perennial');
  else cats.push('annual');
  if (weed.origin === 'Introduced' && weed.actImmediately) cats.push('invasive');
  return cats;
}

function buildQuizOptions(weed: Weed, grade: GradeLevel): { options: string[]; correct: string; prompt: string } {
  switch (grade) {
    case 'elementary':
      return {
        prompt: `Is ${weed.commonName} a Monocot or Dicot?`,
        options: ['Monocot', 'Dicot'],
        correct: weed.plantType === 'Monocot' ? 'Monocot' : 'Dicot',
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
}

// ── Component ──────────────────────────────────────────────
interface Props { onClose: () => void; }

export default function FarmMode({ onClose }: Props) {
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [phase, setPhase] = useState<FarmPhase>('avatar');
  const [year, setYear] = useState(1);
  const [totalEarnings, setTotalEarnings] = useState(0); // cumulative money earned through gameplay
  const [money, setMoney] = useState(0); // running earnings this year

  const [fields, setFields] = useState<FieldState[]>([]);
  const [activeFieldIdx, setActiveFieldIdx] = useState(0);
  const [scoutPhaseIdx, setScoutPhaseIdx] = useState(0);
  // Track missed weed IDs from scouting to carry forward
  const [missedWeedIds, setMissedWeedIds] = useState<string[]>([]);

  const [selectedDot, setSelectedDot] = useState<WeedDot | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const quizOptionsRef = useRef<{ options: string[]; correct: string; prompt: string } | null>(null);

  // Field timer for upper levels
  const [fieldStartTime, setFieldStartTime] = useState(0);
  const [fieldTimeRemaining, setFieldTimeRemaining] = useState(FIELD_TIME_LIMIT_MS);

  // Sorting phase state
  const [unsortedWeeds, setUnsortedWeeds] = useState<UnsortedWeed[]>([]);
  const [sortedWeeds, setSortedWeeds] = useState<Record<SortCategory, string[]>>({ monocot: [], dicot: [], annual: [], perennial: [], invasive: [] });
  const [currentSortWeed, setCurrentSortWeed] = useState(0);
  const [selectedSortCats, setSelectedSortCats] = useState<SortCategory[]>([]);
  const [sortResults, setSortResults] = useState<SortResult[]>([]);
  const [sortFeedbackResult, setSortFeedbackResult] = useState<SortResult | null>(null);
  // Elementary sorting state
  const [elemSortResults, setElemSortResults] = useState<ElemSortResult[]>([]);
  const [elemSortFeedback, setElemSortFeedback] = useState<ElemSortResult | null>(null);
  const [elemPlantType, setElemPlantType] = useState<string | null>(null);
  const [elemOrigin, setElemOrigin] = useState<string | null>(null);
  const [elemLifeStage, setElemLifeStage] = useState<string | null>(null);

  // Middle school sorting state
  const [midPlantType, setMidPlantType] = useState<string | null>(null);
  const [midOrigin, setMidOrigin] = useState<string | null>(null);
  const [midLifeCycle, setMidLifeCycle] = useState<string | null>(null);
  const [midHabitat, setMidHabitat] = useState<string | null>(null);
  const [midSortResults, setMidSortResults] = useState<MiddleSortResult[]>([]);
  const [midSortFeedback, setMidSortFeedback] = useState<MiddleSortResult | null>(null);

  const [groups, setGroups] = useState<{ label: string; weedIds: string[] }[]>([]);
  const [invasiveReports, setInvasiveReports] = useState<InvasiveReport[]>([]);
  const [managementActions, setManagementActions] = useState<ManagementAction[]>([]);
  const [currentMgmtGroup, setCurrentMgmtGroup] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedTiming, setSelectedTiming] = useState('');
  const [mgmtFeedback, setMgmtFeedback] = useState<ManagementAction | null>(null);
  const [mgmtBest, setMgmtBest] = useState<{ method: string; timing: string; explanation: string } | null>(null);
  const [yieldResults, setYieldResults] = useState<{ fieldId: string; crop: string; baseYield: number; adjustedYield: number; weedPenalty: number }[]>([]);

  const scoutPhases = useMemo(() => grade ? getScoutingPhases(grade) : [], [grade]);
  const currentScoutPhase = scoutPhases[scoutPhaseIdx];
  const hasMultipleSeasons = scoutPhases.length > 1;
  const hasTimer = grade === 'middle' || grade === 'high';

  const activeField = fields[activeFieldIdx];
  const totalDotsFound = fields.reduce((s, f) => s + f.dots.filter(d => d.found).length, 0);
  const correctDots = fields.reduce((s, f) => s + f.dots.filter(d => d.found && d.category).length, 0);

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

  // Timer effect for upper levels
  useEffect(() => {
    if (phase !== 'scouting' || !hasTimer || fieldStartTime === 0) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - fieldStartTime;
      const remaining = Math.max(0, FIELD_TIME_LIMIT_MS - elapsed);
      setFieldTimeRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        toast('⏰ Time is up!', { description: 'Moving to next field.' });
        handleFinishFieldAuto();
      }
    }, 200);
    return () => clearInterval(interval);
  }, [phase, hasTimer, fieldStartTime]);

  const handleFinishFieldAuto = useCallback(() => {
    // Auto-advance when timer runs out
    if (activeFieldIdx < fields.length - 1) {
      setActiveFieldIdx(i => i + 1);
      closeDotPopup();
      setFieldStartTime(Date.now());
    } else {
      // For upper levels with seasonal flow: finish this season's scouting of all fields
      if (hasMultipleSeasons) {
        finishSeasonScouting();
      } else {
        finishScouting();
      }
    }
  }, [activeFieldIdx, fields.length, hasMultipleSeasons]);

  // ── Grade + avatar ──────────────────────────────────────
  const handleGradeSelect = useCallback((g: GradeLevel) => {
    setGrade(g);
    const phases = getScoutingPhases(g);
    const count = getFieldCount(g);
    const selectedFields = pickRandom(fieldEnvironments, count);
    const weedSample = pickRandom(weeds, WEEDS_PER_GAME);
    const perField = Math.ceil(weedSample.length / count);
    const hasSeasons = phases.length > 1;
    // For upper levels, use the first season's stage
    const stage = hasSeasons ? getSeasonStage(0, phases.length) : (g === 'elementary' ? 'random' : 'whole');
    const fieldStates: FieldState[] = selectedFields.map((env, i) => {
      const start = i * perField;
      const fieldWeeds = weedSample.slice(start, Math.min(start + perField, weedSample.length));
      const cropId = env.suggestedCrops.length ? env.suggestedCrops[0] : undefined;
      return { fieldId: env.id, dots: generateDots(fieldWeeds, env.id, stage), cropId };
    });
    setFields(fieldStates);
  }, []);

  // ── Scouting: click dot → popup with STABLE options ────
  const handleDotClick = useCallback((dot: WeedDot) => {
    if (dot.found) return;
    const weed = weedMap[dot.weedId];
    if (!weed || !grade) return;
    quizOptionsRef.current = buildQuizOptions(weed, grade);
    setSelectedDot(dot);
    setSelectedAnswer(null);
    setShowFeedback(false);
  }, [grade]);

  const handleIdentifyDot = useCallback(() => {
    if (!selectedDot || !selectedAnswer || !grade || !quizOptionsRef.current) return;
    const weed = weedMap[selectedDot.weedId];
    if (!weed) return;
    const correct = selectedAnswer === quizOptionsRef.current.correct;
    setShowFeedback(true);
    const category: 'monocot' | 'dicot' = weed.plantType === 'Monocot' ? 'monocot' : 'dicot';
    setFields(prev => prev.map(f => ({
      ...f,
      dots: f.dots.map(d =>
        d.id === selectedDot.id ? { ...d, found: true, category: correct ? category : undefined } : d
      ),
    })));
    if (correct) {
      setMoney(m => m + 100);
      setTotalEarnings(e => e + 100);
      toast.success(`+$100 — Identified ${getWeedLabel(weed, grade)}!`);
    } else {
      toast.error(`Incorrect — that was ${getWeedLabel(weed, grade)}`);
    }
  }, [selectedDot, selectedAnswer, grade]);

  const closeDotPopup = useCallback(() => {
    setSelectedDot(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    quizOptionsRef.current = null;
  }, []);

  /** For upper levels: finish scouting all fields for this season, then sort & manage */
  const finishSeasonScouting = useCallback(() => {
    // Track missed weeds (unfound dots)
    const missed: string[] = [];
    fields.forEach(f => f.dots.filter(d => !d.found).forEach(d => {
      if (!missed.includes(d.weedId)) missed.push(d.weedId);
    }));
    setMissedWeedIds(prev => [...prev, ...missed.filter(id => !prev.includes(id))]);
    
    // Collect unique found weeds for sorting
    const foundMap = new Map<string, string>();
    fields.forEach(f => f.dots.filter(d => d.found && d.category).forEach(d => {
      if (!foundMap.has(d.weedId)) foundMap.set(d.weedId, d.id);
    }));
    const unsorted: UnsortedWeed[] = [...foundMap.entries()].map(([weedId, dotId]) => ({ weedId, dotId }));
    setUnsortedWeeds(shuffle(unsorted));
    setCurrentSortWeed(0);
    setSelectedSortCats([]);
    setSortedWeeds({ monocot: [], dicot: [], annual: [], perennial: [], invasive: [] });
    setSortResults([]);
    setPhase('sorting');
    toast.success('Scouting complete for this season! Sort your findings.');
  }, [fields]);

  /** For upper levels: after sort+manage of one season, advance to next season */
  const advanceToNextSeason = useCallback(() => {
    if (!grade) return;
    const nextSeasonIdx = scoutPhaseIdx + 1;
    if (nextSeasonIdx >= scoutPhases.length) {
      // All seasons done, calculate year results
      calculateResults();
      return;
    }
    setScoutPhaseIdx(nextSeasonIdx);
    setActiveFieldIdx(0);
    closeDotPopup();
    
    // Regenerate dots for next season with appropriate stage and carry-over missed weeds
    const stage = getSeasonStage(nextSeasonIdx, scoutPhases.length);
    const baseSample = pickRandom(weeds, WEEDS_PER_GAME);
    // Add extra weeds similar to missed ones
    const extraMissed = missedWeedIds.length > 0
      ? pickRandom(missedWeedIds.map(id => weedMap[id]).filter(Boolean) as Weed[], Math.min(missedWeedIds.length, 5))
      : [];
    const weedSample = shuffle([...baseSample, ...extraMissed]).slice(0, WEEDS_PER_GAME + extraMissed.length);
    const perField = Math.ceil(weedSample.length / fields.length);
    
    setFields(prev => prev.map((f, i) => {
      const start = i * perField;
      const fieldWeeds = weedSample.slice(start, Math.min(start + perField, weedSample.length));
      return { ...f, dots: generateDots(fieldWeeds, f.fieldId, stage) };
    }));
    
    setGroups([]);
    setManagementActions([]);
    setInvasiveReports([]);
    setUnsortedWeeds([]);
    setSortedWeeds({ monocot: [], dicot: [], annual: [], perennial: [], invasive: [] });
    setSortResults([]);
    setFieldStartTime(Date.now());
    setPhase('scouting');
    toast('🌱 Season advancing...', { description: scoutPhases[nextSeasonIdx]?.name });
  }, [grade, scoutPhaseIdx, scoutPhases, fields, missedWeedIds, closeDotPopup]);

  // ── Move to next field (elementary: linear; upper: all fields then sort) ──
  const handleFinishField = useCallback(() => {
    if (activeFieldIdx < fields.length - 1) {
      setActiveFieldIdx(i => i + 1);
      closeDotPopup();
      if (hasTimer) setFieldStartTime(Date.now());
    } else if (!hasMultipleSeasons) {
      // Elementary: single season, proceed as before
      if (scoutPhaseIdx < scoutPhases.length - 1) {
        setScoutPhaseIdx(i => i + 1);
        setActiveFieldIdx(0);
        closeDotPopup();
        toast('🌱 Season advancing...', { description: scoutPhases[scoutPhaseIdx + 1]?.name });
      } else {
        finishScouting();
      }
    } else {
      // Upper levels: all fields scouted for this season → sort & manage
      finishSeasonScouting();
    }
  }, [activeFieldIdx, fields.length, scoutPhaseIdx, scoutPhases, closeDotPopup, hasMultipleSeasons, hasTimer]);

  const finishScouting = useCallback(() => {
    const foundMap = new Map<string, string>();
    fields.forEach(f => f.dots.filter(d => d.found && d.category).forEach(d => {
      if (!foundMap.has(d.weedId)) foundMap.set(d.weedId, d.id);
    }));
    const unsorted: UnsortedWeed[] = [...foundMap.entries()].map(([weedId, dotId]) => ({ weedId, dotId }));
    setUnsortedWeeds(shuffle(unsorted));
    setCurrentSortWeed(0);
    setSelectedSortCats([]);
    setSortedWeeds({ monocot: [], dicot: [], annual: [], perennial: [], invasive: [] });
    setSortResults([]);
    setPhase('sorting');
    toast.success('Scouting complete! Now sort your findings into categories.');
  }, [fields]);

  // ── Sorting phase ──────────────────────────────────────
  const handleSortSubmit = useCallback(() => {
    if (grade === 'elementary') {
      if (!elemPlantType || !elemOrigin || !elemLifeStage) { toast.error('Select one option in each row'); return; }
      const current = unsortedWeeds[currentSortWeed];
      if (!current) return;
      const weed = weedMap[current.weedId];
      if (!weed) return;
      const dot = fields.flatMap(f => f.dots).find(d => d.id === current.dotId);
      const dotStage = dot?.imageStage || 'whole';
      const correctPlantType = weed.plantType === 'Monocot' ? 'monocot' : 'dicot';
      const correctOrigin = weed.origin === 'Native' ? 'native' : 'introduced';
      const correctLifeStage = imageStageToLifeStage(dotStage);

      const ptCorrect = elemPlantType === correctPlantType;
      const orCorrect = elemOrigin === correctOrigin;
      const lsCorrect = elemLifeStage === correctLifeStage;
      const correctCount = [ptCorrect, orCorrect, lsCorrect].filter(Boolean).length;
      const status: ElemSortResult['status'] = correctCount === 3 ? 'correct' : correctCount > 0 ? 'partial' : 'incorrect';

      const result: ElemSortResult = {
        weedId: current.weedId,
        dotImageStage: dotStage,
        plantType: { selected: elemPlantType, correct: correctPlantType, isCorrect: ptCorrect },
        origin: { selected: elemOrigin, correct: correctOrigin, isCorrect: orCorrect },
        lifeStage: { selected: elemLifeStage, correct: correctLifeStage, isCorrect: lsCorrect },
        status,
      };
      setElemSortResults(prev => [...prev, result]);

      if (status === 'correct') { setMoney(m => m + 150); setTotalEarnings(e => e + 150); }
      else if (status === 'partial') { setMoney(m => m + 50); setTotalEarnings(e => e + 50); }

      setElemPlantType(null);
      setElemOrigin(null);
      setElemLifeStage(null);
      setElemSortFeedback(result);
      return;
    }

    if (grade === 'middle') {
      if (!midPlantType || !midOrigin || !midLifeCycle || !midHabitat) { toast.error('Select one option in each row'); return; }
      const current = unsortedWeeds[currentSortWeed];
      if (!current) return;
      const weed = weedMap[current.weedId];
      if (!weed) return;
      const correctPlantType = weed.plantType === 'Monocot' ? 'monocot' : 'dicot';
      const correctOrigin = weed.origin === 'Native' ? 'native' : 'introduced';
      const correctLC = getCorrectLifeCycle(weed);
      const correctHab = getCorrectHabitat(weed);

      const ptCorrect = midPlantType === correctPlantType;
      const orCorrect = midOrigin === correctOrigin;
      const lcCorrect = midLifeCycle === correctLC;
      const habCorrect = midHabitat === correctHab;
      const correctCount = [ptCorrect, orCorrect, lcCorrect, habCorrect].filter(Boolean).length;
      const status: MiddleSortResult['status'] = correctCount === 4 ? 'correct' : correctCount > 0 ? 'partial' : 'incorrect';

      const result: MiddleSortResult = {
        weedId: current.weedId,
        plantType: { selected: midPlantType, correct: correctPlantType, isCorrect: ptCorrect },
        origin: { selected: midOrigin, correct: correctOrigin, isCorrect: orCorrect },
        lifeCycle: { selected: midLifeCycle, correct: correctLC, isCorrect: lcCorrect },
        habitat: { selected: midHabitat, correct: correctHab, isCorrect: habCorrect },
        status,
      };
      setMidSortResults(prev => [...prev, result]);

      if (status === 'correct') { setMoney(m => m + 150); setTotalEarnings(e => e + 150); }
      else if (status === 'partial') { setMoney(m => m + 50); setTotalEarnings(e => e + 50); }

      setMidPlantType(null);
      setMidOrigin(null);
      setMidLifeCycle(null);
      setMidHabitat(null);
      setMidSortFeedback(result);
      return;
    }

    if (selectedSortCats.length === 0) { toast.error('Select at least one category'); return; }
    const current = unsortedWeeds[currentSortWeed];
    if (!current) return;
    const weed = weedMap[current.weedId];
    if (!weed) return;
    const correctCats = getCorrectCategories(weed);
    const allCorrect = selectedSortCats.every(c => correctCats.includes(c)) && correctCats.every(c => selectedSortCats.includes(c));
    const partial = selectedSortCats.some(c => correctCats.includes(c));

    const status: SortResult['status'] = allCorrect ? 'correct' : partial ? 'partial' : 'incorrect';
    const result: SortResult = { weedId: current.weedId, selectedCats: [...selectedSortCats], correctCats, status };
    setSortResults(prev => [...prev, result]);

    setSortedWeeds(prev => {
      const next = { ...prev };
      selectedSortCats.forEach(cat => {
        if (!next[cat].includes(current.weedId)) {
          next[cat] = [...next[cat], current.weedId];
        }
      });
      return next;
    });

    if (allCorrect) {
      setMoney(m => m + 150);
      setTotalEarnings(e => e + 150);
    } else if (partial) {
      setMoney(m => m + 50);
      setTotalEarnings(e => e + 50);
    }

    setSelectedSortCats([]);
    setSortFeedbackResult(result);
  }, [grade, selectedSortCats, currentSortWeed, unsortedWeeds, elemPlantType, elemOrigin, elemLifeStage, fields, midPlantType, midOrigin, midLifeCycle, midHabitat]);

  const handleSortFeedbackNext = useCallback(() => {
    setSortFeedbackResult(null);
    setElemSortFeedback(null);
    setMidSortFeedback(null);
    if (currentSortWeed < unsortedWeeds.length - 1) {
      setCurrentSortWeed(i => i + 1);
    } else {
      setPhase('sort-results');
    }
  }, [currentSortWeed, unsortedWeeds.length]);

  const finishSorting = useCallback(() => {
    if (grade === 'elementary') {
      const allWeedIds = unsortedWeeds.map(u => u.weedId);
      const monocotIds = allWeedIds.filter(id => weedMap[id]?.plantType === 'Monocot');
      const dicotIds = allWeedIds.filter(id => weedMap[id]?.plantType !== 'Monocot');
      const groupList: { label: string; weedIds: string[] }[] = [];
      if (monocotIds.length > 0) groupList.push({ label: '🌾 Monocots (Grasses)', weedIds: monocotIds });
      if (dicotIds.length > 0) groupList.push({ label: '🍀 Dicots (Broadleaves)', weedIds: dicotIds });
      setGroups(groupList);
      setCurrentMgmtGroup(0);
      setSelectedMethod('');
      setSelectedTiming('');
      setMgmtFeedback(null);
      setMgmtBest(null);
      setPhase('management');
      return;
    }

    if (grade === 'middle') {
      const allWeedIds = unsortedWeeds.map(u => u.weedId);
      const monocotIds = allWeedIds.filter(id => weedMap[id]?.plantType === 'Monocot');
      const dicotIds = allWeedIds.filter(id => weedMap[id]?.plantType !== 'Monocot');
      const annualIds = allWeedIds.filter(id => !weedMap[id]?.lifeCycle.toLowerCase().includes('perennial'));
      const perennialIds = allWeedIds.filter(id => weedMap[id]?.lifeCycle.toLowerCase().includes('perennial'));
      const groupList: { label: string; weedIds: string[] }[] = [];
      if (monocotIds.length > 0) groupList.push({ label: '🌾 Monocots (Grasses)', weedIds: monocotIds });
      if (dicotIds.length > 0) groupList.push({ label: '🍀 Dicots (Broadleaves)', weedIds: dicotIds });
      if (annualIds.length > 0) groupList.push({ label: '📅 Annuals / Biennials', weedIds: annualIds });
      if (perennialIds.length > 0) groupList.push({ label: '🔄 Perennials', weedIds: perennialIds });
      setGroups(groupList);
      setCurrentMgmtGroup(0);
      setSelectedMethod('');
      setSelectedTiming('');
      setMgmtFeedback(null);
      setMgmtBest(null);
      setPhase('management');
      return;
    }

    const groupList = SORT_CATEGORIES
      .map(cat => ({ label: cat.label, weedIds: sortedWeeds[cat.id] || [] }))
      .filter(g => g.weedIds.length > 0);
    setGroups(groupList);

    const invasiveIds = sortedWeeds.invasive || [];
    const reports: InvasiveReport[] = invasiveIds.map(wId => {
      const dotCount = fields.reduce((s, f) => s + f.dots.filter(d => d.weedId === wId && d.found).length, 0);
      const fieldId = fields.find(f => f.dots.some(d => d.weedId === wId && d.found))?.fieldId || '';
      return { weedId: wId, fieldId, count: dotCount, density: '', notes: '', submitted: false };
    });
    setInvasiveReports(reports);
    setPhase('categorize-review');
  }, [grade, sortedWeeds, fields, unsortedWeeds]);

  // ── Management ──────────────────────────────────────────
  const startManagement = useCallback(() => {
    setCurrentMgmtGroup(0);
    setSelectedMethod('');
    setSelectedTiming('');
    setMgmtFeedback(null);
    setMgmtBest(null);
    setPhase('management');
  }, []);

  const submitManagement = useCallback(() => {
    if (grade === 'elementary') {
      if (!selectedMethod) return;
      const group = groups[currentMgmtGroup];
      if (!group) return;
      const effective = isElemMethodEffective(selectedMethod);
      const best = getElemBestMethod(group.weedIds);
      const isBestChoice = selectedMethod === best.method;

      const action: ManagementAction = { groupLabel: group.label, method: selectedMethod, timing: 'N/A', effective, bestChoice: isBestChoice };
      setManagementActions(prev => [...prev, action]);

      if (isBestChoice) { setMoney(m => m + 750); setTotalEarnings(e => e + 750); }
      else if (effective) { setMoney(m => m + 400); setTotalEarnings(e => e + 400); }
      else { setMoney(m => m - 150); }

      setMgmtFeedback(action);
      setMgmtBest({ ...best, timing: 'N/A' });
      setPhase('mgmt-feedback');
      return;
    }

    if (grade === 'middle') {
      if (!selectedMethod) return;
      const group = groups[currentMgmtGroup];
      if (!group) return;
      const effective = isMidMethodEffective(selectedMethod, group.label, group.weedIds);
      const best = getMidBestMethod(group.label, group.weedIds);
      const isBestChoice = selectedMethod === best.method;

      const action: ManagementAction = { groupLabel: group.label, method: selectedMethod, timing: 'N/A', effective, bestChoice: isBestChoice };
      setManagementActions(prev => [...prev, action]);

      if (isBestChoice) { setMoney(m => m + 750); setTotalEarnings(e => e + 750); }
      else if (effective) { setMoney(m => m + 400); setTotalEarnings(e => e + 400); }
      else { setMoney(m => m - 200); }

      setMgmtFeedback(action);
      setMgmtBest({ ...best, timing: 'N/A' });
      setPhase('mgmt-feedback');
      return;
    }

    if (!selectedMethod || !selectedTiming) return;
    const group = groups[currentMgmtGroup];
    if (!group) return;
    const effective = isMethodEffective(selectedMethod, group.label, group.weedIds);
    const best = getBestManagement(group.label, group.weedIds);
    const isBestChoice = selectedMethod === best.method && selectedTiming === best.timing;

    const action: ManagementAction = { groupLabel: group.label, method: selectedMethod, timing: selectedTiming, effective, bestChoice: isBestChoice };
    setManagementActions(prev => [...prev, action]);

    if (isBestChoice) {
      setMoney(m => m + 750);
      setTotalEarnings(e => e + 750);
    } else if (effective) {
      setMoney(m => m + 400);
      setTotalEarnings(e => e + 400);
    } else {
      setMoney(m => m - 150);
    }

    setMgmtFeedback(action);
    setMgmtBest(best);
    setPhase('mgmt-feedback');
  }, [grade, selectedMethod, selectedTiming, groups, currentMgmtGroup]);

  const handleMgmtFeedbackNext = useCallback(() => {
    setMgmtFeedback(null);
    setMgmtBest(null);
    setSelectedMethod('');
    setSelectedTiming('');
    if (currentMgmtGroup < groups.length - 1) {
      setCurrentMgmtGroup(i => i + 1);
      setPhase('management');
    } else {
      // For upper levels with seasonal flow, advance to next season
      if (hasMultipleSeasons && scoutPhaseIdx < scoutPhases.length - 1) {
        advanceToNextSeason();
      } else {
        calculateResults();
      }
    }
  }, [currentMgmtGroup, groups.length, hasMultipleSeasons, scoutPhaseIdx, scoutPhases.length, advanceToNextSeason]);

  const calculateResults = useCallback(() => {
    const allMgmt = [...managementActions];
    const effectiveCount = allMgmt.filter(a => a.effective).length;
    const totalGroups = Math.max(groups.length, 1);
    const mgmtRate = effectiveCount / totalGroups;
    const results = fields.map(f => {
      const crop = f.cropId ? cropMap[f.cropId] : null;
      const baseYield = crop?.baseYieldValue || 200;
      const foundRate = f.dots.length > 0 ? f.dots.filter(d => d.found && d.category).length / f.dots.length : 0;
      const yieldMultiplier = 0.3 + 0.35 * foundRate + 0.35 * mgmtRate;
      const adjusted = Math.round(baseYield * yieldMultiplier);
      const penalty = baseYield - adjusted;
      return { fieldId: f.fieldId, crop: crop?.name || 'Conservation (CRP)', baseYield, adjustedYield: adjusted, weedPenalty: penalty };
    });
    setYieldResults(results);
    setPhase('results');
  }, [fields, managementActions, groups]);

  // ── Year progression ────────────────────────────────────
  const handleNextYear = useCallback(() => {
    if (!grade) return;
    const totalYield = yieldResults.reduce((s, r) => s + r.adjustedYield, 0);
    setTotalEarnings(e => e + totalYield);
    setMoney(0);
    setYear(y => y + 1);
    setMissedWeedIds([]);
    const hasSeasons = scoutPhases.length > 1;
    const stage = hasSeasons ? getSeasonStage(0, scoutPhases.length) : 'whole';
    const weedSample = pickRandom(weeds, WEEDS_PER_GAME);
    const perField = Math.ceil(weedSample.length / fields.length);
    setFields(prev => prev.map((f, i) => {
      const start = i * perField;
      const fieldWeeds = weedSample.slice(start, Math.min(start + perField, weedSample.length));
      return { ...f, dots: generateDots(fieldWeeds, f.fieldId, stage) };
    }));
    setPhase('overview');
    setGroups([]);
    setManagementActions([]);
    setInvasiveReports([]);
    setScoutPhaseIdx(0);
    setActiveFieldIdx(0);
    closeDotPopup();
    setYieldResults([]);
    setUnsortedWeeds([]);
    setSortedWeeds({ monocot: [], dicot: [], annual: [], perennial: [], invasive: [] });
    setSortResults([]);
    toast('🗓️ New Year!', { description: `Year ${year + 1} — new weeds are emerging` });
  }, [grade, year, yieldResults, fields, closeDotPopup, scoutPhases]);

  // ── Earnings display component (bottom-right popup) ──
  const EarningsBar = () => {
    const yearlyTotal = totalEarnings + money;
    const profit = yearlyTotal - (TOTAL_EXPENSES * year);
    return (
      <div className="fixed bottom-4 right-4 z-[60] bg-card/95 backdrop-blur border border-border rounded-xl px-4 py-3 shadow-xl flex items-center gap-4">
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">💰 Earnings</div>
          <div className="font-display font-bold text-base text-accent">${yearlyTotal.toLocaleString()}</div>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">📊 Profit/Loss</div>
          <div className={`font-display font-bold text-base ${profit >= 0 ? 'text-accent' : 'text-destructive'}`}>
            {profit >= 0 ? '+' : '-'}${Math.abs(profit).toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

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
        <EarningsBar />
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
              <div className="bg-muted rounded-lg px-4 py-2 text-center">
                <div className="text-xs text-muted-foreground">Expenses</div>
                <div className="font-display font-bold text-destructive">${TOTAL_EXPENSES.toLocaleString()}/yr</div>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-foreground">
              <span className="font-bold text-primary">🎯 Goal:</span> Scout fields, identify & sort weeds, apply management, and earn enough to cover ${TOTAL_EXPENSES.toLocaleString()} in annual expenses.
              {hasMultipleSeasons && <span className="block mt-1 text-xs text-muted-foreground">You'll scout all fields each season, then sort and manage weeds before the next season begins.</span>}
              {hasTimer && <span className="block mt-1 text-xs text-destructive font-semibold">⏱️ 2-minute time limit per field!</span>}
            </p>
          </div>

          <h2 className="font-display font-bold text-lg text-foreground mb-4">🗺️ Your Farm</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {fields.map(f => {
              const env = fieldMap[f.fieldId];
              const crop = f.cropId ? cropMap[f.cropId] : null;
              return (
                <div key={f.fieldId} className="border-2 border-border rounded-xl overflow-hidden">
                  <FieldPreview fieldId={f.fieldId} className="h-32" />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-bold text-foreground">{env?.emoji} {env?.name}</h3>
                      {crop && <span className="text-xl">{crop.emoji}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{env?.description}</p>
                    {crop && <div className="text-xs text-foreground font-medium">Crop: {crop.name.split('(')[0].trim()} • Base: ${crop.baseYieldValue.toLocaleString()}</div>}
                    {!crop && <div className="text-xs text-muted-foreground italic">No crop — conservation land</div>}
                  </div>
                </div>
              );
            })}
          </div>

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
                        <span key={v} className="text-[10px] px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">Vulnerable to {v}s</span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="font-display font-bold text-sm text-foreground mb-2">💰 Economic Thresholds</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Not every weed needs treatment. Consider the <span className="font-semibold text-foreground">economic injury level</span> — the point at which weed damage costs exceed treatment costs.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-accent/10 rounded-lg p-2">
                <div className="text-xs font-bold text-accent">Low Density</div>
                <div className="text-[10px] text-muted-foreground">Monitor only</div>
              </div>
              <div className="bg-primary/10 rounded-lg p-2">
                <div className="text-xs font-bold text-primary">Threshold</div>
                <div className="text-[10px] text-muted-foreground">Action needed</div>
              </div>
              <div className="bg-destructive/10 rounded-lg p-2">
                <div className="text-xs font-bold text-destructive">Injury Level</div>
                <div className="text-[10px] text-muted-foreground">Yield loss occurring</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => { setActiveFieldIdx(0); setScoutPhaseIdx(0); setPhase('scouting'); if (hasTimer) setFieldStartTime(Date.now()); }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 transition-opacity">
            🔍 Begin Scouting — {scoutPhases[0]?.name}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SCOUTING — Immersive Field Map
  // ═══════════════════════════════════════════════════════════
  if (phase === 'scouting' && activeField) {
    const env = fieldMap[activeField.fieldId];
    const foundInField = activeField.dots.filter(d => d.found).length;
    const currentWeed = selectedDot ? weedMap[selectedDot.weedId] : null;
    const idOptions = quizOptionsRef.current;
    const timerSec = Math.ceil(fieldTimeRemaining / 1000);

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <EarningsBar />
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
            {hasTimer && (
              <span className={`text-base font-bold px-3 py-1.5 rounded-lg border-2 ${
                timerSec <= 30
                  ? 'text-destructive bg-destructive/15 border-destructive/50 animate-pulse'
                  : timerSec <= 60
                    ? 'text-amber-600 bg-amber-600/10 border-amber-600/30'
                    : 'text-foreground bg-muted border-border'
              }`}>
                ⏱️ {Math.floor(timerSec / 60)}:{(timerSec % 60).toString().padStart(2, '0')}
              </span>
            )}
            <span className="text-xs bg-muted px-2 py-1 rounded">{foundInField} found</span>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            <FieldBackground fieldId={activeField.fieldId} />

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

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="bg-card/90 backdrop-blur border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
                Click colored dots to scout weeds
              </div>
              <button onClick={handleFinishField}
                className="bg-primary/90 backdrop-blur text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
                {activeFieldIdx < fields.length - 1 ? 'Next Field →' : hasMultipleSeasons ? 'Finish Season Scouting →' : 'Finish Scouting →'}
              </button>
            </div>

            <div className="absolute top-3 left-3 flex gap-1">
              {fields.map((f, i) => {
                const fEnv = fieldMap[f.fieldId];
                return (
                  <button key={f.fieldId}
                    onClick={() => { setActiveFieldIdx(i); closeDotPopup(); if (hasTimer) setFieldStartTime(Date.now()); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      i === activeFieldIdx ? 'bg-primary text-primary-foreground' : 'bg-card/80 backdrop-blur text-foreground hover:bg-card'
                    }`}>
                    {fEnv?.emoji} {fEnv?.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {scoutPhases.length > 1 && (
              <div className="absolute top-3 right-3 flex gap-1 bg-card/80 backdrop-blur rounded-lg px-2 py-1">
                {scoutPhases.map((sp, i) => (
                  <span key={sp.id} className={`text-[10px] px-2 py-0.5 rounded ${i === scoutPhaseIdx ? 'bg-primary text-primary-foreground' : i < scoutPhaseIdx ? 'text-accent' : 'text-muted-foreground'}`}>
                    {i < scoutPhaseIdx ? '✓ ' : ''}{sp.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Side panel: Baskets */}
          <div className="w-64 border-l border-border bg-card flex flex-col shrink-0">
            <div className="p-3 border-b border-border">
              <h3 className="font-display font-bold text-sm text-foreground">🧺 Collection</h3>
              <p className="text-[10px] text-muted-foreground">{currentScoutPhase?.name}</p>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                <div className="border border-primary/30 rounded-lg p-2 bg-primary/5">
                  <div className="text-xs font-bold text-primary mb-2">{getCategoryLabel('monocot', grade)}</div>
                  <div className="flex flex-wrap gap-1">
                    {monocotBasket.length === 0 && <span className="text-[10px] text-muted-foreground italic">Empty</span>}
                    {monocotBasket.map(wId => {
                      const dot = fields.flatMap(f => f.dots).find(d => d.weedId === wId && d.found);
                      return (
                        <div key={wId} className="w-10 h-10 rounded-md overflow-hidden bg-muted border border-primary/20" title={weedMap[wId]?.commonName}>
                          <WeedImage weedId={wId} stage={dot?.imageStage || 'whole'} className="w-full h-full" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{monocotBasket.length} species</div>
                </div>

                <div className="border border-amber-600/30 rounded-lg p-2 bg-amber-600/5">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">{getCategoryLabel('dicot', grade)}</div>
                  <div className="flex flex-wrap gap-1">
                    {dicotBasket.length === 0 && <span className="text-[10px] text-muted-foreground italic">Empty</span>}
                    {dicotBasket.map(wId => {
                      const dot = fields.flatMap(f => f.dots).find(d => d.weedId === wId && d.found);
                      return (
                        <div key={wId} className="w-10 h-10 rounded-md overflow-hidden bg-muted border border-amber-600/20" title={weedMap[wId]?.commonName}>
                          <WeedImage weedId={wId} stage={dot?.imageStage || 'whole'} className="w-full h-full" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{dicotBasket.length} species</div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Identification popup */}
        {selectedDot && currentWeed && idOptions && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget && !showFeedback) closeDotPopup(); }}>
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
              <div className="aspect-square max-h-64 bg-muted overflow-hidden flex items-center justify-center">
                <WeedImage weedId={currentWeed.id} stage={selectedDot.imageStage} className="w-full h-full object-contain" />
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">🔍 Identify this weed</div>
                {grade === 'elementary' ? (
                  <div className="font-display font-bold text-lg text-foreground mb-3">{currentWeed.commonName}</div>
                ) : (
                  <ul className="space-y-1 mb-3">
                    {currentWeed.traits.slice(0, 3).map((t, i) => (
                      <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                        <span className="text-accent">•</span>{t}
                      </li>
                    ))}
                  </ul>
                )}
                {!showFeedback ? (
                  <div className="space-y-2">
                    <div className="grid gap-2 grid-cols-1">
                      {idOptions.options.map((opt, i) => (
                        <button key={`${opt}-${i}`} onClick={() => setSelectedAnswer(opt)}
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
                      <span className="font-display font-bold text-sm">{selectedAnswer === idOptions.correct ? 'Correct! +$100' : 'Incorrect'}</span>
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
  // SORTING PHASE
  // ═══════════════════════════════════════════════════════════
  if (phase === 'sorting') {
    const current = unsortedWeeds[currentSortWeed];
    const currentW = current ? weedMap[current.weedId] : null;
    const progress = unsortedWeeds.length > 0 ? ((currentSortWeed) / unsortedWeeds.length) * 100 : 100;

    if (!current || !currentW) {
      finishSorting();
      return null;
    }

    // Get the dot's image stage for this weed
    const currentDot = fields.flatMap(f => f.dots).find(d => d.id === current.dotId);
    const currentImgStage = currentDot?.imageStage || 'whole';

    // Elementary: 3-row radio sorting
    if (grade === 'elementary') {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <EarningsBar />
          <div className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">🗂️ Sort Your Findings</h1>
                <p className="text-xs text-muted-foreground">Classify each weed by selecting one option per row.</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{currentSortWeed + 1} / {unsortedWeeds.length}</div>
              </div>
            </div>

            <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>

            {/* Current weed card */}
            <div className="bg-card border-2 border-border rounded-xl overflow-hidden mb-6">
              <div className="aspect-square max-h-72 bg-muted overflow-hidden mx-auto flex items-center justify-center">
                <WeedImage weedId={currentW.id} stage={currentImgStage} className="w-full h-full object-contain" />
              </div>
              <div className="p-4">
                <div className="font-display font-bold text-lg text-foreground">{currentW.commonName}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {currentW.traits.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{currentW.habitat}</p>
              </div>
            </div>

            {/* Row 1: Monocot vs Dicot */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Plant Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'monocot', label: '🌾 Monocot' }, { id: 'dicot', label: '🍀 Dicot' }].map(opt => (
                    <button key={opt.id} onClick={() => setElemPlantType(opt.id)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                        elemPlantType === opt.id ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Row 2: Native vs Introduced */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Origin</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'native', label: '🏡 Native' }, { id: 'introduced', label: '🌍 Introduced' }].map(opt => (
                    <button key={opt.id} onClick={() => setElemOrigin(opt.id)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                        elemOrigin === opt.id ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Row 3: Life Stage */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Life Stage</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'seedling', label: '🌱 Seedling' },
                    { id: 'vegetative', label: '🌿 Vegetative' },
                    { id: 'reproductive', label: '🌸 Reproductive' },
                    { id: 'plant', label: '🌳 Mature Plant' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setElemLifeStage(opt.id)}
                      className={`px-2 py-3 rounded-lg border-2 text-xs font-semibold transition-all text-center ${
                        elemLifeStage === opt.id ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSortSubmit} disabled={!elemPlantType || !elemOrigin || !elemLifeStage || !!elemSortFeedback}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              Confirm Sorting ✓
            </button>
          </div>

          {/* Elementary sort feedback overlay */}
          {elemSortFeedback && (() => {
            const fbWeed = weedMap[elemSortFeedback.weedId];
            const isCorrect = elemSortFeedback.status === 'correct';
            const isPartial = elemSortFeedback.status === 'partial';
            return (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
                <div className={`bg-card border-2 rounded-xl max-w-sm w-full p-5 animate-scale-in ${
                  isCorrect ? 'border-accent' : isPartial ? 'border-primary' : 'border-destructive'
                }`}>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{isCorrect ? '✅' : isPartial ? '🟡' : '❌'}</div>
                    <div className="font-display font-bold text-lg text-foreground">
                      {isCorrect ? 'All Correct!' : isPartial ? 'Partially Correct' : 'Incorrect'}
                    </div>
                    <div className={`text-sm font-semibold ${isCorrect ? 'text-accent' : isPartial ? 'text-primary' : 'text-destructive'}`}>
                      {isCorrect ? '+$150' : isPartial ? '+$50' : '$0'}
                    </div>
                    <div className="text-sm text-foreground mt-1">{fbWeed?.commonName}</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      elemSortFeedback.plantType.isCorrect ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                    }`}>
                      <span>{elemSortFeedback.plantType.isCorrect ? '✅' : '❌'}</span>
                      <span>Plant Type: {elemSortFeedback.plantType.selected === 'monocot' ? 'Monocot' : 'Dicot'}</span>
                      {!elemSortFeedback.plantType.isCorrect && (
                        <span className="ml-auto text-xs">→ {elemSortFeedback.plantType.correct === 'monocot' ? 'Monocot' : 'Dicot'}</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      elemSortFeedback.origin.isCorrect ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                    }`}>
                      <span>{elemSortFeedback.origin.isCorrect ? '✅' : '❌'}</span>
                      <span>Origin: {elemSortFeedback.origin.selected === 'native' ? 'Native' : 'Introduced'}</span>
                      {!elemSortFeedback.origin.isCorrect && (
                        <span className="ml-auto text-xs">→ {elemSortFeedback.origin.correct === 'native' ? 'Native' : 'Introduced'}</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      elemSortFeedback.lifeStage.isCorrect ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                    }`}>
                      <span>{elemSortFeedback.lifeStage.isCorrect ? '✅' : '❌'}</span>
                      <span>Life Stage: {lifeStageLabel(elemSortFeedback.lifeStage.selected)}</span>
                      {!elemSortFeedback.lifeStage.isCorrect && (
                        <span className="ml-auto text-xs">→ {lifeStageLabel(elemSortFeedback.lifeStage.correct)}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={handleSortFeedbackNext}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold hover:opacity-90">
                    {currentSortWeed < unsortedWeeds.length - 1 ? 'Next Weed →' : 'See Results Overview →'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      );
    }

    // Middle: 4-row radio sorting
    if (grade === 'middle') {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <EarningsBar />
          <div className="p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">🗂️ Sort Your Findings</h1>
                <p className="text-xs text-muted-foreground">Classify each weed by selecting one option per row.</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">{currentSortWeed + 1} / {unsortedWeeds.length}</div>
              </div>
            </div>

            <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>

            {/* Current weed card */}
            <div className="bg-card border-2 border-border rounded-xl overflow-hidden mb-6">
              <div className="aspect-square max-h-72 bg-muted overflow-hidden mx-auto flex items-center justify-center">
                <WeedImage weedId={currentW.id} stage="whole" className="w-full h-full object-contain" />
              </div>
              <div className="p-4">
                <div className="font-display font-bold text-lg text-foreground">{currentW.commonName}</div>
                <div className="text-xs text-muted-foreground italic">{currentW.scientificName}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {currentW.traits.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{currentW.habitat}</p>
              </div>
            </div>

            {/* Row 1: Monocot vs Dicot */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Plant Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'monocot', label: '🌾 Monocot' }, { id: 'dicot', label: '🍀 Dicot' }].map(opt => (
                    <button key={opt.id} onClick={() => setMidPlantType(opt.id)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                        midPlantType === opt.id ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Row 2: Native vs Introduced */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Origin</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'native', label: '🏡 Native' }, { id: 'introduced', label: '🌍 Introduced' }].map(opt => (
                    <button key={opt.id} onClick={() => setMidOrigin(opt.id)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                        midOrigin === opt.id ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Row 3: Life Cycle */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Life Cycle</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'annual', label: '📅 Annual' },
                    { id: 'perennial', label: '🔄 Perennial' },
                    { id: 'biennial', label: '2️⃣ Biennial' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setMidLifeCycle(opt.id)}
                      className={`px-3 py-3 rounded-lg border-2 text-xs font-semibold transition-all text-center ${
                        midLifeCycle === opt.id ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>

              {/* Row 4: Habitat/Climate */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Habitat / Climate</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'warm', label: '☀️ Warm-Season / Full Sun' },
                    { id: 'cool', label: '❄️ Cool-Season / Early Spring' },
                    { id: 'wet', label: '💧 Wet / Poorly Drained' },
                    { id: 'dry', label: '🏜️ Dry / Disturbed' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setMidHabitat(opt.id)}
                      className={`px-3 py-3 rounded-lg border-2 text-xs font-semibold transition-all text-center ${
                        midHabitat === opt.id ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                      }`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleSortSubmit} disabled={!midPlantType || !midOrigin || !midLifeCycle || !midHabitat || !!midSortFeedback}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              Confirm Sorting ✓
            </button>
          </div>

          {/* Middle sort feedback overlay */}
          {midSortFeedback && (() => {
            const fbWeed = weedMap[midSortFeedback.weedId];
            const isCorrect = midSortFeedback.status === 'correct';
            const isPartial = midSortFeedback.status === 'partial';
            return (
              <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
                <div className={`bg-card border-2 rounded-xl max-w-sm w-full p-5 animate-scale-in ${
                  isCorrect ? 'border-accent' : isPartial ? 'border-primary' : 'border-destructive'
                }`}>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{isCorrect ? '✅' : isPartial ? '🟡' : '❌'}</div>
                    <div className="font-display font-bold text-lg text-foreground">
                      {isCorrect ? 'All Correct!' : isPartial ? 'Partially Correct' : 'Incorrect'}
                    </div>
                    <div className={`text-sm font-semibold ${isCorrect ? 'text-accent' : isPartial ? 'text-primary' : 'text-destructive'}`}>
                      {isCorrect ? '+$150' : isPartial ? '+$50' : '$0'}
                    </div>
                    <div className="text-sm text-foreground mt-1">{fbWeed?.commonName}</div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      midSortFeedback.plantType.isCorrect ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                    }`}>
                      <span>{midSortFeedback.plantType.isCorrect ? '✅' : '❌'}</span>
                      <span>Plant Type: {midSortFeedback.plantType.selected === 'monocot' ? 'Monocot' : 'Dicot'}</span>
                      {!midSortFeedback.plantType.isCorrect && (
                        <span className="ml-auto text-xs">→ {midSortFeedback.plantType.correct === 'monocot' ? 'Monocot' : 'Dicot'}</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      midSortFeedback.origin.isCorrect ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                    }`}>
                      <span>{midSortFeedback.origin.isCorrect ? '✅' : '❌'}</span>
                      <span>Origin: {midSortFeedback.origin.selected === 'native' ? 'Native' : 'Introduced'}</span>
                      {!midSortFeedback.origin.isCorrect && (
                        <span className="ml-auto text-xs">→ {midSortFeedback.origin.correct === 'native' ? 'Native' : 'Introduced'}</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      midSortFeedback.lifeCycle.isCorrect ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                    }`}>
                      <span>{midSortFeedback.lifeCycle.isCorrect ? '✅' : '❌'}</span>
                      <span>Life Cycle: {midSortFeedback.lifeCycle.selected.charAt(0).toUpperCase() + midSortFeedback.lifeCycle.selected.slice(1)}</span>
                      {!midSortFeedback.lifeCycle.isCorrect && (
                        <span className="ml-auto text-xs">→ {midSortFeedback.lifeCycle.correct.charAt(0).toUpperCase() + midSortFeedback.lifeCycle.correct.slice(1)}</span>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      midSortFeedback.habitat.isCorrect ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
                    }`}>
                      <span>{midSortFeedback.habitat.isCorrect ? '✅' : '❌'}</span>
                      <span>Habitat: {habitatLabel(midSortFeedback.habitat.selected)}</span>
                      {!midSortFeedback.habitat.isCorrect && (
                        <span className="ml-auto text-xs">→ {habitatLabel(midSortFeedback.habitat.correct)}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={handleSortFeedbackNext}
                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold hover:opacity-90">
                    {currentSortWeed < unsortedWeeds.length - 1 ? 'Next Weed →' : 'See Results Overview →'}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      );
    }

    // High: existing multi-category sorting
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <EarningsBar />
        <div className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">🗂️ Sort Your Findings</h1>
              <p className="text-xs text-muted-foreground">Categorize each weed you found. Select ALL categories that apply.</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">{currentSortWeed + 1} / {unsortedWeeds.length}</div>
            </div>
          </div>

          <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>

          {/* Current weed — square photo centered */}
          <div className="bg-card border-2 border-border rounded-xl overflow-hidden mb-6">
            <div className="aspect-square max-h-72 bg-muted overflow-hidden mx-auto flex items-center justify-center">
              <WeedImage weedId={currentW.id} stage="whole" className="w-full h-full object-contain" />
            </div>
            <div className="p-4">
              <div className="font-display font-bold text-lg text-foreground">{currentW.commonName}</div>
              {(grade === 'high' || grade === 'middle') && (
                <div className="text-xs text-muted-foreground italic">{currentW.scientificName}</div>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {currentW.traits.slice(0, 4).map((t, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">{t}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{currentW.habitat}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <p className="text-sm font-semibold text-foreground">Select all categories that apply:</p>
            {SORT_CATEGORIES.map(cat => (
              <button key={cat.id}
                onClick={() => setSelectedSortCats(prev =>
                  prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                )}
                className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                  selectedSortCats.includes(cat.id) ? cat.color + ' ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                }`}>
                <div>
                  <div className="font-semibold text-sm text-foreground">{cat.label}</div>
                  <div className="text-[10px] text-muted-foreground">{cat.description}</div>
                </div>
                {selectedSortCats.includes(cat.id) && <span className="text-primary text-lg">✓</span>}
              </button>
            ))}
          </div>

          <button onClick={handleSortSubmit} disabled={selectedSortCats.length === 0 || !!sortFeedbackResult}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            Confirm Sorting ✓
          </button>
        </div>

        {/* Per-weed sort feedback overlay */}
        {sortFeedbackResult && (() => {
          const fbWeed = weedMap[sortFeedbackResult.weedId];
          const isCorrect = sortFeedbackResult.status === 'correct';
          const isPartial = sortFeedbackResult.status === 'partial';
          const catLabel = (id: SortCategory) => SORT_CATEGORIES.find(c => c.id === id)?.label || id;
          return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
              <div className={`bg-card border-2 rounded-xl max-w-sm w-full p-5 animate-scale-in ${
                isCorrect ? 'border-accent' : isPartial ? 'border-primary' : 'border-destructive'
              }`}>
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{isCorrect ? '✅' : isPartial ? '🟡' : '❌'}</div>
                  <div className="font-display font-bold text-lg text-foreground">
                    {isCorrect ? 'Correct!' : isPartial ? 'Partially Correct' : 'Incorrect'}
                  </div>
                  <div className={`text-sm font-semibold ${isCorrect ? 'text-accent' : isPartial ? 'text-primary' : 'text-destructive'}`}>
                    {isCorrect ? '+$150' : isPartial ? '+$50' : '$0'}
                  </div>
                  <div className="text-sm text-foreground mt-1">{fbWeed?.commonName}</div>
                </div>
                {!isCorrect && (
                  <div className="bg-muted/50 rounded-lg p-3 mb-4 text-xs space-y-1">
                    <div><span className="font-semibold text-foreground">Your picks:</span> {sortFeedbackResult.selectedCats.map(catLabel).join(', ')}</div>
                    <div><span className="font-semibold text-accent">Correct:</span> {sortFeedbackResult.correctCats.map(catLabel).join(', ')}</div>
                  </div>
                )}
                <button onClick={handleSortFeedbackNext}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold hover:opacity-90">
                  {currentSortWeed < unsortedWeeds.length - 1 ? 'Next Weed →' : 'See Results Overview →'}
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // SORT RESULTS SCREEN
  // ═══════════════════════════════════════════════════════════
  if (phase === 'sort-results') {
    // Use elementary results or standard results
    const isElem = grade === 'elementary';
    const resultsToShow = isElem ? elemSortResults : sortResults;
    const correctCount = isElem
      ? elemSortResults.filter(r => r.status === 'correct').length
      : sortResults.filter(r => r.status === 'correct').length;
    const partialCount = isElem
      ? elemSortResults.filter(r => r.status === 'partial').length
      : sortResults.filter(r => r.status === 'partial').length;
    const incorrectCount = isElem
      ? elemSortResults.filter(r => r.status === 'incorrect').length
      : sortResults.filter(r => r.status === 'incorrect').length;
    const totalMoney = correctCount * 150 + partialCount * 50;

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <EarningsBar />
        <div className="p-4 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{correctCount > incorrectCount ? '🎉' : '📋'}</div>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">Sorting Results</h1>
            <p className="text-sm text-muted-foreground">Here's how you categorized the weeds</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-extrabold text-accent">{correctCount}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
              <div className="text-[10px] text-accent">+${correctCount * 150}</div>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-extrabold text-primary">{partialCount}</div>
              <div className="text-xs text-muted-foreground">Partial</div>
              <div className="text-[10px] text-primary">+${partialCount * 50}</div>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-extrabold text-destructive">{incorrectCount}</div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
              <div className="text-[10px] text-destructive">+$0</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <div className="text-center mb-2">
              <span className="font-display font-bold text-lg text-accent">+${totalMoney.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground ml-2">earned from sorting</span>
            </div>
          </div>

          <ScrollArea className="h-72 mb-6">
            <div className="space-y-2">
              {isElem ? (
                elemSortResults.map((r, idx) => {
                  const w = weedMap[r.weedId];
                  return (
                    <div key={idx} className={`p-3 rounded-lg border flex items-center gap-3 ${
                      r.status === 'correct' ? 'bg-accent/5 border-accent/30' :
                      r.status === 'partial' ? 'bg-primary/5 border-primary/30' :
                      'bg-destructive/5 border-destructive/30'
                    }`}>
                      <span className="text-lg shrink-0">{r.status === 'correct' ? '✅' : r.status === 'partial' ? '🟡' : '❌'}</span>
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                        <WeedImage weedId={r.weedId} stage={r.dotImageStage} className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground">{w?.commonName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {r.plantType.isCorrect ? '✅' : '❌'} {r.plantType.selected === 'monocot' ? 'Monocot' : 'Dicot'}
                          {' • '}{r.origin.isCorrect ? '✅' : '❌'} {r.origin.selected === 'native' ? 'Native' : 'Introduced'}
                          {' • '}{r.lifeStage.isCorrect ? '✅' : '❌'} {lifeStageLabel(r.lifeStage.selected)}
                        </div>
                      </div>
                      <span className="text-xs font-bold shrink-0">
                        {r.status === 'correct' ? '+$150' : r.status === 'partial' ? '+$50' : '$0'}
                      </span>
                    </div>
                  );
                })
              ) : (
                sortResults.map((r, idx) => {
                  const w = weedMap[r.weedId];
                  return (
                    <div key={idx} className={`p-3 rounded-lg border flex items-center gap-3 ${
                      r.status === 'correct' ? 'bg-accent/5 border-accent/30' :
                      r.status === 'partial' ? 'bg-primary/5 border-primary/30' :
                      'bg-destructive/5 border-destructive/30'
                    }`}>
                      <span className="text-lg shrink-0">{r.status === 'correct' ? '✅' : r.status === 'partial' ? '🟡' : '❌'}</span>
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
                        <WeedImage weedId={r.weedId} stage="whole" className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground">{w?.commonName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Your picks: {r.selectedCats.map(c => SORT_CATEGORIES.find(s => s.id === c)?.label).join(', ')}
                        </div>
                        {r.status !== 'correct' && (
                          <div className="text-[10px] text-accent">
                            Correct: {r.correctCats.map(c => SORT_CATEGORIES.find(s => s.id === c)?.label).join(', ')}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold shrink-0">
                        {r.status === 'correct' ? '+$150' : r.status === 'partial' ? '+$50' : '$0'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <button onClick={finishSorting}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90">
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // CATEGORIZE REVIEW
  // ═══════════════════════════════════════════════════════════
  if (phase === 'categorize-review') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <EarningsBar />
        <div className="p-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display font-bold text-2xl text-foreground">📊 Sorting Summary</h1>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-extrabold text-accent">{correctDots}</div>
              <div className="text-xs text-muted-foreground">ID'd in Field</div>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-extrabold text-primary">{unsortedWeeds.length}</div>
              <div className="text-xs text-muted-foreground">Sorted</div>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-display font-extrabold text-destructive">{invasiveReports.length}</div>
              <div className="text-xs text-muted-foreground">Invasives</div>
            </div>
          </div>

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
                  {g.label.includes('Perennial') && 'Regrow from roots yearly. Require systemic herbicides or repeated control.'}
                  {g.label.includes('Annual') && 'Complete life cycle in one season. Pre-emergent herbicides are most effective.'}
                  {g.label.includes('Invasive') && 'Must be reported and controlled immediately! High economic injury potential.'}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              if (invasiveReports.length > 0) setPhase('invasive-report');
              else startManagement();
            }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90">
            {invasiveReports.length > 0 ? '🚨 File Invasive Reports →' : '🛠️ Plan Management →'}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // INVASIVE REPORT
  // ═══════════════════════════════════════════════════════════
  if (phase === 'invasive-report') {
    const allSubmitted = invasiveReports.every(r => r.submitted);
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <EarningsBar />
        <div className="p-4 max-w-2xl mx-auto">
          <h1 className="font-display font-bold text-2xl text-foreground mb-2">🚨 Invasive Species Report</h1>
          <p className="text-sm text-muted-foreground mb-6">Complete a field report for each invasive species found.</p>
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
                              }`}>{d}</button>
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
                          setMoney(m => m + 300);
                          setTotalEarnings(e => e + 300);
                          toast.success(`+$300 — Report filed for ${w?.commonName}!`);
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
          <button onClick={startManagement} disabled={!allSubmitted}
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

    if (grade === 'elementary') {
      return (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <EarningsBar />
          <div className="p-4 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">🛠️ Management Plan</h1>
                <p className="text-xs text-muted-foreground">Choose the best way to manage each weed group</p>
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
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                    💡 <span className="font-semibold text-foreground">Tip:</span> Choose the best way to get rid of these weeds!
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-2">What should you do?</h3>
                  <div className="grid gap-2 grid-cols-1">
                    {ELEM_MANAGEMENT_METHODS.map(m => (
                      <button key={m} onClick={() => setSelectedMethod(m)}
                        className={`px-4 py-3 rounded-lg border text-left text-sm transition-all ${
                          selectedMethod === m ? 'border-primary bg-primary/15 ring-2 ring-primary/30' : 'border-border bg-card hover:bg-secondary'
                        }`}>{m}</button>
                    ))}
                  </div>
                </div>
                <button onClick={submitManagement} disabled={!selectedMethod}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                  Apply Management ✓
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <EarningsBar />
        <div className="p-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">🛠️ Management Plan</h1>
              <p className="text-xs text-muted-foreground">Choose the right method and timing for each weed group</p>
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
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                  💡 <span className="font-semibold text-foreground">Tip:</span>{' '}
                  {isGrassGroup && 'Grass weeds require grass-specific herbicides. Broadleaf herbicides will NOT work.'}
                  {isBroadleafGroup && 'Broadleaf weeds need broadleaf herbicides. Grass herbicides will NOT be effective.'}
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
                      }`}>{m}</button>
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
                      }`}>{t}</button>
                  ))}
                </div>
              </div>
              <button onClick={submitManagement} disabled={!selectedMethod || !selectedTiming}
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
  // MANAGEMENT FEEDBACK SCREEN
  // ═══════════════════════════════════════════════════════════
  if (phase === 'mgmt-feedback' && mgmtFeedback && mgmtBest) {
    const isBest = mgmtFeedback.bestChoice;
    const isEffective = mgmtFeedback.effective;
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <EarningsBar />
        <div className="p-4 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{isBest ? '🌟' : isEffective ? '✅' : '❌'}</div>
            <h1 className="font-display font-bold text-2xl text-foreground mb-1">
              {isBest ? 'Best Solution!' : isEffective ? 'Effective Strategy' : 'Ineffective Strategy'}
            </h1>
            <p className={`font-display font-bold text-xl ${isBest ? 'text-accent' : isEffective ? 'text-primary' : 'text-destructive'}`}>
              {isBest ? '+$750' : isEffective ? '+$400' : '-$150'}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <h3 className="font-display font-bold text-sm text-foreground mb-2">Your Choice</h3>
            <div className="text-sm text-foreground mb-1">
              <span className="font-semibold">Method:</span> {mgmtFeedback.method}
            </div>
            {mgmtFeedback.timing !== 'N/A' && (
              <div className="text-sm text-foreground mb-2">
                <span className="font-semibold">Timing:</span> {mgmtFeedback.timing}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">For:</span> {mgmtFeedback.groupLabel}
            </div>
          </div>

          {!isBest && (
            <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 mb-4">
              <h3 className="font-display font-bold text-sm text-accent mb-2">⭐ Best Solution</h3>
              <div className="text-sm text-foreground mb-1">
                <span className="font-semibold">Method:</span> {mgmtBest.method}
              </div>
              {mgmtBest.timing !== 'N/A' && (
                <div className="text-sm text-foreground mb-2">
                  <span className="font-semibold">Timing:</span> {mgmtBest.timing}
                </div>
              )}
            </div>
          )}

          <div className={`rounded-xl p-4 mb-6 ${isBest ? 'bg-accent/10 border border-accent/30' : isEffective ? 'bg-primary/10 border border-primary/30' : 'bg-destructive/10 border border-destructive/30'}`}>
            <h3 className="font-display font-bold text-sm text-foreground mb-2">💡 Why?</h3>
            <p className="text-sm text-muted-foreground">{mgmtBest.explanation}</p>
            {!isEffective && (
              <p className="text-sm text-destructive mt-2">
                Your chosen method ({mgmtFeedback.method}) is not effective against this group because the herbicide class or control method doesn't match the weed type and life cycle.
              </p>
            )}
          </div>

          <button onClick={handleMgmtFeedbackNext}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90">
            {currentMgmtGroup < groups.length - 1 ? 'Next Group →' : hasMultipleSeasons && scoutPhaseIdx < scoutPhases.length - 1 ? 'Next Season →' : 'See Results →'}
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════════════
  if (phase === 'results') {
    const totalYield = yieldResults.reduce((s, r) => s + r.adjustedYield, 0);
    const yearEarnings = totalEarnings + money + totalYield;
    const yearExpenses = TOTAL_EXPENSES * year;
    const netIncome = yearEarnings - yearExpenses;
    const profitable = netIncome >= 0;

    const chartData = yieldResults.map(r => {
      const env = fieldMap[r.fieldId];
      return { name: env?.name?.split(' ')[0] || r.fieldId, fullName: env?.name || r.fieldId, earned: r.adjustedYield, lost: r.weedPenalty, potential: r.baseYield };
    });

    const getResultExplanation = () => {
      const totalDots = fields.reduce((s, f) => s + f.dots.length, 0);
      const scoutRate = totalDotsFound / Math.max(totalDots, 1);
      const correctRate = correctDots / Math.max(totalDotsFound, 1);
      const mgmtEffective = managementActions.filter(a => a.effective).length;
      const mgmtBestCount = managementActions.filter(a => a.bestChoice).length;
      const mgmtTotal = managementActions.length;

      if (grade === 'elementary') {
        const scoutPct = Math.round(scoutRate * 100);
        const emoji = profitable ? '🌟' : '💪';
        return (
          <div className="space-y-2 text-sm">
            <p>{emoji} You found <span className="font-bold text-primary">{scoutPct}%</span> of the weeds in your fields!</p>
            <p>You correctly identified <span className="font-bold text-accent">{correctDots}</span> weeds.</p>
            <p>You sorted <span className="font-bold text-primary">{unsortedWeeds.length}</span> species into groups.</p>
            <p><span className="font-bold">{mgmtBestCount}</span> best solutions and <span className="font-bold">{mgmtEffective - mgmtBestCount}</span> effective solutions chosen.</p>
            {!profitable && <p>Find more weeds and pick the right treatments to earn more next year! 💰</p>}
          </div>
        );
      }

      if (grade === 'middle') {
        return (
          <div className="space-y-2 text-sm">
            <p><span className="font-bold">Scouting:</span> {Math.round(scoutRate * 100)}% coverage • {Math.round(correctRate * 100)}% accuracy</p>
            <p><span className="font-bold">Sorting:</span> {unsortedWeeds.length} species categorized</p>
            <p><span className="font-bold">Management:</span> {mgmtBestCount} best, {mgmtEffective - mgmtBestCount} effective, {mgmtTotal - mgmtEffective} ineffective</p>
            <p className="text-xs text-muted-foreground">Revenue = Sum of (Base Yield × [30% base + 35% scouting + 35% management])</p>
          </div>
        );
      }

      return (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground">Scouting Coverage</div>
              <div className="font-bold">{Math.round(scoutRate * 100)}%</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground">ID Accuracy</div>
              <div className="font-bold">{Math.round(correctRate * 100)}%</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground">Best Solutions</div>
              <div className="font-bold text-accent">{mgmtBestCount}/{mgmtTotal}</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="text-[10px] text-muted-foreground">Invasives Reported</div>
              <div className="font-bold">{invasiveReports.filter(r => r.submitted).length}</div>
            </div>
          </div>
          <p className="text-muted-foreground">Adj. Yield = Base × [0.30 + 0.35 × (Found/Total) + 0.35 × (Effective/Groups)]</p>
          {managementActions.filter(a => !a.effective).map((a, i) => (
            <p key={i} className="text-destructive">✗ {a.method} failed on {a.groupLabel}</p>
          ))}
        </div>
      );
    };

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{profitable ? '🎉' : '😓'}</div>
            <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">Year {year} Results</h1>
            <p className="text-muted-foreground">
              {profitable
                ? `Great work, ${avatar?.label}! Your farm turned a profit!`
                : `Tough year, ${avatar?.label}. Let's analyze what happened.`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground">Total Earnings</div>
              <div className="font-display font-bold text-xl text-accent">${yearEarnings.toLocaleString()}</div>
            </div>
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground">Expenses ({year}yr)</div>
              <div className="font-display font-bold text-xl text-destructive">-${yearExpenses.toLocaleString()}</div>
            </div>
            <div className={`border rounded-lg p-4 text-center ${profitable ? 'bg-accent/15 border-accent/40' : 'bg-destructive/15 border-destructive/40'}`}>
              <div className="text-xs text-muted-foreground">{profitable ? 'Profit' : 'Loss'}</div>
              <div className={`font-display font-bold text-xl ${profitable ? 'text-accent' : 'text-destructive'}`}>
                {netIncome >= 0 ? '+' : '-'}${Math.abs(netIncome).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Revenue from field yields this year */}
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Field Revenue</div>
                <div className="font-display font-bold text-foreground">${totalYield.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Activity Earnings</div>
                <div className="font-display font-bold text-foreground">${(totalEarnings + money).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">📊 Field Yield Breakdown</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'earned' ? 'Revenue' : 'Weed Damage']}
                    labelFormatter={(label: string) => {
                      const item = chartData.find(d => d.name === label);
                      return item?.fullName || label;
                    }}
                  />
                  <Legend formatter={(value) => value === 'earned' ? 'Revenue' : 'Weed Damage'} />
                  <Bar dataKey="earned" stackId="a" fill="hsl(var(--accent))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="lost" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <h3 className="font-display font-bold text-sm text-foreground mb-3">
              {grade === 'elementary' ? '📝 What Happened' : grade === 'middle' ? '📋 Performance Analysis' : '📈 Detailed Analysis'}
            </h3>
            {getResultExplanation()}
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

// ═══════════════════════════════════════════════════════════
// IMMERSIVE FIELD BACKGROUNDS
// ═══════════════════════════════════════════════════════════
function FieldPreview({ fieldId, className }: { fieldId: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className || ''}`}>
      <FieldBackground fieldId={fieldId} />
    </div>
  );
}

function FieldBackground({ fieldId }: { fieldId: string }) {
  switch (fieldId) {
    case 'row-crop':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/30 via-amber-700/20 to-amber-900/40">
          <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-sky-400/20 to-transparent" />
          <div className="absolute inset-x-0 top-[20%] bottom-0">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="flex items-end justify-around" style={{ height: '6.25%' }}>
                {Array.from({ length: 12 }).map((_, j) => (
                  <span key={j} className="text-sm select-none pointer-events-none opacity-40"
                    style={{ transform: `translateY(${Math.sin(i + j) * 2}px)` }}>
                    {(i + j) % 4 === 0 ? '🌽' : '🌿'}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[15%] bg-gradient-to-t from-amber-900/30 to-transparent" />
          <div className="absolute inset-y-[25%] left-[20%] w-px bg-amber-800/15" />
          <div className="absolute inset-y-[25%] left-[22%] w-px bg-amber-800/15" />
          <div className="absolute inset-y-[25%] right-[20%] w-px bg-amber-800/15" />
          <div className="absolute inset-y-[25%] right-[22%] w-px bg-amber-800/15" />
        </div>
      );

    case 'pasture':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/25 via-green-600/25 to-green-800/35">
          <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-sky-400/20 to-transparent" />
          <div className="absolute top-[5%] left-[15%] text-xl opacity-20 select-none pointer-events-none">☁️</div>
          <div className="absolute top-[8%] right-[25%] text-lg opacity-15 select-none pointer-events-none">☁️</div>
          <div className="absolute top-[30%] inset-x-0 bottom-0 opacity-30">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex items-end justify-around" style={{ height: '5%' }}>
                {Array.from({ length: 10 }).map((_, j) => (
                  <span key={j} className="text-xs select-none pointer-events-none">
                    {(i * 10 + j) % 7 === 0 ? '🌾' : '🌿'}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute top-[40%] left-[10%] text-2xl opacity-40 select-none pointer-events-none">🐄</div>
          <div className="absolute top-[55%] right-[15%] text-xl opacity-35 select-none pointer-events-none">🐄</div>
          <div className="absolute top-[65%] left-[45%] text-lg opacity-30 select-none pointer-events-none">🐄</div>
          <div className="absolute top-[50%] right-[40%] text-sm opacity-25 select-none pointer-events-none">🐂</div>
          <div className="absolute bottom-[10%] left-0 right-0 h-px bg-amber-800/20" />
          <div className="absolute bottom-[12%] left-0 right-0 h-px bg-amber-800/15" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="absolute bottom-[8%] w-0.5 h-[6%] bg-amber-800/20" style={{ left: `${12 + i * 11}%` }} />
          ))}
          <div className="absolute top-[25%] right-[10%] text-lg opacity-25 select-none pointer-events-none">🏚️</div>
        </div>
      );

    case 'small-grain':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-200/20 via-yellow-600/25 to-amber-700/30">
          <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-sky-300/20 to-transparent" />
          <div className="absolute top-[22%] inset-x-0 bottom-0 opacity-35">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex items-end justify-around" style={{ height: '5.5%' }}>
                {Array.from({ length: 14 }).map((_, j) => (
                  <span key={j} className="text-xs select-none pointer-events-none"
                    style={{ transform: `rotate(${Math.sin(i + j) * 8}deg)` }}>
                    🌾
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute top-[18%] left-[8%] text-sm opacity-20 select-none pointer-events-none">🏗️</div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent" />
        </div>
      );

    case 'wetland-edge':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-teal-700/25 to-blue-800/40">
          <div className="absolute top-0 left-0 right-0 h-[20%] bg-gradient-to-b from-sky-400/25 to-transparent" />
          <div className="absolute top-[15%] inset-x-0 bottom-[30%] opacity-30">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="absolute" style={{ left: `${5 + i * 12}%`, top: `${10 + Math.sin(i) * 15}%`, bottom: '0' }}>
                <span className="text-lg select-none pointer-events-none">🌿</span>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[35%] bg-gradient-to-t from-blue-900/40 via-blue-700/25 to-transparent">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="absolute text-xs opacity-20 select-none pointer-events-none"
                style={{ left: `${10 + i * 18}%`, top: `${20 + i * 12}%` }}>
                〰️
              </div>
            ))}
          </div>
          <div className="absolute bottom-[25%] left-[30%] text-lg opacity-30 select-none pointer-events-none">🦆</div>
          <div className="absolute bottom-[20%] right-[20%] text-sm opacity-25 select-none pointer-events-none">🦆</div>
          <div className="absolute bottom-[35%] right-[35%] text-lg opacity-20 select-none pointer-events-none">🦢</div>
        </div>
      );

    case 'field-edge':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300/25 via-green-700/20 to-amber-800/30">
          <div className="absolute top-0 left-0 right-0 h-[25%] bg-gradient-to-b from-sky-400/20 to-transparent" />
          <div className="absolute top-[20%] left-0 w-[40%] bottom-0 opacity-25">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex items-end justify-around" style={{ height: '8%' }}>
                {Array.from({ length: 4 }).map((_, j) => (
                  <span key={j} className="text-lg select-none pointer-events-none">🌳</span>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute top-[25%] right-0 w-[55%] bottom-0">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex items-end justify-around opacity-30" style={{ height: '7%' }}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <span key={j} className="text-xs select-none pointer-events-none">
                    {(i + j) % 3 === 0 ? '🌾' : '🌿'}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="absolute top-[20%] left-[38%] w-1 bottom-0 bg-amber-700/15" />
        </div>
      );

    default:
      return <div className="absolute inset-0 bg-gradient-to-b from-sky-300/20 via-green-600/20 to-green-800/30" />;
  }
}
