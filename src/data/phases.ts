import type { GradeLevel, PhaseConfig } from '@/types/game';

export const PHASES: Record<GradeLevel, PhaseConfig[]> = {
  elementary: [
    { id: 'e1', name: 'Name That Weed', description: 'Multiple choice — identify weed from image + traits', xpRequired: 0, xpReward: 10, imageStage: 'seedling', showName: false, showFamily: false },
    { id: 'e2', name: 'Monocot or Dicot?', description: 'Drag/click sort into two categories', xpRequired: 20, xpReward: 12, imageStage: 'seedling', showName: false, showFamily: false },
    { id: 'e3', name: 'Card Flip Match', description: 'Flip-card memory: match emoji to common name', xpRequired: 50, xpReward: 8, imageStage: 'vegetative', showName: false, showFamily: false },
    { id: 'e4', name: 'Habitat Sort', description: 'Sort weeds into habitat categories', xpRequired: 90, xpReward: 12, imageStage: 'vegetative', showName: true, showFamily: false },
    { id: 'e5', name: 'Act Now or Wait?', description: 'Binary management decision (act immediately / monitor)', xpRequired: 140, xpReward: 15, imageStage: 'vegetative', showName: true, showFamily: false },
  ],
  middle: [
    { id: 'm1', name: 'Identify the Weed', description: 'Multiple choice from characteristics', xpRequired: 0, xpReward: 10, imageStage: 'vegetative', showName: false, showFamily: false },
    { id: 'm2', name: 'Plant Family Sort', description: 'Sort into plant families', xpRequired: 20, xpReward: 14, imageStage: 'vegetative', showName: true, showFamily: false },
    { id: 'm3', name: 'Life Cycle Match', description: 'Classify annual / perennial / biennial', xpRequired: 50, xpReward: 12, imageStage: 'vegetative', showName: true, showFamily: false },
    { id: 'm4', name: 'Look-Alike Challenge', description: 'Choose between two commonly confused species', xpRequired: 90, xpReward: 20, imageStage: 'vegetative', showName: false, showFamily: false },
    { id: 'm5', name: 'Native or Introduced?', description: 'Binary origin classification', xpRequired: 140, xpReward: 12, imageStage: 'vegetative', showName: true, showFamily: false },
  ],
  high: [
    { id: 'h1', name: 'Weed Identification', description: 'Multiple choice — vegetative characteristics', xpRequired: 0, xpReward: 10, imageStage: 'vegetative', showName: false, showFamily: false },
    { id: 'h2', name: 'Scientific Name', description: 'Fill-in-the-blank (genus match accepted)', xpRequired: 20, xpReward: 20, imageStage: 'vegetative', showName: true, showFamily: true },
    { id: 'h3', name: 'EPPO Code Match', description: 'Flip card: match EPPO code to species', xpRequired: 50, xpReward: 15, imageStage: 'vegetative', showName: false, showFamily: true },
    { id: 'h4', name: 'Control Timing', description: 'Multiple choice — correct growth stage for control', xpRequired: 90, xpReward: 18, imageStage: 'flower', showName: true, showFamily: false },
    { id: 'h5', name: 'IPM Decision', description: 'Multiple choice — best integrated management action', xpRequired: 140, xpReward: 25, imageStage: 'flower', showName: true, showFamily: false },
  ],
};

export const GRADE_NAMES: Record<GradeLevel, string> = {
  elementary: 'Plant Explorer',
  middle: 'Field Scout',
  high: 'IPM Specialist',
};

export const GRADE_RANGES: Record<GradeLevel, string> = {
  elementary: 'K–5',
  middle: '6–8',
  high: '9–12',
};

export const XP_PER_LEVEL = 100;
