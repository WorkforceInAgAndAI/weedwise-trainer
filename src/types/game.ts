export type GradeLevel = 'elementary' | 'middle' | 'high';

export interface Weed {
 id: string;
 commonName: string;
 scientificName: string;
 family: string;
 plantType: 'Dicot' | 'Monocot' | 'Non-flowering';
 lifeCycle: string;
 origin: 'Native' | 'Introduced';
 emoji?: string;
 image?: string;
 traits: string[];
 habitat: string;
 primaryHabitat: string;
 management: string;
 controlTiming: string;
 actImmediately: boolean;
 actReason: string;
 lookAlike: { id: string; species: string; difference: string };
 memoryHook: string;
 safetyNote?: string;
}

export interface PhaseConfig {
 id: string;
 name: string;
 description: string;
 xpRequired: number;
 xpReward: number;
 imageStage: string;
 showName: boolean;
 showFamily: boolean;
}

export interface Question {
 weedId: string;
 phaseId: string;
 phaseName: string;
 xpReward: number;
 type: 'mcq' | 'binary' | 'fillin' | 'matching' | 'minigame';
 text: string;
 options: string[];
 correct: string;
 imageStage: string;
 showName: boolean;
 showFamily: boolean;
}

export interface WeedStat {
 timesShown: number;
 timesCorrect: number;
 timesWrong: number;
 consecutiveCorrect: number;
 mastered: boolean;
 totalTimeMs: number;
}

export interface PhaseStat {
 correct: number;
 wrong: number;
}

export interface LogEntry {
 weedName: string;
 phaseName: string;
 type: string;
 studentAnswer: string;
 correctAnswer: string;
 correct: boolean;
 timeMs: number;
}

export interface FeedbackData {
 correct: boolean;
 xpEarned: number;
 correctAnswer: string;
 weed: Weed;
}

export interface BadgeDefinition {
 id: string;
 name: string;
 description: string;
 icon: string;
 category: 'species' | 'topic' | 'streak' | 'phase';
 requirement: {
 type: string;
 count?: number;
 topic?: string;
 grade?: string;
 };
}
