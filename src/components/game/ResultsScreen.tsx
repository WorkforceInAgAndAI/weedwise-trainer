import type { GameEngine } from '@/hooks/useGameEngine';
import { GRADE_NAMES } from '@/data/phases';

export default function ResultsScreen(game: GameEngine) {
 const { grade, xp, totalCorrect, totalWrong, questionNum, masteredCount, resetToLanding } = game;
 const total = totalCorrect + totalWrong;
 const accuracy = total > 0 ? ((totalCorrect / total) * 100).toFixed(1) : '0.0';

 return (
 <div className="min-h-screen flex items-center justify-center p-4">
 <div className="max-w-md w-full text-center space-y-6 animate-scale-in">
 <div className="text-6xl"></div>
 <h1 className="text-3xl font-display font-extrabold text-primary">Session Complete!</h1>

 <div className="bg-card border-2 border-primary/30 rounded-lg p-6 space-y-4 animate-pulse-glow">
 <div className="text-sm text-muted-foreground uppercase tracking-wider">Certificate of Achievement</div>
 {grade && <div className="text-lg font-display font-bold text-foreground">{GRADE_NAMES[grade]}</div>}
 <div className="grid grid-cols-2 gap-3 text-sm">
 <div className="bg-muted rounded-lg p-3">
 <div className="text-muted-foreground text-xs">Questions</div>
 <div className="text-xl font-bold text-foreground">{questionNum - 1}</div>
 </div>
 <div className="bg-muted rounded-lg p-3">
 <div className="text-muted-foreground text-xs">XP Earned</div>
 <div className="text-xl font-bold text-primary">{xp}</div>
 </div>
 <div className="bg-muted rounded-lg p-3">
 <div className="text-muted-foreground text-xs">Correct</div>
 <div className="text-xl font-bold text-accent">{totalCorrect}</div>
 </div>
 <div className="bg-muted rounded-lg p-3">
 <div className="text-muted-foreground text-xs">Accuracy</div>
 <div className="text-xl font-bold text-foreground">{accuracy}%</div>
 </div>
 </div>
 <div className="text-sm text-muted-foreground">Species Mastered: <span className="text-primary font-bold">{masteredCount}/25</span></div>
 </div>

 <button onClick={resetToLanding}
 className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 transition-opacity">
 Play Again
 </button>
 </div>
 </div>
 );
}
