import { useState, type FormEvent } from 'react';
import type { GameEngine } from '@/hooks/useGameEngine';
import { PHASES, GRADE_NAMES, XP_PER_LEVEL } from '@/data/phases';
import { weedMap, weeds } from '@/data/weeds';
import CardFlipMatch from './CardFlipMatch';
import HabitatDragDrop from './HabitatDragDrop';
import ActNowScenario from './ActNowScenario';
import ConnectGame from './ConnectGame';
import LifeCycleDragDrop from './LifeCycleDragDrop';
import LookAlikeChallenge from './LookAlikeChallenge';
import NativeOrIntroduced from './NativeOrIntroduced';
import LifecycleImageSort from './LifecycleImageSort';
import ControlTimingGame from './ControlTimingGame';
import IPMPlanBuilder from './IPMPlanBuilder';
import WeedImage from './WeedImage';
import { filterTraitsForQuestion } from '@/lib/traitFilter';

export default function GameScreen(game: GameEngine) {
  const { grade, xp, level, current, feedback, round, questionNum, streak,
    totalCorrect, totalWrong, masteredCount,
    submitAnswer, nextQuestion, endSession, setShowInstructor, setShowGlossary,
    completeMinigame } = game;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fillInValue, setFillInValue] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  if (!current || !grade) return null;
  const weed = weedMap[current.weedId];
  const xpInLevel = xp % XP_PER_LEVEL;
  const phases = PHASES[grade];
  const gradeColor = grade === 'elementary' ? 'bg-grade-elementary' : grade === 'middle' ? 'bg-grade-middle' : 'bg-grade-high';

  const handleSubmit = (answer: string) => { if (!feedback) submitAnswer(answer); setSelectedAnswer(null); };
  const handleFillIn = (e: FormEvent) => { e.preventDefault(); if (fillInValue.trim()) handleSubmit(fillInValue.trim()); };
  const handleNext = () => { setFillInValue(''); setSelectedAnswer(null); nextQuestion(); };

  // Mini-game completion handler
  const onMinigameComplete = (results: Array<{ weedId: string; correct: boolean }>) => {
    completeMinigame(current.phaseId, results);
  };

  const renderActivity = () => {
    const key = `${current.phaseId}-${questionNum}`;

    // Batch mini-games
    switch (current.phaseId) {
      case 'e3': return <CardFlipMatch key={key} onComplete={onMinigameComplete} onNext={nextQuestion} />;
      case 'e4': return <HabitatDragDrop key={key} onComplete={onMinigameComplete} onNext={nextQuestion} />;
      case 'm2': return <ConnectGame key={key} mode="family" onComplete={onMinigameComplete} onNext={nextQuestion} />;
      case 'm3': return <LifeCycleDragDrop key={key} onComplete={onMinigameComplete} onNext={nextQuestion} />;
      case 'm5': return <NativeOrIntroduced key={key} onComplete={onMinigameComplete} onNext={nextQuestion} />;
      case 'h2': return <ConnectGame key={key} mode="scientific" onComplete={onMinigameComplete} onNext={nextQuestion} />;
      case 'h3': return <LifecycleImageSort key={key} onComplete={onMinigameComplete} onNext={nextQuestion} />;

      // Per-weed interactive phases
      case 'e5': return <ActNowScenario key={key} weed={weed} onComplete={onMinigameComplete} onNext={nextQuestion} />;
      case 'm4': return <LookAlikeChallenge key={key} onComplete={onMinigameComplete} onNext={nextQuestion} />;
      case 'h4': return <ControlTimingGame key={key} weed={weed} onComplete={onMinigameComplete} onNext={nextQuestion} />;
      case 'h5': return <IPMPlanBuilder key={key} weed={weed} onComplete={onMinigameComplete} onNext={nextQuestion} />;
    }

    // Standard MCQ / Binary / Fill-in
    return (
      <>
        {/* Weed Card */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 animate-scale-in">
          <div className="w-full sm:w-40 h-40 bg-muted rounded-lg overflow-hidden shrink-0">
            <WeedImage weedId={weed.id} stage={current.imageStage} className="w-full h-full" />
          </div>
          <div className="flex-1 space-y-2">
            {current.showName && <h2 className="font-display font-bold text-lg text-foreground">{weed.commonName}</h2>}
            {current.showFamily && <p className="text-sm text-primary">Family: {weed.family}</p>}
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Identifying Traits</div>
            <ul className="space-y-1">
              {(current.showName ? weed.traits.slice(0, 3) : filterTraitsForQuestion(weed.traits, weed.commonName).slice(0, 3)).map((t, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>{t}
                </li>
              ))}
            </ul>
            <div className="text-xs text-muted-foreground">Stage: <span className="capitalize text-foreground">{current.imageStage === 'whole' ? 'Whole Plant' : current.imageStage}</span></div>
          </div>
        </div>

        {weed.safetyNote && (
          <div className="bg-destructive/15 border border-destructive/50 rounded-lg p-3 text-sm text-destructive-foreground animate-fade-in">
            {weed.safetyNote}
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-slide-up">
          <p className="font-display font-semibold text-foreground">{current.text}</p>

          {/* MCQ with confirm */}
          {!feedback && current.type === 'mcq' && (
            <div className="space-y-3">
              <div className={`grid gap-3 ${current.options.some(o => o.length > 50) ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {current.options.map((opt, i) => (
                  <button key={i} onClick={() => setSelectedAnswer(opt)}
                    className={`flex items-start gap-3 px-4 py-3 rounded-lg border transition-all text-left text-sm ${
                      selectedAnswer === opt
                        ? 'border-primary bg-primary/15 ring-2 ring-primary/30'
                        : 'border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50'
                    }`}>
                    <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedAnswer === opt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>{String.fromCharCode(65 + i)}</span>
                    <span className="text-foreground">{opt}</span>
                  </button>
                ))}
              </div>
              {selectedAnswer && (
                <button onClick={() => handleSubmit(selectedAnswer)}
                  className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity animate-fade-in">
                  Confirm Selection ✓
                </button>
              )}
            </div>
          )}

          {/* Binary with confirm */}
          {!feedback && current.type === 'binary' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {current.options.map((opt, i) => (
                  <button key={i} onClick={() => setSelectedAnswer(opt)}
                    className={`px-6 py-4 rounded-lg border-2 transition-all text-center font-semibold ${
                      selectedAnswer === opt
                        ? 'border-primary bg-primary/15 ring-2 ring-primary/30 text-foreground'
                        : 'border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50 text-foreground'
                    }`}>
                    {opt}
                  </button>
                ))}
              </div>
              {selectedAnswer && (
                <button onClick={() => handleSubmit(selectedAnswer)}
                  className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity animate-fade-in">
                  Confirm Selection ✓
                </button>
              )}
            </div>
          )}

          {!feedback && current.type === 'fillin' && (
            <form onSubmit={handleFillIn} className="flex gap-3">
              <input type="text" value={fillInValue} onChange={e => setFillInValue(e.target.value)} placeholder="Type your answer..." autoFocus
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              <button type="submit" className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">Submit</button>
            </form>
          )}

          {feedback && (
            <div className={`rounded-lg p-4 space-y-3 animate-scale-in ${feedback.correct ? 'bg-accent/15 border border-accent/50' : 'bg-destructive/15 border border-destructive/50'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{feedback.correct ? '✅' : '❌'}</span>
                <span className={`font-display font-bold ${feedback.correct ? 'text-accent' : 'text-destructive'}`}>{feedback.correct ? 'Correct!' : 'Incorrect'}</span>
                {feedback.xpEarned > 0 && <span className="text-sm text-primary font-semibold ml-auto">+{feedback.xpEarned} XP</span>}
              </div>
              {/* Streak celebration */}
              {feedback.correct && streak >= 3 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30">
                  <span className="text-lg">🔥</span>
                  <span className="text-sm font-bold text-primary">{streak} in a row!</span>
                  {streak % 3 === 0 && <span className="text-xs text-accent ml-auto">+bonus XP!</span>}
                </div>
              )}
              {/* Wrong answer encouragement */}
              {!feedback.correct && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                  <span className="text-lg">💪</span>
                  <span className="text-xs text-muted-foreground">Keep going! Review the info below to improve.</span>
                </div>
              )}
              {!feedback.correct && <p className="text-sm text-foreground"><span className="text-muted-foreground">Correct answer:</span> <span className="font-semibold text-accent">{feedback.correctAnswer}</span></p>}
              {current.phaseId === 'e2' && (
                <div className="text-sm text-foreground bg-muted/50 rounded-lg p-3 space-y-1">
                  <p><span className="font-semibold text-primary">🌾 Monocot:</span> One seed leaf, parallel veins, fibrous roots.</p>
                  <p><span className="font-semibold text-primary">🍀 Dicot:</span> Two seed leaves, branching veins, taproot.</p>
                  <p className="text-muted-foreground mt-1"><strong>{feedback.weed.commonName}</strong> is a <strong>{feedback.weed.plantType}</strong> ({feedback.weed.family}).</p>
                </div>
              )}
              <div className="text-sm text-foreground space-y-1">
                <p><span className="text-primary">💡 Memory Hook:</span> {feedback.weed.memoryHook}</p>
                <p><span className="text-muted-foreground">Look-alike:</span> Often confused with {feedback.weed.lookAlike.species} — {feedback.weed.lookAlike.difference}</p>
              </div>
              <button onClick={handleNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2">NEXT QUESTION →</button>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && <div className="fixed inset-0 bg-background/80 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border overflow-y-auto transition-transform lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-display font-bold text-primary text-lg">WeedID</span>
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Level {level}</span><span>{xpInLevel}/{XP_PER_LEVEL} XP</span></div>
            <div className="h-3 bg-muted rounded-full overflow-hidden"><div className={`h-full ${gradeColor} rounded-full transition-all duration-500`} style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }} /></div>
            <div className="text-xs text-primary font-semibold mt-1">{xp} Total XP</div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Phases</h3>
            <div className="space-y-1">
              {phases.map(p => {
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
          <div className="space-y-1 text-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Session</h3>
            <div className="flex justify-between"><span className="text-muted-foreground">Correct</span><span className="text-accent font-semibold">{totalCorrect}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Wrong</span><span className="text-destructive font-semibold">{totalWrong}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Mastered</span><span className="text-primary font-semibold">{masteredCount}/{weeds.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Streak</span><span className="font-semibold">{streak} 🔥</span></div>
          </div>
          <div className="space-y-2 pt-2">
            <button onClick={() => setShowInstructor(true)} className="w-full px-3 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors">📊 Instructor Panel</button>
            <button onClick={() => setShowGlossary(true)} className="w-full px-3 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors">📖 Glossary</button>
            <button onClick={endSession} className="w-full px-3 py-2 text-sm rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors">🏁 End Session</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">☰</button>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${gradeColor} text-accent-foreground`}>{current.phaseName}</span>
          <span className="text-sm text-muted-foreground">Round {round}</span>
          <span className="text-sm text-muted-foreground">Q#{questionNum}</span>
          {streak >= 3 && <span className="text-sm font-bold text-destructive animate-pulse">🔥 {streak} streak!</span>}
          <div className="flex-1" />
          <span className="text-sm font-semibold text-primary">{GRADE_NAMES[grade]}</span>
        </header>

        <div className="flex-1 p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-4">
          {renderActivity()}
        </div>
      </main>
    </div>
  );
}
