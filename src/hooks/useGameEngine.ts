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
      return { ...base, type: 'binary', text: 'Look at this plant. Is it a Monocot or a Dicot?', options: ['🌾 Monocot', '🍀 Dicot'], correct: weed.plantType === 'Monocot' ? '🌾 Monocot' : '🍀 Dicot' };
    }
    case 'e3': {
      const opts = shuffle([weed.commonName, ...pickRandom(others, 3).map(w => w.commonName)]);
      return { ...base, type: 'mcq', text: `Which weed does this emoji represent? ${weed.emoji}`, options: opts, correct: weed.commonName, showName: false };
    }
    case 'e4': {
      const habitats: string[] = ['Crop fields', 'Roadsides & disturbed areas', 'Wet areas & waterways', 'Pastures & meadows'];
      return { ...base, type: 'mcq', text: `Where does ${weed.commonName} primarily grow?`, options: habitats, correct: weed.primaryHabitat };
    }
    case 'e5': {
      return { ...base, type: 'binary', text: `${weed.commonName} has been spotted at early growth stage. What should you do?`, options: ['🚨 Act Now!', '👀 Monitor & Wait'], correct: weed.actImmediately ? '🚨 Act Now!' : '👀 Monitor & Wait' };
    }
    case 'm2': {
      const allFamilies = [...new Set(allWeeds.map(w => w.family))];
      let opts = pickRandom(allFamilies.filter(f => f !== weed.family), 3);
      opts.push(weed.family);
      return { ...base, type: 'mcq', text: `Which plant family does ${weed.commonName} belong to?`, options: shuffle(opts), correct: weed.family };
    }
    case 'm3': {
      const cycles = ['Annual', 'Perennial', 'Biennial', 'Annual/Winter Annual'];
      return { ...base, type: 'mcq', text: `What is the life cycle of ${weed.commonName}?`, options: cycles, correct: weed.lifeCycle };
    }
    case 'm4': {
      const lookAlikeWeed = allWeeds.find(w => w.id === weed.lookAlike.id) || pickRandom(others, 1)[0];
      return { ...base, type: 'binary', text: 'Based on the traits and image shown, which weed is this?', options: shuffle([weed.commonName, lookAlikeWeed.commonName]), correct: weed.commonName, showName: false };
    }
    case 'm5': {
      return { ...base, type: 'binary', text: `Is ${weed.commonName} native to North America or introduced?`, options: ['🌿 Native', '🚢 Introduced'], correct: weed.origin === 'Native' ? '🌿 Native' : '🚢 Introduced' };
    }
    case 'h2': {
      return { ...base, type: 'fillin', text: `What is the scientific name of ${weed.commonName}?`, options: [], correct: weed.scientificName };
    }
    case 'h3': {
      const opts = shuffle([weed.eppoCode, ...pickRandom(others, 3).map(w => w.eppoCode)]);
      return { ...base, type: 'mcq', text: 'Which EPPO code belongs to the weed shown?', options: opts, correct: weed.eppoCode };
    }
    case 'h4': {
      const opts = shuffle([weed.controlTiming, ...pickRandom(others, 3).map(w => w.controlTiming)]);
      return { ...base, type: 'mcq', text: `When is the optimal time to control ${weed.commonName}?`, options: opts, correct: weed.controlTiming };
    }
    case 'h5': {
      const opts = shuffle([weed.management, ...pickRandom(others, 3).map(w => w.management)]);
      return { ...base, type: 'mcq', text: `What is the best IPM approach for ${weed.commonName}?`, options: opts, correct: weed.management };
    }
    default:
      throw new Error(`Unknown phase: ${phase.id}`);
  }
}

function getUnlockedPhases(grade: GradeLevel, xp: number): PhaseConfig[] {
  return PHASES[grade].filter(p => xp >= p.xpRequired);
}

function buildPool(grade: GradeLevel, xp: number): Question[] {
  const unlocked = getUnlockedPhases(grade, xp);
  const questions: Question[] = [];
  for (const phase of unlocked) {
    for (const weed of weeds) {
      questions.push(generateQuestion(phase, weed, weeds));
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

  const poolRef = useRef<Question[]>([]);
  const roundRef = useRef(1);
  const xpRef = useRef(0);
  const timerRef = useRef(0);

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

    const p = buildPool(g, 0);
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
      poolRef.current = buildPool(grade, xpRef.current);
      roundRef.current += 1;
      setRound(roundRef.current);
    }

    const [next, ...rest] = poolRef.current;
    poolRef.current = rest;
    setCurrent(next);
    setQuestionNum(n => n + 1);
    timerRef.current = Date.now();
  }, [grade]);

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

    const xpEarned = isCorrect ? current.xpReward : 0;
    const newXp = xpRef.current + xpEarned;
    const oldUnlocked = getUnlockedPhases(grade, xpRef.current).length;
    const newUnlocked = getUnlockedPhases(grade, newXp).length;

    xpRef.current = newXp;
    setXp(newXp);

    if (newUnlocked > oldUnlocked) {
      const newPhase = PHASES[grade][newUnlocked - 1];
      toast('🔓 New Phase Unlocked!', { description: newPhase.name });
      // Rebuild pool with new phase
      poolRef.current = buildPool(grade, newXp);
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

    setPhaseStats(prev => {
      const stat = prev[current.phaseId] || { correct: 0, wrong: 0 };
      return { ...prev, [current.phaseId]: { correct: stat.correct + (isCorrect ? 1 : 0), wrong: stat.wrong + (isCorrect ? 0 : 1) } };
    });

    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    if (isCorrect && newStreak > 0 && newStreak % 5 === 0) {
      toast('🔥 Streak!', { description: `${newStreak} correct in a row!` });
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
  }, [current, grade, streak]);

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
    weedStats, phaseStats, questionLog,
    showInstructor, showGlossary,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    unlockedPhases: grade ? getUnlockedPhases(grade, xp) : [],
    masteredCount: Object.values(weedStats).filter(s => s.mastered).length,
    totalCorrect, totalWrong,
    startGame, submitAnswer, nextQuestion, endSession, resetToLanding,
    setShowInstructor, setShowGlossary,
  };
}

export type GameEngine = ReturnType<typeof useGameEngine>;
