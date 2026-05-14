import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBgImage from '@/assets/images/field-background.jpg';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Diversified per-weed control methods. Each weed has its own best method drawn from
// real-world IPM guidance. Wrong options are still real techniques but a poor fit.
interface ControlMethod { id: string; label: string }
const METHOD_LIBRARY: Record<string, ControlMethod> = {
  'hand-pull': { id: 'hand-pull', label: 'Hand-pull young plants' },
  'hoe': { id: 'hoe', label: 'Hoe at the soil line' },
  'mow': { id: 'mow', label: 'Mow before flowering' },
  'tillage': { id: 'tillage', label: 'Shallow tillage between rows' },
  'pre-emergent': { id: 'pre-emergent', label: 'Spray pre-emergent herbicide' },
  'post-emergent': { id: 'post-emergent', label: 'Spray post-emergent herbicide' },
  'cover-crop': { id: 'cover-crop', label: 'Plant a cover crop to crowd it out' },
  'rotation': { id: 'rotation', label: 'Rotate to a different crop next year' },
  'spot-treat': { id: 'spot-treat', label: 'Spot-treat with herbicide' },
  'mulch': { id: 'mulch', label: 'Mulch to block sunlight' },
  'rhizome-dig': { id: 'rhizome-dig', label: 'Dig out roots and rhizomes' },
  'leave': { id: 'leave', label: 'Leave it alone' },
};

function bestMethodFor(w: typeof weeds[0]): ControlMethod {
  const m = w.management.toLowerCase();
  const lc = w.lifeCycle.toLowerCase();
  if (lc.includes('perennial') && (m.includes('rhizome') || m.includes('root'))) return METHOD_LIBRARY['rhizome-dig'];
  if (m.includes('pre-emergent') || m.includes('pre emergent')) return METHOD_LIBRARY['pre-emergent'];
  if (m.includes('post-emergent') || m.includes('post emergent')) return METHOD_LIBRARY['post-emergent'];
  if (m.includes('hand') || m.includes('pull')) return METHOD_LIBRARY['hand-pull'];
  if (m.includes('hoe')) return METHOD_LIBRARY['hoe'];
  if (m.includes('mow')) return METHOD_LIBRARY['mow'];
  if (m.includes('cover crop')) return METHOD_LIBRARY['cover-crop'];
  if (m.includes('rotation') || m.includes('rotate')) return METHOD_LIBRARY['rotation'];
  if (m.includes('mulch')) return METHOD_LIBRARY['mulch'];
  if (m.includes('tillage') || m.includes('cultivation')) return METHOD_LIBRARY['tillage'];
  if (m.includes('spot')) return METHOD_LIBRARY['spot-treat'];
  if (m.includes('herbicide') || m.includes('chemical')) return METHOD_LIBRARY['post-emergent'];
  // Hash-based fallback so each weed still gets a varied "best" method
  const keys = Object.keys(METHOD_LIBRARY).filter(k => k !== 'leave');
  const hash = w.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return METHOD_LIBRARY[keys[hash % keys.length]];
}

function methodOptionsFor(w: typeof weeds[0]): ControlMethod[] {
  const correct = bestMethodFor(w);
  const distractors = Object.values(METHOD_LIBRARY).filter(m => m.id !== correct.id);
  // Stable seed-based pick of 3 distractors per weed so options vary by species
  const hash = w.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const picked: ControlMethod[] = [];
  for (let i = 0; i < 3; i++) picked.push(distractors[(hash + i * 5) % distractors.length]);
  return shuffle([correct, ...picked]);
}

function bestMethod(w: typeof weeds[0]): string {
  return bestMethodFor(w).id;
}

interface FieldWeed { weed: typeof weeds[0]; x: number; y: number; identified: boolean; managed: boolean; correct: boolean; chosenMethodId?: string; }

export default function WeedControl({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);

  const fieldWeeds = useMemo<FieldWeed[]>(() => {
    const offset = (level - 1) * 8;
    const rotated = [...weeds.slice(offset % weeds.length), ...weeds.slice(0, offset % weeds.length)];
    return shuffle(rotated).slice(0, 8).map(w => ({
      weed: w, x: 10 + Math.random() * 75, y: 10 + Math.random() * 55,
      identified: false, managed: false, correct: false,
    }));
  }, [level]);

  const [weedState, setWeedState] = useState(fieldWeeds);
  const [timer, setTimer] = useState(90);
  const [activeWeed, setActiveWeed] = useState<number | null>(null);
  const [phase, setPhase] = useState<'identify' | 'idFeedback' | 'manage' | 'manageFeedback'>('identify');
  const [done, setDone] = useState(false);
  const [idChoice, setIdChoice] = useState<string | null>(null);
  const [methodChoice, setMethodChoice] = useState<string | null>(null);

  // Reset weedState when level changes
  useEffect(() => { setWeedState(fieldWeeds); }, [fieldWeeds]);

  const restart = () => { setWeedState(fieldWeeds); setTimer(90); setActiveWeed(null); setPhase('identify'); setDone(false); setIdChoice(null); setMethodChoice(null); };
  const nextLevel = () => { setLevel(l => l + 1); setTimer(90); setActiveWeed(null); setPhase('identify'); setDone(false); setIdChoice(null); setMethodChoice(null); };
  const startOver = () => { setLevel(1); restart(); };

  useEffect(() => {
    if (done) return;
    if (timer <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, done]);

  const clickWeed = (idx: number) => {
    if (done || weedState[idx].managed) return;
    setActiveWeed(idx);
    setPhase(weedState[idx].identified ? 'manage' : 'identify');
    setIdChoice(null);
    setMethodChoice(null);
  };

  const identifyWeed = (name: string) => {
    if (activeWeed === null) return;
    setIdChoice(name);
    const correct = name === weedState[activeWeed].weed.commonName;
    if (correct) {
      setWeedState(prev => prev.map((w, i) => i === activeWeed ? { ...w, identified: true } : w));
    }
    setPhase('idFeedback');
  };

  const afterIdFeedback = () => {
    if (activeWeed === null) return;
    const correct = idChoice === weedState[activeWeed].weed.commonName;
    if (correct) setPhase('manage');
    else { setActiveWeed(null); setPhase('identify'); }
    setIdChoice(null);
  };

  const manageWeed = (methodId: string) => {
    if (activeWeed === null) return;
    const w = weedState[activeWeed];
    const correct = methodId === bestMethod(w.weed);
    setMethodChoice(methodId);
    setWeedState(prev => prev.map((fw, i) => i === activeWeed ? { ...fw, managed: true, correct, chosenMethodId: methodId } : fw));
    setPhase('manageFeedback');
    if (weedState.filter(w => w.managed).length + 1 >= weedState.length) {
      setTimeout(() => setDone(true), 2000);
    }
  };

  const afterManageFeedback = () => {
    setActiveWeed(null); setPhase('identify'); setMethodChoice(null);
  };

  const score = weedState.filter(w => w.managed && w.correct).length;
  const active = activeWeed !== null ? weedState[activeWeed] : null;

  const idOptions = useMemo(() => {
    if (activeWeed === null) return [];
    const correct = weedState[activeWeed].weed.commonName;
    const wrongs = shuffle(weeds.filter(w => w.commonName !== correct)).slice(0, 3).map(w => w.commonName);
    return shuffle([correct, ...wrongs]);
  }, [activeWeed, weedState]);

  // Memoize control method options per active weed so they don't reshuffle on every render.
  const methodOptions = useMemo(() => {
    if (activeWeed === null) return [];
    return methodOptionsFor(weedState[activeWeed].weed);
  }, [activeWeed, weedState]);

  if (done) return <LevelComplete level={level} score={score} total={fieldWeeds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Control</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className={`text-sm font-bold ${timer <= 10 ? 'text-destructive' : 'text-foreground'}`}>{timer}s</span>
        <span className="text-sm text-primary font-bold ml-2">{score} pts</span>
      </div>
      <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 relative">
        <img src={fieldBgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-3 left-3 right-3 z-20">
          <FarmerGuide
            gradeLabel="K-5"
            tone={active ? (phase === 'idFeedback' && idChoice === active.weed.commonName ? 'correct' : phase === 'idFeedback' ? 'wrong' : phase === 'manageFeedback' && methodChoice === bestMethod(active.weed) ? 'correct' : phase === 'manageFeedback' ? 'wrong' : 'hint') : 'intro'}
            compact
            message={
              !active
                ? "Tap a weed in the field, then tell me what it is and how we should manage it!"
                : phase === 'identify'
                  ? `Look closely. Hint: ${active.weed.traits[0]}.`
                  : phase === 'idFeedback'
                    ? (idChoice === active.weed.commonName ? `Yes! That's ${active.weed.commonName}. Now pick a control method.` : `Not quite — that one is ${active.weed.commonName}. Try another weed!`)
                    : phase === 'manage'
                      ? `For ${active.weed.commonName}, think about its life cycle (${active.weed.lifeCycle}) and roots.`
                      : (methodChoice === bestMethod(active.weed) ? `Great choice! ${bestMethodFor(active.weed).label} works best here.` : `Close! The best method is ${bestMethodFor(active.weed).label}.`)
            }
          />
        </div>
        {weedState.map((fw, i) => (
          <button key={i} onClick={() => clickWeed(i)}
            className={`absolute w-14 h-14 rounded-full transition-all ${fw.managed ? 'opacity-30 scale-75' : 'hover:scale-110'}`}
            style={{ left: `${fw.x}%`, top: `${fw.y}%` }}>
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-border bg-secondary shadow-lg">
              <WeedImage weedId={fw.weed.id} stage="plant" className="w-full h-full object-cover" />
            </div>
            {fw.managed && <span className="absolute -top-1 -right-1 text-sm">{fw.correct ? '✓' : '✗'}</span>}
          </button>
        ))}
        {active && (
          <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border p-5">
            {phase === 'identify' && (
              <div>
                <p className="text-base font-bold text-foreground mb-3">What weed is this?</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-40 h-40 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
                    <WeedImage weedId={active.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-muted-foreground flex-1">{active.weed.traits[0]}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {idOptions.map(opt => (
                    <button key={opt} onClick={() => identifyWeed(opt)}
                      className="py-3 px-4 rounded-lg border border-border bg-secondary text-foreground text-base font-medium hover:border-primary transition-colors">
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {phase === 'idFeedback' && (
              <div className="text-center">
                <div className="flex items-center gap-4 justify-center mb-3">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-border bg-secondary">
                    <WeedImage weedId={active.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">{active.weed.commonName}</p>
                    <p className="text-xs italic text-muted-foreground">{active.weed.scientificName}</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[160px]">Look for: {active.weed.traits[0]}</p>
                  </div>
                </div>
                {idChoice === active.weed.commonName ? (
                  <div>
                    <p className="text-green-500 font-bold text-lg mb-1">Correct!</p>
                    <p className="text-sm text-muted-foreground mb-3">It's in the {active.weed.family} family.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-destructive font-bold text-lg mb-1">Not quite!</p>
                    <p className="text-sm text-muted-foreground mb-1">You guessed: {idChoice}</p>
                    <p className="text-sm text-muted-foreground mb-3">This is <span className="font-bold text-foreground">{active.weed.commonName}</span>. Look for: {active.weed.traits[0]}</p>
                  </div>
                )}
                <button onClick={afterIdFeedback} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
                  {idChoice === active.weed.commonName ? 'Choose Control Method →' : 'Try Another Weed'}
                </button>
              </div>
            )}
            {phase === 'manage' && (
              <div>
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
                    <WeedImage weedId={active.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground mb-1">Manage <span className="text-primary">{active.weed.commonName}</span></p>
                    <p className="text-xs text-muted-foreground">{active.weed.lifeCycle} • {active.weed.plantType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {methodOptions.map(m => (
                    <button key={m.id} onClick={() => manageWeed(m.id)}
                      className="py-3 px-4 rounded-lg border border-border bg-secondary text-foreground text-sm font-medium hover:border-primary transition-colors text-left">
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {phase === 'manageFeedback' && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-secondary">
                    <WeedImage weedId={active.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                  </div>
                  <p className="font-bold text-foreground">{active.weed.commonName}</p>
                </div>
                {methodChoice === bestMethod(active.weed) ? (
                  <div>
                    <p className="text-green-500 font-bold text-lg mb-1">Correct!</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {METHOD_LIBRARY[methodChoice!]?.label} is the best way to control {active.weed.commonName}. {active.weed.management}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-destructive font-bold text-lg mb-1">Not the best choice</p>
                    <p className="text-sm text-muted-foreground mb-1">You chose: {METHOD_LIBRARY[methodChoice!]?.label}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Best: <span className="font-bold text-foreground">{bestMethodFor(active.weed).label}</span> — {active.weed.management}
                    </p>
                  </div>
                )}
                <button onClick={afterManageFeedback} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Continue</button>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Side tracking panel */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-l border-border bg-card overflow-y-auto">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Field Log</p>
          <p className="text-sm text-foreground mt-0.5">{weedState.filter(w => w.managed).length}/{weedState.length} managed</p>
        </div>
        <ul className="p-3 space-y-2">
          {weedState.map((fw, i) => {
            const chosenLabel = fw.chosenMethodId ? METHOD_LIBRARY[fw.chosenMethodId]?.label : null;
            return (
              <li key={i} className={`flex items-start gap-2 p-2 rounded-lg border ${fw.managed ? (fw.correct ? 'border-green-500/40 bg-green-500/5' : 'border-destructive/40 bg-destructive/5') : 'border-border bg-secondary/40'}`}>
                <div className="w-10 h-10 rounded-md overflow-hidden border border-border shrink-0">
                  <WeedImage weedId={fw.weed.id} stage="plant" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{fw.identified || fw.managed ? fw.weed.commonName : `Weed #${i + 1}`}</p>
                  {fw.managed ? (
                    <>
                      <p className={`text-[10px] font-semibold ${fw.correct ? 'text-green-600' : 'text-destructive'}`}>
                        {fw.correct ? '✓' : '✗'} You chose: {chosenLabel}
                      </p>
                      {!fw.correct && <p className="text-[10px] text-muted-foreground">Best: {bestMethodFor(fw.weed).label}</p>}
                    </>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">{fw.identified ? 'Pick a control method' : 'Not yet identified'}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
      </div>
    </div>
  );
}
