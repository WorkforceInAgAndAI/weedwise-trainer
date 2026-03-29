import { useState, useMemo, useCallback, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import type { GradeLevel, Weed } from '@/types/game';
import WeedImage from './WeedImage';
import { ArrowLeft, X, Eye, Droplets, Hand, Tractor, Clock, ChevronRight, Wheat, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import fieldBgImage from '@/assets/images/field-background.jpg';

// ── Types ──────────────────────────────────────────────────
type GamePhase = 'setup' | 'playing' | 'event' | 'harvest' | 'results';
type Season = 'spring' | 'early-summer' | 'mid-summer' | 'late-summer' | 'fall';

interface FieldWeed {
  id: string;
  weed: Weed;
  x: number;
  y: number;
  alive: boolean;
  identified: boolean;
  density: number; // plants per sq ft
  stage: 'seedling' | 'vegetative' | 'reproductive' | 'mature';
}

interface EventCard {
  id: string;
  title: string;
  description: string;
  question: string;
  options: { id: string; label: string; correct: boolean; feedback: string }[];
  teachingPoint: string;
  season: Season;
  grades: GradeLevel[];
}

interface ActionLog {
  season: Season;
  action: string;
  detail: string;
  cost: number;
}

interface SeasonData {
  label: string;
  cropStage: string;
  description: string;
}

// ── Constants ──────────────────────────────────────────────
const SEASONS: Record<Season, SeasonData> = {
  'spring': { label: 'Spring Pre-Plant', cropStage: 'Pre-Plant', description: 'Prepare the seedbed and make early decisions before soybeans emerge.' },
  'early-summer': { label: 'Early Summer', cropStage: 'V2-V4 Soybeans', description: 'First weed flush. Critical POST herbicide application window.' },
  'mid-summer': { label: 'Mid-Summer', cropStage: 'V5-V8 Soybeans', description: 'Second weed flush. Rain events may bring new challenges.' },
  'late-summer': { label: 'Late Summer', cropStage: 'V9+ Soybeans', description: 'Weeds approaching maturity. Last chance for intervention.' },
  'fall': { label: 'Fall Harvest', cropStage: 'R6-R8 Soybeans', description: 'Harvest time. Assess the season and calculate yield.' },
};
const SEASON_ORDER: Season[] = ['spring', 'early-summer', 'mid-summer', 'late-summer', 'fall'];
const WEED_STAGE_BY_SEASON: Record<Season, FieldWeed['stage']> = {
  'spring': 'seedling',
  'early-summer': 'seedling',
  'mid-summer': 'vegetative',
  'late-summer': 'reproductive',
  'fall': 'mature',
};

const BASE_YIELD = 50; // bu/acre baseline

// ── Helpers ────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

function generateFieldWeeds(season: Season, count: number): FieldWeed[] {
  const pool = shuffle(weeds).slice(0, count);
  return pool.map((w, i) => ({
    id: `${season}-${i}`,
    weed: w,
    x: 5 + Math.random() * 85,
    y: 10 + Math.random() * 75,
    alive: true,
    identified: false,
    density: Math.floor(Math.random() * 15) + 1,
    stage: WEED_STAGE_BY_SEASON[season],
  }));
}

// ── Event Cards ────────────────────────────────────────────
const ALL_EVENTS: EventCard[] = [
  // Elementary
  { id: 'e1', title: 'Weed or Crop?', description: 'Your scout shows unknown plants in the field. Are these soybeans or weeds?', question: 'Which plant is the CROP (soybean)?', options: [
    { id: 'a', label: 'The plant growing in the crop row with broad trifoliate leaves', correct: true, feedback: 'Correct! Soybeans grow in rows with distinctive trifoliate (three-part) leaves.' },
    { id: 'b', label: 'The plant growing randomly between rows with alternate leaves', correct: false, feedback: 'This is actually a weed. Weeds appear randomly, not in the planted crop rows.' },
  ], teachingPoint: 'Soybeans grow in planted rows with trifoliate leaves. Weeds appear randomly between and within rows.', season: 'early-summer', grades: ['elementary'] },
  { id: 'e2', title: 'Leaf Type Classification', description: 'New weeds have been found in your field. Help classify them by leaf type.', question: 'A weed with narrow, parallel-veined leaves is most likely:', options: [
    { id: 'a', label: 'A grass (monocot)', correct: true, feedback: 'Correct! Parallel veins are the hallmark of monocots (grasses).' },
    { id: 'b', label: 'A broadleaf (dicot)', correct: false, feedback: 'Broadleaf plants have branching (net) veins, not parallel.' },
    { id: 'c', label: 'A fern', correct: false, feedback: 'Ferns have fronds with a different structure entirely.' },
  ], teachingPoint: 'Grass weeds have parallel leaf veins. Broadleaf weeds have branching (net) veins. This distinction affects which herbicides will work.', season: 'early-summer', grades: ['elementary'] },
  { id: 'e3', title: 'Seed Bank Discovery', description: 'You dig into the soil and find hundreds of tiny seeds from last year.', question: 'How long can some weed seeds survive in soil?', options: [
    { id: 'a', label: '1 year', correct: false, feedback: 'Some seeds last longer — much longer.' },
    { id: 'b', label: '5-10 years or more', correct: true, feedback: 'Correct! Many weed seeds can remain dormant for over a decade in the soil seed bank.' },
    { id: 'c', label: 'Only a few weeks', correct: false, feedback: 'Weed seeds are remarkably persistent in the soil.' },
  ], teachingPoint: 'The soil seed bank contains thousands of dormant seeds. One plant can produce tens of thousands of seeds that persist for years.', season: 'spring', grades: ['elementary'] },
  { id: 'e4', title: 'Safe vs. Toxic', description: 'While scouting, you notice cattle near the field edge eating some weeds.', question: 'What should you do about potentially toxic weeds near livestock?', options: [
    { id: 'a', label: 'Ignore it — animals know what to avoid', correct: false, feedback: 'Animals may eat toxic plants if hungry or if the plants are mixed with forage.' },
    { id: 'b', label: 'Identify the weeds and remove any toxic species', correct: true, feedback: 'Correct! Always identify weeds near livestock. Poison hemlock and wild parsnip can be lethal.' },
  ], teachingPoint: 'Some weeds like poison hemlock are highly toxic to livestock and humans. Always identify weeds near grazing areas.', season: 'mid-summer', grades: ['elementary'] },
  { id: 'e5', title: 'How Seeds Travel', description: 'A windstorm is approaching your field.', question: 'Which dispersal method spreads seeds the farthest?', options: [
    { id: 'a', label: 'Wind (light, parachute-like seeds)', correct: true, feedback: 'Correct! Wind-dispersed seeds like marestail can travel miles.' },
    { id: 'b', label: 'Water (heavy seeds in drainage)', correct: false, feedback: 'Water moves seeds along waterways but usually shorter distances.' },
    { id: 'c', label: 'Animals (burr-covered seeds)', correct: false, feedback: 'Animal-dispersed seeds travel moderate distances but not as far as wind.' },
  ], teachingPoint: 'Seeds disperse by wind, water, and animals. Understanding dispersal helps predict where new weeds will appear.', season: 'late-summer', grades: ['elementary'] },
  { id: 'e6', title: 'Control Method Choice', description: 'You found 20 broadleaf weeds in a small patch of your soybean field.', question: 'What is the most practical control method for this situation?', options: [
    { id: 'a', label: 'Hand pull them (small patch, 20 plants)', correct: false, feedback: 'Hand pulling 20 plants is feasible but time-consuming. There may be a better option.' },
    { id: 'b', label: 'Spot-spray with a selective broadleaf herbicide', correct: true, feedback: 'Correct! A selective herbicide targets broadleaf weeds without harming the soybean crop.' },
    { id: 'c', label: 'Do nothing — 20 plants will not hurt', correct: false, feedback: 'Even 20 weeds can produce thousands of seeds that will make next year worse.' },
  ], teachingPoint: 'Matching the control method to the situation saves time and money. Selective herbicides target specific weed types.', season: 'early-summer', grades: ['elementary'] },

  // Middle School
  { id: 'm1', title: 'Scouting Pattern Selection', description: 'You need to scout your 40-acre soybean field for weed populations.', question: 'What is the most efficient walking pattern for accurate weed counts?', options: [
    { id: 'a', label: 'Random walk across the field', correct: false, feedback: 'Random walks miss areas and produce unreliable data.' },
    { id: 'b', label: 'W-pattern (covers the whole field efficiently)', correct: true, feedback: 'Correct! The W-pattern systematically covers the field while sampling diverse areas.' },
    { id: 'c', label: 'Walk only the edges', correct: false, feedback: 'Edge-only scouting misses interior weed populations.' },
  ], teachingPoint: 'The W-pattern is the standard scouting method. Count weeds in sample quadrats along the path to estimate total population.', season: 'spring', grades: ['middle'] },
  { id: 'm2', title: 'Economic Threshold Decision', description: 'Your scout counted 8 weeds per square foot. The economic threshold is 10.', question: 'Should you spray now or wait?', options: [
    { id: 'a', label: 'Spray now — better safe than sorry', correct: false, feedback: 'Spraying below the threshold wastes money and increases resistance risk.' },
    { id: 'b', label: 'Wait and re-scout in 5 days', correct: true, feedback: 'Correct! Below the threshold, the cost of spraying exceeds potential yield loss. Monitor the trend.' },
  ], teachingPoint: 'The pest threshold is the density where control costs less than the yield loss. Below it, wait and monitor.', season: 'mid-summer', grades: ['middle'] },
  { id: 'm3', title: 'Herbicide Selectivity', description: 'Your field has mixed grass and broadleaf weeds. You need to protect the soybeans.', question: 'Which herbicide approach targets broadleaf weeds without harming soybeans?', options: [
    { id: 'a', label: 'Non-selective herbicide (kills everything)', correct: false, feedback: 'A non-selective herbicide would kill your soybeans too.' },
    { id: 'b', label: 'Selective broadleaf herbicide in herbicide-tolerant soybeans', correct: true, feedback: 'Correct! Herbicide-tolerant soybeans allow selective control of broadleaf weeds.' },
    { id: 'c', label: 'Grass-only herbicide', correct: false, feedback: 'This would only control grasses, leaving the broadleaf problem.' },
  ], teachingPoint: 'Selective herbicides target specific weed types. Herbicide-tolerant crop varieties expand chemical control options.', season: 'early-summer', grades: ['middle'] },
  { id: 'm4', title: 'Herbicide Resistance Warning', description: 'A weed survived your herbicide spray. You have used the same herbicide for 5 years.', question: 'What is the most likely cause?', options: [
    { id: 'a', label: 'The herbicide expired', correct: false, feedback: 'While possible, repeated use of the same herbicide is a more common cause.' },
    { id: 'b', label: 'Herbicide resistance from repeated use', correct: true, feedback: 'Correct! Repeated use of the same herbicide selects for resistant individuals.' },
    { id: 'c', label: 'It rained too soon after application', correct: false, feedback: 'Rain can reduce efficacy, but a pattern of survival points to resistance.' },
  ], teachingPoint: 'Herbicide resistance develops when the same mode of action is used repeatedly. Rotate herbicide groups to prevent it.', season: 'mid-summer', grades: ['middle'] },
  { id: 'm5', title: 'Invasive Species Alert', description: 'An aggressive introduced weed has been spotted spreading toward your field.', question: 'Why are invasive species more dangerous than native weeds?', options: [
    { id: 'a', label: 'They have no natural predators in the new environment', correct: true, feedback: 'Correct! Without natural checks, invasive species can spread unchecked.' },
    { id: 'b', label: 'They are always larger than native plants', correct: false, feedback: 'Size is not the key factor — it is the lack of ecological controls.' },
  ], teachingPoint: 'Invasive species lack natural predators, diseases, and competitors in their new environment, allowing rapid population growth.', season: 'late-summer', grades: ['middle'] },
  { id: 'm6', title: 'Life Cycle & Control Timing', description: 'Two weeds are in your field: an annual and a perennial.', question: 'Which requires multiple treatments throughout the season?', options: [
    { id: 'a', label: 'The annual (dies after one season)', correct: false, feedback: 'Annuals complete their lifecycle in one season — a single well-timed application is usually sufficient.' },
    { id: 'b', label: 'The perennial (returns from roots each year)', correct: true, feedback: 'Correct! Perennials regrow from underground structures and need sustained management.' },
  ], teachingPoint: 'Annuals germinate, set seed, and die in one season. Perennials persist for years through root systems, requiring ongoing management.', season: 'early-summer', grades: ['middle'] },

  // High School
  { id: 'h1', title: 'Herbicide Mode of Action', description: 'You need to select herbicides to prevent resistance in your soybean field.', question: 'What is the most effective resistance prevention strategy?', options: [
    { id: 'a', label: 'Use the most effective herbicide every year', correct: false, feedback: 'Repeating the same MOA selects for resistance — even if it is effective now.' },
    { id: 'b', label: 'Rotate between different modes of action each year', correct: true, feedback: 'Correct! Rotating MOA groups prevents any single resistance mechanism from dominating.' },
    { id: 'c', label: 'Increase the application rate each year', correct: false, feedback: 'Higher rates do not prevent resistance and may increase environmental impact.' },
  ], teachingPoint: 'Herbicide modes of action (MOA) describe HOW the chemical kills weeds. Rotating MOA groups disrupts resistance development.', season: 'spring', grades: ['high'] },
  { id: 'h2', title: 'Seed Dormancy Mechanisms', description: 'Seeds in your soil will not germinate despite ideal conditions.', question: 'What mechanism allows seeds to persist for 10+ years in soil?', options: [
    { id: 'a', label: 'Physical dormancy (impermeable seed coat)', correct: true, feedback: 'Correct! A hard seed coat prevents water uptake, keeping the seed dormant until the coat breaks down.' },
    { id: 'b', label: 'The seeds are dead', correct: false, feedback: 'Dormant seeds are alive but in a suspended state of development.' },
    { id: 'c', label: 'Chemical dormancy (growth inhibitors)', correct: false, feedback: 'Chemical dormancy exists but physical dormancy is the primary mechanism for long-term persistence.' },
  ], teachingPoint: 'Physical dormancy through impermeable seed coats is the primary mechanism for long-term seed bank persistence.', season: 'spring', grades: ['high'] },
  { id: 'h3', title: 'Allelopathy in Weed Competition', description: 'Some weed patches show bare soil around their base where nothing else grows.', question: 'What mechanism causes this suppression zone?', options: [
    { id: 'a', label: 'The weed simply shades out other plants', correct: false, feedback: 'Shading is part of competition but the bare zone suggests chemical suppression.' },
    { id: 'b', label: 'Allelopathy — chemical compounds released by roots or leaves', correct: true, feedback: 'Correct! Allelopathic compounds inhibit germination and growth of neighboring plants.' },
  ], teachingPoint: 'Allelopathy is chemical competition — plants release compounds that suppress neighbors. This affects management decisions.', season: 'mid-summer', grades: ['high'] },
  { id: 'h4', title: 'Dynamic Economic Threshold', description: 'It is mid-September and soybeans are at R5 (pod fill). You found 12 weeds per sq ft, exceeding the threshold of 10.', question: 'Should you spray now?', options: [
    { id: 'a', label: 'Yes — the threshold is exceeded', correct: false, feedback: 'Late-season thresholds are adjusted. At R5, weeds cause minimal additional yield loss.' },
    { id: 'b', label: 'No — the economic benefit at this late stage does not justify the cost', correct: true, feedback: 'Correct! The dynamic threshold adjusts based on crop stage. At R5, the cost of treatment exceeds potential benefit.' },
  ], teachingPoint: 'Economic thresholds are dynamic — they change based on crop growth stage, weed maturity, and remaining growing season.', season: 'late-summer', grades: ['high'] },
  { id: 'h5', title: 'Herbicide Injury Diagnosis', description: 'After herbicide application, soybean plants show yellowing and necrotic spots, but nearby weeds are dead.', question: 'What is the most likely cause?', options: [
    { id: 'a', label: 'Herbicide drift from application', correct: true, feedback: 'Correct! The weeds dying confirms the herbicide worked, but soybean injury suggests drift or off-target movement.' },
    { id: 'b', label: 'A disease in the soybeans', correct: false, feedback: 'Disease would not correlate with herbicide application timing.' },
    { id: 'c', label: 'Nutrient deficiency', correct: false, feedback: 'Nutrient issues develop gradually, not immediately after spraying.' },
  ], teachingPoint: 'Herbicide injury symptoms include yellowing, necrosis, and stunting. Drift occurs when application conditions are not ideal.', season: 'mid-summer', grades: ['high'] },
  { id: 'h6', title: 'Crop Variety for Resistance Management', description: 'Your field has developing herbicide resistance. You are selecting soybean varieties for next year.', question: 'What is the best variety rotation strategy?', options: [
    { id: 'a', label: 'Use the same variety every year for consistency', correct: false, feedback: 'Consistency in variety means consistency in herbicide, accelerating resistance.' },
    { id: 'b', label: 'Alternate between different herbicide-tolerant traits (e.g., glyphosate-tolerant then dicamba-tolerant)', correct: true, feedback: 'Correct! Rotating herbicide-tolerant traits allows different MOA herbicides each year.' },
  ], teachingPoint: 'Rotating crop varieties with different herbicide tolerance traits enables herbicide MOA rotation, a key resistance management strategy.', season: 'fall', grades: ['high'] },
];

// ── Management Actions ─────────────────────────────────────
interface MgmtOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  cost: number;
  timeHours: number;
  effectiveness: number; // 0-1
  description: string;
  grades: GradeLevel[];
}

const MGMT_OPTIONS: MgmtOption[] = [
  { id: 'scout', label: 'Scout Field', icon: Eye, cost: 0, timeHours: 1, effectiveness: 0, description: 'Walk the field to identify weeds. Takes time but reveals exact weed locations.', grades: ['elementary', 'middle', 'high'] },
  { id: 'hand-pull', label: 'Hand Pull Weeds', icon: Hand, cost: 0, timeHours: 3, effectiveness: 0.85, description: 'Physically remove weeds. Very effective for small populations but labor-intensive.', grades: ['elementary', 'middle', 'high'] },
  { id: 'herbicide-pre', label: 'Pre-Emergent Herbicide', icon: Droplets, cost: 15, timeHours: 0.5, effectiveness: 0.9, description: 'Chemical barrier applied before weeds emerge. Most effective in spring.', grades: ['middle', 'high'] },
  { id: 'herbicide-post', label: 'Post-Emergent Herbicide', icon: Droplets, cost: 20, timeHours: 0.5, effectiveness: 0.85, description: 'Spray applied to actively growing weeds. Best at V2-V4 when weeds are small.', grades: ['elementary', 'middle', 'high'] },
  { id: 'cultivate', label: 'Cultivate / Till', icon: Tractor, cost: 8, timeHours: 1.5, effectiveness: 0.7, description: 'Mechanical tillage between crop rows. Buries surface weeds but may disturb soil.', grades: ['middle', 'high'] },
  { id: 'wait', label: 'Wait & Observe', icon: Clock, cost: 0, timeHours: 0, effectiveness: 0, description: 'Skip intervention and let a week pass. More weeds may grow — or the crop may outcompete them.', grades: ['elementary', 'middle', 'high'] },
];

// ── Main Component ─────────────────────────────────────────
export default function FarmMode({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [fieldWeeds, setFieldWeeds] = useState<FieldWeed[]>([]);
  const [actionLog, setActionLog] = useState<ActionLog[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [weedsKilled, setWeedsKilled] = useState(0);
  const [currentEvent, setCurrentEvent] = useState<EventCard | null>(null);
  const [eventAnswer, setEventAnswer] = useState<string | null>(null);
  const [eventsAnswered, setEventsAnswered] = useState(0);
  const [eventsCorrect, setEventsCorrect] = useState(0);
  const [selectedWeed, setSelectedWeed] = useState<FieldWeed | null>(null);

  const seasonIdx = SEASON_ORDER.indexOf(currentSeason);
  const seasonInfo = SEASONS[currentSeason];

  // Initialize field weeds for current season
  const initSeason = useCallback((season: Season) => {
    const count = grade === 'elementary' ? 6 : grade === 'middle' ? 8 : 10;
    const newWeeds = generateFieldWeeds(season, count);
    setFieldWeeds(prev => [...prev.filter(w => w.alive), ...newWeeds]);
  }, [grade]);

  // Start game
  const startGame = (g: GradeLevel) => {
    setGrade(g);
    setPhase('playing');
    setCurrentSeason('spring');
    const count = g === 'elementary' ? 6 : g === 'middle' ? 8 : 10;
    setFieldWeeds(generateFieldWeeds('spring', count));
  };

  // Apply management action
  const applyAction = (opt: MgmtOption) => {
    if (opt.id === 'scout') {
      setFieldWeeds(prev => prev.map(w => ({ ...w, identified: true })));
    } else if (opt.id === 'wait') {
      // More weeds may emerge
      if (Math.random() > 0.5) {
        const extras = generateFieldWeeds(currentSeason, 2);
        setFieldWeeds(prev => [...prev, ...extras]);
      }
    } else {
      // Apply control - kill some weeds
      const killRate = opt.effectiveness * (currentSeason === 'early-summer' ? 1.1 : currentSeason === 'spring' && opt.id === 'herbicide-pre' ? 1.2 : 0.9);
      let killed = 0;
      setFieldWeeds(prev => prev.map(w => {
        if (w.alive && Math.random() < killRate) { killed++; return { ...w, alive: false }; }
        return w;
      }));
      setWeedsKilled(prev => prev + killed);
    }
    setTotalCost(prev => prev + opt.cost);
    setTotalHours(prev => prev + opt.timeHours);
    setActionLog(prev => [...prev, { season: currentSeason, action: opt.label, detail: `Cost: $${opt.cost}/acre, Time: ${opt.timeHours}h`, cost: opt.cost }]);
  };

  // Advance to next season
  const advanceSeason = () => {
    const nextIdx = seasonIdx + 1;
    if (nextIdx >= SEASON_ORDER.length) {
      setPhase('harvest');
      return;
    }

    const nextSeason = SEASON_ORDER[nextIdx];
    setCurrentSeason(nextSeason);

    // Update existing weeds to new stage
    setFieldWeeds(prev => prev.map(w => ({
      ...w,
      stage: WEED_STAGE_BY_SEASON[nextSeason],
      density: w.alive ? Math.min(w.density + Math.floor(Math.random() * 3), 20) : w.density,
    })));

    // Maybe add new weeds
    if (nextSeason !== 'fall') {
      const extras = generateFieldWeeds(nextSeason, grade === 'elementary' ? 3 : 5);
      setFieldWeeds(prev => [...prev, ...extras]);
    }

    // Trigger event card
    const gradeEvents = ALL_EVENTS.filter(e => e.grades.includes(grade!) && e.season === nextSeason);
    if (gradeEvents.length > 0) {
      const event = gradeEvents[Math.floor(Math.random() * gradeEvents.length)];
      setCurrentEvent(event);
      setEventAnswer(null);
      setPhase('event');
    }
  };

  // Calculate final yield
  const finalYield = useMemo(() => {
    const aliveWeeds = fieldWeeds.filter(w => w.alive);
    const totalDensity = aliveWeeds.reduce((s, w) => s + w.density, 0);
    const yieldLoss = Math.min(totalDensity * 0.3, 25); // Max 25 bu loss
    return Math.max(BASE_YIELD - yieldLoss, 20);
  }, [fieldWeeds]);

  const aliveCount = fieldWeeds.filter(w => w.alive).length;
  const totalCount = fieldWeeds.length;
  const availableActions = MGMT_OPTIONS.filter(o => o.grades.includes(grade!));

  // ── Setup Screen ─────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-12 text-center">
          <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Wheat className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">Soybean Farm Simulator</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">Manage a soybean field through a full growing season. Scout for weeds, make management decisions, respond to events, and harvest your crop.</p>

          <h2 className="font-display font-bold text-lg text-foreground mb-4">Select Difficulty</h2>
          <div className="grid gap-3">
            {[
              { grade: 'elementary' as GradeLevel, label: 'Elementary (K-5)', desc: '6 weeds per phase, simpler decisions, 6 events', events: '6' },
              { grade: 'middle' as GradeLevel, label: 'Middle School (6-8)', desc: '8 weeds per phase, economic thresholds, 8 events', events: '8' },
              { grade: 'high' as GradeLevel, label: 'High School (9-12)', desc: '10 weeds, advanced reasoning, 10 events', events: '10' },
            ].map(g => (
              <button key={g.grade} onClick={() => startGame(g.grade)}
                className="p-5 rounded-lg border border-border bg-card shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all text-left">
                <h3 className="font-semibold text-foreground">{g.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{g.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Event Card Screen ────────────────────────────────────
  if (phase === 'event' && currentEvent) {
    const answered = eventAnswer !== null;
    const selectedOpt = currentEvent.options.find(o => o.id === eventAnswer);

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Event Card — {seasonInfo.label}</p>
              <h2 className="font-display font-bold text-xl text-foreground">{currentEvent.title}</h2>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5 mb-6 shadow-card">
            <p className="text-foreground leading-relaxed mb-4">{currentEvent.description}</p>
            <p className="font-semibold text-foreground">{currentEvent.question}</p>
          </div>

          <div className="space-y-2 mb-6">
            {currentEvent.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  if (!answered) {
                    setEventAnswer(opt.id);
                    setEventsAnswered(p => p + 1);
                    if (opt.correct) setEventsCorrect(p => p + 1);
                  }
                }}
                disabled={answered}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  !answered ? 'border-border bg-card hover:border-primary/30 hover:shadow-subtle' :
                  opt.correct ? 'border-success bg-success/5' :
                  opt.id === eventAnswer ? 'border-error bg-error/5' :
                  'border-border bg-card opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {answered && opt.correct && <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />}
                  {answered && !opt.correct && opt.id === eventAnswer && <XCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />}
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    {answered && (opt.correct || opt.id === eventAnswer) && (
                      <p className="text-xs text-muted-foreground mt-1">{opt.feedback}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {answered && (
            <div className="animate-fade-in">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Teaching Point</p>
                <p className="text-sm text-foreground">{currentEvent.teachingPoint}</p>
              </div>
              <button onClick={() => setPhase('playing')}
                className="w-full py-3 rounded-md bg-success text-success-foreground font-semibold hover:opacity-90 transition-opacity">
                Continue Managing Field <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Harvest Screen ───────────────────────────────────────
  if (phase === 'harvest') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-12 text-center">
          <div className="w-16 h-16 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Wheat className="w-8 h-8 text-success" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">Harvest Time</h1>
          <p className="text-muted-foreground mb-8">The combine is rolling through your soybean field.</p>

          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card mb-8">
            <div className="relative h-48">
              <img src={fieldBgImage} alt="Soybean field" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="font-display font-bold text-4xl text-foreground">{finalYield.toFixed(1)} bu/acre</p>
                <p className="text-sm text-muted-foreground">{finalYield >= 45 ? 'Excellent yield' : finalYield >= 38 ? 'Good yield' : 'Below average — weeds impacted production'}</p>
              </div>
            </div>
          </div>

          <button onClick={() => setPhase('results')}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            View Season Summary
          </button>
        </div>
      </div>
    );
  }

  // ── Results Screen ───────────────────────────────────────
  if (phase === 'results') {
    const matureWeeds = fieldWeeds.filter(w => w.alive && w.stage === 'mature');
    const seedsProduced = matureWeeds.length * 5000; // rough estimate

    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8">
          <h1 className="font-display font-bold text-2xl text-foreground mb-6">Season Summary</h1>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Final Yield', value: `${finalYield.toFixed(1)} bu/acre` },
              { label: 'Total Cost', value: `$${totalCost}/acre` },
              { label: 'Hours Worked', value: `${totalHours.toFixed(1)}h` },
              { label: 'Weeds Controlled', value: `${weedsKilled}/${totalCount}` },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-lg p-4 text-center shadow-card">
                <p className="font-display font-bold text-xl text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Events performance */}
          <div className="bg-card border border-border rounded-lg p-5 mb-6 shadow-card">
            <h3 className="font-display font-bold text-foreground mb-2">Knowledge Events</h3>
            <p className="text-sm text-muted-foreground">{eventsCorrect}/{eventsAnswered} questions answered correctly</p>
          </div>

          {/* Weeds that set seed */}
          {matureWeeds.length > 0 && (
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-5 mb-6">
              <h3 className="font-semibold text-foreground mb-2">Weeds That Set Seed</h3>
              <p className="text-sm text-muted-foreground mb-3">{matureWeeds.length} weeds reached maturity and produced an estimated {seedsProduced.toLocaleString()} seeds — these will be in the soil for years.</p>
              <div className="flex flex-wrap gap-2">
                {matureWeeds.map(w => (
                  <span key={w.id} className="px-2 py-1 rounded-md bg-card border border-border text-xs text-foreground">{w.weed.commonName}</span>
                ))}
              </div>
            </div>
          )}

          {/* Action log */}
          <div className="bg-card border border-border rounded-lg p-5 mb-6 shadow-card">
            <h3 className="font-display font-bold text-foreground mb-3">Decision History</h3>
            <div className="space-y-2">
              {actionLog.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{SEASONS[a.season].label}</span>
                  <span className="text-foreground font-medium">{a.action}</span>
                  <span className="text-muted-foreground ml-auto">{a.detail}</span>
                </div>
              ))}
              {actionLog.length === 0 && <p className="text-sm text-muted-foreground">No actions taken this season.</p>}
            </div>
          </div>

          {/* Reflection */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-8">
            <h3 className="font-semibold text-foreground mb-2">Reflection</h3>
            <p className="text-sm text-foreground">What would you do differently next season? Consider your timing, herbicide choices, and scouting frequency.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setPhase('setup'); setFieldWeeds([]); setActionLog([]); setTotalCost(0); setTotalHours(0); setWeedsKilled(0); setEventsAnswered(0); setEventsCorrect(0); setGrade(null); }}
              className="flex-1 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
              Play Again
            </button>
            <button onClick={onClose}
              className="flex-1 py-3 rounded-md border border-border bg-card text-foreground font-semibold hover:bg-secondary transition-colors">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Playing Screen ──────────────────────────────────
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="font-display font-bold text-foreground">{seasonInfo.label}</p>
            <p className="text-xs text-muted-foreground">{seasonInfo.cropStage}</p>
          </div>
        </div>

        {/* Season progress */}
        <div className="flex items-center gap-1">
          {SEASON_ORDER.map((s, i) => (
            <div key={s} className={`w-8 h-1.5 rounded-full transition-colors ${
              i < seasonIdx ? 'bg-success' : i === seasonIdx ? 'bg-primary' : 'bg-border'
            }`} title={SEASONS[s].label} />
          ))}
        </div>

        <div className="text-right text-xs text-muted-foreground">
          <div>Cost: ${totalCost}/acre</div>
          <div>Hours: {totalHours.toFixed(1)}</div>
        </div>
      </div>

      {/* Main content - left/right split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Field Visualization (70%) */}
        <div className="flex-[7] flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            {/* Field background */}
            <img src={fieldBgImage} alt="Soybean field" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/10" />

            {/* Weed dots */}
            {fieldWeeds.map(fw => (
              <button
                key={fw.id}
                onClick={() => setSelectedWeed(fw)}
                className={`absolute w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  !fw.alive ? 'opacity-20 border-muted-foreground bg-muted-foreground/30 pointer-events-none' :
                  fw.identified ? 'border-success bg-success/30 hover:scale-125' :
                  'border-warning bg-warning/30 hover:scale-125 animate-pulse'
                }`}
                style={{ left: `${fw.x}%`, top: `${fw.y}%`, transform: 'translate(-50%,-50%)' }}
                title={fw.identified ? fw.weed.commonName : 'Unidentified weed'}
              />
            ))}

            {/* Selected weed popup */}
            {selectedWeed && selectedWeed.alive && (
              <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-card border border-border rounded-lg p-4 shadow-card-hover animate-slide-up z-10">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
                    <WeedImage weedId={selectedWeed.weed.id} stage={selectedWeed.stage} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{selectedWeed.identified ? selectedWeed.weed.commonName : '???'}</p>
                    {selectedWeed.identified && (
                      <>
                        <p className="text-xs text-muted-foreground">{selectedWeed.weed.plantType} · {selectedWeed.weed.lifeCycle}</p>
                        <p className="text-xs text-muted-foreground">Density: {selectedWeed.density} plants/sq ft</p>
                      </>
                    )}
                  </div>
                  <button onClick={() => setSelectedWeed(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Season description */}
          <div className="border-t border-border bg-card px-4 py-3">
            <p className="text-sm text-foreground">{seasonInfo.description}</p>
            <p className="text-xs text-muted-foreground mt-1">Active weeds: {aliveCount} · Identified: {fieldWeeds.filter(w => w.identified).length} · Controlled: {weedsKilled}</p>
          </div>
        </div>

        {/* Right: Management Panel (30%) */}
        <div className="flex-[3] border-l border-border bg-card overflow-y-auto hidden sm:flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-display font-bold text-foreground text-sm mb-1">Management Decisions</h3>
            <p className="text-xs text-muted-foreground">Choose an action for this phase</p>
          </div>

          <div className="p-4 space-y-2 flex-1">
            {availableActions.map(opt => (
              <button
                key={opt.id}
                onClick={() => applyAction(opt)}
                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/30 hover:shadow-subtle transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <opt.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground text-sm">{opt.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {opt.cost > 0 && <span>${opt.cost}/acre</span>}
                  {opt.timeHours > 0 && <span>{opt.timeHours}h</span>}
                  {opt.effectiveness > 0 && <span>{Math.round(opt.effectiveness * 100)}% effective</span>}
                </div>
              </button>
            ))}
          </div>

          {/* Advance season button */}
          <div className="p-4 border-t border-border">
            <button onClick={advanceSeason}
              className="w-full py-3 rounded-md bg-success text-success-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              {currentSeason === 'late-summer' ? 'Harvest' : 'Next Season'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Bottom action bar */}
      <div className="sm:hidden border-t border-border bg-card p-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {availableActions.slice(0, 4).map(opt => (
            <button key={opt.id} onClick={() => applyAction(opt)}
              className="shrink-0 px-3 py-2 rounded-md border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5">
              <opt.icon className="w-3.5 h-3.5 text-primary" /> {opt.label}
            </button>
          ))}
          <button onClick={advanceSeason}
            className="shrink-0 px-4 py-2 rounded-md bg-success text-success-foreground text-xs font-bold">
            {currentSeason === 'late-summer' ? 'Harvest' : 'Next'} <ChevronRight className="w-3 h-3 inline" />
          </button>
        </div>
      </div>
    </div>
  );
}
