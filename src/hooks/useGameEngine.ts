import { useState, useRef, useCallback } from 'react';
import { weeds, weedMap } from '@/data/weeds';
import { PHASES, XP_PER_LEVEL } from '@/data/phases';
import type { GradeLevel, Question, WeedStat, PhaseStat, LogEntry, FeedbackData, Weed, PhaseConfig } from '@/types/game';
import { toast } from 'sonner';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, Math.min(n, arr.length));
}

// Phases that are batch mini-games (one question per pool, component picks weeds)
const BATCH_PHASES = new Set(['e3', 'e4', 'm2', 'm3', 'm5', 'h2', 'h3', 'h4', 'h5']);

// How many correct answers at a tier before a species advances to next tier
const TIER_ADVANCE_THRESHOLD = 2;

function getPhaseIndex(grade: GradeLevel, phaseId: string): number {
  return PHASES[grade].findIndex(p => p.id === phaseId);
}

function generateQuestion(phase: PhaseConfig, weed: Weed, allWeeds: Weed[]): Question {
  const others = allWeeds.filter(w => w.id !== weed.id);
  const base = {
    weedId: weed.id, phaseId: phase.id, phaseName: phase.name,
    xpReward: phase.xpReward, imageStage: phase.imageStage,
    showName: phase.showName, showFamily: phase.showFamily,
  };

  switch (phase.id) {
    case 'e1': case 'm1': case 'h1': {
      const opts = shuffle([weed.commonName, ...pickRandom(others, 3).map(w => w.commonName)]);
      return { ...base, type: 'mcq', text: 'Which weed is shown based on the traits and image?', options: opts, correct: weed.commonName };
    }
    case 'e2': {
      return { ...base, type: 'binary', text: 'Look at this plant. Is it a Monocot or a Dicot?', options: ['Monocot', 'Dicot'], correct: weed.plantType === 'Monocot' ? 'Monocot' : 'Dicot' };
    }
    // Per-weed interactive phases
    case 'e5': case 'm4': case 'h4': case 'h5': {
      return { ...base, type: 'minigame', text: phase.name, options: [], correct: '' };
    }
    default:
      throw new Error(`Unknown phase: ${phase.id}`);
  }
}

function getUnlockedPhases(grade: GradeLevel, xp: number): PhaseConfig[] {
  return PHASES[grade].filter(p => xp >= p.xpRequired);
}

/** Get species eligible for a given phase — all weeds are eligible for any unlocked phase */
function getEligibleWeeds(_grade: GradeLevel, _phaseId: string, _speciesTiers: Record<string, number>): Weed[] {
  return weeds;
}

function buildPool(grade: GradeLevel, xp: number, speciesTiers: Record<string, number>): Question[] {
  const unlocked = getUnlockedPhases(grade, xp);
  const questions: Question[] = [];

  // Ensure EVEN distribution across all unlocked phases
  // Each phase gets exactly 2 entries per pool cycle
  const QUESTIONS_PER_PHASE = 2;

  for (const phase of unlocked) {
    for (let i = 0; i < QUESTIONS_PER_PHASE; i++) {
      if (BATCH_PHASES.has(phase.id)) {
        questions.push({
          weedId: weeds[0].id, phaseId: phase.id, phaseName: phase.name,
          xpReward: phase.xpReward, imageStage: phase.imageStage,
          showName: phase.showName, showFamily: phase.showFamily,
          type: 'minigame', text: phase.name, options: [], correct: '',
        });
      } else {
        const eligible = getEligibleWeeds(grade, phase.id, speciesTiers);
        const picked = pickRandom(eligible, 1);
        for (const weed of picked) {
          questions.push(generateQuestion(phase, weed, weeds));
        }
      }
    }
  }

  // If only 1 phase unlocked, add extras for variety
  if (unlocked.length === 1 && questions.length < 6) {
    const firstPhase = unlocked[0];
    const extra = pickRandom(weeds, 4);
    for (const weed of extra) {
      questions.push(generateQuestion(firstPhase, weed, weeds));
    }
  }

  return shuffle(questions);
}

export function useGameEngine() {
  const [screen, setScreen] = useState<'landing' | 'playing' | 'results'>('landing');
  const [grade, setGrade] = useState<GradeLevel | null>(null);
  const [xp, setXp] = useState(0);
  const [current, setCurrent] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [round, setRound] = useState(1);
  const [questionNum, setQuestionNum] = useState(0);
  const [streak, setStreak] = useState(0);
  const [weedStats, setWeedStats] = useState<Record<string, WeedStat>>({});
  const [phaseStats, setPhaseStats] = useState<Record<string, PhaseStat>>({});
  const [questionLog, setQuestionLog] = useState<LogEntry[]>([]);
  const [showInstructor, setShowInstructor] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [penaltyUntil, setPenaltyUntil] = useState(0);
  // Per-species mastery tier: 0 = phase 1 only, 1 = phases 1-2, etc.
  const [speciesTiers, setSpeciesTiers] = useState<Record<string, number>>({});
  // Track correct count at current tier for advancement
  const [tierProgress, setTierProgress] = useState<Record<string, number>>({});

  const poolRef = useRef<Question[]>([]);
  const roundRef = useRef(1);
  const xpRef = useRef(0);
  const timerRef = useRef(0);
  const speciesTiersRef = useRef<Record<string, number>>({});
  const tierProgressRef = useRef<Record<string, number>>({});

  const advanceSpeciesTier = useCallback((weedId: string, grade: GradeLevel) => {
    const currentTier = speciesTiersRef.current[weedId] ?? 0;
    const currentProgress = (tierProgressRef.current[weedId] ?? 0) + 1;
    const maxTier = PHASES[grade].length - 1;

    if (currentProgress >= TIER_ADVANCE_THRESHOLD && currentTier < maxTier) {
      const newTier = currentTier + 1;
      speciesTiersRef.current = { ...speciesTiersRef.current, [weedId]: newTier };
      setSpeciesTiers(prev => ({ ...prev, [weedId]: newTier }));
      tierProgressRef.current = { ...tierProgressRef.current, [weedId]: 0 };
      setTierProgress(prev => ({ ...prev, [weedId]: 0 }));
      const phaseName = PHASES[grade][newTier]?.name;
      const weedName = weedMap[weedId]?.commonName;
      if (phaseName && weedName) {
        toast('🌱 Species Advanced!', { description: `${weedName} unlocked "${phaseName}"` });
      }
      // Rebuild pool to include newly eligible questions
      poolRef.current = buildPool(grade, xpRef.current, speciesTiersRef.current);
    } else {
      tierProgressRef.current = { ...tierProgressRef.current, [weedId]: currentProgress };
      setTierProgress(prev => ({ ...prev, [weedId]: currentProgress }));
    }
  }, []);

  const startGame = useCallback((g: GradeLevel) => {
    setGrade(g);
    setXp(0); xpRef.current = 0;
    setStreak(0);
    setRound(1); roundRef.current = 1;
    setQuestionNum(1);
    setWeedStats({});
    setPhaseStats({});
    setQuestionLog([]);
    setFeedback(null);
    setSpeciesTiers({}); speciesTiersRef.current = {};
    setTierProgress({}); tierProgressRef.current = {};

    const p = buildPool(g, 0, {});
    const [first, ...rest] = p;
    poolRef.current = rest;
    setCurrent(first);
    timerRef.current = Date.now();
    setScreen('playing');
  }, []);

  const nextQuestion = useCallback(() => {
    if (!grade) return;
    setFeedback(null);

    if (poolRef.current.length === 0) {
      poolRef.current = buildPool(grade, xpRef.current, speciesTiersRef.current);
      roundRef.current += 1;
      setRound(roundRef.current);
    }

    const [next, ...rest] = poolRef.current;
    poolRef.current = rest;
    setCurrent(next);
    setQuestionNum(n => n + 1);
    timerRef.current = Date.now();
  }, [grade]);

  const completeMinigame = useCallback((phaseId: string, results: Array<{ weedId: string; correct: boolean }>) => {
    if (!grade) return;
    const phase = PHASES[grade].find(p => p.id === phaseId);
    if (!phase) return;

    const correctCount = results.filter(r => r.correct).length;
    const xpEarned = correctCount * phase.xpReward;
    const newXp = xpRef.current + xpEarned;

    const oldUnlocked = getUnlockedPhases(grade, xpRef.current).length;
    xpRef.current = newXp;
    setXp(newXp);
    const newUnlocked = getUnlockedPhases(grade, newXp).length;

    if (newUnlocked > oldUnlocked) {
      const newPhase = PHASES[grade][newUnlocked - 1];
      toast('🔓 New Phase Unlocked!', { description: newPhase.name });
      poolRef.current = buildPool(grade, newXp, speciesTiersRef.current);
    }

    setPhaseStats(prev => ({
      ...prev,
      [phaseId]: {
        correct: (prev[phaseId]?.correct || 0) + correctCount,
        wrong: (prev[phaseId]?.wrong || 0) + (results.length - correctCount),
      },
    }));

    results.forEach(r => {
      setWeedStats(prev => {
        const stat = prev[r.weedId] || { timesShown: 0, timesCorrect: 0, timesWrong: 0, consecutiveCorrect: 0, mastered: false, totalTimeMs: 0 };
        const updated: WeedStat = {
          ...stat,
          timesShown: stat.timesShown + 1,
          timesCorrect: stat.timesCorrect + (r.correct ? 1 : 0),
          timesWrong: stat.timesWrong + (r.correct ? 0 : 1),
          consecutiveCorrect: r.correct ? stat.consecutiveCorrect + 1 : 0,
          mastered: (stat.timesCorrect + (r.correct ? 1 : 0)) >= 3,
        };
        if (updated.mastered && !stat.mastered) {
          toast('⭐ Species Mastered!', { description: weedMap[r.weedId]?.commonName });
        }
        return { ...prev, [r.weedId]: updated };
      });

      // Advance species tier on correct answers
      if (r.correct) {
        advanceSpeciesTier(r.weedId, grade);
      }
    });

    const allCorrect = results.every(r => r.correct);
    setStreak(s => allCorrect ? s + correctCount : 0);

    const oldLevel = Math.floor((newXp - xpEarned) / XP_PER_LEVEL) + 1;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    if (newLevel > oldLevel) {
      toast('🎉 Level Up!', { description: `You reached Level ${newLevel}!` });
    }
  }, [grade, advanceSpeciesTier]);

  const submitAnswer = useCallback((answer: string) => {
    if (!current || !grade) return;

    const timeMs = Date.now() - timerRef.current;
    const weed = weedMap[current.weedId];

    let isCorrect = false;
    if (current.type === 'fillin') {
      const a = answer.trim().toLowerCase();
      const c = current.correct.toLowerCase();
      const genus = c.split(' ')[0];
      isCorrect = a === c || a === genus;
    } else {
      isCorrect = answer === current.correct;
    }

    // Streak bonus: +2 XP for every 3 in a row, +5 for every 5
    const newStreak = isCorrect ? streak + 1 : 0;
    let streakBonus = 0;
    if (isCorrect && newStreak >= 5 && newStreak % 5 === 0) streakBonus = 5;
    else if (isCorrect && newStreak >= 3 && newStreak % 3 === 0) streakBonus = 2;

    const xpEarned = isCorrect ? current.xpReward + streakBonus : 0;
    const newXp = xpRef.current + xpEarned;
    const oldUnlocked = getUnlockedPhases(grade, xpRef.current).length;
    const newUnlocked = getUnlockedPhases(grade, newXp).length;

    xpRef.current = newXp;
    setXp(newXp);

    if (newUnlocked > oldUnlocked) {
      const newPhase = PHASES[grade][newUnlocked - 1];
      toast('🔓 New Phase Unlocked!', { description: newPhase.name });
      poolRef.current = buildPool(grade, newXp, speciesTiersRef.current);
    }

    setWeedStats(prev => {
      const stat = prev[current.weedId] || { timesShown: 0, timesCorrect: 0, timesWrong: 0, consecutiveCorrect: 0, mastered: false, totalTimeMs: 0 };
      const updated: WeedStat = {
        timesShown: stat.timesShown + 1,
        timesCorrect: stat.timesCorrect + (isCorrect ? 1 : 0),
        timesWrong: stat.timesWrong + (isCorrect ? 0 : 1),
        consecutiveCorrect: isCorrect ? stat.consecutiveCorrect + 1 : 0,
        mastered: (stat.timesCorrect + (isCorrect ? 1 : 0)) >= 3,
        totalTimeMs: stat.totalTimeMs + timeMs,
      };
      if (updated.mastered && !stat.mastered) {
        toast('⭐ Species Mastered!', { description: weed.commonName });
      }
      return { ...prev, [current.weedId]: updated };
    });

    // Advance species tier on correct
    if (isCorrect) {
      advanceSpeciesTier(current.weedId, grade);
    }

    setPhaseStats(prev => {
      const stat = prev[current.phaseId] || { correct: 0, wrong: 0 };
      return { ...prev, [current.phaseId]: { correct: stat.correct + (isCorrect ? 1 : 0), wrong: stat.wrong + (isCorrect ? 0 : 1) } };
    });

    setStreak(newStreak);

    // Track consecutive wrong for time penalty
    if (!isCorrect) {
      setConsecutiveWrong(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          // 5-second penalty
          setPenaltyUntil(Date.now() + 5000);
          toast('⏳ Slow Down!', { description: 'Take a moment to review — 5 second pause' });
        }
        return newCount;
      });
    } else {
      setConsecutiveWrong(0);
    }

    if (isCorrect && newStreak > 0 && newStreak % 5 === 0) {
      toast('🔥 Streak Bonus!', { description: `${newStreak} in a row! +${streakBonus} bonus XP` });
    } else if (isCorrect && newStreak > 0 && newStreak % 3 === 0) {
      toast('🔥 Streak!', { description: `${newStreak} correct in a row! +${streakBonus} bonus XP` });
    }

    const oldLevel = Math.floor((xpRef.current - xpEarned) / XP_PER_LEVEL) + 1;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    if (newLevel > oldLevel) {
      toast('🎉 Level Up!', { description: `You reached Level ${newLevel}!` });
    }

    setQuestionLog(prev => [
      { weedName: weed.commonName, phaseName: current.phaseName, type: current.type, studentAnswer: answer, correctAnswer: current.correct, correct: isCorrect, timeMs },
      ...prev,
    ].slice(0, 50));

    setFeedback({ correct: isCorrect, xpEarned, correctAnswer: current.correct, weed });
  }, [current, grade, streak, advanceSpeciesTier]);

  const endSession = useCallback(() => setScreen('results'), []);
  const resetToLanding = useCallback(() => {
    setScreen('landing');
    setGrade(null);
    setCurrent(null);
    setFeedback(null);
  }, []);

  const totalCorrect = Object.values(weedStats).reduce((s, w) => s + w.timesCorrect, 0);
  const totalWrong = Object.values(weedStats).reduce((s, w) => s + w.timesWrong, 0);

  return {
    screen, grade, xp, current, feedback, round, questionNum, streak,
    weedStats, phaseStats, questionLog, speciesTiers, tierProgress,
    showInstructor, showGlossary, consecutiveWrong, penaltyUntil,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    unlockedPhases: grade ? getUnlockedPhases(grade, xp) : [],
    masteredCount: Object.values(weedStats).filter(s => s.mastered).length,
    totalCorrect, totalWrong,
    startGame, submitAnswer, nextQuestion, endSession, resetToLanding,
    setShowInstructor, setShowGlossary,
    completeMinigame,
  };
}

export type GameEngine = ReturnType<typeof useGameEngine>;
