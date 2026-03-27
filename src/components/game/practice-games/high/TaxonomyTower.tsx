import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface TowerLevel { question: string; options: [string, string]; correct: number; }

function buildTower(target: typeof weeds[0]): TowerLevel[] {
  const levels: TowerLevel[] = [];
  levels.push({ question: 'Kingdom?', options: ['Plantae', 'Fungi'], correct: 0 });
  const isMono = target.plantType === 'Monocot';
  levels.push({ question: 'Class?', options: isMono ? ['Monocotyledon', 'Dicotyledon'] : ['Dicotyledon', 'Monocotyledon'], correct: 0 });
  const families = [...new Set(weeds.map(w => w.family))];
  const wrongFam = shuffle(families.filter(f => f !== target.family))[0] || 'Unknown';
  const famOpts = shuffle([target.family, wrongFam]) as [string, string];
  levels.push({ question: 'Family?', options: famOpts, correct: famOpts.indexOf(target.family) });
  const wrongGenus = shuffle(weeds.filter(w => w.id !== target.id).map(w => w.scientificName.split(' ')[0])).filter(g => g !== target.scientificName.split(' ')[0])[0] || 'Other';
  const genus = target.scientificName.split(' ')[0];
  const genusOpts = shuffle([genus, wrongGenus]) as [string, string];
  levels.push({ question: 'Genus?', options: genusOpts, correct: genusOpts.indexOf(genus) });
  const species = target.scientificName;
  const wrongSp = shuffle(weeds.filter(w => w.family === target.family && w.id !== target.id))[0]?.scientificName || 'Unknown species';
  const spOpts = shuffle([species, wrongSp]) as [string, string];
  levels.push({ question: 'Species?', options: spOpts, correct: spOpts.indexOf(species) });
  return levels;
}

export default function TaxonomyTower({ onBack }: { onBack: () => void }) {
  const targets = useMemo(() => shuffle(weeds).slice(0, 5), []);
  const [tIdx, setTIdx] = useState(0);
  const tower = useMemo(() => buildTower(targets[tIdx]), [tIdx]);
  const [level, setLevel] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [score, setScore] = useState(0);
  const done = tIdx >= targets.length;

  const choose = (i: number) => {
    if (i === tower[level].correct) {
      setWrong(false);
      if (level + 1 >= tower.length) { setScore(s => s + 1); setTIdx(t => t + 1); setLevel(0); }
      else setLevel(l => l + 1);
    } else setWrong(true);
  };

  const restart = () => { setTIdx(0); setLevel(0); setScore(0); setWrong(false); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-4xl mb-2">🏗️</p>
      <h2 className="font-display font-bold text-2xl text-foreground mb-2">Tower Complete!</h2>
      <p className="text-foreground mb-6">Score: {score} / {targets.length}</p>
      <div className="flex gap-3">
        <button onClick={restart} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Play Again</button>
        <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  const t = targets[tIdx];
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Taxonomy Tower</h1>
          <span className="ml-auto text-sm text-muted-foreground">{tIdx + 1}/{targets.length}</span>
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-border">
            <WeedImage weedId={t.id} stage="plant" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-4">Find: <strong className="text-foreground">{t.commonName}</strong></p>
        <div className="flex flex-col-reverse gap-2">
          {tower.map((lv, i) => (
            <div key={i} className={`p-3 rounded-xl border-2 ${i < level ? 'border-green-500 bg-green-500/10' : i === level ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 opacity-50'}`}>
              <p className="text-xs text-muted-foreground mb-1">{lv.question}</p>
              {i === level ? (
                <div className="grid grid-cols-2 gap-2">
                  {lv.options.map((opt, oi) => (
                    <button key={oi} onClick={() => choose(oi)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm font-medium text-foreground hover:border-primary transition-colors">{opt}</button>
                  ))}
                </div>
              ) : i < level ? (
                <p className="text-sm font-medium text-green-600">{lv.options[lv.correct]}</p>
              ) : null}
            </div>
          ))}
        </div>
        {wrong && <p className="text-center text-sm text-destructive mt-3">Wrong — try again!</p>}
      </div>
    </div>
  );
}
