import { useState, useMemo } from 'react';
import { Droplets, TreePine, Link } from 'lucide-react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface NeedItem { id: string; label: string; category: string; }

const ALL_NEEDS: NeedItem[] = [
  { id: 'standing-water', label: 'Standing water', category: 'aquatic' },
  { id: 'dissolved-nutrients', label: 'Dissolved nutrients', category: 'aquatic' },
  { id: 'underwater-light', label: 'Underwater sunlight', category: 'aquatic' },
  { id: 'soil', label: 'Soil to root in', category: 'terrestrial' },
  { id: 'rain', label: 'Rainfall', category: 'terrestrial' },
  { id: 'air-space', label: 'Open air space', category: 'terrestrial' },
  { id: 'host-plant', label: 'Host plant to attach to', category: 'parasitic' },
  { id: 'steal-nutrients', label: 'Steal nutrients from host', category: 'parasitic' },
  { id: 'special-roots', label: 'Special attachment roots', category: 'parasitic' },
];

const CATEGORIES = [
  { id: 'aquatic', label: 'Aquatic Plants', Icon: Droplets, borderColor: 'border-info/50' },
  { id: 'terrestrial', label: 'Terrestrial Plants', Icon: TreePine, borderColor: 'border-success/50' },
  { id: 'parasitic', label: 'Parasitic Plants', Icon: Link, borderColor: 'border-accent/50' },
];

function getWeedCategory(w: typeof weeds[0]): string {
  const text = `${w.habitat} ${w.primaryHabitat}`.toLowerCase();
  if (text.match(/water|aquatic|pond|lake|stream|river|flood|marsh|wet/)) return 'aquatic';
  if (text.match(/parasit/)) return 'parasitic';
  return 'terrestrial';
}

export default function EcologyScramble({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const items = useMemo(() => shuffle([...ALL_NEEDS]), []);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  // Phase 2: Weed needs identification
  const [phase, setPhase] = useState<'sort' | 'weedNeeds' | 'done'>('sort');
  const weedRounds = useMemo(() => {
    // Pick 3 weeds, one for each category if possible
    const aquatic = shuffle(weeds.filter(w => getWeedCategory(w) === 'aquatic'));
    const terrestrial = shuffle(weeds.filter(w => getWeedCategory(w) === 'terrestrial'));
    const parasitic = shuffle(weeds.filter(w => getWeedCategory(w) === 'parasitic'));
    const picks: { weed: typeof weeds[0]; category: string }[] = [];
    if (aquatic.length) picks.push({ weed: aquatic[0], category: 'aquatic' });
    if (terrestrial.length) picks.push({ weed: terrestrial[0], category: 'terrestrial' });
    if (parasitic.length) picks.push({ weed: parasitic[0], category: 'parasitic' });
    // Fill to 3 if needed
    while (picks.length < 3) {
      const extra = shuffle(weeds.filter(w => !picks.find(p => p.weed.id === w.id)))[0];
      if (extra) picks.push({ weed: extra, category: getWeedCategory(extra) });
      else break;
    }
    return shuffle(picks);
  }, []);

  const [weedIdx, setWeedIdx] = useState(0);
  const [weedSelected, setWeedSelected] = useState<string[]>([]);
  const [weedChecked, setWeedChecked] = useState(false);
  const [sortScore, setSortScore] = useState(0);
  const [weedScore, setWeedScore] = useState(0);

  // Shuffle the answer bank for each weed round
  const shuffledNeeds = useMemo(() => shuffle([...ALL_NEEDS]), [weedIdx]);

  const unplaced = items.filter(i => !placements[i.id]);
  const allPlaced = Object.keys(placements).length === items.length;

  const handleCatClick = (catId: string) => {
    if (!selected || checked) return;
    setPlacements(p => ({ ...p, [selected]: catId }));
    setSelected(null);
  };

  const handleRemove = (itemId: string) => {
    if (checked) return;
    setPlacements(p => { const n = { ...p }; delete n[itemId]; return n; });
  };

  const correctCount = checked ? items.filter(i => placements[i.id] === i.category).length : 0;

  const handleCheck = () => {
    setChecked(true);
    setSortScore(items.filter(i => placements[i.id] === i.category).length);
  };

  const goToWeedPhase = () => {
    setPhase('weedNeeds');
    setWeedIdx(0);
    setWeedSelected([]);
    setWeedChecked(false);
  };

  const toggleWeedNeed = (needId: string) => {
    if (weedChecked) return;
    setWeedSelected(prev =>
      prev.includes(needId) ? prev.filter(id => id !== needId) : prev.length < 3 ? [...prev, needId] : prev
    );
  };

  const checkWeedNeeds = () => {
    setWeedChecked(true);
    const currentCat = weedRounds[weedIdx].category;
    const correctNeeds = ALL_NEEDS.filter(n => n.category === currentCat).map(n => n.id);
    const allCorrect = weedSelected.length === 3 && weedSelected.every(id => correctNeeds.includes(id));
    if (allCorrect) setWeedScore(s => s + 1);
  };

  const nextWeed = () => {
    if (weedIdx + 1 >= weedRounds.length) {
      setPhase('done');
    } else {
      setWeedIdx(i => i + 1);
      setWeedSelected([]);
      setWeedChecked(false);
    }
  };

  const restart = () => {
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };
    setPlacements({});
    setSelected(null);
    setChecked(false);
    setPhase('sort');
    setWeedIdx(0);
    setWeedSelected([]);
    setWeedChecked(false);
    setSortScore(0);
    setWeedScore(0);
  };

  // Done screen
  if (phase === 'done') {
    const total = items.length + weedRounds.length;
    const finalScore = sortScore + weedScore;
    addBadge({ gameId: 'ecology-scramble', gameName: 'Ecology Scramble', level: 'K-5', score: finalScore, total });
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <TreePine className="w-10 h-10 text-primary mb-3" />
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">Ecology Expert!</h2>
        <p className="text-foreground mb-2">Sorting: {sortScore}/{items.length}</p>
        <p className="text-foreground mb-6">Weed Needs: {weedScore}/{weedRounds.length}</p>
        <LevelComplete level={level} score={correctCount} total={items.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  // Phase 2: Weed needs identification
  if (phase === 'weedNeeds' && weedIdx < weedRounds.length) {
    const wr = weedRounds[weedIdx];
    const catLabel = wr.category === 'aquatic' ? 'an aquatic' : wr.category === 'parasitic' ? 'a parasitic' : 'a terrestrial';
    const correctNeeds = ALL_NEEDS.filter(n => n.category === wr.category).map(n => n.id);

    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Ecology Scramble</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">{weedIdx + 1}/{weedRounds.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-center mb-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30 bg-secondary">
              <WeedImage weedId={wr.weed.id} stage="plant" className="w-full h-full object-cover" />
            </div>
          </div>
          <p className="text-center text-foreground font-bold text-lg mb-1">{wr.weed.commonName}</p>
          <p className="text-center text-sm text-muted-foreground mb-4">
            {wr.weed.commonName} is {catLabel} plant. What does it need to survive?
          </p>
          <p className="text-xs text-muted-foreground text-center mb-3">Select 3 needs:</p>
          <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto mb-4">
            {shuffledNeeds.map(need => {
              const isSelected = weedSelected.includes(need.id);
              const isCorrect = correctNeeds.includes(need.id);
              let cls = 'border-border bg-card text-foreground';
              if (weedChecked && isSelected && isCorrect) cls = 'border-green-500 bg-green-500/20 text-foreground';
              else if (weedChecked && isSelected && !isCorrect) cls = 'border-destructive bg-destructive/20 text-foreground';
              else if (weedChecked && !isSelected && isCorrect) cls = 'border-green-500/50 bg-green-500/10 text-muted-foreground';
              else if (isSelected) cls = 'border-primary bg-primary/10 text-primary';

              return (
                <button key={need.id} onClick={() => toggleWeedNeed(need.id)}
                  className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${cls}`}>
                  {need.label}
                </button>
              );
            })}
          </div>
          {!weedChecked && weedSelected.length === 3 && (
            <button onClick={checkWeedNeeds} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
          )}
          {weedChecked && (
            <button onClick={nextWeed} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold mt-2">
              {weedIdx + 1 < weedRounds.length ? 'Next Weed' : 'See Results'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Phase 1: Sort needs into categories
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Ecology Scramble</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-4 text-center">Sort each survival need into the correct plant type</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {CATEGORIES.map(cat => {
            const CatIcon = cat.Icon;
            return (
              <button key={cat.id} onClick={() => handleCatClick(cat.id)}
                className={`rounded-xl border-2 ${cat.borderColor} p-3 text-center transition-all flex flex-col items-center ${selected ? 'hover:bg-secondary cursor-pointer' : ''}`}>
                <CatIcon className="w-5 h-5 text-foreground mb-1" />
                <span className="font-bold text-foreground text-xs">{cat.label}</span>
                <div className="mt-2 space-y-1 min-h-[60px] w-full">
                  {items.filter(i => placements[i.id] === cat.id).map(i => (
                    <div key={i.id} className={`flex items-center justify-between gap-1 px-2 py-1 rounded text-[11px] font-medium ${
                      checked ? (i.category === cat.id ? 'bg-green-500/20 text-green-600' : 'bg-destructive/20 text-destructive') : 'bg-secondary text-foreground'
                    }`}>
                      <span className="truncate">{i.label}</span>
                      {!checked && (
                        <button onClick={(e) => { e.stopPropagation(); handleRemove(i.id); }} className="text-muted-foreground hover:text-foreground shrink-0">✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {unplaced.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {unplaced.map(i => (
              <button key={i.id} onClick={() => setSelected(selected === i.id ? null : i.id)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selected === i.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
                }`}>
                {i.label}
              </button>
            ))}
          </div>
        )}

        {allPlaced && !checked && (
          <button onClick={handleCheck} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
        )}
        {checked && (
          <div className="text-center mt-4">
            <p className={`text-lg font-bold mb-3 ${correctCount === items.length ? 'text-green-500' : 'text-foreground'}`}>
              {correctCount} / {items.length} correct!
            </p>
            <button onClick={goToWeedPhase} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
              Next: Identify Weed Needs →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
