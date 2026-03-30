export interface Crop {
 id: string;
 name: string;
 type: 'broadleaf' | 'grass';
 emoji: string;
 description: string;
 /** Base yield per acre in dollars */
 baseYieldValue: number;
 /** Which weed types are most problematic */
 vulnerableTo: ('Monocot' | 'Dicot')[];
 commonWeeds: string[];
 season: 'spring' | 'summer' | 'winter';
}

export const crops: Crop[] = [
 {
 id: 'corn',
 name: 'Corn (Zea mays)',
 type: 'grass',
 emoji: '',
 description: 'A grass crop vulnerable to broadleaf weeds early in the season. Grass weeds compete more directly for resources.',
 baseYieldValue: 850,
 vulnerableTo: ['Dicot', 'Monocot'],
 commonWeeds: ['waterhemp', 'giant-ragweed', 'velvetleaf', 'common-lambsquarters', 'giant-foxtail'],
 season: 'spring',
 },
 {
 id: 'soybeans',
 name: 'Soybeans (Glycine max)',
 type: 'broadleaf',
 emoji: '',
 description: 'A broadleaf crop where grass weeds are especially problematic. Broadleaf herbicides must be selective.',
 baseYieldValue: 620,
 vulnerableTo: ['Monocot', 'Dicot'],
 commonWeeds: ['waterhemp', 'palmer-amaranth', 'common-ragweed', 'giant-foxtail', 'fall-panicum'],
 season: 'spring',
 },
 {
 id: 'wheat',
 name: 'Winter Wheat (Triticum aestivum)',
 type: 'grass',
 emoji: '',
 description: 'A cool-season grass crop planted in fall. Competes well but vulnerable to winter annuals.',
 baseYieldValue: 420,
 vulnerableTo: ['Dicot'],
 commonWeeds: ['common-chickweed', 'shepherds-purse', 'field-pennycress', 'henbit', 'purple-deadnettle'],
 season: 'winter',
 },
 {
 id: 'alfalfa',
 name: 'Alfalfa (Medicago sativa)',
 type: 'broadleaf',
 emoji: '',
 description: 'A perennial broadleaf forage crop. Grass weeds and perennial broadleafs are key threats.',
 baseYieldValue: 550,
 vulnerableTo: ['Monocot', 'Dicot'],
 commonWeeds: ['canada-thistle', 'dandelion', 'quackgrass', 'smooth-bromegrass', 'curly-dock'],
 season: 'spring',
 },
 {
 id: 'oats',
 name: 'Oats (Avena sativa)',
 type: 'grass',
 emoji: '',
 description: 'A cool-season grain crop. Fast-growing and somewhat competitive with weeds.',
 baseYieldValue: 320,
 vulnerableTo: ['Dicot'],
 commonWeeds: ['wild-mustard', 'common-lambsquarters', 'redroot-pigweed', 'common-ragweed'],
 season: 'spring',
 },
];

export const cropMap = Object.fromEntries(crops.map(c => [c.id, c]));
