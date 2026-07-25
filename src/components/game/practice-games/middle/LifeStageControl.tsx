import { useState, useMemo } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import FloatingCoach from '@/components/game/FloatingCoach';
import { DollarSign, Lock } from 'lucide-react';
import BetweenLevelShop from '@/components/game/BetweenLevelShop';
import { usePracticeShop, type ShopItem } from '@/lib/practiceShop';

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

// SHORTER levels + persistent shop = students BUILD up their toolkit
// across levels instead of grinding a long round.
const QUESTIONS_PER_ROUND = 5;

// Only Hand Pull + Cultivation are free to start. Everything else must be
// bought between levels. Prices are tuned so a student earning full marks
// on 5 questions ($100 × 5 = $500) can afford one mid-tier tool per level.
const SHOP_CATALOG: ShopItem[] = [
  { id: 'hoe',        name: 'Hoe & Hand-Pull Kit',   cost: 100, tag: 'Mechanical', desc: 'Unlocks Hand Pull for any weed. (Starter)' },
  { id: 'pre-herb',   name: 'Pre-Emergence Herbicide', cost: 250, tag: 'Chemical',   desc: 'Unlocks Pre-emergence Herbicide.' },
  { id: 'post-herb',  name: 'Post-Emergence Herbicide', cost: 300, tag: 'Chemical',   desc: 'Unlocks Post-emergence Herbicide.' },
  { id: 'mow',        name: 'Mower',                 cost: 275, tag: 'Mechanical', desc: 'Unlocks Mow / Cut.' },
  { id: 'cover-crop', name: 'Cover-Crop Seed',       cost: 325, tag: 'Cultural',   desc: 'Unlocks Cover Crops / Competition.' },
  { id: 'spot-spray', name: 'Precision Spot Sprayer', cost: 450, tag: 'Chemical',   desc: 'Unlocks Spot Spray Treatment.' },
  { id: 'biocontrol', name: 'Biocontrol Release',    cost: 400, tag: 'Biological', desc: 'Unlocks Biological Control.' },
];

const STARTER_OWNED = ['hand-pull', 'cultivate'];

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
  const shop = usePracticeShop('life-stage-control', STARTER_OWNED, 0);
  const [earnedThisLevel, setEarnedThisLevel] = useState(0);

  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<'stage' | 'weed' | 'control' | 'feedback'>('stage');
  const [stageAnswer, setStageAnswer] = useState<Stage | null>(null);
  const [weedAnswer, setWeedAnswer] = useState<string | null>(null);
  const [controlAnswer, setControlAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const done = idx >= items.length;
  const current = !done ? items[idx] : null;

  // Generate distractors for weed identification
  const weedOptions = useMemo(() => {
    if (!current) return [];
    const others = shuffle(weeds.filter(w => w.id !== current.weed.id)).slice(0, 3);
    return shuffle([current.weed, ...others]);
  }, [idx, current?.weed.id]);

  // Pick 5 control options. GUARANTEE every owned tool is included so
  // students always have at least one clickable answer (progression must
  // never be blocked by an all-locked option set). Then fill with valid
  // options for the current stage, then invalid distractors.
  const controlOptions = useMemo(() => {
    if (!current) return [];
    const ownedSet = new Set(shop.owned);
    const owned = CONTROLS.filter(c => ownedSet.has(c.id));
    const valid = CONTROLS.filter(c => c.stages.includes(current.stage) && !ownedSet.has(c.id));
    const rest  = CONTROLS.filter(c => !c.stages.includes(current.stage) && !ownedSet.has(c.id));
    const picked = [...owned, ...valid, ...shuffle(rest)].slice(0, Math.max(5, owned.length + 1));
    return shuffle(picked);
  }, [idx, current?.stage, shop.owned]);

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
    // Locked tools are visible for awareness but not selectable.
    if (!shop.owns(cId)) return;
    setControlAnswer(cId);
    const stageOk = stageAnswer === current!.stage;
    const weedOk = weedAnswer === current!.weed.id;
    const controlOk = validControlIds.includes(cId);
    if (controlOk) setScore(sc => sc + 1);
    // Money rewards mastery of all THREE — only full payout when all correct.
    let award = 5;
    if (stageOk && weedOk && controlOk) award = 100;
    else if ([stageOk, weedOk, controlOk].filter(Boolean).length === 2) award = 25;
    shop.earn(award);
    setEarnedThisLevel(m => m + award);
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
    setIdx(0); setScore(0); setStep('stage'); setEarnedThisLevel(0);
    setStageAnswer(null); setWeedAnswer(null); setControlAnswer(null);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); shop.reset(); restart(); };

  if (done) {
    const maxScore = items.length * 3;
    return (
      <BetweenLevelShop
        title="IPM Supply Shop"
        level={level}
        score={score}
        total={maxScore}
        money={shop.money}
        owned={shop.owned}
        earnedThisLevel={earnedThisLevel}
        catalog={SHOP_CATALOG}
        onBuy={shop.buy}
        onContinue={nextLevel}
        onStartOver={startOver}
        onBack={onBack}
        gradeLabel="6-8"
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
        <span className="text-sm font-bold text-green-600 inline-flex items-center"><DollarSign className="w-3 h-3" />{shop.money}</span>
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
              {controlOptions.map(c => {
                const owned = shop.owns(c.id);
                const shopEntry = SHOP_CATALOG.find(s => s.id === c.id);
                return (
                  <button key={c.id} onClick={() => handleControl(c.id)}
                    disabled={!owned}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left flex items-center justify-between gap-2 ${
                      owned ? 'border-border bg-card hover:border-primary text-foreground'
                            : 'border-dashed border-border bg-card/50 text-muted-foreground cursor-not-allowed'
                    }`}>
                    <span>{c.label}</span>
                    {!owned && (
                      <span className="text-[10px] inline-flex items-center gap-1"><Lock className="w-3 h-3" />
                        {shopEntry ? `$${shopEntry.cost}` : 'Locked'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground italic max-w-sm text-center">
              Locked tools can be bought in the shop between levels.
            </p>
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
