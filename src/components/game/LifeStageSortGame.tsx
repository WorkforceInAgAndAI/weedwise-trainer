import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';

const LIFE_STAGES = [
  { id: 'seedling', label: 'Seedling', imageStage: 'seedling' },
  { id: 'vegetative', label: 'Vegetative', imageStage: 'vegetative' },
  { id: 'reproductive', label: 'Reproductive', imageStage: 'flower' },
];

interface Props {
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function LifeStageSortGame({ onComplete, onNext }: Props) {
  const items = useMemo(() => {
    const shuffled = [...weeds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8).map(w => {
      const stageIdx = Math.floor(Math.random() * LIFE_STAGES.length);
      const stage = LIFE_STAGES[stageIdx];
      return {
        id: `${w.id}-${stage.id}`,
        weedId: w.id,
        name: w.commonName,
        imageStage: stage.imageStage,
        correctStage: stage.id,
      };
    });
  }, []);

  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const unplaced = items.filter(i => !placements[i.id]);
  const allPlaced = unplaced.length === 0;

  const handleStageClick = (stageId: string) => {
    if (checked || !selected) return;
    setPlacements(prev => ({ ...prev, [selected]: stageId }));
    setSelected(null);
  };

  const handleRemove = (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (checked) return;
    setPlacements(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleCheck = () => {
    setChecked(true);
    const results = items.map(i => ({
      weedId: i.weedId,
      correct: placements[i.id] === i.correctStage,
    }));
    onComplete(results);
  };

  const correctCount = checked
    ? items.filter(i => placements[i.id] === i.correctStage).length
    : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">📸 Life Stage Sort</h2>
        <p className="text-sm text-muted-foreground">
          {checked
            ? `${correctCount}/${items.length} correct!`
            : 'Tap a photo, then tap the life stage it shows. Place all photos, then check answers.'}
        </p>
      </div>

      {/* Life stage boxes */}
      <div className="grid grid-cols-2 gap-3">
        {LIFE_STAGES.map(s => {
          const stageItems = items.filter(i => placements[i.id] === s.id);
          return (
            <button
              key={s.id}
              onClick={() => handleStageClick(s.id)}
              disabled={!selected || checked}
              className={`p-3 rounded-xl border-2 text-center transition-all min-h-[90px] flex flex-col items-center gap-1
                ${selected && !checked ? 'cursor-pointer hover:bg-muted/40 hover:border-primary/50' : 'cursor-default'}
                ${checked ? 'border-border' : 'border-border bg-muted/20'}
              `}
            >
              <span className="text-2xl">{s.label.split(' ')[0]}</span>
              <span className="text-xs font-bold text-foreground">{s.label.split(' ').slice(1).join(' ')}</span>
              <div className="flex flex-wrap gap-1 mt-1 justify-center">
                {stageItems.map(item => {
                  const isCorrect = checked && item.correctStage === s.id;
                  const isWrong = checked && item.correctStage !== s.id;
                  return (
                    <div
                      key={item.id}
                      onClick={(e) => { e.stopPropagation(); if (!checked) handleRemove(item.id); }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold cursor-pointer
                        ${isCorrect ? 'bg-accent/20 text-accent border border-accent/30' : ''}
                        ${isWrong ? 'bg-destructive/20 text-destructive border border-destructive/30' : ''}
                        ${!checked ? 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25' : ''}
                      `}
                    >
                      <div className="w-6 h-6 rounded overflow-hidden shrink-0">
                        <WeedImage weedId={item.weedId} stage={item.imageStage} className="w-full h-full" />
                      </div>
                      {item.name}
                      {!checked && <span className="text-muted-foreground ml-0.5">✕</span>}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Unplaced photos */}
      {unplaced.length > 0 && !checked && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Tap a photo to select, then tap a life stage:</p>
          <div className="grid grid-cols-4 gap-2">
            {unplaced.map(item => (
              <button
                key={item.id}
                onClick={() => setSelected(selected === item.id ? null : item.id)}
                className={`p-1.5 rounded-lg border-2 transition-all text-center
                  ${selected === item.id ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-secondary/50 hover:border-primary/50'}
                `}
              >
                <div className="aspect-square mb-1 overflow-hidden rounded">
                  <WeedImage weedId={item.weedId} stage={item.imageStage} className="w-full h-full" />
                </div>
                <span className="text-[9px] font-semibold text-foreground leading-tight block truncate">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {allPlaced && !checked && (
        <button onClick={handleCheck} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity animate-fade-in">
          Check Answers ✓
        </button>
      )}

      {checked && (
        <div className="space-y-3 animate-scale-in">
          <div className={`text-lg font-bold ${correctCount === items.length ? 'text-accent' : 'text-foreground'}`}>
            {correctCount === items.length ? '✅' : '📊'} {correctCount}/{items.length} Correct
          </div>
          {items.filter(i => placements[i.id] !== i.correctStage).map(i => {
            const correctStage = LIFE_STAGES.find(s => s.id === i.correctStage);
            return (
              <div key={i.id} className="flex gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <div className="w-10 h-10 rounded overflow-hidden shrink-0">
                  <WeedImage weedId={i.weedId} stage={i.imageStage} className="w-full h-full" />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-sm">{i.name}</span>
                  <span className="text-xs text-accent ml-2">→ {correctStage?.label}</span>
                </div>
              </div>
            );
          })}
          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}
