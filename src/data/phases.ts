import type { GradeLevel, PhaseConfig } from '@/types/game';

export const PHASES: Record<GradeLevel, PhaseConfig[]> = {
  elementary: [
    { id: 'e1', name: 'Name That Weed', description: 'Multiple choice — identify weed from image + traits', xpRequired: 0, xpReward: 5, imageStage: 'whole', showName: false, showFamily: false },
    { id: 'e2', name: 'Monocot or Dicot?', description: 'Classify plants by leaf type', xpRequired: 20, xpReward: 5, imageStage: 'whole', showName: false, showFamily: false },
    { id: 'e3', name: 'Card Flip Match', description: 'Memory game — match images to names', xpRequired: 50, xpReward: 4, imageStage: 'whole', showName: false, showFamily: false },
    { id: 'e4', name: 'Life Stage Sort', description: 'Sort weed images into their correct life stages', xpRequired: 80, xpReward: 5, imageStage: 'whole', showName: true, showFamily: false },
    { id: 'e5', name: 'Act Now or Wait?', description: 'Assess threat level and choose response', xpRequired: 120, xpReward: 6, imageStage: 'whole', showName: true, showFamily: false },
  ],
  middle: [
    { id: 'm1', name: 'Identify the Weed', description: 'Multiple choice from characteristics', xpRequired: 0, xpReward: 5, imageStage: 'vegetative', showName: false, showFamily: false },
    { id: 'm2', name: 'Plant Family Connect', description: 'Connect each weed to its plant family', xpRequired: 20, xpReward: 5, imageStage: 'vegetative', showName: true, showFamily: false },
    { id: 'm3', name: 'Life Cycle Sort', description: 'Sort weeds by their life cycle type', xpRequired: 50, xpReward: 5, imageStage: 'whole', showName: true, showFamily: false },
    { id: 'm4', name: 'Look-Alike Challenge', description: 'Tell apart similar species from the same family', xpRequired: 80, xpReward: 6, imageStage: 'seedling', showName: false, showFamily: false },
    { id: 'm5', name: 'Native or Introduced?', description: 'Rapid-fire species origin classification', xpRequired: 120, xpReward: 5, imageStage: 'flower', showName: true, showFamily: false },
  ],
  high: [
    { id: 'h1', name: 'Weed Identification', description: 'Multiple choice — vegetative characteristics', xpRequired: 0, xpReward: 5, imageStage: 'seedling', showName: false, showFamily: false },
    { id: 'h2', name: 'Scientific Name Match', description: 'Connect common names to scientific names', xpRequired: 20, xpReward: 6, imageStage: 'vegetative', showName: true, showFamily: true },
    { id: 'h3', name: 'Life Stage Image Sort', description: 'Sort life stage images into correct species', xpRequired: 50, xpReward: 5, imageStage: 'flower', showName: false, showFamily: true },
    { id: 'h4', name: 'Control Timing', description: 'Choose optimal timing and see population impact', xpRequired: 80, xpReward: 6, imageStage: 'flower', showName: true, showFamily: false },
    { id: 'h5', name: 'IPM Plan Builder', description: 'Build an integrated pest management strategy', xpRequired: 120, xpReward: 8, imageStage: 'vegetative', showName: true, showFamily: false },
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
