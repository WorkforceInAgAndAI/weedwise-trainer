import { useState, type FormEvent } from 'react';
import type { GameEngine } from '@/hooks/useGameEngine';
import { PHASES, GRADE_NAMES, XP_PER_LEVEL } from '@/data/phases';
import { weedMap, weeds } from '@/data/weeds';
import type { GradeLevel } from '@/types/game';
import CardFlipMatch from './CardFlipMatch';

export default function GameScreen(game: GameEngine) {
  const { grade, xp, level, current, feedback, round, questionNum, streak,
    totalCorrect, totalWrong, masteredCount, unlockedPhases,
    submitAnswer, nextQuestion, endSession, setShowInstructor, setShowGlossary } = game;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fillInValue, setFillInValue] = useState('');
  const [matchingResult, setMatchingResult] = useState<{ correct: number; attempts: number; xpEarned: number } | null>(null);

  const pickRandomWeeds = (n: number) => {
    const shuffled = [...weeds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, n).map(w => ({ weed: w }));
  };
  if (!current || !grade) return null;
  const weed = weedMap[current.weedId];
  const xpInLevel = xp % XP_PER_LEVEL;
  const phases = PHASES[grade];

  const handleSubmit = (answer: string) => {
    if (feedback) return;
    submitAnswer(answer);
  };

  const handleFillIn = (e: FormEvent) => {
    e.preventDefault();
    if (fillInValue.trim()) {
      handleSubmit(fillInValue.trim());
    }
  };

  const handleNext = () => {
    setFillInValue('');
    nextQuestion();
  };

  const gradeColor = grade === 'elementary' ? 'bg-grade-elementary' : grade === 'middle' ? 'bg-grade-middle' : 'bg-grade-high';

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/80 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border overflow-y-auto transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-display font-bold text-primary text-lg">WeedID</span>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Level {level}</span>
              <span>{xpInLevel}/{XP_PER_LEVEL} XP</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${gradeColor} rounded-full transition-all duration-500`} style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }} />
            </div>
            <div className="text-xs text-primary font-semibold mt-1">{xp} Total XP</div>
          </div>

          {/* Phases */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Phases</h3>
            <div className="space-y-1">
              {phases.map((p, i) => {
                const unlocked = xp >= p.xpRequired;
                return (
                  <div key={p.id} className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded ${unlocked ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                    <span>{unlocked ? '✅' : '🔒'}</span>
                    <span className="flex-1">{p.name}</span>
                    {!unlocked && <span className="text-xs">{p.xpRequired} XP</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-1 text-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Session</h3>
            <div className="flex justify-between"><span className="text-muted-foreground">Correct</span><span className="text-accent font-semibold">{totalCorrect}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Wrong</span><span className="text-destructive font-semibold">{totalWrong}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Mastered</span><span className="text-primary font-semibold">{masteredCount}/25</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Streak</span><span className="font-semibold">{streak} 🔥</span></div>
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <button onClick={() => setShowInstructor(true)} className="w-full px-3 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors">📊 Instructor Panel</button>
            <button onClick={() => setShowGlossary(true)} className="w-full px-3 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors">📖 Glossary</button>
            <button onClick={endSession} className="w-full px-3 py-2 text-sm rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors">🏁 End Session</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">☰</button>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${gradeColor} text-accent-foreground`}>{current.phaseName}</span>
          <span className="text-sm text-muted-foreground">Round {round}</span>
          <span className="text-sm text-muted-foreground">Q#{questionNum}</span>
          <div className="flex-1" />
          <span className="text-sm font-semibold text-primary">{GRADE_NAMES[grade]}</span>
        </header>

        <div className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-4">
          {/* Matching Game Mode */}
          {current.type === 'matching' && !feedback ? (
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-slide-up">
              <p className="font-display font-semibold text-foreground">{current.text}</p>
              <CardFlipMatch
                pairs={pickRandomWeeds(4)}
                xpReward={current.xpReward}
                onComplete={(correct, attempts) => {
                  const xpEarned = correct * current.xpReward;
                  for (let i = 0; i < correct; i++) {
                    submitAnswer('__matching_correct__');
                  }
                  setMatchingResult({ correct, attempts, xpEarned });
                }}
              />
            </div>
          ) : current.type === 'matching' && matchingResult ? (
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
              <div className="rounded-lg p-4 space-y-3 bg-accent/15 border border-accent/50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <span className="font-display font-bold text-accent">All Matched!</span>
                  <span className="text-sm text-primary font-semibold ml-auto">+{matchingResult.xpEarned} XP</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Completed {matchingResult.correct} pairs in {matchingResult.attempts} attempts.
                </p>
                <button onClick={() => { setMatchingResult(null); nextQuestion(); }}
                  className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2">
                  NEXT QUESTION →
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Weed Card */}
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 animate-scale-in">
                {/* Image / Emoji */}
                <div className="w-full sm:w-40 h-40 bg-muted rounded-lg flex items-center justify-center text-6xl shrink-0">
                  <WeedImage weedId={weed.id} stage={current.imageStage} emoji={weed.emoji} />
                </div>
                {/* Traits */}
                <div className="flex-1 space-y-2">
                  {current.showName && <h2 className="font-display font-bold text-lg text-foreground">{weed.commonName}</h2>}
                  {current.showFamily && <p className="text-sm text-primary">Family: {weed.family}</p>}
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Identifying Traits</div>
                  <ul className="space-y-1">
                    {weed.traits.slice(0, 3).map((t, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>{t}
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs text-muted-foreground">Stage: <span className="capitalize text-foreground">{current.imageStage}</span></div>
                </div>
              </div>

              {/* Safety Banner */}
              {weed.safetyNote && (
                <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-3 text-sm text-destructive-foreground animate-fade-in">
                  {weed.safetyNote}
                </div>
              )}

              {/* Question */}
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-slide-up">
                <p className="font-display font-semibold text-foreground">{current.text}</p>

                {/* Answer Area */}
                {!feedback && current.type === 'mcq' && (
                  <div className={`grid gap-3 ${current.options.some(o => o.length > 50) ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                    {current.options.map((opt, i) => (
                      <button key={i} onClick={() => handleSubmit(opt)}
                        className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50 transition-all text-left text-sm">
                        <span className="shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-foreground">{opt}</span>
                      </button>
                    ))}
                  </div>
                )}

                {!feedback && current.type === 'binary' && (
                  <div className="grid grid-cols-2 gap-4">
                    {current.options.map((opt, i) => (
                      <button key={i} onClick={() => handleSubmit(opt)}
                        className="px-6 py-4 rounded-lg border-2 border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50 transition-all text-center font-semibold text-foreground">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {!feedback && current.type === 'fillin' && (
                  <form onSubmit={handleFillIn} className="flex gap-3">
                    <input
                      type="text" value={fillInValue} onChange={e => setFillInValue(e.target.value)}
                      placeholder="Type your answer..."
                      autoFocus
                      className="flex-1 px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                      Submit
                    </button>
                  </form>
                )}

                {/* Feedback */}
                {feedback && (
                  <div className={`rounded-lg p-4 space-y-3 animate-scale-in ${feedback.correct ? 'bg-accent/15 border border-accent/50' : 'bg-destructive/15 border border-destructive/50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{feedback.correct ? '✅' : '❌'}</span>
                      <span className={`font-display font-bold ${feedback.correct ? 'text-accent' : 'text-destructive'}`}>
                        {feedback.correct ? 'Correct!' : 'Incorrect'}
                      </span>
                      {feedback.xpEarned > 0 && <span className="text-sm text-primary font-semibold ml-auto">+{feedback.xpEarned} XP</span>}
                    </div>

                    {!feedback.correct && (
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Correct answer:</span>{' '}
                        <span className="font-semibold text-accent">{feedback.correctAnswer}</span>
                      </p>
                    )}

                    {/* Monocot/Dicot definition for e2 phase */}
                    {current.phaseId === 'e2' && (
                      <div className="text-sm text-foreground bg-muted/50 rounded-lg p-3 space-y-1">
                        <p><span className="font-semibold text-primary">🌾 Monocot:</span> Plants with one seed leaf, parallel leaf veins, fibrous roots, and flower parts in multiples of 3. Examples: grasses, sedges.</p>
                        <p><span className="font-semibold text-primary">🍀 Dicot:</span> Plants with two seed leaves, branching (net) leaf veins, taproot systems, and flower parts in multiples of 4 or 5. Examples: broadleaf weeds.</p>
                        <p className="text-muted-foreground mt-1"><strong>{feedback.weed.commonName}</strong> is a <strong>{feedback.weed.plantType}</strong> ({feedback.weed.family}).</p>
                      </div>
                    )}

                    {/* Act Now or Wait reasoning for e5 phase */}
                    {current.phaseId === 'e5' && (
                      <div className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
                        <p><span className="font-semibold text-primary">{feedback.weed.actImmediately ? '🚨 Why Act Now:' : '👀 Why Monitor & Wait:'}</span> {feedback.weed.actReason}</p>
                      </div>
                    )}

                    <div className="text-sm text-foreground space-y-1">
                      <p><span className="text-primary">💡 Memory Hook:</span> {feedback.weed.memoryHook}</p>
                      <p><span className="text-muted-foreground">Look-alike:</span> Often confused with {feedback.weed.lookAlike.species} — {feedback.weed.lookAlike.difference}</p>
                    </div>

                    <button onClick={handleNext}
                      className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2">
                      NEXT QUESTION →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function WeedImage({ weedId, stage, emoji }: { weedId: string; stage: string; emoji: string }) {
  const [failed, setFailed] = useState(true);
  const src = `/images/${weedId}/${stage}.jpg`;

  if (failed) {
    return <span>{emoji}</span>;
  }

  return (
    <img src={src} alt="" className="w-full h-full object-cover rounded-lg"
      onError={() => setFailed(true)} />
  );
}
