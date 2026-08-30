import { useState, useMemo } from 'react';
import { highSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import FloatingCoach from '@/components/game/FloatingCoach';
import { getDifficulty, levelSlice } from '@/lib/difficulty';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const STAGES = ['seedling', 'vegetative', 'reproductive'] as const;
type Stage = typeof STAGES[number];
const STAGE_LABELS: Record<Stage, string> = { seedling: 'Seedling', vegetative: 'Vegetative', reproductive: 'Reproductive' };
const DISPLAY_STAGES = [
  { id: "seedling", label: "Seedling", image: "seedling" },
  { id: "vegetative", label: "Vegetative", image: "vegetative" },
  { id: "reproductive", label: "Flower/Repro", image: "flower" },
  { id: "mature", label: "Mature/Seed", image: "repros" },
] as const;
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

const QUESTIONS_PER_ROUND = 5;

function buildRounds(level: number, questionsPerRound = QUESTIONS_PER_ROUND) {
  const offset = ((level - 1) * questionsPerRound) % weeds.length;
  const rotated = [...weeds.slice(offset), ...weeds.slice(0, offset)];
  const pool = shuffle(rotated).slice(0, questionsPerRound * 2);

  const items: { weed: typeof weeds[0]; stage: Stage }[] = [];
  let lastStage: Stage | null = null;

  for (let i = 0; i < questionsPerRound && pool.length > 0; i++) {
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
  const d = useMemo(() => getDifficulty(level, 'ms'), [level]);
  const items = useMemo(() => buildRounds(level, d.rounds), [level, d.rounds]);

  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<'weed' | 'stage' | 'control' | 'feedback'>('weed');
  const [stageAnswer, setStageAnswer] = useState<Stage | null>(null);
  const [weedAnswer, setWeedAnswer] = useState<string | null>(null);
  const [controlAnswer, setControlAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const done = idx >= items.length;
  const current = !done ? items[idx] : null;

  // Generate distractors for weed identification
  const weedOptions = useMemo(() => {
    if (!current) return [];
    const others = shuffle(weeds.filter(w => w.id !== current.weed.id)).slice(0, Math.max(2, d.options - 1));
    return shuffle([current.weed, ...others]);
  }, [idx, current?.weed.id, d.options]);

  // Pick control options: all valid options for the current stage plus
  // shuffled distractors, capped at 5 total.
  const controlOptions = useMemo(() => {
    if (!current) return [];
    const valid = CONTROLS.filter(c => c.stages.includes(current.stage));
    const rest  = CONTROLS.filter(c => !c.stages.includes(current.stage));
    const picked = [...valid, ...shuffle(rest)].slice(0, 5);
    return shuffle(picked);
  }, [idx, current?.stage]);

  const validControlIds = current ? CONTROLS.filter(c => c.stages.includes(current.stage)).map(c => c.id) : [];

  const handleStage = (s: Stage) => {
    setStageAnswer(s);
    if (s === current!.stage) setScore(sc => sc + 1);
    setStep('control');
  };

  const handleWeed = (id: string) => {
    setWeedAnswer(id);
    if (id === current!.weed.id) setScore(sc => sc + 1);
    setStep('stage');
  };

  const handleControl = (cId: string) => {
    setControlAnswer(cId);
    const controlOk = validControlIds.includes(cId);
    if (controlOk) setScore(sc => sc + 1);
    setStep('feedback');
  };

  const next = () => {
    setIdx(i => i + 1);
    setStep('weed');
    setStageAnswer(null);
    setWeedAnswer(null);
    setControlAnswer(null);
  };

  const restart = () => {
    setIdx(0); setScore(0); setStep('weed');
    setStageAnswer(null); setWeedAnswer(null); setControlAnswer(null);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    const maxScore = items.length * 3;
    return (
      <LevelComplete
        level={level}
        score={score}
        total={maxScore}
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
        <span className="text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {/* Weed images row */}
        <div className="flex flex-wrap gap-2 w-full max-w-3xl px-2 mb-6 justify-center">
          {DISPLAY_STAGES.map(ds => {
            const isCorrectStage = ds.id === current!.stage;
            const hasGuessedStage = step === "control" || step === "feedback";
            const showHighlight = hasGuessedStage && isCorrectStage;
            const showDim = hasGuessedStage && !isCorrectStage;
            
            return (
              <div 
                key={ds.id} 
                className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${
                  showDim ? "opacity-40 scale-95" : "opacity-100 scale-100"
                }`}
              >
                <div className={`relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-2 bg-secondary transition-all ${
                  showHighlight 
                    ? "ring-4 ring-primary ring-offset-2 border-primary shadow-lg shadow-primary/20" 
                    : "border-white/10 dark:border-white/5"
                }`}>
                  <WeedImage 
                    weedId={current!.weed.id} 
                    stage={ds.image} 
                    className="w-full h-full object-cover" 
                  />
                  {showHighlight && (
                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg z-10 animate-in zoom-in duration-300">
                      CONTROL HERE
                    </div>
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  showHighlight ? "text-primary" : "text-muted-foreground/70"
                }`}>
                  {ds.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-4">
          {['Weed', 'When', 'How'].map((label, i) => {
            const stepNames = ['weed', 'stage', 'control', 'feedback'] as const;
            const currentIdx = stepNames.indexOf(step);
            const isComplete = currentIdx > i;
            const isCurrent = currentIdx === i;
            // Determine correctness per step (only known after answered)
            let stepCorrect: boolean | null = null;
            if (i === 0 && weedAnswer) stepCorrect = weedAnswer === current!.weed.id;
            else if (i === 1 && stageAnswer) stepCorrect = stageAnswer === current!.stage;
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

        {/* Step 2: When should it be controlled? */}
        {step === 'stage' && (
          <>
            <p className={`text-sm font-bold mb-1 ${weedCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {weedCorrect ? 'Correct weed!' : `That's ${current!.weed.commonName}.`}
            </p>
            <p className="font-bold text-foreground mb-3 text-center">
              At which growth stage should you control {current!.weed.commonName}?
            </p>
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

        {/* Step 1: Name the weed */}
        {step === 'weed' && (
          <>
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
            <p className={`text-sm font-bold mb-1 ${stageCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {stageCorrect ? 'Good timing!' : `Best timing here is the ${STAGE_LABELS[current!.stage].toLowerCase()} stage.`}
            </p>
            <p className="font-bold text-foreground mb-3 text-center">
              How should you manage {current!.weed.commonName} at the {STAGE_LABELS[current!.stage].toLowerCase()} stage?
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {controlOptions.map(c => (
                <button key={c.id} onClick={() => handleControl(c.id)}
                  className="p-3 rounded-lg border-2 border-border bg-card hover:border-primary text-sm font-medium text-foreground transition-all text-left">
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
                <p className="text-sm font-bold text-green-600 mb-2">Perfect! All three matter to control this weed.</p>
              ) : (
                <p className="text-xs text-amber-600 mb-2 font-semibold">
                  Knowing the stage, the species, AND the right control together is key to effective management.
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${stageCorrect ? 'text-green-500' : 'text-destructive'}`}>
                    {stageCorrect ? 'Timing: Correct' : `Timing: ${STAGE_LABELS[current!.stage]}`}
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
