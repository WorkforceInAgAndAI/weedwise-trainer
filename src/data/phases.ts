import type { GradeLevel, PhaseConfig } from '@/types/game';

export const PHASES: Record<GradeLevel, PhaseConfig[]> = {
  elementary: [
    { id: 'e1', name: 'Name That Weed', description: 'Multiple choice — identify weed from image + traits', xpRequired: 0, xpReward: 5, imageStage: 'whole', showName: false, showFamily: false },
    { id: 'e2', name: 'Monocot or Dicot?', description: 'Classify plants by leaf type', xpRequired: 20, xpReward: 5, imageStage: 'whole', showName: false, showFamily: false },
    { id: 'e3', name: 'Card Flip Match', description: 'Memory game — match images to names', xpRequired: 50, xpReward: 4, imageStage: 'whole', showName: false, showFamily: false },
    { id: 'e4', name: 'Life Stage Sort', description: 'Sort weed images into their correct life stages', xpRequired: 80, xpReward: 5, imageStage: 'whole', showName: true, showFamily: false },
  ],
  middle: [
    { id: 'm1', name: 'Identify the Weed', description: 'Multiple choice from characteristics', xpRequired: 0, xpReward: 5, imageStage: 'vegetative', showName: false, showFamily: false },
    { id: 'm2', name: 'Habitat Connect', description: 'Match weeds to their habitats', xpRequired: 20, xpReward: 5, imageStage: 'whole', showName: true, showFamily: false },
    { id: 'm3', name: 'Life Cycle Sort', description: 'Sort weeds by their life cycle type', xpRequired: 50, xpReward: 5, imageStage: 'whole', showName: true, showFamily: false },
    { id: 'm4', name: 'Look-Alike Challenge', description: 'Tell apart similar species from the same family', xpRequired: 80, xpReward: 6, imageStage: 'seedling', showName: false, showFamily: false },
    { id: 'm5', name: 'Scientific Name Match', description: 'Match common names to scientific names with card flip', xpRequired: 120, xpReward: 6, imageStage: 'whole', showName: true, showFamily: false },
    { id: 'm6', name: 'Control Timing', description: 'Choose optimal timing and see population impact', xpRequired: 150, xpReward: 6, imageStage: 'flower', showName: true, showFamily: false },
  ],
  high: [
    { id: 'h1', name: 'Name the Weed', description: 'Multiple choice — identify by scientific name', xpRequired: 0, xpReward: 5, imageStage: 'seedling', showName: false, showFamily: false },
    { id: 'h2', name: 'Life Cycle Sort', description: 'Sort weeds into Annual, Perennial, or Biennial', xpRequired: 20, xpReward: 5, imageStage: 'whole', showName: true, showFamily: false },
    { id: 'h4', name: 'Habitat/Climate Connect', description: 'Match species to their preferred habitat', xpRequired: 50, xpReward: 5, imageStage: 'whole', showName: true, showFamily: false },
    { id: 'h5', name: 'Family Match', description: 'Match scientific names to plant families', xpRequired: 80, xpReward: 6, imageStage: 'whole', showName: true, showFamily: false },
    { id: 'h7', name: 'Act Now or Wait?', description: 'Assess threat level and choose response', xpRequired: 110, xpReward: 6, imageStage: 'whole', showName: true, showFamily: false },
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
