/**
 * Authoritative herbicide Mode of Action (MOA) reference data.
 * Source: HRAC, WSSA, International Survey of Herbicide Resistant Weeds.
 *
 * Every game, learning module, and quiz should import from here
 * rather than defining its own herbicide constants.
 */

export interface HerbicideMOA {
  /** Internal stable key */
  id: string;
  /** HRAC/WSSA group number */
  group: number;
  /** Primary MOA name */
  moa: string;
  /** Short label for UI: "MOA (Group #)" */
  label: string;
  /** Application timing */
  timing: 'PRE' | 'POST' | 'BOTH';
  /** Weed spectrum the group targets */
  spectrum: 'Grass' | 'Broadleaf' | 'Both';
  /** Key chemistry families */
  chemistry: string;
  /** Well-known brand / active-ingredient examples */
  brands: string[];
  /** Resistance risk level */
  resistanceLevel: 'None reported' | 'Low' | 'Low-moderate' | 'Moderate' | 'High' | 'Very high';
  /** Resistance notes */
  resistanceNotes: string;
  /** Symptomology type – used for visual-symptom grouping in games */
  symptomType: string;
}

/**
 * Full MOA table from the uploaded spreadsheet.
 * POST entries first, then PRE, matching the original ordering.
 */
export const HERBICIDE_MOA: HerbicideMOA[] = [
  // ── POST ──
  {
    id: 'accase',
    group: 1,
    moa: 'ACCase inhibitors',
    label: 'ACCase Inhibitors (Group 1)',
    timing: 'POST',
    spectrum: 'Grass',
    chemistry: 'FOPs, DIMs, DENs',
    brands: ['Assure II (quizalofop)', 'Poast (sethoxydim)', 'Select/Arrow (clethodim)'],
    resistanceLevel: 'Very high',
    resistanceNotes: 'Widespread grass resistance globally; target-site & metabolic mechanisms',
    symptomType: 'growth-inhibition',
  },
  {
    id: 'als-post',
    group: 2,
    moa: 'ALS inhibitors',
    label: 'ALS Inhibitors (Group 2)',
    timing: 'POST',
    spectrum: 'Both',
    chemistry: 'Sulfonylureas, imidazolinones, triazolopyrimidines',
    brands: ['Pursuit (imazethapyr)', 'Raptor (imazamox)', 'Ally (metsulfuron)'],
    resistanceLevel: 'Very high',
    resistanceNotes: 'Most widespread resistance globally; grasses & broadleaves; many target-site mutations',
    symptomType: 'growth-inhibition',
  },
  {
    id: 'hppd',
    group: 25,
    moa: 'HPPD inhibitors',
    label: 'HPPD Inhibitors (Group 25)',
    timing: 'POST',
    spectrum: 'Grass',
    chemistry: 'Topramezone, tembotrione, mesotrione (POST)',
    brands: ['Callisto (mesotrione)', 'Impact/Armezon (topramezone)', 'Laudis (tembotrione)'],
    resistanceLevel: 'Moderate',
    resistanceNotes: 'Resistance in waterhemp, Palmer amaranth & some grasses; growing concern',
    symptomType: 'bleaching',
  },
  {
    id: 'microtubule-26',
    group: 26,
    moa: 'Microtubule inhibitors (VLCFA-independent)',
    label: 'Microtubule Inhibitors (Group 26)',
    timing: 'POST',
    spectrum: 'Grass',
    chemistry: 'Dithiopyr (POST early)',
    brands: ['Dimension (dithiopyr)'],
    resistanceLevel: 'Low',
    resistanceNotes: 'Limited resistance reports; minor use POST',
    symptomType: 'growth-inhibition',
  },
  {
    id: 'auxin',
    group: 4,
    moa: 'Synthetic auxins',
    label: 'Synthetic Auxins (Group 4)',
    timing: 'POST',
    spectrum: 'Broadleaf',
    chemistry: '2,4-D, dicamba, MCPA, clopyralid, picloram',
    brands: ['Enlist One (2,4-D choline)', 'XtendiMax (dicamba)', 'Tordon (picloram)'],
    resistanceLevel: 'Moderate',
    resistanceNotes: 'Resistance mainly in broadleaves (kochia, waterhemp, wild radish); dicamba resistance emerging rapidly',
    symptomType: 'epinasty-twisting',
  },
  {
    id: 'psii-6',
    group: 6,
    moa: 'PSII inhibitors (serine binding)',
    label: 'PSII Inhibitors (Group 6)',
    timing: 'POST',
    spectrum: 'Broadleaf',
    chemistry: 'Atrazine, simazine, metribuzin (POST)',
    brands: ['AAtrex (atrazine)', 'Bicep II Magnum (atrazine+metolachlor)'],
    resistanceLevel: 'High',
    resistanceNotes: 'Triazine resistance in broadleaves widespread since 1970s; psbA target-site mutation common',
    symptomType: 'chlorosis-necrosis',
  },
  {
    id: 'epsps',
    group: 9,
    moa: 'EPSPS inhibitors',
    label: 'EPSPS Inhibitors (Group 9)',
    timing: 'POST',
    spectrum: 'Both',
    chemistry: 'Glyphosate',
    brands: ['Roundup (glyphosate)', 'Enlist Duo (glyphosate+2,4-D)'],
    resistanceLevel: 'Very high',
    resistanceNotes: 'Resistance in 50+ species globally; grasses (ryegrass, junglerice) and broadleaves (Palmer amaranth, kochia)',
    symptomType: 'chlorosis-necrosis',
  },
  {
    id: 'gs',
    group: 10,
    moa: 'Glutamine synthetase inhibitors',
    label: 'Glutamine Synthetase Inhibitors (Group 10)',
    timing: 'POST',
    spectrum: 'Both',
    chemistry: 'Glufosinate',
    brands: ['Liberty/Ignite (glufosinate-ammonium)', 'Interline (glufosinate-P)'],
    resistanceLevel: 'Low',
    resistanceNotes: 'Few confirmed resistance cases; some Italian ryegrass populations',
    symptomType: 'rapid-burndown',
  },
  {
    id: 'ppo-post',
    group: 14,
    moa: 'PPO inhibitors (POST)',
    label: 'PPO Inhibitors (Group 14)',
    timing: 'POST',
    spectrum: 'Broadleaf',
    chemistry: 'Lactofen, fomesafen, acifluorfen',
    brands: ['Cobra (lactofen)', 'Flexstar/Reflex (fomesafen)'],
    resistanceLevel: 'High',
    resistanceNotes: 'Resistance mainly broadleaves (waterhemp, Palmer amaranth, common ragweed); target-site mutations',
    symptomType: 'rapid-burndown',
  },
  {
    id: 'auxin-transport',
    group: 19,
    moa: 'Auxin transport inhibitors',
    label: 'Auxin Transport Inhibitors (Group 19)',
    timing: 'POST',
    spectrum: 'Broadleaf',
    chemistry: 'Diflufenzopyr',
    brands: ['Overdrive (diflufenzopyr)'],
    resistanceLevel: 'None reported',
    resistanceNotes: 'No confirmed resistance; limited standalone use',
    symptomType: 'epinasty-twisting',
  },
  {
    id: 'psi',
    group: 22,
    moa: 'PSI electron diverters',
    label: 'PSI Electron Diverters (Group 22)',
    timing: 'POST',
    spectrum: 'Both',
    chemistry: 'Paraquat, diquat',
    brands: ['Gramoxone (paraquat)', 'Cyclone (paraquat)', 'Reglone (diquat)'],
    resistanceLevel: 'Moderate',
    resistanceNotes: 'Resistance in ryegrass, hairy fleabane, horseweed; sequestration mechanism',
    symptomType: 'rapid-burndown',
  },
  // ── PRE ──
  {
    id: 'microtubule-3',
    group: 3,
    moa: 'Microtubule assembly inhibitors',
    label: 'Microtubule Assembly Inhibitors (Group 3)',
    timing: 'PRE',
    spectrum: 'Grass',
    chemistry: 'Pendimethalin, trifluralin, oryzalin',
    brands: ['Prowl (pendimethalin)', 'Treflan/Triflurex (trifluralin)', 'Surflan (oryzalin)'],
    resistanceLevel: 'Low',
    resistanceNotes: 'Resistance rare; some dinitroaniline resistance in goosegrass and rigid ryegrass',
    symptomType: 'seedling-inhibition',
  },
  {
    id: 'lipid-8',
    group: 8,
    moa: 'Lipid synthesis inhibitors (not ACCase)',
    label: 'Lipid Synthesis Inhibitors (Group 8)',
    timing: 'PRE',
    spectrum: 'Grass',
    chemistry: 'EPTC, triallate, butylate (thiocarbamates)',
    brands: ['Eptam (EPTC)', 'Far-Go (triallate)', 'Sutan+ (butylate)'],
    resistanceLevel: 'Low',
    resistanceNotes: 'Limited resistance; some wild oat populations with enhanced metabolism',
    symptomType: 'seedling-inhibition',
  },
  {
    id: 'vlcfa-15',
    group: 15,
    moa: 'VLCFA inhibitors (chloroacetamides)',
    label: 'VLCFA Inhibitors (Group 15)',
    timing: 'PRE',
    spectrum: 'Grass',
    chemistry: 'Metolachlor, acetochlor, dimethenamid',
    brands: ['Dual Magnum (S-metolachlor)', 'Harness/Surpass (acetochlor)', 'Cinch (metolachlor)'],
    resistanceLevel: 'Low',
    resistanceNotes: 'Minimal resistance; some metabolism-based tolerance in corn; limited weed resistance documented',
    symptomType: 'seedling-inhibition',
  },
  {
    id: 'vlcfa-23',
    group: 23,
    moa: 'VLCFA inhibitors (oxyacetamides/isoxazolines)',
    label: 'VLCFA Inhibitors (Group 23)',
    timing: 'PRE',
    spectrum: 'Grass',
    chemistry: 'Flufenacet, pyroxasulfone',
    brands: ['Axiom (flufenacet+metribuzin)', 'Zidua (pyroxasulfone)', 'Fierce (pyroxasulfone+flumioxazin)'],
    resistanceLevel: 'Low-moderate',
    resistanceNotes: 'Metabolic resistance emerging in blackgrass (Alopecurus) in Europe; growing concern',
    symptomType: 'seedling-inhibition',
  },
  {
    id: 'psii-5',
    group: 5,
    moa: 'PSII inhibitors (urea/amide binding)',
    label: 'PSII Inhibitors (Group 5)',
    timing: 'PRE',
    spectrum: 'Broadleaf',
    chemistry: 'Linuron, diuron, metoxuron (phenylureas)',
    brands: ['Lorox (linuron)', 'Karmex (diuron)', 'Sinbar (terbacil)'],
    resistanceLevel: 'Moderate',
    resistanceNotes: 'Resistance in broadleaves & some grasses; distinct binding site from Group 6',
    symptomType: 'chlorosis-necrosis',
  },
  {
    id: 'dxp',
    group: 13,
    moa: 'DXP synthase inhibitors (carotenoid — MEP pathway)',
    label: 'DXP Synthase Inhibitors (Group 13)',
    timing: 'PRE',
    spectrum: 'Both',
    chemistry: 'Clomazone',
    brands: ['Command (clomazone)', 'Commence (clomazone+trifluralin)'],
    resistanceLevel: 'None reported',
    resistanceNotes: 'No confirmed resistance; unique target site',
    symptomType: 'bleaching',
  },
  {
    id: 'als-pre',
    group: 2,
    moa: 'ALS inhibitors (PRE-applied)',
    label: 'ALS Inhibitors — PRE (Group 2)',
    timing: 'PRE',
    spectrum: 'Both',
    chemistry: 'Chlorsulfuron, metsulfuron, cloransulam (some PRE)',
    brands: ['Glean (chlorsulfuron)', 'Escort/Ally (metsulfuron)', 'Canopy (chlorimuron+metribuzin)'],
    resistanceLevel: 'Very high',
    resistanceNotes: 'Same resistance pool as POST Group 2; dozens of species confirmed globally',
    symptomType: 'growth-inhibition',
  },
];

/* ─── Symptom-type descriptors for learning & quizzes ─── */
export const SYMPTOM_TYPES: Record<string, { label: string; description: string }> = {
  'growth-inhibition': {
    label: 'Growth Inhibition / Stunting',
    description: 'New growth slows or stops; plants appear stunted, with shortened internodes and reduced leaf expansion.',
  },
  'bleaching': {
    label: 'Bleaching / White Tissue',
    description: 'New leaves emerge white or pale yellow because pigment production is blocked. Older leaves stay green.',
  },
  'chlorosis-necrosis': {
    label: 'Yellowing (Chlorosis) then Browning (Necrosis)',
    description: 'Leaves gradually turn yellow then brown and die. Photosynthesis or amino acid pathways are disrupted.',
  },
  'epinasty-twisting': {
    label: 'Epinasty / Twisting & Curling',
    description: 'Stems twist, leaves curl and cup. Uncontrolled cell elongation caused by synthetic hormones.',
  },
  'rapid-burndown': {
    label: 'Rapid Burndown / Tissue Destruction',
    description: 'Leaves develop water-soaked spots within hours, then rapidly dry out and turn brown. Cell membranes are destroyed.',
  },
  'seedling-inhibition': {
    label: 'Seedling Emergence Failure',
    description: 'Seeds germinate but fail to emerge or die shortly after. Roots and shoots are stunted, swollen, or malformed.',
  },
};

/* ─── Helpers ─── */

/** Get all unique POST-timing MOA entries (deduplicated by symptomType for middle school) */
export function getPostMOAs(): HerbicideMOA[] {
  return HERBICIDE_MOA.filter(h => h.timing === 'POST');
}

/** Get all unique PRE-timing MOA entries */
export function getPreMOAs(): HerbicideMOA[] {
  return HERBICIDE_MOA.filter(h => h.timing === 'PRE');
}

/**
 * For middle school games: simplified subset focused on application timing,
 * symptom type correlation, and avoiding visually similar options.
 * Returns 6 distinct symptom-type groups each represented by one MOA.
 */
export function getMiddleSchoolMOAs(): HerbicideMOA[] {
  const seen = new Set<string>();
  const result: HerbicideMOA[] = [];
  // Pick one representative per symptom type, preferring the most common groups
  const preferred = ['epsps', 'auxin', 'accase', 'hppd', 'ppo-post', 'vlcfa-15', 'psii-6', 'gs'];
  for (const id of preferred) {
    const h = HERBICIDE_MOA.find(m => m.id === id);
    if (h && !seen.has(h.symptomType)) {
      seen.add(h.symptomType);
      result.push(h);
    }
  }
  return result;
}

/**
 * Pick N distractor MOAs that do NOT share the same symptomType as the correct answer.
 * This prevents middle-school quizzes from showing two similar-looking options.
 */
export function pickDistinctDistractors(
  correct: HerbicideMOA,
  pool: HerbicideMOA[],
  count: number,
): HerbicideMOA[] {
  const candidates = pool.filter(
    h => h.id !== correct.id && h.symptomType !== correct.symptomType,
  );
  // shuffle
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  // deduplicate by symptomType so no two distractors look alike either
  const result: HerbicideMOA[] = [];
  const usedTypes = new Set<string>();
  for (const h of shuffled) {
    if (!usedTypes.has(h.symptomType)) {
      usedTypes.add(h.symptomType);
      result.push(h);
    }
    if (result.length >= count) break;
  }
  return result;
}

/**
 * Determine the best MOA for a weed based on its management text and plant type.
 * Returns a MOA id from HERBICIDE_MOA.
 */
export function getBestMOAForWeed(w: { management: string; plantType: string }): string {
  const m = w.management.toLowerCase();
  if (m.includes('group 2') || m.includes('als')) return 'als-post';
  if (m.includes('group 4') || m.includes('auxin') || m.includes('2,4-d') || m.includes('dicamba')) return 'auxin';
  if (m.includes('group 9') || m.includes('glyphosate')) return 'epsps';
  if (m.includes('group 15') || m.includes('metolachlor') || m.includes('acetochlor')) return 'vlcfa-15';
  if (m.includes('group 1') || m.includes('accase')) return 'accase';
  if (m.includes('ppo') || m.includes('group 14')) return 'ppo-post';
  if (m.includes('group 10') || m.includes('glufosinate') || m.includes('liberty')) return 'gs';
  if (m.includes('group 25') || m.includes('hppd') || m.includes('callisto') || m.includes('mesotrione')) return 'hppd';
  if (m.includes('atrazine') || m.includes('group 6')) return 'psii-6';
  if (m.includes('group 5') || m.includes('linuron')) return 'psii-5';
  if (m.includes('paraquat') || m.includes('group 22')) return 'psi';
  if (m.includes('group 3') || m.includes('pendimethalin') || m.includes('trifluralin')) return 'microtubule-3';
  // Fallback by plant type
  if (w.plantType === 'Monocot') return 'accase';
  return 'auxin';
}

/**
 * Determine application timing for a weed from its management text.
 */
export function getBestTimingForWeed(w: { management: string; controlTiming: string }): 'PRE' | 'POST' {
  const m = (w.management + ' ' + w.controlTiming).toLowerCase();
  if (m.includes('pre-emerge') || m.includes('pre-emergent') || m.includes('preemerg')) return 'PRE';
  return 'POST';
}
