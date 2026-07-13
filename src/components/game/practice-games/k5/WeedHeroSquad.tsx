import { useState } from 'react';
import { ArrowLeft, Sprout, Hand, Shield, Brain, Bug, Zap, Check, X, Shrub } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

type HeroKey = 'pull' | 'block' | 'outsmart' | 'eat' | 'stop';

interface Hero {
  key: HeroKey;
  name: string;
  power: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  ring: string;
}

const HEROES: Hero[] = [
  { key: 'pull',     name: 'Pull It!',     power: 'Super Strength',  Icon: Hand,   color: 'text-orange-700', ring: 'border-orange-500' },
  { key: 'block',    name: 'Block It!',    power: 'Force Field',     Icon: Shield, color: 'text-sky-700',    ring: 'border-sky-500' },
  { key: 'outsmart', name: 'Outsmart It!', power: 'Brain Power',     Icon: Brain,  color: 'text-primary',    ring: 'border-primary' },
  { key: 'eat',      name: 'Eat It!',      power: 'Animal Allies',   Icon: Bug,    color: 'text-emerald-700',ring: 'border-emerald-500' },
  { key: 'stop',     name: 'Stop It!',     power: 'Precision Blast', Icon: Zap,    color: 'text-yellow-700', ring: 'border-yellow-500' },
];

interface Mission {
  crop: string;
  villain: string;
  scene: string;
  best: HeroKey;
  win: string;
  wrongHint: string;
}

const MISSIONS: Mission[] = [
  {
    crop: 'Tomato Patch',
    villain: 'A few young dandelions in the backyard garden',
    scene: 'Only a handful of weeds have popped up in a small garden — and they have not made seeds yet. Which hero should you send?',
    best: 'pull',
    win: 'Pull It uses super strength to yank the young weeds out — roots and all — before they can spread!',
    wrongHint: 'A tiny garden with just a few young weeds is a perfect job for Pull It!',
  },
  {
    crop: 'Flower Bed',
    villain: 'Weed seeds sleeping in the soil, waiting for sunlight',
    scene: 'The soil is full of weed seeds. If they get sunlight, they will sprout everywhere! Which hero can stop them?',
    best: 'block',
    win: 'Block It lays down mulch and fabric — the seeds never get the sunlight they need to sprout!',
    wrongHint: 'Sleeping seeds need sunlight to wake up. Block It puts up a force field of mulch!',
  },
  {
    crop: 'Corn Field',
    villain: 'Weeds sneaking into gaps between crop rows',
    scene: 'A big field has open spaces where weeds keep sneaking in. Which hero plans the crops so weeds cannot fit?',
    best: 'outsmart',
    win: 'Outsmart It plants strong crops close together — no room, no sunlight, no chance for weeds!',
    wrongHint: 'Planting healthy crops close together beats weeds with brain power. That is Outsmart It!',
  },
  {
    crop: 'Steep Hillside Pasture',
    villain: 'Prickly weeds on a steep hill where tractors cannot go',
    scene: 'The hill is too steep for machines and too big to pull by hand. Which hero brings in animal allies?',
    best: 'eat',
    win: 'Eat It sends in goats and sheep — they munch the weeds and leave the good plants alone!',
    wrongHint: 'Steep hills are perfect for hungry goats. Eat It calls the animal allies!',
  },
  {
    crop: 'Giant Soybean Field',
    villain: 'Millions of weeds spread across acres of crops',
    scene: 'The field is huge — too big to pull every weed by hand. Which hero uses a careful, precise weed-control product?',
    best: 'stop',
    win: 'Stop It uses herbicide with a precision blast — only when needed, only where needed. Crops are safe!',
    wrongHint: 'Huge fields with too many weeds need Stop It — the precision blast used carefully by farmers.',
  },
  {
    crop: 'School Vegetable Garden',
    villain: 'One giant thistle right next to the lettuce',
    scene: 'Just one big weed is bullying your lettuce. It has not made seeds yet. Which hero handles it?',
    best: 'pull',
    win: 'Pull It grabs the thistle with super strength — one weed, one heroic pull!',
    wrongHint: 'A single weed you can grab is a job for Pull It!',
  },
  {
    crop: 'Fruit Tree Row',
    villain: 'Weed seeds trying to sprout around apple trees',
    scene: 'You want to protect the soil around a row of apple trees all season long. Which hero sets a force field?',
    best: 'block',
    win: 'Block It covers the soil with mulch — the trees drink the water and the weeds get shut out!',
    wrongHint: 'To protect soil all season, use Block It — mulch is a superpower!',
  },
  {
    crop: 'Wheat Field',
    villain: 'Empty patches where the crop grew thin',
    scene: 'Bare spots between the wheat plants let weeds sneak in. Which hero plans a thicker crop next time?',
    best: 'outsmart',
    win: 'Outsmart It plants crops closer together — no gaps means no weeds!',
    wrongHint: 'Fixing the plan and planting thicker crops is Outsmart It using Brain Power!',
  },
];

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function WeedHeroSquad({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<HeroKey | null>(null);
  const [done, setDone] = useState(false);
  const [rescued, setRescued] = useState(0);

  const mission = MISSIONS[step];
  const answered = picked !== null;
  const isCorrect = answered && picked === mission.best;

  const choose = (k: HeroKey) => {
    if (answered) return;
    setPicked(k);
    if (k === mission.best) {
      setScore(s => s + 1);
      setRescued(r => r + 1);
    }
  };

  const next = () => {
    if (step + 1 >= MISSIONS.length) {
      setDone(true);
    } else {
      setStep(s => s + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setStep(0); setScore(0); setPicked(null); setDone(false); setRescued(0);
  };

  const nextLevel = () => { setLevel(l => l + 1); restart(); };

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={score}
        total={MISSIONS.length}
        onNextLevel={nextLevel}
        onStartOver={restart}
        onBack={onBack}
        title={score === MISSIONS.length ? 'Weed-Fighting Hero of the Year!' : 'Crops rescued — assemble the squad again!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const bestHero = HEROES.find(h => h.key === mission.best)!;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-card border-2 border-primary/40 rounded-lg p-4 mb-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-6 h-6 text-primary" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">Weed Hero Squad</h1>
            <p className="text-xs text-muted-foreground">Pick the right superpower to rescue the crops!</p>
          </div>
          <div className="text-sm font-semibold text-foreground bg-muted px-3 py-1 rounded-full">
            Mission {step + 1} / {MISSIONS.length}
          </div>
        </div>

        {/* Progress + rescued crops */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1 flex-1">
            {MISSIONS.map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full ${i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <Sprout className="w-4 h-4" /> {rescued} rescued
          </div>
        </div>

        {/* Mission card */}
        <div className="bg-card border-2 border-border rounded-lg p-5 space-y-4 animate-scale-in">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3 text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-1">Protect</div>
              <Sprout className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-emerald-900 mt-1">{mission.crop}</div>
            </div>
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-3 text-center">
              <div className="text-xs font-bold uppercase tracking-wide text-red-700 mb-1">Villain</div>
              <Shrub className="w-8 h-8 text-red-600 mx-auto" />
              <div className="text-sm font-bold text-red-900 mt-1">{mission.villain}</div>
            </div>
          </div>

          <p className="text-foreground text-base leading-relaxed">{mission.scene}</p>

          {/* Hero picker */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Send a Hero:</div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {HEROES.map(h => {
                const isPick = picked === h.key;
                const isBest = h.key === mission.best;
                const state = !answered
                  ? 'border-border bg-secondary/40 hover:border-primary/60 hover:bg-secondary'
                  : isBest
                    ? 'border-emerald-500 bg-emerald-50'
                    : isPick
                      ? 'border-red-500 bg-red-50'
                      : 'border-border bg-secondary/40 opacity-50';
                return (
                  <button
                    key={h.key}
                    onClick={() => choose(h.key)}
                    disabled={answered}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${state}`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-background border-2 border-current flex items-center justify-center ${h.color}`}>
                      <h.Icon className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-foreground">{h.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{h.power}</div>
                    {answered && isBest && <Check className="w-4 h-4 text-emerald-600" />}
                    {answered && isPick && !isBest && <X className="w-4 h-4 text-red-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {answered && (
            <div className={`rounded-lg p-4 border-2 animate-scale-in ${isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
              <div className="font-bold mb-1 text-foreground">
                {isCorrect ? `${bestHero.name} saves the crops!` : 'The weed got away!'}
              </div>
              <p className="text-sm text-foreground">
                {isCorrect ? mission.win : mission.wrongHint}
              </p>
              {!isCorrect && (
                <p className="text-xs text-muted-foreground mt-2">
                  Best hero for this mission: <strong>{bestHero.name}</strong> ({bestHero.power}).
                </p>
              )}
              <button
                onClick={next}
                className="mt-3 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90"
              >
                {step + 1 >= MISSIONS.length ? 'Finish Squad Day' : 'Next Mission →'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Crops rescued: <span className="font-bold text-foreground">{rescued}</span> / {step + (answered ? 1 : 0)}
        </div>
      </div>

      <FarmerGuide message="Every weed problem is different! Match the right superpower — Pull, Block, Outsmart, Eat, or Stop — to each mission." />
    </div>
  );
}