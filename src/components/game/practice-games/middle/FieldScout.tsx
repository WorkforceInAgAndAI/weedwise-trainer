import { useState, useMemo } from 'react';
import { DollarSign, Search, Target, Fingerprint, FileSearch } from 'lucide-react';
import WeedImage from '@/components/game/WeedImage';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import aerialCorn from '@/assets/images/aerial_corn_field.jpg';
import aerialSoybean from '@/assets/images/aerial_soybean_field.jpg';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const WEED_IDS = weeds.map(w => w.id);

const MIN_DIST = 10;

function generateWeedSpots(layout: WeedLayout, count: number, seed: number): Array<{ x: number; y: number; weedId: string }> {
  const spots: Array<{ x: number; y: number; weedId: string }> = [];
  const ids = shuffle(WEED_IDS);
  const maxAttempts = 100;
  for (let i = 0; i < count; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // True random scatter for all layouts — no straight lines
      const x = 5 + Math.random() * 90;
      const y = 5 + Math.random() * 90;
      const tooClose = spots.some(s => {
        const dx = s.x - x; const dy = s.y - y;
        return Math.sqrt(dx * dx + dy * dy) < MIN_DIST;
      });
      if (!tooClose) {
        spots.push({ x, y, weedId: ids[i % ids.length] });
        placed = true;
        break;
      }
    }
    if (!placed) {
      // Fallback with jitter to avoid lines
      spots.push({ x: 5 + Math.random() * 90, y: 5 + Math.random() * 90, weedId: ids[i % ids.length] });
    }
  }

  // Apply layout-specific clustering after random placement
  if (layout === 'center') {
    return spots.map(s => ({ ...s, x: 15 + (s.x - 5) * 0.7, y: 15 + (s.y - 5) * 0.7 }));
  }
  if (layout === 'edges') {
    return spots.map((s, i) => {
      const side = i % 4;
      if (side === 0) return { ...s, x: 2 + Math.random() * 12, y: s.y };
      if (side === 1) return { ...s, x: 86 + Math.random() * 12, y: s.y };
      if (side === 2) return { ...s, y: 2 + Math.random() * 12, x: s.x };
      return { ...s, y: 86 + Math.random() * 12, x: s.x };
    });
  }
  if (layout === 'clumped') {
    const centers = [{ cx: 25, cy: 30 }, { cx: 60, cy: 40 }, { cx: 40, cy: 70 }];
    return spots.map((s, i) => {
      const c = centers[i % centers.length];
      return { ...s, x: c.cx + (Math.random() * 20 - 10), y: c.cy + (Math.random() * 20 - 10) };
    });
  }
  return spots;
}

const PATTERNS = [
  { id: 'w', name: 'W-Pattern', desc: 'Walk in a "W" shape across the field — covers center and edges efficiently.', best: ['mixed', 'scattered'] },
  { id: 'z', name: 'Z-Pattern', desc: 'Zig-zag across the field in a "Z" shape — good for long rectangular fields.', best: ['rows', 'diagonal'] },
  { id: 'x', name: 'X-Pattern', desc: 'Walk from corner to corner in an "X" — covers all quadrants.', best: ['center', 'clumped'] },
  { id: 'edge', name: 'Edge Walk', desc: 'Walk around the perimeter — good for spotting boundary-specific weeds.', best: ['edges'] },
];

type WeedLayout = 'mixed' | 'rows' | 'center' | 'edges' | 'clumped' | 'diagonal' | 'scattered';

interface FieldDef {
  id: number;
  crop: 'corn' | 'soybean';
  weedLayout: WeedLayout;
  label: string;
  bestPattern: string;
  weedCount: number;
  note: string;
}

const FIELDS: FieldDef[] = [
  { id: 1, crop: 'corn', weedLayout: 'mixed', label: 'Square corn field with mixed weed patches throughout', bestPattern: 'w', weedCount: 14, note: 'W-pattern crosses the most ground for mixed distributions.' },
  { id: 2, crop: 'soybean', weedLayout: 'rows', label: 'Long narrow soybean field with weeds along rows', bestPattern: 'z', weedCount: 9, note: 'Z-pattern works best for long fields by crossing each row.' },
  { id: 3, crop: 'soybean', weedLayout: 'center', label: 'Soybean field with weeds concentrated in the center', bestPattern: 'x', weedCount: 18, note: 'X-pattern hits the center where the weeds are concentrated.' },
  { id: 4, crop: 'soybean', weedLayout: 'edges', label: 'Soybean field with weed pressure on the edges', bestPattern: 'edge', weedCount: 7, note: 'Edge walks catch boundary weeds that other patterns miss.' },
  { id: 5, crop: 'corn', weedLayout: 'clumped', label: 'Corn field with clustered weed patches in 2-3 spots', bestPattern: 'x', weedCount: 12, note: 'X-pattern finds clumped patches by crossing through them.' },
  { id: 6, crop: 'soybean', weedLayout: 'diagonal', label: 'Soybean field with weeds spreading diagonally from a corner', bestPattern: 'z', weedCount: 10, note: 'Z-pattern catches diagonal spreads across the field.' },
  { id: 7, crop: 'corn', weedLayout: 'scattered', label: 'Large corn field with randomly scattered weeds', bestPattern: 'w', weedCount: 16, note: 'W-pattern is most efficient for randomly scattered weeds.' },
  { id: 8, crop: 'soybean', weedLayout: 'edges', label: 'Soybean field with heavy weed pressure along the field margins', bestPattern: 'edge', weedCount: 11, note: 'Margin weeds are best found with an edge walk.' },
  { id: 9, crop: 'soybean', weedLayout: 'center', label: 'Soybean field with a dense weed patch in the middle', bestPattern: 'x', weedCount: 15, note: 'The X-pattern crosses through the center where weeds are densest.' },
  { id: 10, crop: 'corn', weedLayout: 'rows', label: 'Corn field with weeds emerging between crop rows', bestPattern: 'z', weedCount: 13, note: 'Z-pattern effectively crosses between rows to find emerging weeds.' },
];

const CROP_IMAGES: Record<string, string[]> = {
  corn: [aerialCorn],
  soybean: [aerialSoybean],
};

const TOTAL_ROUNDS = 10;
const CORRECT_PAY = 50;
const WRONG_PAY = 10;

export default function FieldScout({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const fieldOrder = useMemo(() => {
    const shuffled = shuffle([...FIELDS]);
    const result: FieldDef[] = [];
    for (let i = 0; i < TOTAL_ROUNDS; i++) {
      result.push(shuffled[i % shuffled.length]);
    }
    return result;
  }, []);

  const [showIntro, setShowIntro] = useState(true);
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [scouting, setScouting] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [money, setMoney] = useState(0);

  const finished = round >= TOTAL_ROUNDS;
  const field = !finished ? fieldOrder[round] : fieldOrder[0];

  const weedSpots = useMemo(() => {
    if (finished) return [];
    return generateWeedSpots(field.weedLayout, field.weedCount, field.id * 17 + round * 31);
  }, [round, finished]);

  const cropImg = useMemo(() => {
    if (finished) return '';
    const imgs = CROP_IMAGES[field.crop] || CROP_IMAGES.corn;
    return imgs[round % imgs.length];
  }, [round, finished]);

  const select = (pId: string) => {
    if (scouting || done) return;
    setChosen(pId);
  };

  const scout = () => {
    if (!chosen) return;
    setScouting(true);
    setTimeout(() => {
      setScouting(false);
      setDone(true);
      const correct = chosen === field.bestPattern;
      if (correct) {
        setScore(s => s + 1);
        setMoney(m => m + CORRECT_PAY);
      } else {
        setMoney(m => m + WRONG_PAY);
      }
    }, 2000);
  };

  // Simulate weeds found by chosen pattern: best pattern finds ~all, others find a fraction
  const weedsFound = useMemo(() => {
    if (!done || !chosen) return 0;
    if (chosen === field.bestPattern) return field.weedCount;
    // Less effective patterns find roughly 35-60% of weeds
    const ratios: Record<string, number> = { w: 0.5, z: 0.45, x: 0.4, edge: 0.35 };
    return Math.max(1, Math.round(field.weedCount * (ratios[chosen] ?? 0.4)));
  }, [done, chosen, field]);

  const next = () => { setRound(r => r + 1); setChosen(null); setDone(false); };
  const restart = () => { setRound(0); setChosen(null); setDone(false); setScore(0); setMoney(0); setShowIntro(true); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 z-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-4">
          <Fingerprint className="w-16 h-16 text-emerald-400" />
          <FileSearch className="w-6 h-6 text-amber-300 absolute -bottom-1 -right-1" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-amber-300 mb-1">Case File Opened</p>
        <h2 className="text-2xl font-bold text-white mb-3">Field Detective</h2>
        <p className="text-emerald-100/80 max-w-md mb-2">
          A farmer just called: something is stealing yield from their fields. Your job — read the crime scene, pick the right search route, and catch the culprits.
        </p>
        <p className="text-emerald-100/80 max-w-md mb-2">
          Solve the case: <span className="font-bold text-amber-300">${CORRECT_PAY}</span> reward for the right route, <span className="font-bold text-white/60">${WRONG_PAY}</span> if you miss suspects.
        </p>
        <p className="text-emerald-100/60 max-w-md mb-6 text-sm">
          {TOTAL_ROUNDS} case files. Crack them all.
        </p>
        <button onClick={() => setShowIntro(false)} className="px-8 py-3 rounded-lg bg-amber-400 text-slate-900 font-bold hover:bg-amber-300 transition-colors">
          Open First Case →
        </button>
      </div>
    );
  }

  if (finished) {
    const maxMoney = TOTAL_ROUNDS * CORRECT_PAY;
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 z-50 flex flex-col items-center justify-center p-6 text-center">
        <Fingerprint className="w-12 h-12 text-amber-300 mb-3" />
        <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-amber-300 mb-1">Case Closed</p>
        <h2 className="text-2xl font-bold text-white mb-2">Detective's Report</h2>
        <p className="text-lg text-emerald-100 mb-1">{score}/{TOTAL_ROUNDS} cases cracked</p>
        <p className="text-2xl font-bold text-amber-300 mb-2">${money} reward</p>
        <p className="text-sm text-emerald-100/60 mb-6">Out of ${maxMoney} possible</p>
        <LevelComplete level={level} score={score} total={TOTAL_ROUNDS} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  const isCorrect = chosen === field.bestPattern;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-amber-400/30 bg-slate-950/70 backdrop-blur">
        <button onClick={onBack} className="text-emerald-100/70 hover:text-white text-xl">←</button>
        <Fingerprint className="w-5 h-5 text-amber-300" />
        <h1 className="font-bold text-white text-lg flex-1">Field Detective</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold ml-auto">Lv.{level}</span>
        <div className="flex items-center gap-1 text-amber-300 font-bold text-sm">
          <DollarSign className="w-4 h-4" />
          {money}
        </div>
        <span className="text-sm text-emerald-100/70 ml-2">Case {round + 1}/{TOTAL_ROUNDS}</span>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 h-full">
          {/* LEFT: field image */}
          <div className="relative rounded-xl border-2 border-amber-400/40 overflow-hidden min-h-[300px] shadow-[0_0_40px_-10px] shadow-amber-400/20">
            <img src={cropImg} alt="Aerial field view" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-slate-950/80 border border-amber-400/40 text-[10px] uppercase tracking-widest font-bold text-amber-300">Crime Scene</div>
            {weedSpots.map((spot, i) => (
              <div key={i} className="absolute w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-md overflow-hidden" style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%,-50%)' }}>
                <WeedImage weedId={spot.weedId} stage="flower" className="w-full h-full object-cover" />
              </div>
            ))}
            {(scouting || done) && chosen && (
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="none">
                {chosen === 'w' && <polyline points="20,180 75,40 150,160 225,40 280,180" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className={scouting ? 'animate-pulse' : ''} />}
                {chosen === 'z' && <polyline points="20,40 280,40 20,180 280,180" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className={scouting ? 'animate-pulse' : ''} />}
                {chosen === 'x' && <><line x1="20" y1="20" x2="280" y2="180" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className={scouting ? 'animate-pulse' : ''} /><line x1="280" y1="20" x2="20" y2="180" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className={scouting ? 'animate-pulse' : ''} /></>}
                {chosen === 'edge' && <rect x="20" y="20" width="260" height="160" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8" className={scouting ? 'animate-pulse' : ''} />}
              </svg>
            )}
          </div>

          {/* RIGHT: side panel — description, methods, results */}
          <div className="overflow-y-auto pr-1 space-y-3">
            <div className="rounded-xl border-2 border-amber-400/40 bg-slate-950/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-300 mb-1">Case Brief</p>
              <p className="text-sm text-emerald-50 font-medium">{field.label}</p>
              <p className="text-xs text-emerald-100/60 mt-1">Crop: <span className="font-semibold capitalize text-emerald-100">{field.crop}</span></p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-300 mb-2">Choose your search route</p>
              <div className="space-y-2">
                {PATTERNS.map(p => (
                  <button key={p.id} onClick={() => select(p.id)} disabled={done || scouting}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      done ? (p.id === field.bestPattern ? 'border-emerald-400 bg-emerald-400/15' : p.id === chosen ? 'border-red-500 bg-red-500/15' : 'border-slate-700 bg-slate-900/60 opacity-50')
                      : chosen === p.id ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/30' : 'border-slate-700 bg-slate-900/60 hover:border-amber-400/50'
                    }`}>
                    <span className="font-bold text-sm text-white">{p.name}</span>
                    <p className="text-xs text-emerald-100/70 mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {!done && chosen && !scouting && (
              <button onClick={scout} className="w-full py-3 rounded-lg bg-amber-400 text-slate-900 font-bold hover:bg-amber-300 transition-colors">Investigate →</button>
            )}
            {scouting && <p className="text-center text-amber-300 font-bold animate-pulse">Investigating scene...</p>}

            {done && (
              <div className={`rounded-xl border-2 p-4 ${isCorrect ? 'border-emerald-400 bg-emerald-400/10' : 'border-red-500/60 bg-red-500/10'}`}>
                {/* Money — large and prominent */}
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-300">Reward</span>
                  <span className={`text-3xl font-extrabold ${isCorrect ? 'text-emerald-300' : 'text-amber-300'}`}>+${isCorrect ? CORRECT_PAY : WRONG_PAY}</span>
                </div>

                {/* Weeds found vs optimal */}
                <div className="bg-slate-950/60 rounded-lg p-2 mb-2 border border-slate-700">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1 text-emerald-100"><Search className="w-3 h-3" /> Suspects caught</span>
                    <span className="font-bold text-white">{weedsFound}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-emerald-100/60"><Target className="w-3 h-3" /> Total on scene</span>
                    <span className="font-bold text-emerald-300">{field.weedCount}</span>
                  </div>
                  {!isCorrect && (
                    <p className="text-[11px] text-amber-300 mt-2 font-semibold">
                      {field.weedCount - weedsFound} suspects escaped. Best route: {PATTERNS.find(p => p.id === field.bestPattern)?.name}
                    </p>
                  )}
                </div>

                <p className="text-xs text-emerald-100/70 mb-3 italic">Detective's note: {field.note}</p>
                <button onClick={next} className="w-full py-2.5 rounded-lg bg-amber-400 text-slate-900 font-bold text-sm hover:bg-amber-300 transition-colors">Next Case →</button>
              </div>
            )}
          </div>
        </div>
      </div>
          <FloatingCoach grade="6-8" tip={`Scout systematically — note density, growth stage, and patterns before recommending action.`} />
</div>
  );
}
