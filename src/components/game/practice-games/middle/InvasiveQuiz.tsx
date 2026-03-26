import { useState } from 'react';

const QUESTIONS = [
  { q: 'What is an invasive species?', options: ['A species that is native to an area', 'A species introduced to a new area where it causes harm', 'Any weed found in a garden', 'A rare endangered species'], correct: 1 },
  { q: 'How do invasive plants typically enter new ecosystems?', options: ['They evolve naturally', 'Through human activities like trade and travel', 'They migrate on their own', 'Through natural disasters only'], correct: 1 },
  { q: 'Which of these is a major impact of invasive weeds on waterways?', options: ['They improve water quality', 'They can clog waterways and reduce oxygen', 'They have no effect on water', 'They make water taste better'], correct: 1 },
  { q: 'How can invasive weeds affect native plant populations?', options: ['They always help native plants grow', 'They compete for resources and can push out native species', 'They have no interaction with native plants', 'They only affect animals'], correct: 1 },
  { q: 'What happens when invasive weeds reduce biodiversity?', options: ['Ecosystems become more resilient', 'Food webs can be disrupted', 'Nothing changes', 'More species appear'], correct: 1 },
  { q: 'Why are invasive weeds often successful in new environments?', options: ['They have natural predators there', 'They often lack natural predators and diseases', 'The climate is always perfect', 'They grow very slowly'], correct: 1 },
  { q: 'How can invasive weeds affect agriculture economically?', options: ['They always increase crop yields', 'They can reduce crop yields and increase management costs', 'They have no economic impact', 'They make farming easier'], correct: 1 },
  { q: 'What is one way to help prevent the spread of invasive species?', options: ['Plant them in your garden', 'Clean equipment and boots when moving between areas', 'Ignore them', 'Spread their seeds widely'], correct: 1 },
];

export default function InvasiveQuiz({ onBack }: { onBack: () => void }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const done = qIdx >= QUESTIONS.length;
  const current = !done ? QUESTIONS[qIdx] : null;

  const submit = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === current!.correct) setScore(s => s + 1);
  };

  const next = () => { setQIdx(q => q + 1); setSelected(null); setAnswered(false); };
  const restart = () => { setQIdx(0); setScore(0); setSelected(null); setAnswered(false); };

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{QUESTIONS.length} correct</p>
        <div className="flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Invasive Quiz</h1>
        <span className="text-sm text-muted-foreground">{qIdx + 1}/{QUESTIONS.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <p className="font-bold text-foreground text-lg mb-6 text-center max-w-md">{current!.q}</p>
        <div className="flex flex-col gap-3 w-full max-w-md">
          {current!.options.map((opt, idx) => {
            const isCorrect = idx === current!.correct;
            const bg = !answered ? 'border-border bg-card hover:border-primary' :
              idx === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
              isCorrect ? 'border-green-500 bg-green-500/20' : 'border-border bg-card';
            return (
              <button key={idx} onClick={() => submit(idx)}
                className={`p-4 rounded-lg border-2 text-left text-sm font-medium text-foreground transition-all ${bg}`}>
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <button onClick={next} className="mt-4 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
        )}
      </div>
    </div>
  );
}
