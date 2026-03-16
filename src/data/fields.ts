import type { GradeLevel } from '@/types/game';

export interface FieldEnvironment {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  /** Which weed primaryHabitat values appear here */
  habitatTags: string[];
  /** Recommended crop IDs */
  suggestedCrops: string[];
}

export const fieldEnvironments: FieldEnvironment[] = [
  {
    id: 'row-crop',
    name: 'Row Crop Field',
    emoji: '🌾',
    description: 'Flat, well-drained cropland with corn and soybeans. Full sun, tilled annually.',
    color: 'bg-accent/20 border-accent/40',
    habitatTags: ['Warm-Season / Full Sun', 'Cropland', 'Disturbed / Open Ground', 'Cultivated Fields'],
    suggestedCrops: ['corn', 'soybeans'],
  },
  {
    id: 'pasture',
    name: 'Pasture & Hay',
    emoji: '🐄',
    description: 'Perennial grassland for grazing and hay. Undisturbed soil favors perennial weeds.',
    color: 'bg-primary/20 border-primary/40',
    habitatTags: ['Pastures / Hay Fields', 'Cool-Season / Partial Shade', 'Perennial'],
    suggestedCrops: ['alfalfa'],
  },
  {
    id: 'small-grain',
    name: 'Small Grain Field',
    emoji: '🌱',
    description: 'Cool-season wheat and oat fields. Dense canopy suppresses some weeds but winter annuals thrive.',
    color: 'bg-grade-middle/20 border-grade-middle/40',
    habitatTags: ['Cool-Season / Partial Shade', 'Cultivated Fields', 'Disturbed / Open Ground'],
    suggestedCrops: ['wheat', 'oats'],
  },
  {
    id: 'wetland-edge',
    name: 'Wetland Edge',
    emoji: '💧',
    description: 'Low-lying, moist areas near ponds and ditches. Home to moisture-loving and invasive species.',
    color: 'bg-grade-middle/20 border-grade-middle/40',
    habitatTags: ['Wet / Riparian', 'Wetlands', 'Ditches / Waterways'],
    suggestedCrops: [],
  },
  {
    id: 'field-edge',
    name: 'Field Edge & Fencerow',
    emoji: '🌿',
    description: 'Borders, roadsides, and fencerows. Untilled refuges for perennial and invasive species.',
    color: 'bg-destructive/20 border-destructive/40',
    habitatTags: ['Roadsides / Fencerows', 'Waste Areas', 'Disturbed / Open Ground', 'Field Edges'],
    suggestedCrops: [],
  },
];

/** How many fields to show per grade */
export function getFieldCount(grade: GradeLevel): number {
  switch (grade) {
    case 'elementary': return 2;
    case 'middle': return 3;
    case 'high': return 3;
  }
}

/** Scouting phases per grade */
export function getScoutingPhases(grade: GradeLevel): { id: string; name: string; imageStage: string }[] {
  switch (grade) {
    case 'elementary':
      return [{ id: 'plant', name: 'Growing Season', imageStage: 'whole' }];
    case 'middle':
      return [
        { id: 'plant', name: 'Early Season', imageStage: 'vegetative' },
        { id: 'repro', name: 'Late Season', imageStage: 'flower' },
      ];
    case 'high':
      return [
        { id: 'seedling', name: 'Spring Scouting', imageStage: 'seedling' },
        { id: 'veg', name: 'Vegetative Growth', imageStage: 'vegetative' },
        { id: 'repro', name: 'Reproductive Stage', imageStage: 'flower' },
      ];
  }
}

export const fieldMap = Object.fromEntries(fieldEnvironments.map(f => [f.id, f]));
