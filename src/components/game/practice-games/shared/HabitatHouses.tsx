import { useMemo, useState } from 'react';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import { HABITAT_HOUSES, resolveHabitatHome, type HabitatId } from '@/data/habitatHomes';
import type { Weed } from '@/types/game';
import { Sprout, Wheat, Route, Trees, Waves, Droplets, Sun, Home } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const HOUSE_ICONS: Record<HabitatId, typeof Home> = {
  cropland: Sprout,
  pasture: Wheat,
  roadside: Route,
  woodland: Trees,
  wetland: Waves,
  wet: Droplets,
  dry: Sun,
};

/** Each village house gets its own colour so students can tell them apart. */
const HOUSE_COLORS: Record<HabitatId, { border: string; bg: string; roof: string; icon: string }> = {
  cropland: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', roof: 'bg-emerald-500', icon: 'text-emerald-700' },
  pasture:  { border: 'border-amber-500',   bg: 'bg-amber-500/10',   roof: 'bg-amber-500',   icon: 'text-amber-700' },
  roadside: { border: 'border-slate-500',   bg: 'bg-slate-500/10',   roof: 'bg-slate-500',   icon: 'text-slate-700' },
  woodland: { border: 'border-green-800',   bg: 'bg-green-800/10',   roof: 'bg-green-800',   icon: 'text-green-900' },
  wetland:  { border: 'border-teal-500',    bg: 'bg-teal-500/10',    roof: 'bg-teal-500',    icon: 'text-teal-700' },
  wet:      { border: 'border-sky-500',     bg: 'bg-sky-500/10',     roof: 'bg-sky-500',     icon: 'text-sky-700' },
  dry:      { border: 'border-orange-500',  bg: 'bg-orange-500/10',  roof: 'bg-orange-500',  icon: 'text-orange-700' },
};

const ROUNDS = 6;

interface Props {
  weeds: Weed[];
  /** Life stage photo shown for the weed. */
  stage?: string;
  /** Collegiate level: fewer / shorter characteristic clues. */
  short?: boolean;
  title?: string;
  onBack: () => void;
}

export default function HabitatHouses({ weeds, stage = 'vegetative', short = false, title = 'Pick Your House', onBack }: Props) {
  const [level, setLevel] = useState(1);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<HabitatId | null>(null);

  const rounds = useMemo(() => {
    const usable = weeds
      .map(w => ({ weed: w, home: resolveHabitatHome(w.commonName) }))
      .filter((r): r is { weed: Weed; home: NonNullable<ReturnType<typeof resolveHabitatHome>> } => !!r.home);
    return shuffle(usable).slice(0, ROUNDS);
  }, [weeds, level]);

  const current = rounds[idx];
  const done = idx >= rounds.length || rounds.length === 0;

  const restart = () => { setIdx(0); setScore(0); setPicked(null); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    return <LevelComplete level={level} score={score} total={Math.max(rounds.length, 1)} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  const correctSet = current.home.habitats;
  const isRight = picked ? correctSet.includes(picked) : false;
  const traits = short ? current.home.traits.slice(0, 2) : current.home.traits;

  const choose = (id: HabitatId) => { if (!picked) { setPicked(id); if (correctSet.includes(id)) setScore(s => s + 1); } };
  const next = () => { setPicked(null); setIdx(i => i + 1); };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 pb-28">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Which house would you most like to move in to?</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
        </div>

        {/* Your characteristics */}
        <div className="rounded-2xl border-2 border-border bg-card p-4 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Your characteristics</p>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1">
            {traits.map(t => (
              <li key={t} className="text-sm text-foreground flex gap-2">
                <span className="text-primary font-bold">•</span>
                <span>{t.charAt(0).toUpperCase() + t.slice(1)}.</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm font-semibold text-foreground mb-2 text-center">
          Which house could you survive in best? Knock on a door.
        </p>

        {/* Houses laid out like a village circle, with you in the middle */}
        <div className="relative mx-auto w-full max-w-[760px] aspect-square">
          <div className="absolute inset-[29%] rounded-full border-4 border-dashed border-primary/25 bg-primary/5 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
            <div className="w-[46%] aspect-square rounded-full overflow-hidden border-4 border-primary/40 bg-secondary shrink-0">
              <WeedImage key={`${current.weed.id}-${stage}`} weedId={current.weed.id} stage={stage} className="w-full h-full object-cover" />
            </div>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground leading-none">You are</p>
            <p className="font-display font-bold text-sm sm:text-lg text-foreground leading-tight px-1">{current.weed.commonName}</p>
            <p className="text-[10px] sm:text-xs italic text-muted-foreground leading-tight px-1">{current.weed.scientificName}</p>
          </div>
          {HABITAT_HOUSES.map((h, i) => {
            const Icon = HOUSE_ICONS[h.id];
            const isCorrect = correctSet.includes(h.id);
            const c = HOUSE_COLORS[h.id];
            let tone = `${c.border} ${c.bg} hover:scale-105`;
            if (picked) {
              if (isCorrect) tone = 'border-green-600 bg-green-500/15';
              else if (h.id === picked) tone = 'border-destructive bg-destructive/15';
              else tone = `${c.border} ${c.bg} opacity-50`;
            }
            const angle = (i / HABITAT_HOUSES.length) * Math.PI * 2 - Math.PI / 2;
            const left = 50 + Math.cos(angle) * 42;
            const top = 50 + Math.sin(angle) * 42;
            return (
              <button
                key={h.id}
                onClick={() => choose(h.id)}
                disabled={!!picked}
                style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%,-50%)' }}
                className={`absolute w-[24%] rounded-xl border-4 p-0 overflow-hidden text-center transition-all ${tone}`}
              >
                <div className={`h-5 w-full ${c.roof}`} style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }} />
                <div className="p-2">
                  <div className={`mx-auto w-10 h-11 rounded-t-md border-2 ${c.border} bg-background/70 flex flex-col items-center justify-center gap-1`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                    <span className={`w-1.5 h-1.5 rounded-full ${c.roof}`} />
                  </div>
                  <p className="mt-1.5 text-xs sm:text-sm font-extrabold text-foreground leading-tight">{h.label}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight mt-0.5">{short ? h.shortBlurb : h.blurb}</p>
                </div>
              </button>
            );
          })}
        </div>


        {picked && (
          <div className={`mt-4 rounded-xl border-2 p-4 ${isRight ? 'border-green-600 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
            <p className={`font-bold ${isRight ? 'text-green-700' : 'text-destructive'}`}>
              {isRight ? 'Good home! You would thrive here.' : 'You would struggle there.'}
            </p>
            <p className="text-sm text-foreground mt-1">
              {current.weed.commonName} lives in: {correctSet.map(c => HABITAT_HOUSES.find(h => h.id === c)?.label).join(' + ')}.
            </p>
            <button onClick={next} className="mt-3 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">
              {idx + 1 < rounds.length ? 'Next Weed' : 'Finish Level'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}