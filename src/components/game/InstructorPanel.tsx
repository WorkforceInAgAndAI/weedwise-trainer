import { useState } from 'react';
import type { GameEngine } from '@/hooks/useGameEngine';
import { weeds } from '@/data/weeds';
import { PHASES, GRADE_NAMES, GRADE_RANGES } from '@/data/phases';
import type { GradeLevel } from '@/types/game';

type SortKey = 'name' | 'shown' | 'correct' | 'wrong' | 'accuracy' | 'avgTime' | 'status';

export default function InstructorPanel(game: GameEngine) {
  const { weedStats, phaseStats, questionLog, xp, totalCorrect, totalWrong, masteredCount, setShowInstructor } = game;
  const [tab, setTab] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const totalQuestions = totalCorrect + totalWrong;
  const accuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : '0.0';
  const totalTimeMs = Object.values(weedStats).reduce((s, w) => s + w.totalTimeMs, 0);
  const avgTime = totalQuestions > 0 ? (totalTimeMs / totalQuestions / 1000).toFixed(1) : '0.0';

  const weedRows = weeds.map(w => {
    const stat = weedStats[w.id];
    const shown = stat?.timesShown ?? 0;
    const correct = stat?.timesCorrect ?? 0;
    const wrong = stat?.timesWrong ?? 0;
    const acc = shown > 0 ? (correct / shown) * 100 : -1;
    const avg = shown > 0 ? stat!.totalTimeMs / shown / 1000 : 0;
    const status = stat?.mastered ? 'Mastered' : (shown >= 3 && acc < 50) ? 'Struggling' : shown > 0 ? 'In Progress' : 'Not Yet Seen';
    return { id: w.id, name: w.commonName, shown, correct, wrong, acc, avg, status };
  });

  const sorted = [...weedRows].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'shown': cmp = a.shown - b.shown; break;
      case 'correct': cmp = a.correct - b.correct; break;
      case 'wrong': cmp = a.wrong - b.wrong; break;
      case 'accuracy': cmp = a.acc - b.acc; break;
      case 'avgTime': cmp = a.avg - b.avg; break;
      case 'status': cmp = a.status.localeCompare(b.status); break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const tabs = ['Session Overview', 'Species Reference', 'Phase Guide'];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-primary">📊 Instructor Panel</h1>
          <button onClick={() => setShowInstructor(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">✕ Close</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${tab === i ? 'bg-card text-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab 1: Session Overview */}
        {tab === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Questions', value: totalQuestions },
                { label: 'Correct', value: totalCorrect },
                { label: 'Accuracy', value: `${accuracy}%` },
                { label: 'Total XP', value: xp },
                { label: 'Mastered', value: `${masteredCount}/25` },
                { label: 'Wrong', value: totalWrong },
                { label: 'Avg Time', value: `${avgTime}s` },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-xl font-bold text-foreground">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Per-Weed Table */}
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Per-Weed Performance</h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      {([['name','Weed'],['shown','Shown'],['correct','✓'],['wrong','✗'],['accuracy','Acc%'],['avgTime','Avg(s)'],['status','Status']] as [SortKey,string][]).map(([k,l]) => (
                        <th key={k} onClick={() => handleSort(k)} className="px-3 py-2 text-left cursor-pointer hover:text-primary text-muted-foreground font-medium">
                          {l} {sortKey === k && (sortAsc ? '↑' : '↓')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(r => (
                      <tr key={r.id} className={`border-t border-border ${r.status === 'Struggling' ? 'bg-destructive/10' : r.status === 'Mastered' ? 'bg-accent/10' : ''}`}>
                        <td className="px-3 py-2 font-medium">{r.name}</td>
                        <td className="px-3 py-2">{r.shown}</td>
                        <td className="px-3 py-2 text-accent">{r.correct}</td>
                        <td className="px-3 py-2 text-destructive">{r.wrong}</td>
                        <td className="px-3 py-2">{r.acc >= 0 ? `${r.acc.toFixed(0)}%` : '—'}</td>
                        <td className="px-3 py-2">{r.shown > 0 ? r.avg.toFixed(1) : '—'}</td>
                        <td className={`px-3 py-2 font-semibold ${r.status === 'Mastered' ? 'text-accent' : r.status === 'Struggling' ? 'text-destructive' : 'text-muted-foreground'}`}>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phase Accuracy */}
            {game.grade && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">Per-Phase Accuracy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PHASES[game.grade].filter(p => xp >= p.xpRequired).map(p => {
                    const s = phaseStats[p.id];
                    const t = (s?.correct ?? 0) + (s?.wrong ?? 0);
                    const a = t > 0 ? ((s!.correct / t) * 100).toFixed(0) : '—';
                    return (
                      <div key={p.id} className="bg-card border border-border rounded-lg p-3">
                        <div className="text-sm font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{s?.correct ?? 0}✓ {s?.wrong ?? 0}✗ — {a}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Question Log */}
            {questionLog.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-foreground mb-3">Question Log (last 20)</h3>
                <div className="overflow-x-auto rounded-lg border border-border max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Weed</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Phase</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Answer</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Correct</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Result</th>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionLog.slice(0, 20).map((e, i) => (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-2">{e.weedName}</td>
                          <td className="px-3 py-2 text-muted-foreground">{e.phaseName}</td>
                          <td className="px-3 py-2 truncate max-w-[120px]">{e.studentAnswer}</td>
                          <td className="px-3 py-2 truncate max-w-[120px] text-accent">{e.correctAnswer}</td>
                          <td className="px-3 py-2">{e.correct ? '✅' : '❌'}</td>
                          <td className="px-3 py-2 text-muted-foreground">{(e.timeMs / 1000).toFixed(1)}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Species Reference */}
        {tab === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeds.map(w => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{w.emoji}</span>
                  <div>
                    <div className="font-display font-bold text-foreground">{w.commonName}</div>
                    <div className="text-xs text-primary italic">{w.scientificName}</div>
                  </div>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p><span className="text-foreground">EPPO:</span> {w.eppoCode} | <span className="text-foreground">Family:</span> {w.family}</p>
                  <p><span className="text-foreground">Type:</span> {w.plantType} | <span className="text-foreground">Cycle:</span> {w.lifeCycle} | <span className="text-foreground">Origin:</span> {w.origin}</p>
                </div>
                <div className="text-xs space-y-1">
                  {w.traits.map((t, i) => <p key={i} className="text-foreground">• {t}</p>)}
                </div>
                <div className="text-xs space-y-1 text-muted-foreground border-t border-border pt-2">
                  <p><span className="text-foreground">Management:</span> {w.management}</p>
                  <p><span className="text-foreground">Timing:</span> {w.controlTiming}</p>
                  <p><span className="text-foreground">Look-alike:</span> {w.lookAlike.species} — {w.lookAlike.difference}</p>
                  <p><span className="text-primary">💡</span> {w.memoryHook}</p>
                </div>
                {w.safetyNote && <div className="text-xs bg-destructive/15 text-destructive-foreground p-2 rounded">{w.safetyNote}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Phase Guide */}
        {tab === 2 && (
          <div className="space-y-8">
            {(['elementary', 'middle', 'high'] as GradeLevel[]).map(g => (
              <div key={g}>
                <h2 className="font-display font-bold text-lg text-foreground mb-3">
                  {GRADE_NAMES[g]} <span className="text-sm text-muted-foreground font-normal">(Grades {GRADE_RANGES[g]})</span>
                </h2>
                <div className="space-y-2">
                  {PHASES[g].map(p => (
                    <div key={p.id} className="bg-card border border-border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.description}</div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        Unlock: {p.xpRequired} XP • Reward: +{p.xpReward} XP
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 italic">All unlocked phases rotate together for continuous review.</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
