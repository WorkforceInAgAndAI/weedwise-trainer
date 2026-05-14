import { useState, useMemo, useCallback } from 'react';
import { weeds } from '@/data/weeds';
import type { GradeLevel, Weed } from '@/types/game';
import WeedImage from './WeedImage';
import { ArrowLeft, X, Eye, Droplets, Hand, Tractor, Clock, ChevronRight, Wheat, AlertTriangle, CheckCircle2, XCircle, Camera, Plane, Bot, Crosshair, Settings2, Sprout, Ruler } from 'lucide-react';
import HomeButton from './HomeButton';
import fieldBgImage from '@/assets/images/field-background.jpg';

// Types 
type GamePhase = 'setup' | 'playing' | 'scouting' | 'identifying' | 'managing' | 'event' | 'harvest' | 'results';
type Season = 'spring' | 'early-summer' | 'mid-summer' | 'late-summer' | 'fall';
type ScoutMethod = 'manual' | 'drone' | 'rover';

interface FieldWeed {
 id: string;
 weed: Weed;
 x: number;
 y: number;
 alive: boolean;
 identified: boolean;
 scouted: boolean;
 density: number;
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

// Constants 
const SEASONS: Record<Season, SeasonData> = {
 'spring':       { label: 'Year 1 — Establishment',  cropStage: 'First Soybean Crop',     description: 'Year 1 of your soybean rotation. Build the seed bank picture, choose early controls.' },
 'early-summer': { label: 'Early Summer',            cropStage: 'V2-V4 Soybeans',         description: 'First weed flush. Critical POST herbicide application window.' },
 'mid-summer':   { label: 'Year 2 — Building',       cropStage: 'Second Soybean Crop',    description: 'Year 2. Carry-over weeds returning. Decisions made last year matter now.' },
 'late-summer':  { label: 'Late Summer',             cropStage: 'V9+ Soybeans',           description: 'Weeds approaching maturity. Last chance for intervention.' },
 'fall':         { label: 'Year 3 — Harvest',        cropStage: 'Third Soybean Crop',     description: 'Year 3. Final crop — your three-year management strategy is judged here.' },
};
const SEASON_ORDER: Season[] = ['spring', 'mid-summer', 'fall'];
const WEED_STAGE_BY_SEASON: Record<Season, FieldWeed['stage']> = {
 'spring': 'seedling', 'early-summer': 'seedling', 'mid-summer': 'vegetative', 'late-summer': 'reproductive', 'fall': 'mature',
};

const BASE_YIELD = 50;

const SCOUT_METHODS: { id: ScoutMethod; label: string; icon: React.ComponentType<{ className?: string }>; cost: number; timeHours: number; accuracy: number; gradeDesc: Record<GradeLevel, string> }[] = [
 { id: 'manual', label: 'Manual Scouting', icon: Camera, cost: 0, timeHours: 3, accuracy: 0.7, gradeDesc: { elementary: 'Walk through the field and take pictures of any plants you see.', middle: 'Walk a W-pattern through the field photographing weeds in sample quadrats.', high: 'Systematic W-pattern scouting with GPS-tagged photos and quadrat sampling.' } },
 { id: 'drone', label: 'Drone Survey', icon: Plane, cost: 25, timeHours: 0.5, accuracy: 0.9, gradeDesc: { elementary: 'Fly a camera over the field to see weeds from above.', middle: 'Multispectral drone survey detects weed patches by color differences.', high: 'NDVI-enabled drone survey with AI patch detection and density mapping.' } },
 { id: 'rover', label: 'Soil Rover', icon: Bot, cost: 15, timeHours: 1.5, accuracy: 0.85, gradeDesc: { elementary: 'Send a little robot to drive through the field and find baby weeds.', middle: 'Ground-based rover scans soil level detecting seedlings missed by aerial views.', high: 'Autonomous rover with close-range imaging for seedling detection and soil seed bank sampling.' } },
];

const HERBICIDE_PRODUCTS = [
 { id: 'glyphosate', label: 'Glyphosate (Non-selective)', effectiveness: 0.92, cost: 18, broadleaf: true, grass: true },
 { id: 'dicamba', label: 'Dicamba (Broadleaf selective)', effectiveness: 0.88, cost: 22, broadleaf: true, grass: false },
 { id: '2-4-d', label: '2,4-D (Broadleaf selective)', effectiveness: 0.85, cost: 14, broadleaf: true, grass: false },
 { id: 'sethoxydim', label: 'Sethoxydim (Grass selective)', effectiveness: 0.87, cost: 20, broadleaf: false, grass: true },
 { id: 'ppo-inhibitor', label: 'PPO Inhibitor (Burndown)', effectiveness: 0.80, cost: 16, broadleaf: true, grass: true },
];

const NOZZLE_TYPES = [
 { id: 'flat-fan', label: 'Flat-Fan Nozzle', driftRisk: 0.3, coverage: 0.85, desc: 'Standard coverage, moderate drift risk.' },
 { id: 'air-induction', label: 'Air-Induction Nozzle', driftRisk: 0.1, coverage: 0.80, desc: 'Larger droplets reduce drift significantly.' },
 { id: 'drift-reducing', label: 'Drift-Reducing Nozzle', driftRisk: 0.05, coverage: 0.75, desc: 'Minimal drift but reduced coverage.' },
];

const SPRAY_SPEEDS = [
 { id: 'slow', label: 'Slow & Careful', driftMult: 0.7, timeMult: 2.0, coverageMult: 1.1 },
 { id: 'medium', label: 'Medium Pace', driftMult: 1.0, timeMult: 1.0, coverageMult: 1.0 },
 { id: 'fast', label: 'Fast', driftMult: 1.5, timeMult: 0.5, coverageMult: 0.85 },
];

const SPRAY_HEIGHTS = [
 { id: 'low', label: '12 inches', driftMult: 0.6, coverageMult: 0.9, desc: 'Low boom — minimal drift, tighter coverage pattern.' },
 { id: 'standard', label: '20 inches', driftMult: 1.0, coverageMult: 1.0, desc: 'Standard height — balanced coverage and drift.' },
 { id: 'high', label: '30 inches', driftMult: 1.4, coverageMult: 1.05, desc: 'High boom — wider coverage but increased drift risk.' },
];

const TILLAGE_TYPES = [
 { id: 'cultivator', label: 'Row Cultivator', cost: 8, timeHours: 1.5, effectiveness: 0.7, desc: 'Cultivates between crop rows. Good for small weeds.' },
 { id: 'disc', label: 'Disc Harrow', cost: 12, timeHours: 1, effectiveness: 0.8, desc: 'More aggressive. Buries weeds but disturbs more soil.' },
 { id: 'rotary-hoe', label: 'Rotary Hoe', cost: 6, timeHours: 0.5, effectiveness: 0.5, desc: 'Light tillage for very small seedlings. Fast and cheap.' },
];

// Helpers 
function shuffle<T>(arr: T[]): T[] {
 const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}

function generateFieldWeeds(season: Season, count: number): FieldWeed[] {
 const pool = shuffle(weeds).slice(0, count);
 return pool.map((w, i) => ({
 id: `${season}-${i}-${Date.now()}`,
 weed: w,
 x: 5 + Math.random() * 85,
 y: 10 + Math.random() * 75,
 alive: true,
 identified: false,
 scouted: false,
 density: Math.floor(Math.random() * 15) + 1,
 stage: WEED_STAGE_BY_SEASON[season],
 }));
}

// Event Cards 
const ALL_EVENTS: EventCard[] = [
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

// Main Component 
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

 // Multi-step state
 const [selectedWeed, setSelectedWeed] = useState<FieldWeed | null>(null);
 const [hasScouted, setHasScouted] = useState(false);
 const [scoutMethod, setScoutMethod] = useState<ScoutMethod | null>(null);
 const [scoutAnimating, setScoutAnimating] = useState(false);
 const [idTarget, setIdTarget] = useState<FieldWeed | null>(null);
 const [idOptions, setIdOptions] = useState<string[]>([]);
 const [idPicked, setIdPicked] = useState<string | null>(null);
 const [idResult, setIdResult] = useState<'correct' | 'wrong' | null>(null);

 // Management sub-step
 const [mgmtMode, setMgmtMode] = useState<'choose' | 'herbicide-config' | 'tillage-config' | 'hand-pull' | 'applying' | 'result' | null>(null);
 const [mgmtAction, setMgmtAction] = useState<string | null>(null);
 const [herbProduct, setHerbProduct] = useState(HERBICIDE_PRODUCTS[0].id);
 const [herbNozzle, setHerbNozzle] = useState(NOZZLE_TYPES[0].id);
 const [herbSpeed, setHerbSpeed] = useState(SPRAY_SPEEDS[1].id);
 const [herbHeight, setHerbHeight] = useState(SPRAY_HEIGHTS[1].id);
 const [tillageType, setTillageType] = useState(TILLAGE_TYPES[0].id);
 const [mgmtFeedback, setMgmtFeedback] = useState<string | null>(null);
 const [driftWarning, setDriftWarning] = useState(false);

 const seasonIdx = SEASON_ORDER.indexOf(currentSeason);
 const seasonInfo = SEASONS[currentSeason];

 const startGame = (g: GradeLevel) => {
 setGrade(g);
 setPhase('playing');
 setCurrentSeason('spring');
 const count = g === 'elementary' ? 6 : g === 'middle' ? 8 : 10;
 setFieldWeeds(generateFieldWeeds('spring', count));
 setHasScouted(false);
 };

 // Scouting 
 const startScouting = (method: ScoutMethod) => {
 const sm = SCOUT_METHODS.find(m => m.id === method)!;
 setScoutMethod(method);
 setScoutAnimating(true);
 setTotalCost(prev => prev + sm.cost);
 setTotalHours(prev => prev + sm.timeHours);
 setActionLog(prev => [...prev, { season: currentSeason, action: `Scouted (${sm.label})`, detail: `Cost: $${sm.cost}, Time: ${sm.timeHours} hours`, cost: sm.cost }]);

 setTimeout(() => {
 setFieldWeeds(prev => prev.map(w => {
 if (!w.alive) return w;
 return { ...w, scouted: Math.random() < sm.accuracy };
 }));
 setScoutAnimating(false);
 setHasScouted(true);
 setPhase('playing');
 }, 2500);
 };

 // Identification 
 const startIdentify = useCallback((fw: FieldWeed) => {
 setIdTarget(fw);
 setIdPicked(null);
 setIdResult(null);
 const correctName = grade === 'high' ? fw.weed.scientificName : fw.weed.commonName;
 const pool = shuffle(weeds.filter(w => w.id !== fw.weed.id)).slice(0, 3).map(w => grade === 'high' ? w.scientificName : w.commonName);
 const options = shuffle([correctName, ...pool]);
 setIdOptions(options);
 }, [grade]);

 const submitId = (picked: string) => {
 if (!idTarget) return;
 setIdPicked(picked);
 const correctName = grade === 'high' ? idTarget.weed.scientificName : idTarget.weed.commonName;
 if (picked === correctName) {
 setIdResult('correct');
 setFieldWeeds(prev => prev.map(w => w.id === idTarget.id ? { ...w, identified: true } : w));
 } else {
 setIdResult('wrong');
 }
 };

 const finishIdRound = () => {
 setIdTarget(null);
 setIdPicked(null);
 setIdResult(null);
 };

 const doneIdentifying = () => {
 setPhase('managing');
 setMgmtMode('choose');
 };

 // Management 
 const chooseManagement = (action: string) => {
 setMgmtAction(action);
 if (action === 'herbicide') setMgmtMode('herbicide-config');
 else if (action === 'tillage') setMgmtMode('tillage-config');
 else if (action === 'hand-pull') setMgmtMode('hand-pull');
 else if (action === 'wait') applyWait();
 };

 // Herbicide preview calculation
 const herbPreview = useMemo(() => {
 const product = HERBICIDE_PRODUCTS.find(p => p.id === herbProduct)!;
 const nozzle = NOZZLE_TYPES.find(n => n.id === herbNozzle)!;
 const speed = SPRAY_SPEEDS.find(s => s.id === herbSpeed)!;
 const height = SPRAY_HEIGHTS.find(h => h.id === herbHeight)!;
 const effectiveCoverage = Math.min(nozzle.coverage * speed.coverageMult * height.coverageMult, 1);
 const driftRisk = Math.min(nozzle.driftRisk * speed.driftMult * height.driftMult, 1);
 const timeHours = 0.5 * speed.timeMult;
 const targetable = fieldWeeds.filter(w => w.alive && ((w.weed.plantType === 'Dicot' && product.broadleaf) || (w.weed.plantType === 'Monocot' && product.grass))).length;
 const estKill = Math.round(targetable * product.effectiveness * effectiveCoverage);
 return { product, nozzle, speed, height, effectiveCoverage, driftRisk, timeHours, targetable, estKill };
 }, [herbProduct, herbNozzle, herbSpeed, herbHeight, fieldWeeds]);

 const applyHerbicide = () => {
 const { product, effectiveCoverage, driftRisk, timeHours } = herbPreview;
 setMgmtMode('applying');
 setDriftWarning(driftRisk > 0.25);
 setTotalCost(prev => prev + product.cost);
 setTotalHours(prev => prev + timeHours);

 const feedback: string[] = [];
 if (driftRisk > 0.25) {
 feedback.push(`Drift risk is high (${Math.round(driftRisk * 100)}%). Some herbicide drifted off-target, potentially damaging neighboring crops.`);
 }

 setTimeout(() => {
 let killed = 0;
 setFieldWeeds(prev => prev.map(w => {
 if (!w.alive) return w;
 const isTarget = (w.weed.plantType === 'Dicot' && product.broadleaf) || (w.weed.plantType === 'Monocot' && product.grass);
 const killChance = isTarget ? product.effectiveness * effectiveCoverage : product.effectiveness * effectiveCoverage * 0.3;
 if (Math.random() < killChance) { killed++; return { ...w, alive: false }; }
 return w;
 }));
 setWeedsKilled(prev => prev + killed);
 feedback.push(`${product.label}: ${killed} weeds controlled.`);
 setMgmtFeedback(feedback.join(' '));
 setMgmtMode('result');
 setActionLog(prev => [...prev, { season: currentSeason, action: `Herbicide: ${product.label}`, detail: `Nozzle: ${herbPreview.nozzle.label}, Speed: ${herbPreview.speed.label}, Height: ${herbPreview.height.label}, Cost: $${product.cost}`, cost: product.cost }]);
 }, 2000);
 };

 const applyTillage = () => {
 const till = TILLAGE_TYPES.find(t => t.id === tillageType)!;
 setMgmtMode('applying');
 setTotalCost(prev => prev + till.cost);
 setTotalHours(prev => prev + till.timeHours);
 setTimeout(() => {
 let killed = 0;
 setFieldWeeds(prev => prev.map(w => {
 if (!w.alive) return w;
 if (Math.random() < till.effectiveness) { killed++; return { ...w, alive: false }; }
 return w;
 }));
 setWeedsKilled(prev => prev + killed);
 setMgmtFeedback(`${till.label}: ${killed} weeds buried/removed. ${till.desc}`);
 setMgmtMode('result');
 setActionLog(prev => [...prev, { season: currentSeason, action: `Tillage: ${till.label}`, detail: `Cost: $${till.cost}, Time: ${till.timeHours}h`, cost: till.cost }]);
 }, 1500);
 };

 const applyHandPull = () => {
 setMgmtMode('applying');
 const timeHours = 3;
 setTotalHours(prev => prev + timeHours);
 setTimeout(() => {
 let killed = 0;
 setFieldWeeds(prev => prev.map(w => {
 if (!w.alive) return w;
 if (w.stage === 'seedling' || w.stage === 'vegetative') {
 if (Math.random() < 0.85) { killed++; return { ...w, alive: false }; }
 } else {
 if (Math.random() < 0.5) { killed++; return { ...w, alive: false }; }
 }
 return w;
 }));
 setWeedsKilled(prev => prev + killed);
 setMgmtFeedback(`Hand pulling: ${killed} weeds removed. Most effective on seedlings and small vegetative plants.`);
 setMgmtMode('result');
 setActionLog(prev => [...prev, { season: currentSeason, action: 'Hand Pull', detail: `Time: ${timeHours}h, no cost`, cost: 0 }]);
 }, 1500);
 };

 const applyWait = () => {
 setMgmtMode('applying');
 setTimeout(() => {
 if (Math.random() > 0.4) {
 const extras = generateFieldWeeds(currentSeason, 2);
 setFieldWeeds(prev => [...prev, ...extras]);
 setMgmtFeedback('You waited. More weeds have emerged in the field. The existing weeds also grew larger.');
 } else {
 setMgmtFeedback('You waited. No new weeds appeared this time, but existing weeds continued growing.');
 }
 setFieldWeeds(prev => prev.map(w => ({ ...w, density: w.alive ? Math.min(w.density + 2, 20) : w.density })));
 setMgmtMode('result');
 setActionLog(prev => [...prev, { season: currentSeason, action: 'Wait & Observe', detail: 'No cost, no time', cost: 0 }]);
 }, 1000);
 };

 const finishManagement = () => {
 setMgmtMode(null);
 setMgmtAction(null);
 setMgmtFeedback(null);
 setDriftWarning(false);
 setPhase('playing');
 };

 const advanceSeason = () => {
 const nextIdx = seasonIdx + 1;
 if (nextIdx >= SEASON_ORDER.length) { setPhase('harvest'); return; }
 const nextSeason = SEASON_ORDER[nextIdx];
 setCurrentSeason(nextSeason);
 setHasScouted(false);
 setSelectedWeed(null);
 setFieldWeeds(prev => prev.map(w => ({
 ...w, stage: WEED_STAGE_BY_SEASON[nextSeason],
 density: w.alive ? Math.min(w.density + Math.floor(Math.random() * 3), 20) : w.density,
 scouted: false, identified: false,
 })));
 if (nextSeason !== 'fall') {
 const extras = generateFieldWeeds(nextSeason, grade === 'elementary' ? 3 : 5);
 setFieldWeeds(prev => [...prev, ...extras]);
 }
 const gradeEvents = ALL_EVENTS.filter(e => e.grades.includes(grade!) && e.season === nextSeason);
 if (gradeEvents.length > 0) {
 const event = gradeEvents[Math.floor(Math.random() * gradeEvents.length)];
 setCurrentEvent(event);
 setEventAnswer(null);
 setPhase('event');
 }
 };

 const finalYield = useMemo(() => {
 const aliveWeeds = fieldWeeds.filter(w => w.alive);
 const totalDensity = aliveWeeds.reduce((s, w) => s + w.density, 0);
 const yieldLoss = Math.min(totalDensity * 0.3, 25);
 return Math.max(BASE_YIELD - yieldLoss, 20);
 }, [fieldWeeds]);

 const aliveCount = fieldWeeds.filter(w => w.alive).length;
 const scoutedCount = fieldWeeds.filter(w => w.scouted && w.alive).length;
 const identifiedCount = fieldWeeds.filter(w => w.identified && w.alive).length;
 const totalCount = fieldWeeds.length;

 // Setup Screen 
 if (phase === 'setup') {
 return (
 <div className="fixed inset-0 bg-background z-[60] overflow-y-auto">
  <div className="max-w-lg mx-auto px-5 py-12 text-center">
  <div className="absolute top-4 left-4"><HomeButton onClose={onClose} /></div>
  <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
  <X className="w-4 h-4" />
  </button>
 <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
 <Wheat className="w-8 h-8 text-primary" />
 </div>
 <h1 className="font-display font-bold text-3xl text-foreground mb-2">Soybean Farm Simulator</h1>
 <p className="text-muted-foreground mb-8 leading-relaxed">Manage a soybean field through a full growing season. Scout for weeds, identify them, choose management strategies, and harvest your crop.</p>
 <h2 className="font-display font-bold text-lg text-foreground mb-4">Select Difficulty</h2>
 <div className="grid gap-3">
 {([
 { grade: 'elementary' as GradeLevel, label: 'Elementary (K-5)', desc: 'Identify weeds by common name. Simpler management choices.' },
 { grade: 'middle' as GradeLevel, label: 'Middle School (6-8)', desc: 'Economic thresholds, herbicide selectivity, and scouting patterns.' },
 { grade: 'high' as GradeLevel, label: 'High School (9-12)', desc: 'Identify by scientific name. Advanced herbicide and resistance management.' },
 ]).map(g => (
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

 // Results Screen (no field) 
 if (phase === 'results') {
 const matureWeeds = fieldWeeds.filter(w => w.alive && w.stage === 'mature');
 const seedsProduced = matureWeeds.length * 5000;
 return (
 <div className="fixed inset-0 bg-background z-[60] overflow-y-auto">
 <div className="max-w-2xl mx-auto px-5 py-8">
 <h1 className="font-display font-bold text-2xl text-foreground mb-6">Season Summary</h1>
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
 <div className="bg-card border border-border rounded-lg p-5 mb-6 shadow-card">
 <h3 className="font-display font-bold text-foreground mb-2">Knowledge Events</h3>
 <p className="text-sm text-muted-foreground">{eventsCorrect}/{eventsAnswered} questions answered correctly</p>
 </div>
 {matureWeeds.length > 0 && (
 <div className="bg-warning/5 border border-warning/20 rounded-lg p-5 mb-6">
 <h3 className="font-semibold text-foreground mb-2">Weeds That Set Seed</h3>
 <p className="text-sm text-muted-foreground mb-3">{matureWeeds.length} weeds reached maturity and produced ~{seedsProduced.toLocaleString()} seeds.</p>
 <div className="flex flex-wrap gap-2">
 {matureWeeds.map(w => (
 <span key={w.id} className="px-2 py-1 rounded-md bg-card border border-border text-xs text-foreground">{w.weed.commonName}</span>
 ))}
 </div>
 </div>
 )}
 <div className="bg-card border border-border rounded-lg p-5 mb-6 shadow-card">
 <h3 className="font-display font-bold text-foreground mb-3">Decision History</h3>
 <div className="space-y-2">
 {actionLog.map((a, i) => (
 <div key={i} className="flex items-center gap-3 text-sm">
 <span className="text-xs text-muted-foreground w-28 shrink-0">{SEASONS[a.season].label}</span>
 <span className="text-foreground font-medium">{a.action}</span>
 <span className="text-muted-foreground ml-auto text-xs">{a.detail}</span>
 </div>
 ))}
 {actionLog.length === 0 && <p className="text-sm text-muted-foreground">No actions taken.</p>}
 </div>
 </div>
 <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-8">
 <h3 className="font-semibold text-foreground mb-2">Reflection</h3>
 <p className="text-sm text-foreground">What would you do differently next season?</p>
 </div>
 <div className="flex gap-3">
 <button onClick={() => { setPhase('setup'); setFieldWeeds([]); setActionLog([]); setTotalCost(0); setTotalHours(0); setWeedsKilled(0); setEventsAnswered(0); setEventsCorrect(0); setGrade(null); setHasScouted(false); }}
 className="flex-1 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
 Play Again
 </button>
 <button onClick={onClose}
 className="flex-1 py-3 rounded-md border border-border bg-card text-foreground font-semibold hover:bg-secondary transition-colors">
 Back to Menu
 </button>
 </div>
 </div>
 </div>
 );
 }

 // ALL OTHER PHASES: Field always visible 
 // The field background + weed dots are rendered constantly.
 // Side panel and overlay panels change based on phase.

 const renderSidePanel = () => {
 // Scouting phase in side panel 
 if (phase === 'scouting') {
 return (
 <div className="p-4 space-y-4">
 <div className="flex items-center gap-2 mb-2">
 <Eye className="w-5 h-5 text-primary" />
 <h3 className="font-display font-bold text-foreground">Scout Your Field</h3>
 </div>
 <p className="text-sm text-muted-foreground">Choose a scouting method to find weeds in your field. Each method has different costs, time, and accuracy.</p>

 {scoutAnimating ? (
 <div className="text-center py-8">
 <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
 <p className="font-semibold text-foreground text-sm">Scouting in progress...</p>
 <p className="text-xs text-muted-foreground mt-1">
 {scoutMethod === 'manual' ? 'Walking the field...' : scoutMethod === 'drone' ? 'Flying drone overhead...' : 'Deploying ground rover...'}
 </p>
 </div>
 ) : (
 <div className="space-y-2">
 {SCOUT_METHODS.map(sm => (
 <button key={sm.id} onClick={() => startScouting(sm.id)}
 className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-subtle transition-all">
 <div className="flex items-center gap-2 mb-1">
 <sm.icon className="w-4 h-4 text-primary" />
 <span className="font-semibold text-foreground text-sm">{sm.label}</span>
 </div>
 <p className="text-xs text-muted-foreground mb-2">{sm.gradeDesc[grade!]}</p>
 <div className="flex items-center gap-2 text-xs">
 <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">${sm.cost}</span>
 <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">{sm.timeHours} hours</span>
 <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">{Math.round(sm.accuracy * 100)}%</span>
 </div>
 </button>
 ))}
 </div>
 )}
 <button onClick={() => setPhase('playing')} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
 <ArrowLeft className="w-3 h-3 inline mr-1" /> Cancel
 </button>
 </div>
 );
 }

 // Identifying phase in side panel 
 if (phase === 'identifying') {
 const unidentified = fieldWeeds.filter(w => w.alive && w.scouted && !w.identified);
 const alreadyIdentified = fieldWeeds.filter(w => w.alive && w.identified);

 if (idTarget) {
 const correctName = grade === 'high' ? idTarget.weed.scientificName : idTarget.weed.commonName;
 return (
 <div className="p-4 space-y-3">
 <div className="flex items-center gap-2">
 <Crosshair className="w-4 h-4 text-primary" />
 <h3 className="font-display font-bold text-foreground text-sm">
 {grade === 'high' ? 'Identify by Scientific Name' : 'Identify This Weed'}
 </h3>
 </div>
 <div className="rounded-lg border border-border overflow-hidden">
 <div className="aspect-[3/2] bg-muted">
 <WeedImage weedId={idTarget.weed.id} stage={idTarget.stage} className="w-full h-full object-cover" />
 </div>
 <div className="p-2 text-xs text-muted-foreground">
 Stage: {idTarget.stage} · {idTarget.density}/sq ft · {idTarget.weed.plantType}
 </div>
 </div>
 <div className="space-y-1.5">
 {idOptions.map(opt => (
 <button key={opt} onClick={() => !idPicked && submitId(opt)} disabled={!!idPicked}
 className={`w-full text-left p-2.5 rounded-lg border text-sm transition-all ${
 !idPicked ? 'border-border bg-card hover:border-primary/30' :
 opt === correctName ? 'border-success bg-success/8' :
 opt === idPicked ? 'border-error bg-error/8' : 'border-border bg-card opacity-50'
 }`}>
 <div className="flex items-center gap-2">
 {idPicked && opt === correctName && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
 {idPicked && opt === idPicked && opt !== correctName && <XCircle className="w-4 h-4 text-error shrink-0" />}
 <span className={grade === 'high' ? 'italic' : ''}>{opt}</span>
 </div>
 </button>
 ))}
 </div>
 {idResult && (
 <div className="animate-fade-in space-y-2">
 <div className={`rounded-lg p-3 text-xs ${idResult === 'correct' ? 'bg-success/8 border border-success/20' : 'bg-error/8 border border-error/20'}`}>
 <p className="font-semibold text-foreground">{idResult === 'correct' ? 'Correct!' : 'Incorrect'}</p>
 <p className="text-muted-foreground mt-1">
 This is <span className="font-medium text-foreground">{idTarget.weed.commonName}</span>
 {grade !== 'elementary' && <> (<span className="italic">{idTarget.weed.scientificName}</span>)</>}.
 </p>
 </div>
 <button onClick={finishIdRound} className="w-full py-2 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90">
 Continue
 </button>
 </div>
 )}
 </div>
 );
 }

 return (
 <div className="p-4 space-y-3">
 <div className="flex items-center gap-2">
 <Crosshair className="w-4 h-4 text-primary" />
 <h3 className="font-display font-bold text-foreground text-sm">Identify Weeds</h3>
 </div>
 <p className="text-xs text-muted-foreground">
 Found {scoutedCount} weeds. {unidentified.length > 0 ? `${unidentified.length} remaining.` : 'All identified!'}
 </p>
 {unidentified.length > 0 && (
 <div className="grid grid-cols-2 gap-2">
 {unidentified.map(fw => (
 <button key={fw.id} onClick={() => startIdentify(fw)}
 className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-subtle hover:border-primary/30 transition-all">
 <div className="aspect-square bg-muted">
 <WeedImage weedId={fw.weed.id} stage={fw.stage} className="w-full h-full object-cover" />
 </div>
 <div className="p-2">
 <p className="text-xs font-medium text-foreground">Unknown Weed</p>
 <p className="text-[10px] text-muted-foreground">{fw.stage} · {fw.density}/sq ft</p>
 </div>
 </button>
 ))}
 </div>
 )}
 {alreadyIdentified.length > 0 && (
 <div>
 <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Identified</p>
 <div className="flex flex-wrap gap-1">
 {alreadyIdentified.map(fw => (
 <span key={fw.id} className="px-2 py-1 rounded bg-success/8 border border-success/20 text-[11px] text-foreground">{fw.weed.commonName}</span>
 ))}
 </div>
 </div>
 )}
 <button onClick={doneIdentifying} className="w-full py-2.5 rounded-md bg-success text-success-foreground font-semibold text-sm hover:opacity-90">
 {unidentified.length > 0 ? 'Skip to Management' : 'Proceed to Management'} <ChevronRight className="w-3 h-3 inline ml-1" />
 </button>
 </div>
 );
 }

 // Managing phase in side panel 
 if (phase === 'managing') {
 if (mgmtMode === 'applying') {
 return (
 <div className="p-4 flex items-center justify-center h-full">
 <div className="text-center">
 <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
 <p className="font-semibold text-foreground text-sm">
 {mgmtAction === 'herbicide' ? 'Applying herbicide...' :
 mgmtAction === 'tillage' ? 'Running tillage...' :
 mgmtAction === 'hand-pull' ? 'Hand pulling...' : 'Waiting...'}
 </p>
 </div>
 </div>
 );
 }

 if (mgmtMode === 'result' && mgmtFeedback) {
 return (
 <div className="p-4 space-y-3">
 <div className="flex items-center gap-2">
 {driftWarning ? <AlertTriangle className="w-5 h-5 text-warning" /> : <CheckCircle2 className="w-5 h-5 text-success" />}
 <h3 className="font-display font-bold text-foreground text-sm">Management Result</h3>
 </div>
 <div className={`rounded-lg p-3 border text-sm ${driftWarning ? 'bg-warning/5 border-warning/20' : 'bg-success/5 border-success/20'}`}>
 <p className="text-foreground">{mgmtFeedback}</p>
 </div>
 <div className="bg-card border border-border rounded-lg p-3 text-xs text-muted-foreground">
 Remaining: <span className="font-semibold text-foreground">{fieldWeeds.filter(w => w.alive).length}</span> ·
 Controlled: <span className="font-semibold text-foreground">{weedsKilled}</span> ·
 Cost: <span className="font-semibold text-foreground">${totalCost}</span>
 </div>
 <div className="flex gap-2">
 <button onClick={() => { setMgmtMode('choose'); setMgmtFeedback(null); setDriftWarning(false); }}
 className="flex-1 py-2 rounded-md border border-border bg-card text-foreground text-sm font-semibold hover:bg-secondary">
 More Actions
 </button>
 <button onClick={finishManagement}
 className="flex-1 py-2 rounded-md bg-success text-success-foreground text-sm font-semibold hover:opacity-90">
 Done
 </button>
 </div>
 </div>
 );
 }

 // Herbicide configuration with PREVIEW
 if (mgmtMode === 'herbicide-config') {
 return (
 <div className="p-4 space-y-3 overflow-y-auto">
 <div className="flex items-center gap-2">
 <button onClick={() => setMgmtMode('choose')} className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
 <ArrowLeft className="w-3 h-3" />
 </button>
 <Droplets className="w-4 h-4 text-primary" />
 <h3 className="font-display font-bold text-foreground text-sm">Configure Herbicide</h3>
 </div>

 {/* Product */}
 <div>
 <label className="text-xs font-semibold text-foreground block mb-1">Product</label>
 <div className="space-y-1">
 {HERBICIDE_PRODUCTS.map(p => (
 <button key={p.id} onClick={() => setHerbProduct(p.id)}
 className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${herbProduct === p.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
 <p className="font-medium text-foreground">{p.label}</p>
 <p className="text-muted-foreground">${p.cost} · {Math.round(p.effectiveness * 100)}% control · {p.broadleaf ? 'Broadleaf' : ''}{p.broadleaf && p.grass ? '+' : ''}{p.grass ? 'Grass' : ''}</p>
 </button>
 ))}
 </div>
 </div>

 {/* Nozzle */}
 {(grade === 'middle' || grade === 'high') && (
 <div>
 <label className="text-xs font-semibold text-foreground block mb-1">Nozzle Type</label>
 <div className="space-y-1">
 {NOZZLE_TYPES.map(n => (
 <button key={n.id} onClick={() => setHerbNozzle(n.id)}
 className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${herbNozzle === n.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
 <p className="font-medium text-foreground">{n.label}</p>
 <p className="text-muted-foreground">{n.desc}</p>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Boom Height */}
 {(grade === 'middle' || grade === 'high') && (
 <div>
 <label className="text-xs font-semibold text-foreground block mb-1">
 <Ruler className="w-3 h-3 inline mr-1" />Boom Height
 </label>
 <div className="grid grid-cols-3 gap-1">
 {SPRAY_HEIGHTS.map(h => (
 <button key={h.id} onClick={() => setHerbHeight(h.id)}
 className={`p-2 rounded-lg border text-center text-xs transition-all ${herbHeight === h.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
 <p className="font-medium text-foreground">{h.label}</p>
 <p className="text-muted-foreground text-[10px]">{h.id === 'low' ? 'Low drift' : h.id === 'high' ? 'More drift' : 'Standard'}</p>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Speed */}
 {(grade === 'middle' || grade === 'high') && (
 <div>
 <label className="text-xs font-semibold text-foreground block mb-1">Application Speed</label>
 <div className="grid grid-cols-3 gap-1">
 {SPRAY_SPEEDS.map(s => (
 <button key={s.id} onClick={() => setHerbSpeed(s.id)}
 className={`p-2 rounded-lg border text-center text-xs transition-all ${herbSpeed === s.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
 <p className="font-medium text-foreground">{s.label}</p>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* PREVIEW BOX */}
 <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-3 space-y-1">
 <p className="text-xs font-semibold text-primary uppercase tracking-wider">Decision Preview</p>
 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
 <span className="text-muted-foreground">Coverage:</span>
 <span className="font-medium text-foreground">{Math.round(herbPreview.effectiveCoverage * 100)}% coverage</span>
 <span className="text-muted-foreground">Drift Risk:</span>
 <span className={`font-medium ${herbPreview.driftRisk > 0.25 ? 'text-warning' : 'text-foreground'}`}>
 {Math.round(herbPreview.driftRisk * 100)}%{herbPreview.driftRisk > 0.25 ? ' ' : ''}
 </span>
 <span className="text-muted-foreground">Est. Weeds Killed:</span>
 <span className="font-medium text-foreground">~{herbPreview.estKill} of {herbPreview.targetable} targetable</span>
 <span className="text-muted-foreground">Time:</span>
 <span className="font-medium text-foreground">{herbPreview.timeHours.toFixed(1)} hours</span>
 <span className="text-muted-foreground">Cost:</span>
 <span className="font-medium text-foreground">${herbPreview.product.cost}/acre</span>
 </div>
 {herbPreview.driftRisk > 0.25 && (
 <p className="text-[10px] text-warning mt-1">High drift risk may damage neighboring crops. Consider lower speed or drift-reducing nozzle.</p>
 )}
 </div>

 <button onClick={applyHerbicide}
 className="w-full py-2.5 rounded-md bg-success text-success-foreground font-semibold text-sm hover:opacity-90">
 Apply Herbicide
 </button>
 </div>
 );
 }

 // Tillage configuration
 if (mgmtMode === 'tillage-config') {
 const selectedTill = TILLAGE_TYPES.find(t => t.id === tillageType)!;
 return (
 <div className="p-4 space-y-3">
 <div className="flex items-center gap-2">
 <button onClick={() => setMgmtMode('choose')} className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
 <ArrowLeft className="w-3 h-3" />
 </button>
 <Tractor className="w-4 h-4 text-primary" />
 <h3 className="font-display font-bold text-foreground text-sm">Choose Tillage</h3>
 </div>
 <div className="space-y-1.5">
 {TILLAGE_TYPES.map(t => (
 <button key={t.id} onClick={() => setTillageType(t.id)}
 className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${tillageType === t.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
 <p className="font-semibold text-foreground">{t.label}</p>
 <p className="text-muted-foreground">{t.desc}</p>
 <div className="flex gap-2 mt-1">
 <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">${t.cost}</span>
 <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">{t.timeHours} hours</span>
 <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground">{Math.round(t.effectiveness * 100)}% control</span>
 </div>
 </button>
 ))}
 </div>
 {/* Preview */}
 <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-3 space-y-1">
 <p className="text-xs font-semibold text-primary uppercase tracking-wider">Decision Preview</p>
 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
 <span className="text-muted-foreground">Equipment:</span>
 <span className="font-medium text-foreground">{selectedTill.label}</span>
 <span className="text-muted-foreground">Effectiveness:</span>
 <span className="font-medium text-foreground">{Math.round(selectedTill.effectiveness * 100)}% control</span>
 <span className="text-muted-foreground">Time:</span>
 <span className="font-medium text-foreground">{selectedTill.timeHours} hours</span>
 <span className="text-muted-foreground">Cost:</span>
 <span className="font-medium text-foreground">${selectedTill.cost}/acre</span>
 </div>
 </div>
 <button onClick={applyTillage} className="w-full py-2.5 rounded-md bg-success text-success-foreground font-semibold text-sm hover:opacity-90">
 Run Tillage
 </button>
 </div>
 );
 }

 // Hand pull confirmation
 if (mgmtMode === 'hand-pull') {
 return (
 <div className="p-4 space-y-3">
 <div className="flex items-center gap-2">
 <button onClick={() => setMgmtMode('choose')} className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-foreground">
 <ArrowLeft className="w-3 h-3" />
 </button>
 <Hand className="w-4 h-4 text-primary" />
 <h3 className="font-display font-bold text-foreground text-sm">Hand Pull Weeds</h3>
 </div>
 <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-3 space-y-1">
 <p className="text-xs font-semibold text-primary uppercase tracking-wider">Decision Preview</p>
 <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
 <span className="text-muted-foreground">Method:</span>
 <span className="font-medium text-foreground">Manual removal</span>
 <span className="text-muted-foreground">Best for:</span>
 <span className="font-medium text-foreground">Seedlings & small plants</span>
 <span className="text-muted-foreground">Time:</span>
 <span className="font-medium text-foreground">~3 hours</span>
 <span className="text-muted-foreground">Cost:</span>
 <span className="font-medium text-foreground">Free (labor only)</span>
 </div>
 </div>
 <button onClick={applyHandPull} className="w-full py-2.5 rounded-md bg-success text-success-foreground font-semibold text-sm hover:opacity-90">
 Start Hand Pulling
 </button>
 </div>
 );
 }

 // Management choice menu
 return (
 <div className="p-4 space-y-3">
 <div className="flex items-center gap-2">
 <Settings2 className="w-4 h-4 text-primary" />
 <h3 className="font-display font-bold text-foreground text-sm">Manage Weeds</h3>
 </div>
 <p className="text-xs text-muted-foreground">Choose a management strategy. You can preview the impact before applying.</p>
 <div className="space-y-2">
 <button onClick={() => chooseManagement('herbicide')} className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-subtle transition-all">
 <div className="flex items-center gap-2 mb-0.5"><Droplets className="w-4 h-4 text-primary" /><span className="font-semibold text-foreground text-sm">Apply Herbicide</span></div>
 <p className="text-xs text-muted-foreground">Select product, nozzle, height, and speed.</p>
 </button>
 <button onClick={() => chooseManagement('tillage')} className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-subtle transition-all">
 <div className="flex items-center gap-2 mb-0.5"><Tractor className="w-4 h-4 text-primary" /><span className="font-semibold text-foreground text-sm">Mechanical Tillage</span></div>
 <p className="text-xs text-muted-foreground">Choose tillage equipment.</p>
 </button>
 <button onClick={() => chooseManagement('hand-pull')} className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-subtle transition-all">
 <div className="flex items-center gap-2 mb-0.5"><Hand className="w-4 h-4 text-primary" /><span className="font-semibold text-foreground text-sm">Hand Pull</span></div>
 <p className="text-xs text-muted-foreground">Free but labor-intensive.</p>
 </button>
 <button onClick={() => chooseManagement('wait')} className="w-full text-left p-3 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-subtle transition-all">
 <div className="flex items-center gap-2 mb-0.5"><Clock className="w-4 h-4 text-primary" /><span className="font-semibold text-foreground text-sm">Wait & Observe</span></div>
 <p className="text-xs text-muted-foreground">Skip intervention this season.</p>
 </button>
 </div>
 <button onClick={finishManagement} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
 <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Field
 </button>
 </div>
 );
 }

 // Event phase overlay in side panel 
 if (phase === 'event' && currentEvent) {
 const answered = eventAnswer !== null;
 return (
 <div className="p-4 space-y-3">
 <div className="flex items-center gap-2">
 <AlertTriangle className="w-4 h-4 text-warning" />
 <div>
 <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Event — {seasonInfo.label}</p>
 <h3 className="font-display font-bold text-foreground text-sm">{currentEvent.title}</h3>
 </div>
 </div>
 <div className="bg-card border border-border rounded-lg p-3 text-sm">
 <p className="text-foreground">{currentEvent.description}</p>
 <p className="font-semibold text-foreground mt-2">{currentEvent.question}</p>
 </div>
 <div className="space-y-1.5">
 {currentEvent.options.map(opt => (
 <button key={opt.id} onClick={() => {
 if (!answered) {
 setEventAnswer(opt.id);
 setEventsAnswered(p => p + 1);
 if (opt.correct) setEventsCorrect(p => p + 1);
 }
 }} disabled={answered}
 className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
 !answered ? 'border-border bg-card hover:border-primary/30' :
 opt.correct ? 'border-success bg-success/5' :
 opt.id === eventAnswer ? 'border-error bg-error/5' : 'border-border bg-card opacity-60'
 }`}>
 <div className="flex items-start gap-2">
 {answered && opt.correct && <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />}
 {answered && !opt.correct && opt.id === eventAnswer && <XCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />}
 <div>
 <p className="text-foreground">{opt.label}</p>
 {answered && (opt.correct || opt.id === eventAnswer) && (
 <p className="text-muted-foreground mt-0.5">{opt.feedback}</p>
 )}
 </div>
 </div>
 </button>
 ))}
 </div>
 {answered && (
 <div className="animate-fade-in space-y-2">
 <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
 <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mb-0.5">Teaching Point</p>
 <p className="text-xs text-foreground">{currentEvent.teachingPoint}</p>
 </div>
 <button onClick={() => setPhase('playing')} className="w-full py-2.5 rounded-md bg-success text-success-foreground font-semibold text-sm hover:opacity-90">
 Continue <ChevronRight className="w-3 h-3 inline ml-1" />
 </button>
 </div>
 )}
 </div>
 );
 }

 // Harvest in side panel 
 if (phase === 'harvest') {
 return (
 <div className="p-4 space-y-4 flex flex-col items-center justify-center h-full">
 <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center">
 <Wheat className="w-7 h-7 text-success" />
 </div>
 <h3 className="font-display font-bold text-2xl text-foreground">Harvest Time</h3>
 <p className="text-sm text-muted-foreground text-center">The combine is rolling through your field.</p>
 <div className="bg-card border border-border rounded-lg p-5 text-center w-full">
 <p className="font-display font-bold text-4xl text-foreground">{finalYield.toFixed(1)} bu/acre</p>
 <p className="text-sm text-muted-foreground mt-1">{finalYield >= 45 ? 'Excellent yield' : finalYield >= 38 ? 'Good yield' : 'Below average — weeds impacted production'}</p>
 </div>
 <button onClick={() => setPhase('results')} className="w-full py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90">
 View Season Summary
 </button>
 </div>
 );
 }

 // Default: Playing phase action panel 
 return (
 <div className="flex flex-col h-full">
 <div className="p-4 border-b border-border">
 <h3 className="font-display font-bold text-foreground text-sm mb-1">Field Actions</h3>
 <p className="text-xs text-muted-foreground">Follow the steps to manage your field</p>
 </div>

 <div className="p-4 space-y-3 flex-1">
 {/* Step 1: Scout — highlighted prominently if not done */}
 <button onClick={() => setPhase('scouting')}
 className={`w-full text-left p-3 rounded-lg border transition-all ${
 hasScouted ? 'border-success/30 bg-success/5' :
 'border-primary border-2 bg-primary/8 shadow-subtle hover:shadow-card animate-pulse'
 }`}>
 <div className="flex items-center gap-2 mb-1">
 <Eye className="w-4 h-4 text-primary" />
 <span className="font-medium text-foreground text-sm">1. Scout Field</span>
 {hasScouted && <CheckCircle2 className="w-4 h-4 text-success ml-auto" />}
 </div>
 <p className="text-xs text-muted-foreground">
 {hasScouted ? `Found ${scoutedCount} weeds` : 'Click here first! Choose how to survey the field.'}
 </p>
 </button>

 {/* Step 2: Identify */}
 <button onClick={() => { if (hasScouted) setPhase('identifying'); }}
 disabled={!hasScouted}
 className={`w-full text-left p-3 rounded-lg border transition-all ${
 !hasScouted ? 'border-border bg-card opacity-50 cursor-not-allowed' :
 identifiedCount >= scoutedCount ? 'border-success/30 bg-success/5' :
 'border-primary bg-primary/5 hover:shadow-subtle'
 }`}>
 <div className="flex items-center gap-2 mb-1">
 <Crosshair className="w-4 h-4 text-primary" />
 <span className="font-medium text-foreground text-sm">2. Identify Weeds</span>
 {identifiedCount >= scoutedCount && scoutedCount > 0 && <CheckCircle2 className="w-4 h-4 text-success ml-auto" />}
 </div>
 <p className="text-xs text-muted-foreground">{identifiedCount > 0 ? `${identifiedCount} identified` : 'Identify scouted weeds'}</p>
 </button>

 {/* Step 3: Manage */}
 <button onClick={() => { if (hasScouted) { setPhase('managing'); setMgmtMode('choose'); }}}
 disabled={!hasScouted}
 className={`w-full text-left p-3 rounded-lg border transition-all ${
 !hasScouted ? 'border-border bg-card opacity-50 cursor-not-allowed' :
 'border-primary bg-primary/5 hover:shadow-subtle'
 }`}>
 <div className="flex items-center gap-2 mb-1">
 <Settings2 className="w-4 h-4 text-primary" />
 <span className="font-medium text-foreground text-sm">3. Manage Weeds</span>
 </div>
 <p className="text-xs text-muted-foreground">Choose control method and apply</p>
 </button>
 </div>

 <div className="p-4 border-t border-border">
 <button onClick={advanceSeason}
 className="w-full py-3 rounded-md bg-success text-success-foreground font-semibold text-sm hover:opacity-90 flex items-center justify-center gap-2">
 {currentSeason === 'fall' ? 'Harvest Year 3' : 'Next Year'} <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 );
 };

  // Derived data for status panel
  const unscoutedCount = fieldWeeds.filter(w => w.alive && !w.scouted).length;
  const scoutedOnlyCount = scoutedCount - identifiedCount;
  const techniquesUsed = [...new Set(actionLog.map(a => a.action))];

  // Main Layout: Field always visible + side panel 
  return (
   <div className="fixed inset-0 bg-background z-[60] flex flex-col" style={{ overflow: 'hidden' }}>
   {/* Top bar — always visible */}
   <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between shrink-0 z-10">
   <div className="flex items-center gap-3">
   <HomeButton onClose={onClose} />
   <button onClick={onClose} className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-bold flex items-center gap-2 hover:bg-destructive/90 transition-colors shadow-md">
   <X className="w-4 h-4" /> Exit
   </button>
   <div>
   <p className="font-display font-bold text-foreground">{seasonInfo.label}</p>
   <p className="text-xs text-muted-foreground">{seasonInfo.cropStage}</p>
   </div>
   </div>
   <div className="flex items-center gap-1">
   {SEASON_ORDER.map((s, i) => (
   <div key={s} className={`w-8 h-1.5 rounded-full transition-colors ${
   i < seasonIdx ? 'bg-success' : i === seasonIdx ? 'bg-primary' : 'bg-border'
   }`} title={SEASONS[s].label} />
   ))}
   </div>
   </div>

  {/* Main content: Left Status + Field + Right Action Panel */}
  <div className="flex-1 flex overflow-hidden">
  {/* Left: Status Panel */}
  <div className="flex-[2] border-r border-border bg-card overflow-y-auto hidden sm:flex flex-col p-3 space-y-3">
  <div className="bg-primary/10 border-2 border-primary/50 rounded-lg p-3">
    <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-2">Resources Used</p>
    <div className="space-y-2">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase">Money Spent</p>
        <p className="font-display font-bold text-2xl text-foreground leading-none">${totalCost}<span className="text-xs text-muted-foreground font-normal">/acre</span></p>
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase">Time Spent</p>
        <p className="font-display font-bold text-2xl text-foreground leading-none">{totalHours.toFixed(1)}<span className="text-xs text-muted-foreground font-normal"> hours</span></p>
      </div>
    </div>
  </div>
  <div className="border-t border-border pt-3">
  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Weed Status</p>
  <div className="space-y-1.5 text-xs">
  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-weed-unscouted shrink-0" /><span className="text-muted-foreground">Unscouted:</span><span className="font-bold text-foreground ml-auto">{unscoutedCount}</span></div>
  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-weed-scouted shrink-0" /><span className="text-muted-foreground">Scouted:</span><span className="font-bold text-foreground ml-auto">{scoutedOnlyCount}</span></div>
  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-weed-identified shrink-0" /><span className="text-muted-foreground">Identified:</span><span className="font-bold text-foreground ml-auto">{identifiedCount}</span></div>
  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-success shrink-0" /><span className="text-muted-foreground">Controlled:</span><span className="font-bold text-foreground ml-auto">{weedsKilled}</span></div>
  </div>
  </div>
  {identifiedCount > 0 && (
  <div className="border-t border-border pt-3">
  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Weeds Found</p>
  <div className="flex flex-wrap gap-1">
  {fieldWeeds.filter(w => w.identified && w.alive).map(fw => (
  <span key={fw.id} className="px-1.5 py-0.5 rounded bg-primary/10 text-[10px] text-foreground">{fw.weed.commonName}</span>
  ))}
  </div>
  </div>
  )}
  {techniquesUsed.length > 0 && (
  <div className="border-t border-border pt-3">
  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Techniques Used</p>
  <div className="space-y-1">
  {techniquesUsed.map(t => (
  <p key={t} className="text-[11px] text-foreground">• {t}</p>
  ))}
  </div>
  </div>
  )}
  <div className="border-t border-border pt-3">
  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Season</p>
  <p className="text-xs text-foreground">{seasonInfo.description}</p>
  </div>
  </div>

  {/* Center: Field — ALWAYS VISIBLE */}
  <div className="flex-[5] flex flex-col overflow-hidden">
  <div className="flex-1 relative">
  <img src={fieldBgImage} alt="Soybean field" className="absolute inset-0 w-full h-full object-cover" />
  <div className="absolute inset-0 bg-foreground/10" />

  {/* Weed indicators */}
  {fieldWeeds.map(fw => (
  <button
  key={fw.id}
  onClick={() => { if (fw.alive && fw.identified) setSelectedWeed(fw); }}
  className={`absolute transition-all duration-500 ${
  !fw.alive ? 'opacity-0 pointer-events-none scale-50' :
  fw.identified ? 'hover:scale-125 cursor-pointer' :
  fw.scouted ? 'animate-pulse' : 'animate-pulse'
  }`}
  style={{ left: `${fw.x}%`, top: `${fw.y}%`, transform: 'translate(-50%,-50%)' }}
  title={fw.identified ? fw.weed.commonName : fw.scouted ? 'Scouted — needs ID' : 'Unscouted'}
  >
  <div className={`w-12 h-12 rounded-full overflow-hidden border-[3px] shadow-lg ${
  fw.identified
  ? 'border-weed-identified shadow-weed-identified/30'
  : fw.scouted
  ? 'border-weed-scouted shadow-weed-scouted/30'
  : 'border-weed-unscouted shadow-weed-unscouted/30'
  }`}>
  {fw.scouted || fw.identified ? (
  <WeedImage weedId={fw.weed.id} stage={fw.stage} className="w-full h-full object-cover" />
  ) : (
  <div className="w-full h-full bg-weed-unscouted/50 flex items-center justify-center">
  <span className="text-white text-xs font-bold">?</span>
  </div>
  )}
  </div>
  </button>
  ))}

  {/* Selected weed popup */}
  {selectedWeed && selectedWeed.alive && (
  <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-card border border-border rounded-lg p-4 shadow-card-hover animate-fade-in z-10">
  <div className="flex items-start gap-3">
  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
  <WeedImage weedId={selectedWeed.weed.id} stage={selectedWeed.stage} className="w-full h-full object-cover" />
  </div>
  <div className="flex-1 min-w-0">
  <p className="font-semibold text-foreground">{selectedWeed.weed.commonName}</p>
  {grade !== 'elementary' && <p className="text-xs italic text-muted-foreground">{selectedWeed.weed.scientificName}</p>}
  <p className="text-xs text-muted-foreground mt-1">{selectedWeed.weed.plantType} · {selectedWeed.weed.lifeCycle}</p>
  <p className="text-xs text-muted-foreground">Density: {selectedWeed.density}/sq ft · Stage: {selectedWeed.stage}</p>
  </div>
  <button onClick={() => setSelectedWeed(null)} className="text-muted-foreground hover:text-foreground">
  <X className="w-4 h-4" />
  </button>
  </div>
  </div>
  )}
  </div>
  </div>

  {/* Right: Side Panel — content changes by phase */}
  <div className="flex-[3] border-l border-border bg-card overflow-y-auto hidden sm:flex flex-col">
  {renderSidePanel()}
  </div>
  </div>

 {/* Mobile bottom bar */}
  <div className="sm:hidden border-t border-border bg-card p-3">
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button onClick={onClose}
        className="shrink-0 px-3 py-2 rounded-md border border-destructive/30 text-xs font-medium text-destructive flex items-center gap-1.5">
        <X className="w-3.5 h-3.5" /> Exit
      </button>
      <button onClick={() => setPhase('scouting')}
        className={`shrink-0 px-3 py-2 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors ${
          hasScouted ? 'border-success/30 bg-success/5 text-foreground' : 'border-primary border-2 bg-primary/8 text-foreground animate-pulse'
        }`}>
        <Eye className="w-3.5 h-3.5" /> Scout
      </button>
      <button onClick={() => hasScouted && setPhase('identifying')} disabled={!hasScouted}
        className="shrink-0 px-3 py-2 rounded-md border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 disabled:opacity-50">
        <Crosshair className="w-3.5 h-3.5" /> Identify
      </button>
      <button onClick={() => { if (hasScouted) { setPhase('managing'); setMgmtMode('choose'); }}} disabled={!hasScouted}
        className="shrink-0 px-3 py-2 rounded-md border border-border text-xs font-medium text-foreground hover:bg-secondary transition-colors flex items-center gap-1.5 disabled:opacity-50">
        <Settings2 className="w-3.5 h-3.5" /> Manage
      </button>
      <button onClick={advanceSeason}
        className="shrink-0 px-4 py-2 rounded-md bg-success text-success-foreground text-xs font-bold">
        {currentSeason === 'fall' ? 'Harvest' : 'Next Year'} <ChevronRight className="w-3 h-3 inline" />
      </button>
    </div>
  </div>
 </div>
 );
}
