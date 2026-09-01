/**
 * Grass (Poaceae) identification features used by the Collegiate
 * "Grass Identification" learning module and the "Grass ID Lab" practice game.
 *
 * Every entry describes the vegetative characters agronomists use in the field
 * (ligule, auricles, collar/sheath, blade and vernation) plus the reproductive
 * seed head, so students can identify a grass before and after heading.
 */

export type LiguleType = "Membranous" | "Hairy fringe" | "Membrane + hairs" | "Absent";

export interface GrassFeature {
  /** weed id in src/data/weeds.ts */
  id: string;
  commonName: string;
  scientificName: string;
  liguleType: LiguleType;
  /** Detailed ligule description — the primary diagnostic character. */
  ligule: string;
  auricles: string;
  sheath: string;
  blade: string;
  /** Rolled or folded in the bud (vernation). */
  vernation: "Rolled" | "Folded";
  /** Inflorescence / seed head — the reproductive character. */
  seedHead: string;
  seed: string;
  lifeCycle: string;
  /** One-line memory hook for the field. */
  quickTip: string;
}

export const GRASS_FEATURES: GrassFeature[] = [
  {
    "id": "Annual_Ryegrass",
    "commonName": "Annual Ryegrass",
    "scientificName": "Lolium multiflorum",
    "liguleType": "Membranous",
    "ligule": "Short membrane with narrow clasping auricles at each side.",
    "auricles": "Small pointed claw-like auricles clasping the stem.",
    "sheath": "Smooth reddish at the base; collar broad and pale.",
    "blade": "Glossy dark green underside, ridged above, tapering to a point.",
    "vernation": "Folded",
    "seedHead": "Flat spike with spikelets alternating edgewise along the stem; awned.",
    "seed": "Slim awned grain.",
    "lifeCycle": "Winter annual",
    "quickTip": "Shiny leaf undersides and an edgewise flat spike."
  },
  {
    "id": "Barnyardgrass",
    "commonName": "Barnyardgrass",
    "scientificName": "Echinochloa crus-galli",
    "liguleType": "Absent",
    "ligule": "No ligule at all — the collar region is completely bare. Diagnostic.",
    "auricles": "None.",
    "sheath": "Smooth flattened sheath, often purple at the base; collar bare.",
    "blade": "Wide flat blade with a thick white midrib and no hairs.",
    "vernation": "Rolled",
    "seedHead": "Coarse branched purple_tinged panicle with crowded spikelets often awned.",
    "seed": "Shiny pale plump grain with one flat and one rounded face.",
    "lifeCycle": "Summer annual",
    "quickTip": "No ligule = barnyardgrass. Run a fingernail down the collar to check."
  },
  {
    "id": "Downy_Brome",
    "commonName": "Downy Brome",
    "scientificName": "Bromus tectorum",
    "liguleType": "Membranous",
    "ligule": "Short jagged_toothed membrane.",
    "auricles": "Absent.",
    "sheath": "Densely soft-hairy sheath.",
    "blade": "Light green blade covered with fine soft hairs.",
    "vernation": "Rolled",
    "seedHead": "Soft drooping one_sided nodding panicle with long awns.",
    "seed": "Slender awned grain.",
    "lifeCycle": "Winter annual",
    "quickTip": "Everything is fuzzy and the whole head droops to one side."
  },
  {
    "id": "Fall_Panicum",
    "commonName": "Fall Panicum",
    "scientificName": "Panicum dichotomiflorum",
    "liguleType": "Hairy fringe",
    "ligule": "Fringe of hairs on an otherwise hairless smooth sheath.",
    "auricles": "Absent.",
    "sheath": "Smooth hairless sheath; stems bend at the nodes.",
    "blade": "Wide smooth blade with a prominent white midrib.",
    "vernation": "Rolled",
    "seedHead": "Large open finely branched diffuse panicle.",
    "seed": "Tiny shiny oval grain.",
    "lifeCycle": "Summer annual",
    "quickTip": "Hairy ligule but a naked sheath with zigzag knee_bent stems."
  },
  {
    "id": "Foxtail_Barley",
    "commonName": "Foxtail Barley",
    "scientificName": "Hordeum jubatum",
    "liguleType": "Membranous",
    "ligule": "Very short membrane with small clasping auricles.",
    "auricles": "Small clasping auricles.",
    "sheath": "Smooth to slightly rough sheath.",
    "blade": "Short, flat, rough grey-green blade.",
    "vernation": "Rolled",
    "seedHead": "Bushy nodding spike with very long spreading awns that break apart at maturity.",
    "seed": "Small grain with a barbed awn that lodges in animal tissue.",
    "lifeCycle": "Perennial (short_lived bunch)",
    "quickTip": "Squirrel_tail head with long barbed awns."
  },
  {
    "id": "Giant_Foxtail",
    "commonName": "Giant Foxtail",
    "scientificName": "Setaria faberi",
    "liguleType": "Hairy fringe",
    "ligule": "Fringe of hairs about 1–2 mm tall; no membrane at all.",
    "auricles": "Absent.",
    "sheath": "Smooth sheath with hairy margins.",
    "blade": "Broad blade with short stiff hairs on the upper surface.",
    "vernation": "Rolled",
    "seedHead": "Long (7–15 cm) bristly cylindrical panicle that nods or droops at the tip.",
    "seed": "Small oval grain greenish_yellow tightly enclosed by bristly glumes.",
    "lifeCycle": "Summer annual",
    "quickTip": "Hairy blade tops + a drooping bristly head = giant foxtail."
  },
  {
    "id": "Goosegrass",
    "commonName": "Goosegrass",
    "scientificName": "Eleusine indica",
    "liguleType": "Membranous",
    "ligule": "Short toothed membrane often split down the middle.",
    "auricles": "Absent.",
    "sheath": "Strongly flattened silvery-white sheath.",
    "blade": "Folded blade, smooth with a few hairs near the base.",
    "vernation": "Folded",
    "seedHead": "2–7 thick zipper_like spikes at the stem tip often with one spike below.",
    "seed": "Dark reddish_brown seed with a wrinkled surface.",
    "lifeCycle": "Summer annual",
    "quickTip": "Silvery flattened base and 'zipper' spikes."
  },
  {
    "id": "Green_Foxtail",
    "commonName": "Green Foxtail",
    "scientificName": "Setaria viridis",
    "liguleType": "Hairy fringe",
    "ligule": "Short fringe of fine hairs finer and shorter than yellow foxtail.",
    "auricles": "Absent.",
    "sheath": "Smooth sheath with hairy margins.",
    "blade": "Flat hairless blade, slightly rough to the touch.",
    "vernation": "Rolled",
    "seedHead": "Slender green bristly panicle usually upright but sometimes slightly curved.",
    "seed": "Very small finely ridged grain.",
    "lifeCycle": "Summer annual",
    "quickTip": "Hairless blades — the 'clean' foxtail."
  },
  {
    "id": "Johnsongrass",
    "commonName": "Johnsongrass",
    "scientificName": "Sorghum halepense",
    "liguleType": "Membranous",
    "ligule": "Tall membranous ligule (2–5 mm) with a finely toothed often hairy margin.",
    "auricles": "Absent.",
    "sheath": "Smooth open sheath; collar broad.",
    "blade": "Wide blade with a conspicuous white midrib.",
    "vernation": "Rolled",
    "seedHead": "Large open purplish panicle loosely branched.",
    "seed": "Reddish_brown oval shiny grain often still bearing a bent awn.",
    "lifeCycle": "Perennial (rhizomatous)",
    "quickTip": "White midrib + thick rhizomes = Johnsongrass not shattercane."
  },
  {
    "id": "Large_Crabgrass",
    "commonName": "Large Crabgrass",
    "scientificName": "Digitaria sanguinalis",
    "liguleType": "Membranous",
    "ligule": "Tall membranous ligule (1–3 mm) jagged or toothed across the top.",
    "auricles": "Absent.",
    "sheath": "Densely hairy sheath, especially near the base.",
    "blade": "Wide blade hairy on both surfaces, spreading flat.",
    "vernation": "Rolled",
    "seedHead": "2–9 finger_like spikes radiating from the top of the stem.",
    "seed": "Narrow elliptical grain straw_colored.",
    "lifeCycle": "Summer annual",
    "quickTip": "Hairy sheath + finger_like seed head that spreads like a hand."
  },
  {
    "id": "Longspine_Sandbur",
    "commonName": "Longspine Sandbur",
    "scientificName": "Cenchrus longispinus",
    "liguleType": "Hairy fringe",
    "ligule": "Dense fringe of short hairs at the collar.",
    "auricles": "Absent.",
    "sheath": "Flattened smooth sheath with hairy margins.",
    "blade": "Folded to flat blade, rough on the upper surface.",
    "vernation": "Folded",
    "seedHead": "Short spike of spiny burs each bur armed with sharp barbed spines.",
    "seed": "Seeds enclosed inside the spiny bur.",
    "lifeCycle": "Summer annual",
    "quickTip": "If it hurts to grab it's sandbur."
  },
  {
    "id": "Nimblewill",
    "commonName": "Nimblewill",
    "scientificName": "Muhlenbergia schreberi",
    "liguleType": "Membranous",
    "ligule": "Tiny membranous ligule under 1 mm finely fringed on top.",
    "auricles": "Absent.",
    "sheath": "Smooth short sheath on wiry stems.",
    "blade": "Short narrow blue-green blade held at a wide angle.",
    "vernation": "Rolled",
    "seedHead": "Very slender spike_like grey_green panicle.",
    "seed": "Minute awned grain.",
    "lifeCycle": "Perennial (stoloniferous)",
    "quickTip": "Short blue_green blades on wiry creeping stems — patchy in turf."
  },
  {
    "id": "Quackgrass",
    "commonName": "Quackgrass",
    "scientificName": "Elytrigia repens",
    "liguleType": "Membranous",
    "ligule": "Very short membrane (under 1 mm).",
    "auricles": "Long slender claw-like auricles that clasp the stem. Diagnostic.",
    "sheath": "Sheath smooth to sparsely hairy.",
    "blade": "Flat blade, slightly rough above, dull green.",
    "vernation": "Rolled",
    "seedHead": "Slender upright two_ranked spike spikelets flat against the stem.",
    "seed": "Straw_colored elongated grain often awn_tipped.",
    "lifeCycle": "Perennial (rhizomatous)",
    "quickTip": "Clasping auricles + sharp white rhizomes."
  },
  {
    "id": "Shattercane_Sorghums",
    "commonName": "Shattercane / Sorghums",
    "scientificName": "Sorghum bicolor",
    "liguleType": "Membranous",
    "ligule": "Short rounded membrane with no hair fringe.",
    "auricles": "Absent.",
    "sheath": "Smooth sheath; stems thick and corn-like.",
    "blade": "Very wide blade with a strong white midrib.",
    "vernation": "Rolled",
    "seedHead": "Open to semi_compact panicle that shatters readily at maturity.",
    "seed": "Large round dark grain much bigger than Johnsongrass seed.",
    "lifeCycle": "Summer annual",
    "quickTip": "Looks like Johnsongrass but has no rhizomes and bigger seed."
  },
  {
    "id": "Wild_Oat",
    "commonName": "Wild Oat",
    "scientificName": "Avena fatua",
    "liguleType": "Membranous",
    "ligule": "Tall pointed membranous ligule (4–6 mm) — one of the tallest.",
    "auricles": "Absent.",
    "sheath": "Smooth sheath, sometimes hairy at the base.",
    "blade": "Wide blade that twists counter-clockwise.",
    "vernation": "Rolled",
    "seedHead": "Open drooping panicle of large nodding spikelets.",
    "seed": "Large grain with a stiff bent twisted awn and a hairy basal callus.",
    "lifeCycle": "Summer annual",
    "quickTip": "Tall pointed ligule + twisted awns on big nodding seeds."
  },
  {
    "id": "Witchgrass",
    "commonName": "Witchgrass",
    "scientificName": "Panicum capillare",
    "liguleType": "Hairy fringe",
    "ligule": "Fringe of hairs above a densely hairy leaf sheath.",
    "auricles": "Absent.",
    "sheath": "Densely hairy sheath.",
    "blade": "Blade hairy on both surfaces, wide at the base.",
    "vernation": "Rolled",
    "seedHead": "Huge airy panicle that breaks off and tumbles like a tumbleweed.",
    "seed": "Very small smooth shiny grain.",
    "lifeCycle": "Summer annual",
    "quickTip": "Hairy everywhere with a tumbleweed seed head."
  },
  {
    "id": "Woolly_Cupgrass",
    "commonName": "Woolly Cupgrass",
    "scientificName": "Eriochloa villosa",
    "liguleType": "Membrane + hairs",
    "ligule": "Short membrane topped by a fringe of hairs.",
    "auricles": "Absent.",
    "sheath": "Woolly hairy sheath; collar hairy.",
    "blade": "Wide blade with a crinkled, wavy margin.",
    "vernation": "Rolled",
    "seedHead": "Several short one_sided racemes along a central axis; spikelets sit on a cup_like base.",
    "seed": "Oval seed with a hardened cup at the base.",
    "lifeCycle": "Summer annual",
    "quickTip": "Woolly sheath and a crinkled leaf edge like a ruffled ribbon."
  },
  {
    "id": "Yellow_Foxtail",
    "commonName": "Yellow Foxtail",
    "scientificName": "Setaria pumila",
    "liguleType": "Hairy fringe",
    "ligule": "Dense ring of stiff hairs roughly 1 mm tall.",
    "auricles": "Absent.",
    "sheath": "Smooth flattened sheath, often reddish at the base.",
    "blade": "Flat blade with long silky hairs near the base on the upper surface.",
    "vernation": "Rolled",
    "seedHead": "Stiff upright compact bristly spike; bristles yellow_gold at maturity.",
    "seed": "Coarsely wrinkled grain larger than green foxtail seed.",
    "lifeCycle": "Summer annual",
    "quickTip": "Long silky hairs at the leaf base and a stiff yellow head."
  }
];

export const GRASS_FEATURE_BY_ID: Record<string, GrassFeature> = Object.fromEntries(
  GRASS_FEATURES.map((g) => [g.id, g]),
);

/** The feature fields a student is quizzed on, in the order they are revealed. */
export const GRASS_CLUE_FIELDS: { key: keyof GrassFeature; label: string }[] = [
  { key: "ligule", label: "Ligule" },
  { key: "auricles", label: "Auricles" },
  { key: "sheath", label: "Sheath & collar" },
  { key: "blade", label: "Leaf blade" },
  { key: "seedHead", label: "Seed head" },
  { key: "lifeCycle", label: "Life cycle" },
];
