import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBgImage from '@/assets/images/field-background.jpg';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const METHODS = [
  { id: 'pull', label: 'Pull by hand', icon: '' },
  { id: 'spray', label: 'Spray herbicide', icon: '' },
  { id: 'mow', label: 'Mow it down', icon: '' },
  { id: 'leave', label: 'Leave it alone', icon: '' },
];

function bestMethod(w: typeof weeds[0]): string {
  const m = w.management.toLowerCase();
  if (m.includes('hand') || m.includes('pull')) return 'pull';
  if (m.includes('mow') || m.includes('mechanical') || m.includes('tillage')) return 'mow';
  if (m.includes('herbicide') || m.includes('pre') || m.includes('post')) return 'spray';
  return 'pull';
}

interface FieldWeed { weed: typeof weeds[0]; x: number; y: number; identified: boolean; managed: boolean; correct: boolean; }

export default function WeedControl({ onBack }: { onBack: () => void }) {
  const fieldWeeds = useMemo<FieldWeed[]>(() =>
    shuffle(weeds).slice(0, 8).map(w => ({
      weed: w, x: 10 + Math.random() * 75, y: 10 + Math.random() * 55,
      identified: false, managed: false, correct: false,
    })), []);

  const [weedState, setWeedState] = useState(fieldWeeds);
  const [timer, setTimer] = useState(90);
  const [activeWeed, setActiveWeed] = useState<number | null>(null);
  const [phase, setPhase] = useState<'identify' | 'idFeedback' | 'manage' | 'manageFeedback'>('identify');
  const [done, setDone] = useState(false);
  const [idChoice, setIdChoice] = useState<string | null>(null);
  const [methodChoice, setMethodChoice] = useState<string | null>(null);

  const restart = () => { setWeedState(fieldWeeds); setTimer(90); setActiveWeed(null); setPhase('identify'); setDone(false); setIdChoice(null); setMethodChoice(null); };

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
    if (correct) {
      setPhase('manage');
    } else {
      // Wrong ID — dismiss, let them try again
      setActiveWeed(null);
      setPhase('identify');
    }
    setIdChoice(null);
  };

  const manageWeed = (methodId: string) => {
    if (activeWeed === null) return;
    const w = weedState[activeWeed];
    const correct = methodId === bestMethod(w.weed);
    setMethodChoice(methodId);
    setWeedState(prev => prev.map((fw, i) => i === activeWeed ? { ...fw, managed: true, correct } : fw));
    setPhase('manageFeedback');
    if (weedState.filter(w => w.managed).length + 1 >= weedState.length) {
      setTimeout(() => setDone(true), 2000);
    }
  };

  const afterManageFeedback = () => {
    setActiveWeed(null);
    setPhase('identify');
    setMethodChoice(null);
  };

  const score = weedState.filter(w => w.managed && w.correct).length;
  const managed = weedState.filter(w => w.managed).length;
  const active = activeWeed !== null ? weedState[activeWeed] : null;

  const idOptions = useMemo(() => {
    if (activeWeed === null) return [];
    const correct = weedState[activeWeed].weed.commonName;
    const wrongs = shuffle(weeds.filter(w => w.commonName !== correct)).slice(0, 3).map(w => w.commonName);
    return shuffle([correct, ...wrongs]);
  }, [activeWeed, weedState]);

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">{timer > 0 ? 'Field Clear!' : "Time's Up!"}</h2>
        <p className="text-muted-foreground mb-2">Managed: {managed}/{weedState.length}</p>
        <p className="text-muted-foreground mb-6">Correct methods: {score}/{managed}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Control</h1>
        <span className={`text-sm font-bold ${timer <= 10 ? 'text-destructive' : 'text-foreground'}`}>{timer}s</span>
        <span className="text-sm text-primary font-bold ml-2">{score} pts</span>
      </div>
      <div className="flex-1 relative">
        <img src={fieldBgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10" />

        {weedState.map((fw, i) => (
          <button key={i} onClick={() => clickWeed(i)}
            className={`absolute w-14 h-14 rounded-full transition-all ${fw.managed ? 'opacity-30 scale-75' : 'hover:scale-110'}`}
            style={{ left: `${fw.x}%`, top: `${fw.y}%` }}>
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/70 bg-secondary shadow-lg">
              <WeedImage weedId={fw.weed.id} stage="plant" className="w-full h-full object-cover" />
            </div>
            {fw.managed && <span className="absolute -top-1 -right-1 text-sm">{fw.correct ? '✓' : '✗'}</span>}
          </button>
        ))}

        {/* Panels */}
        {active && (
          <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border p-5">
            {phase === 'identify' && (
              <div>
                <p className="text-base font-bold text-foreground mb-3">What weed is this?</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-secondary">
                    <WeedImage weedId={active.weed.id} stage="plant" className="w-full h-full object-cover" />
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
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary">
                    <WeedImage weedId={active.weed.id} stage="plant" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground">{active.weed.commonName}</p>
                    <p className="text-xs italic text-muted-foreground">{active.weed.scientificName}</p>
                  </div>
                </div>
                {idChoice === active.weed.commonName ? (
                  <div>
                    <p className="text-green-500 font-bold text-lg mb-1">Correct!</p>
                    <p className="text-sm text-muted-foreground mb-3">That's {active.weed.commonName}. It's in the {active.weed.family} family.</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-destructive font-bold text-lg mb-1">Not quite!</p>
                    <p className="text-sm text-muted-foreground mb-1">You guessed: {idChoice}</p>
                    <p className="text-sm text-muted-foreground mb-3">This is actually <span className="font-bold text-foreground">{active.weed.commonName}</span>. Look for: {active.weed.traits[0]}</p>
                  </div>
                )}
                <button onClick={afterIdFeedback} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
                  {idChoice === active.weed.commonName ? 'Choose Control Method →' : 'Try Another Weed'}
                </button>
              </div>
            )}

            {phase === 'manage' && (
              <div>
                <p className="text-base font-bold text-foreground mb-3">How should you manage <span className="text-primary">{active.weed.commonName}</span>?</p>
                <div className="grid grid-cols-2 gap-3">
                  {METHODS.map(m => (
                    <button key={m.id} onClick={() => manageWeed(m.id)}
                      className="py-3 px-4 rounded-lg border border-border bg-secondary text-foreground text-base font-medium hover:border-primary transition-colors">
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {phase === 'manageFeedback' && (
              <div className="text-center">
                <p className="font-bold text-foreground mb-1">{active.weed.commonName}</p>
                {methodChoice === bestMethod(active.weed) ? (
                  <div>
                    <p className="text-green-500 font-bold text-lg mb-1">Correct!</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {METHODS.find(m => m.id === methodChoice)?.label} is the best way to control {active.weed.commonName}!
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-destructive font-bold text-lg mb-1">Not the best choice</p>
                    <p className="text-sm text-muted-foreground mb-1">You chose: {METHODS.find(m => m.id === methodChoice)?.label}</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      The best method is <span className="font-bold text-foreground">{METHODS.find(m => m.id === bestMethod(active.weed))?.label}</span> because: {active.weed.management}
                    </p>
                  </div>
                )}
                <button onClick={afterManageFeedback} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Continue</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
