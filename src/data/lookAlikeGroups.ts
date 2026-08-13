// Curated 3-species look-alike groups used by the 6-8 / 9-12 Learning Module
// and the 6-8 Look-Alike practice game.
// Each entry: weed IDs (must exist in weeds.ts) + a short "how to tell them apart" note.
export interface LookAlikeTriple {
  ids: [string, string, string];
  difference: string;
}

export const LOOKALIKE_TRIPLES: LookAlikeTriple[] = [
  {
    ids: ["palmer-amaranth", "waterhemp", "Redroot_pigweed"],
    difference: "Palmer: petiole ≥ leaf length, chevron midrib, glabrous, extremely rapid growth. Redroot: hairy stem, shorter petioles, stiff bracts on spikes. Waterhemp: narrow willow-like glabrous leaves, slender soft spikes, no prickly bracts.",
  },
  {
    ids: ["common-ragweed", "velvetleaf", "common_Cocklebur"],
    difference: "Common ragweed: finely divided pinnate leaves. Velvetleaf: heart-shaped velvety leaves with no lobes. Cocklebur: sandpaper leaves with hooked bur fruits.",
  },
  {
    ids: ["Shepherds_Purse", "Wild_Carrot", "poison-hemlock"],
    difference: "Shepherd's purse rosette: lobed but not finely divided, white 4-petaled flowers. Wild carrot rosette: finely divided, carrot smell, hairy. Poison hemlock rosette: finely divided, smooth purple-spotted stem, musty odor — TOXIC.",
  },
  {
    ids: ["Wild_mustard", "yellow_Rocket", "Pinnate_tansymustard"],
    difference: "Wild mustard: clasping leaves, long beaked siliques. Yellow rocket: glossy basal leaves with large round terminal lobe. Tansymustard: finely divided pinnate leaves, grayish-green, no unpleasant odor.",
  },
  {
    ids: ["Common_Mallow", "Prickly_sida", "Venice_mallow"],
    difference: "Common mallow: kidney-shaped lobed leaves, cheese-wheel fruit, no spines. Prickly sida: smaller toothed leaves, small spines at petiole base. Venice mallow: cream flower with purple center, inflated striped calyx, 3-lobed leaves.",
  },
  {
    ids: ["giant-ragweed", "Buffalobur", "Common_Burdock"],
    difference: "Giant ragweed: 3–5 lobed coarse leaves, very large plant, no bur. Buffalobur: thorny throughout, spiny bur calyx, yellow flowers. Burdock: large dock-like basal leaves, non-hooked burs.",
  },
  {
    ids: ["pennsylvania-smartweed", "Ladysthumb", "Curly_dock"],
    difference: "Pennsylvania smartweed: terrestrial dry-to-moist sites, pink spike, no leaf blotch. Ladysthumb: dark V-shaped leaf blotch, ochrea fringed with bristles. Curly dock: wavy-margined large basal leaves, no ochrea fringe.",
  },
  {
    ids: ["common_Cocklebur", "wild-parsnip", "Common_teasel"],
    difference: "Cocklebur: rough sandpaper leaves, spiny (not hooked) burs. Wild parsnip rosette: pinnate coarsely toothed leaflets, phototoxic sap. Teasel: fused leaf-base cup, spine-tipped bracts, spiny egg-shaped head.",
  },
  {
    ids: ["Horsenettle", "Buffalobur", "Smooth_Groundcherry"],
    difference: "Horsenettle: thorny stems, orange round berries, perennial. Buffalobur: spiny annual, yellow flowers, bur-like fruiting calyx. Groundcherry: papery inflated husk/lantern around fruit, no spines.",
  },
  {
    ids: ["Eastern_black_nightshade", "Buffalobur", "Smooth_Groundcherry"],
    difference: "Black nightshade: no spines, clustered black berries at maturity. Buffalobur: spiny throughout, yellow flowers, bur calyx. Groundcherry: papery lantern husk around fruit.",
  },
  {
    ids: ["Horsenettle", "Eastern_black_nightshade", "Jimsonweed"],
    difference: "Horsenettle: spiny stems and leaves, white-purple flowers, orange berries, perennial. Black nightshade: no spines, small black clustered berries. Jimsonweed: large trumpet flowers, spiny seed pods, foul odor.",
  },
  {
    ids: ["Eastern_black_nightshade", "Horsenettle", "Smooth_Groundcherry"],
    difference: "Black nightshade: clustered berries, no husk, no spines. Horsenettle: spiny, orange berries, no husk. Groundcherry: papery inflated husk around each berry.",
  },
  {
    ids: ["Hedge_bindweed", "Wild_buckwheat", "Honey-vine_climbing_milkweed"],
    difference: "Hedge bindweed: large white trumpet flowers, square leaf base, large bracts clasping calyx. Wild buckwheat: tiny flowers, ochrea at nodes, 3-angled achene, not a trumpet. Honey-vine: milky sap, opposite heart leaves, pods with silky seeds.",
  },
  {
    ids: ["Tall_morningglory", "Hedge_bindweed", "Wild_buckwheat"],
    difference: "Tall morningglory: heart-shaped unlobed leaves, colorful trumpet. Hedge bindweed: square-based leaves, large white trumpet, large bracts. Wild buckwheat: tiny green flowers, ochrea at nodes, not a trumpet.",
  },
  {
    ids: ["Field_bindweed", "Hedge_bindweed", "Tall_morningglory"],
    difference: "Field bindweed: small flowers, small distant bracts, pointed arrowhead leaf lobes. Hedge bindweed: larger flowers, large bracts enclosing calyx, square leaf base. Morningglory: heart-shaped unlobed leaves, larger colorful trumpets.",
  },
  {
    ids: ["velvetleaf", "Common_Mallow", "Prickly_sida"],
    difference: "Velvetleaf: very large velvety entire leaves, yellow flower, ring capsule. Common mallow: round kidney-shaped lobed leaves, cheese-wheel fruit. Prickly sida: narrow toothed leaves, small spines at petiole base.",
  },
  {
    ids: ["velvetleaf", "Common_Mallow", "Venice_mallow"],
    difference: "Velvetleaf: huge velvety leaves, yellow flower. Common mallow: round lobed leaves, white-pink flower. Venice mallow: cream flower with dark purple center, inflated striped calyx, 3-lobed leaves.",
  },
  {
    ids: ["Russian_thistle", "lambsquarters", "Horseweed"],
    difference: "Russian thistle: spine-tipped narrow leaves, bushy mound, tumbleweed. Lambsquarters: diamond-shaped leaves with mealy white coating, striped stems. Horseweed: very narrow bristly leaves, tall single stalk with panicle of tiny heads.",
  },
  {
    ids: ["Spotted_spurge", "volunteer-sunflower", "Horseweed"],
    difference: "Spotted spurge: prostrate mat, milky sap, small leaves often with dark spot. Volunteer sunflower: large rough leaves, no milky sap, yellow ray heads. Horseweed: tall single stalk, narrow bristly leaves, no milky sap.",
  },
  {
    ids: ["poison-hemlock", "wild-parsnip", "golden-alexanders"],
    difference: "Poison hemlock: smooth purple-spotted stems, white flowers, musty odor — TOXIC. Wild parsnip: yellow flowers, pinnate toothed leaflets, phototoxic sap. Golden Alexanders: native, yellow umbels with central sessile flower per umbelet, safe sap.",
  },
  {
    ids: ["Wild_Carrot", "wild-parsnip", "golden-alexanders"],
    difference: "Wild carrot: hairy stem, carrot odor, white flat-topped umbel with single dark center flower, 3-forked bracts. Wild parsnip: smooth, yellow flowers, no bracts — phototoxic sap. Golden Alexanders: native, yellow umbel, sessile central flower per umbelet, earlier bloom.",
  },
  {
    ids: ["golden-alexanders", "Wild_Carrot", "poison-hemlock"],
    difference: "Golden Alexanders: yellow umbels, native, safe sap. Wild carrot: white umbel with dark center flower, hairy, carrot smell. Poison hemlock: white umbel, smooth purple-spotted hollow stem, musty odor — TOXIC.",
  },
  {
    ids: ["wild-parsnip", "golden-alexanders", "poison-hemlock"],
    difference: "Wild parsnip: introduced, yellow flowers, TOXIC sap causes burns. Golden Alexanders: native yellow umbel, sessile central flower, safe. Poison hemlock: white flowers, purple-spotted stem, musty odor, deadly TOXIC.",
  },
  {
    ids: ["Common_Burdock", "Musk_thistle", "canada-thistle"],
    difference: "Burdock: large dock-like basal leaves, round hooked burs. Musk thistle: deeply lobed leaves, single large nodding heads with cottony pappus, biennial. Canada thistle: small clustered heads, creeping roots, perennial, dioecious.",
  },
  {
    ids: ["Field_bindweed", "Hedge_bindweed", "common_Milkweed"],
    difference: "Field bindweed: vine, no milky sap, trumpet flowers, arrowhead leaves. Hedge bindweed: larger vine and trumpet, square leaf base. Common milkweed: erect, milky sap, broad opposite leaves, globe flower cluster, broad pods.",
  },
  {
    ids: ["Henbit_deadnettle", "Common_Mallow", "Ground_ivy"],
    difference: "Henbit: erect annual, upper leaves clasp the stem, purple flowers. Common mallow: round lobed leaves, no square stem, no mint odor. Ground ivy (Creeping Charlie): creeping stolons, square stem, minty odor, round scalloped leaves.",
  },
  {
    ids: ["Scouringrush", "annual-ryegrass", "barnyardgrass"],
    difference: "Scouringrush: unbranched evergreen jointed hollow stem, no true leaves. Annual ryegrass: flat glossy leaf blades, auricles present, no jointed stem. Barnyardgrass: flat leaf blades, NO ligule (most diagnostic), compressed sheath.",
  },
  {
    ids: ["Field_Horsetail", "annual-ryegrass", "barnyardgrass"],
    difference: "Field horsetail: jointed stems with whorled green branches, dies back. Annual ryegrass: flat glossy leaves, auricles. Barnyardgrass: flat leaves, no ligule, compressed sheath.",
  },
  {
    ids: ["Wild_Four-o'clock", "Field_bindweed", "Common_Mallow"],
    difference: "Wild Four-o'clock: opposite heart-shaped leaves, 5-lobed green involucre around cluster, evening-opening flowers. Field bindweed: vine, trumpet flowers, arrowhead leaves. Common mallow: round lobed leaves, cheese-wheel fruit.",
  },
  {
    ids: ["annual-ryegrass", "barnyardgrass", "Downy_brome"],
    difference: "Annual ryegrass: glossy leaves, auricles, spikelets edgewise to rachis. Barnyardgrass: NO ligule (most diagnostic), compressed sheath. Downy brome: hairy throughout, no auricles, drooping spike.",
  },
  {
    ids: ["yellow-foxtail", "green-foxtail", "large-crabgrass"],
    difference: "Yellow foxtail: yellow-gold bristles, erect spike, long hairs near leaf base only. Green foxtail: green bristles, short hairs, narrower erect spike. Large crabgrass: finger-like branches at the top, very hairy leaves and sheaths.",
  },
  {
    ids: ["green-foxtail", "giant-foxtail", "large-crabgrass"],
    difference: "Green foxtail: green bristles, short hairs, erect spike. Giant foxtail: drooping spike tip, wide hairy blade with twist. Large crabgrass: finger-like branches, no bristly spike.",
  },
  {
    ids: ["Quackgrass", "Downy_brome", "Foxtail_barley"],
    difference: "Quackgrass: clasping auricles, rhizomes, hairy upper leaf, spike. Downy brome: hairy throughout, no auricles, drooping soft spike. Foxtail barley: long delicate bristly awns, no rhizomes, tufted.",
  },
  {
    ids: ["Witchgrass", "large-crabgrass", "barnyardgrass"],
    difference: "Witchgrass: very hairy overall, tumbling open panicle. Large crabgrass: finger-like branches, hairy sheaths. Barnyardgrass: NO ligule (most diagnostic), compressed sheath.",
  },
  {
    ids: ["annual-ryegrass", "Quackgrass", "Foxtail_barley"],
    difference: "Annual ryegrass: glossy, auricles, no rhizomes, spikelets edgewise. Quackgrass: rhizomes, clasping auricles, hairy upper leaf. Foxtail barley: long bristly awns, tufted, no rhizomes.",
  },
  {
    ids: ["Quackgrass", "annual-ryegrass", "Downy_brome"],
    difference: "Quackgrass: rhizomes, clasping auricles, hairy upper leaf surface. Annual ryegrass: glossy leaves, auricles but no rhizomes. Downy brome: hairy throughout, no auricles, drooping spike.",
  },
  {
    ids: ["large-crabgrass", "yellow-foxtail", "Woolly_cupgrass"],
    difference: "Large crabgrass: finger-like branches, very hairy sheaths, no cupule. Yellow foxtail: cylindrical spike with yellow bristles. Woolly cupgrass: cupule at spikelet base, hairy, spike-like racemes.",
  },
];

/**
 * Species whose look-alike comparisons are clearest at the VEGETATIVE stage
 * (ragweeds and the climbing vines). Whenever a look-alike group contains one
 * of these, the whole group is shown at the vegetative stage so students always
 * compare the same image type.
 */
export const VEGETATIVE_LOOKALIKE_IDS = new Set<string>([
  "common-ragweed",
  "giant-ragweed",
  "Tall_morningglory",
  "Field_bindweed",
  "Hedge_bindweed",
  "Wild_buckwheat",
  "Honey-vine_climbing_milkweed",
  "Burcucumber",
]);

/** Pick one shared image stage for a look-alike group. */
export function lookAlikeStage(ids: string[]): "flower" | "vegetative" {
  return ids.some((id) => VEGETATIVE_LOOKALIKE_IDS.has(id)) ? "vegetative" : "flower";
}

/* ═══════════════════════════════════════════════════════════════════
   OFFICIAL LOOK-ALIKE LIST
   Source of truth provided by the curriculum team. Only species that
   actually exist in `weeds.ts` are kept here; outside species from the
   source list are ignored. Pairs are treated as undirected.
   ═══════════════════════════════════════════════════════════════════ */
const OFFICIAL_PAIRS: [string, string][] = [
  ["common_Milkweed", "Hemp_dogbane"],
  ["CommonChickweed", "Mouseear_chickweed"],
  ["waterhemp", "palmer-amaranth"],
  ["waterhemp", "Redroot_pigweed"],
  ["palmer-amaranth", "Redroot_pigweed"],
  ["pennsylvania-smartweed", "Ladysthumb"],
  ["Ladysthumb", "Water_smartweed"],
  ["Shattercane_Sorghums", "johnsongrass"],
  ["Woolly_cupgrass", "barnyardgrass"],
  ["Woolly_cupgrass", "yellow-foxtail"],
  ["Downy_brome", "Foxtail_barley"],
  ["Foxtail_barley", "wild-oat"],
  ["Smooth_Witchgrass", "barnyardgrass"],
  ["Smooth_Witchgrass", "Witchgrass"],
  ["Witchgrass", "large-crabgrass"],
  ["giant-foxtail", "yellow-foxtail"],
  ["giant-foxtail", "green-foxtail"],
  ["yellow-foxtail", "green-foxtail"],
  ["green-foxtail", "barnyardgrass"],
  ["Goosegrass", "large-crabgrass"],
  ["Field_Pennycress", "Shepherds_Purse"],
  ["giant-ragweed", "volunteer-sunflower"],
  ["giant-ragweed", "common_Cocklebur"],
  ["giant-ragweed", "common-ragweed"],
  ["kochia", "Redroot_pigweed"],
  ["lambsquarters", "Redroot_pigweed"],
  ["lambsquarters", "palmer-amaranth"],
  ["poison-hemlock", "Wild_Carrot"],
  ["poison-hemlock", "golden-alexanders"],
  ["wild-parsnip", "golden-alexanders"],
  ["Common_teasel", "Common_mullein"],
  ["Field_bindweed", "Hedge_bindweed"],
  ["Field_bindweed", "Tall_morningglory"],
  ["Hedge_bindweed", "Tall_morningglory"],
  ["Field_bindweed", "Wild_buckwheat"],
  ["Field_bindweed", "Honey-vine_climbing_milkweed"],
  ["Honey-vine_climbing_milkweed", "Tall_morningglory"],
  ["Ground_ivy", "Henbit_deadnettle"],
  ["Henbit_deadnettle", "Corn_speedwell"],
  ["Horsenettle", "Eastern_black_nightshade"],
  ["Field_Horsetail", "Scouringrush"],
  ["velvetleaf", "Jimsonweed"],
  ["Wild_mustard", "yellow_Rocket"],
];

/** Species the official list has no look-alike for yet (flagged for review). */
export const NO_LOOKALIKE_IDS: string[] = [
  "Pinnate_tansymustard",
  "Prickly_sida",
  "Corn_speedwell",
  "Garlic_mustard",
  "Toothed_spurge",
  "White_campion",
  "yellow-nutsedge",
];

/** Undirected adjacency built from the official pair list. */
export const OFFICIAL_LOOKALIKES: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const [a, b] of OFFICIAL_PAIRS) {
    (map[a] ||= []).push(b);
    (map[b] ||= []).push(a);
  }
  return map;
})();

/** Official look-alike partners of `id`, optionally limited to a grade pool. */
export function officialPartners(id: string, poolIds?: Set<string>): string[] {
  const partners = OFFICIAL_LOOKALIKES[id] ?? [];
  return poolIds ? partners.filter((p) => poolIds.has(p)) : partners;
}

/** True when the two species are an official look-alike pair. */
export function isOfficialLookAlike(a: string, b: string): boolean {
  return (OFFICIAL_LOOKALIKES[a] ?? []).includes(b);
}

/* Difference notes: reuse curated wording where it exists. */
const PAIR_NOTES: Record<string, string> = (() => {
  const notes: Record<string, string> = {};
  for (const t of LOOKALIKE_TRIPLES) {
    for (let i = 0; i < t.ids.length; i++) {
      for (let j = i + 1; j < t.ids.length; j++) {
        const key = [t.ids[i], t.ids[j]].sort().join("|");
        if (!notes[key]) notes[key] = t.difference;
      }
    }
  }
  return notes;
})();

interface PoolWeed {
  id: string;
  commonName: string;
  memoryHook?: string;
  lookAlike?: { id: string; difference: string };
}

function noteFor(ids: string[], pool: PoolWeed[]): string {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const n = PAIR_NOTES[[ids[i], ids[j]].sort().join("|")];
      if (n) return n;
    }
  }
  for (const id of ids) {
    const w = pool.find((x) => x.id === id);
    if (w?.lookAlike && ids.includes(w.lookAlike.id)) return w.lookAlike.difference;
  }
  return ids
    .map((id) => pool.find((x) => x.id === id))
    .filter(Boolean)
    .map((w) => `${w!.commonName}: ${w!.memoryHook ?? "compare leaf shape, stem, and flower closely."}`)
    .join(" ");
}

export interface LookAlikeGroup<T> {
  ids: string[];
  weeds: T[];
  difference: string;
  stage: "flower" | "vegetative";
}

/**
 * Build look-alike groups restricted to a grade-level weed pool. Only the
 * official look-alike relationships are used, so no species outside the
 * grade list can ever appear.
 */
export function lookAlikeGroupsForPool<T extends PoolWeed>(pool: T[], maxSize = 3): LookAlikeGroup<T>[] {
  const poolIds = new Set(pool.map((w) => w.id));
  const groups: LookAlikeGroup<T>[] = [];
  const seenKeys = new Set<string>();
  for (const w of pool) {
    const partners = officialPartners(w.id, poolIds);
    if (partners.length === 0) continue;
    const ids = [w.id, ...partners].slice(0, maxSize);
    const key = [...ids].sort().join("|");
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    const members = ids.map((id) => pool.find((x) => x.id === id)!).filter(Boolean);
    if (members.length < 2) continue;
    groups.push({ ids, weeds: members, difference: noteFor(ids, pool), stage: lookAlikeStage(ids) });
  }
  return groups;
}

/** Official look-alike pairs available inside a grade pool. */
export function lookAlikePairsForPool<T extends PoolWeed>(pool: T[]): [T, T][] {
  const poolIds = new Set(pool.map((w) => w.id));
  const pairs: [T, T][] = [];
  const seen = new Set<string>();
  for (const w of pool) {
    for (const p of officialPartners(w.id, poolIds)) {
      const key = [w.id, p].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const other = pool.find((x) => x.id === p);
      if (other) pairs.push([w, other]);
    }
  }
  return pairs;
}

/**
 * Extra species approved for the K-5 "look-alike" content (they appear in the
 * K-5 learning-module look-alike groups even though they are not part of the
 * 15-species K-5 spotting list).
 */
export const K5_LOOKALIKE_EXTRA_IDS: string[] = [
  "waterhemp",
  "palmer-amaranth",
  "Redroot_pigweed",
  "green-foxtail",
  "yellow-foxtail",
  "common-ragweed",
  "Musk_thistle",
  "Common_Burdock",
  "Water_smartweed",
  "Ladysthumb",
  "Wild_mustard",
  "yellow_Rocket",
  "CommonChickweed",
  "Mouseear_chickweed",
  "Eastern_black_nightshade",
  "Horsenettle",
  "Buffalobur",
  "poison-hemlock",
  "large-crabgrass",
  "Witchgrass",
  "barnyardgrass",
  "Russian_thistle",
  "golden-alexanders",
];
