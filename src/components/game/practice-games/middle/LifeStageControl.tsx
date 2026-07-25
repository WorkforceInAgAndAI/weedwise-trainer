import { useState, useMemo } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { DollarSign, ShoppingBag, Check } from 'lucide-react';

// End-of-level shop: turn hard-earned $ into real IPM tools. Each purchase
// is an unlockable badge / trophy so students actually WANT to score high.
interface ShopItem { id: string; name: string; cost: number; desc: string; }
const SHOP_ITEMS: ShopItem[] = [
  { id: 'hand-tool', name: 'Hoe & Hand-Pull Kit', cost: 75, desc: 'Basic mechanical control for seedlings.' },
  { id: 'preemerge', name: 'Pre-Emergence Herbicide', cost: 150, desc: 'Stops seedlings before they sprout.' },
  { id: 'postemerge', name: 'Post-Emergence Herbicide', cost: 200, desc: 'Kills weeds already growing.' },
  { id: 'mower', name: 'Mower', cost: 275, desc: 'Cuts vegetative & reproductive weeds fast.' },
  { id: 'cover-crop', name: 'Cover-Crop Seed', cost: 325, desc: 'Out-competes weeds all season.' },
  { id: 'sprayer', name: 'Precision Spot Sprayer', cost: 450, desc: 'Targets weeds without hurting crops.' },
];

function LifeStageShop({ money, level, score, maxScore, onSpend, onNextLevel, onStartOver, onBack }: {
  money: number; level: number; score: number; maxScore: number;
  onSpend: (amount: number) => void;
  onNextLevel: () => void; onStartOver: () => void; onBack: () => void;
}) {
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [showComplete, setShowComplete] = useState(false);
  const buy = (it: ShopItem) => {
    if (money < it.cost || owned.has(it.id)) return;
    onSpend(it.cost);
    setOwned(s => new Set([...s, it.id]));
  };
  if (showComplete) {
    return <LevelComplete level={level} score={score} total={maxScore} onNextLevel={onNextLevel} onStartOver={onStartOver} onBack={onBack} gradeLabel="6-8" />;
  }
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 overflow-y-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <ShoppingBag className="w-10 h-10 mx-auto text-primary mb-1" />
          <h2 className="text-2xl font-bold text-foreground">IPM Supply Shop</h2>
          <p className="text-sm text-muted-foreground">Spend the money you earned on real weed-control tools.</p>
          <p className="mt-2 inline-flex items-center gap-1 text-lg font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full">
            <DollarSign className="w-5 h-5" />{money}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {SHOP_ITEMS.map(it => {
            const has = owned.has(it.id);
            const afford = money >= it.cost;
            return (
              <button
                key={it.id}
                onClick={() => buy(it)}
                disabled={has || !afford}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  has ? 'border-green-500 bg-green-500/10'
                    : afford ? 'border-border bg-card hover:border-primary'
                    : 'border-border bg-card opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-foreground text-sm">{it.name}</span>
                  {has ? <Check className="w-4 h-4 text-green-600" />
                    : <span className="text-xs font-bold text-amber-700 dark:text-amber-300 inline-flex items-center"><DollarSign className="w-3 h-3" />{it.cost}</span>}
                </div>
                <p className="text-xs text-muted-foreground">{it.desc}</p>
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowComplete(true)}
          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
          Finish Level →
        </button>
      </div>
    </div>
  );
}

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const STAGES = ['seedling', 'vegetative', 'reproductive'] as const;
type Stage = typeof STAGES[number];
const STAGE_LABELS: Record<Stage, string> = { seedling: 'Seedling', vegetative: 'Vegetative', reproductive: 'Reproductive' };
const STAGE_IMAGE_MAP: Record<Stage, string> = { seedling: 'seedling', vegetative: 'vegetative', reproductive: 'flower' };

const CONTROLS = [
  { id: 'pre-herb', label: 'Pre-emergence Herbicide', stages: ['seedling'] },
  { id: 'post-herb', label: 'Post-emergence Herbicide', stages: ['seedling', 'vegetative'] },
  { id: 'mow', label: 'Mow / Cut', stages: ['vegetative', 'reproductive'] },
  { id: 'hand-pull', label: 'Hand Pull', stages: ['seedling'] },
  { id: 'cultivate', label: 'Cultivation / Tillage', stages: ['seedling', 'vegetative'] },
  { id: 'cover-crop', label: 'Cover Crops / Competition', stages: ['seedling'] },
  { id: 'spot-spray', label: 'Spot Spray Treatment', stages: ['vegetative', 'reproductive'] },
  { id: 'biocontrol', label: 'Biological Control', stages: ['vegetative', 'reproductive'] },
];

const QUESTIONS_PER_ROUND = 10;

function buildRounds(level: number) {
  const offset = ((level - 1) * QUESTIONS_PER_ROUND) % weeds.length;
  const rotated = [...weeds.slice(offset), ...weeds.slice(0, offset)];
  const pool = shuffle(rotated).slice(0, QUESTIONS_PER_ROUND * 2);

  const items: { weed: typeof weeds[0]; stage: Stage }[] = [];
  let lastStage: Stage | null = null;

  for (let i = 0; i < QUESTIONS_PER_ROUND && pool.length > 0; i++) {
    // Pick a stage different from the last one
    const availableStages = STAGES.filter(s => s !== lastStage);
    const stage = shuffle([...availableStages])[0];
    lastStage = stage;
    items.push({ weed: pool.shift()!, stage });
  }
  return items;
}

export default function LifeStageControl({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const items = useMemo(() => buildRounds(level), [level]);

  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<'stage' | 'weed' | 'control' | 'feedback'>('stage');
  const [stageAnswer, setStageAnswer] = useState<Stage | null>(null);
  const [weedAnswer, setWeedAnswer] = useState<string | null>(null);
  const [controlAnswer, setControlAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [money, setMoney] = useState(0);

  const done = idx >= items.length;
  const current = !done ? items[idx] : null;

  // Generate distractors for weed identification
  const weedOptions = useMemo(() => {
    if (!current) return [];
    const others = shuffle(weeds.filter(w => w.id !== current.weed.id)).slice(0, 3);
    return shuffle([current.weed, ...others]);
  }, [idx, current?.weed.id]);

  // Pick 4-5 control options shuffled, including valid ones for current stage
  const controlOptions = useMemo(() => {
    if (!current) return [];
    const valid = CONTROLS.filter(c => c.stages.includes(current.stage));
    const invalid = CONTROLS.filter(c => !c.stages.includes(current.stage));
    const picked = [...valid, ...shuffle(invalid).slice(0, Math.max(0, 5 - valid.length))];
    return shuffle(picked);
  }, [idx, current?.stage]);

  const validControlIds = current ? CONTROLS.filter(c => c.stages.includes(current.stage)).map(c => c.id) : [];

  const handleStage = (s: Stage) => {
    setStageAnswer(s);
    if (s === current!.stage) setScore(sc => sc + 1);
    setStep('weed');
  };

  const handleWeed = (id: string) => {
    setWeedAnswer(id);
    if (id === current!.weed.id) setScore(sc => sc + 1);
    setStep('control');
  };

  const handleControl = (cId: string) => {
    setControlAnswer(cId);
    const stageOk = stageAnswer === current!.stage;
    const weedOk = weedAnswer === current!.weed.id;
    const controlOk = validControlIds.includes(cId);
    if (controlOk) setScore(sc => sc + 1);
    // Money rewards mastery of all THREE — only full payout when all correct.
    if (stageOk && weedOk && controlOk) setMoney(m => m + 100);
    else if ([stageOk, weedOk, controlOk].filter(Boolean).length === 2) setMoney(m => m + 25);
    else setMoney(m => m + 5);
    setStep('feedback');
  };

  const next = () => {
    setIdx(i => i + 1);
    setStep('stage');
    setStageAnswer(null);
    setWeedAnswer(null);
    setControlAnswer(null);
  };

  const restart = () => {
    setIdx(0); setScore(0); setStep('stage');
    setStageAnswer(null); setWeedAnswer(null); setControlAnswer(null);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    const maxScore = items.length * 3;
    return (
      <LifeStageShop
        money={money}
        level={level}
        score={score}
        maxScore={maxScore}
        onSpend={(amount) => setMoney(m => m - amount)}
        onNextLevel={nextLevel}
        onStartOver={startOver}
        onBack={onBack}
      />
    );
  }

  const stageCorrect = stageAnswer === current!.stage;
  const weedCorrect = weedAnswer === current!.weed.id;
  const controlCorrect = controlAnswer ? validControlIds.includes(controlAnswer) : false;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Life Stage Control</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm font-bold text-green-600">${money}</span>
        <span className="text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {/* Weed image */}
        <div className="w-48 h-48 rounded-xl overflow-hidden bg-secondary mb-3">
          <WeedImage weedId={current!.weed.id} stage={STAGE_IMAGE_MAP[current!.stage]} className="w-full h-full object-cover" />
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-4">
          {['Stage', 'Weed', 'Control'].map((label, i) => {
            const stepNames = ['stage', 'weed', 'control', 'feedback'] as const;
            const currentIdx = stepNames.indexOf(step);
            const isComplete = currentIdx > i;
            const isCurrent = currentIdx === i;
            // Determine correctness per step (only known after answered)
            let stepCorrect: boolean | null = null;
            if (i === 0 && stageAnswer) stepCorrect = stageAnswer === current!.stage;
            else if (i === 1 && weedAnswer) stepCorrect = weedAnswer === current!.weed.id;
            else if (i === 2 && controlAnswer) stepCorrect = validControlIds.includes(controlAnswer);
            return (
              <span key={label} className={`px-3 py-1 rounded-full text-xs font-bold ${
                isComplete && stepCorrect === true ? 'bg-green-500/20 text-green-500' :
                isComplete && stepCorrect === false ? 'bg-destructive/20 text-destructive' :
                isCurrent ? 'bg-primary text-primary-foreground' :
                'bg-secondary text-muted-foreground'
              }`}>{i + 1}. {label}</span>
            );
          })}
        </div>

        {/* Step 1: Identify life stage */}
        {step === 'stage' && (
          <>
            <p className="font-bold text-foreground mb-3 text-center">What life stage is shown in the image?</p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {STAGES.map(s => (
                <button key={s} onClick={() => handleStage(s)}
                  className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-sm font-medium text-foreground transition-all">
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Identify the weed */}
        {step === 'weed' && (
          <>
            <p className={`text-sm font-bold mb-1 ${stageCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {stageCorrect ? 'Correct stage!' : `Not quite -- it's the ${STAGE_LABELS[current!.stage]} stage.`}
            </p>
            <p className="font-bold text-foreground mb-3 text-center">Which weed is shown in the image?</p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {weedOptions.map(w => (
                <button key={w.id} onClick={() => handleWeed(w.id)}
                  className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-sm font-medium text-foreground transition-all">
                  {w.commonName}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Choose control method */}
        {step === 'control' && (
          <>
            <p className={`text-sm font-bold mb-1 ${weedCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {weedCorrect ? 'Correct weed!' : `That's ${current!.weed.commonName}.`}
            </p>
            <p className="font-bold text-foreground mb-3 text-center">
              How should you manage {current!.weed.commonName} at the {STAGE_LABELS[current!.stage].toLowerCase()} stage?
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {controlOptions.map(c => (
                <button key={c.id} onClick={() => handleControl(c.id)}
                  className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-sm font-medium text-foreground transition-all">
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Feedback */}
        {step === 'feedback' && (
          <div className="w-full max-w-sm">
            <div className="bg-card border border-border rounded-xl p-4 mb-4">
              <p className="font-bold text-foreground mb-2">{current!.weed.commonName}</p>
              <p className="text-xs text-muted-foreground italic mb-2">{current!.weed.scientificName}</p>
              {stageCorrect && weedCorrect && controlCorrect ? (
                <p className="text-sm font-bold text-green-600 mb-2">+$100 — Perfect! All three matter to control this weed.</p>
              ) : (
                <p className="text-xs text-amber-600 mb-2 font-semibold">
                  Knowing the stage, the species, AND the right control all together unlocks the full $100 reward — partial knowledge still leaves money on the table.
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${stageCorrect ? 'text-green-500' : 'text-destructive'}`}>
                    {stageCorrect ? 'Stage: Correct' : `Stage: ${STAGE_LABELS[current!.stage]}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${weedCorrect ? 'text-green-500' : 'text-destructive'}`}>
                    {weedCorrect ? 'Weed ID: Correct' : `Weed: ${current!.weed.commonName}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${controlCorrect ? 'text-green-500' : 'text-destructive'}`}>
                    {controlCorrect ? 'Control: Correct' : `Best: ${CONTROLS.filter(c => c.stages.includes(current!.stage)).map(c => c.label).join(', ')}`}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3">{current!.weed.management}</p>
              <p className="text-xs text-muted-foreground mt-1">Timing: {current!.weed.controlTiming}</p>
            </div>
            <button onClick={next} className="w-full px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
          <FloatingCoach grade="6-8" tip={`Control is most effective at vulnerable growth stages — usually early seedling.`} />
</div>
  );
}
