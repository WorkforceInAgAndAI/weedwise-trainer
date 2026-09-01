import { weeds } from "./weeds";
import type { GradeLevel, Weed } from "@/types/game";
import { getRegion } from "./regions";

/**
 * Region-aware weed pool.
 *
 * When a user has picked a geographic region on the home page, the species
 * that are most prevalent in that region are pushed to the front of the pool
 * and the remaining species are thinned (every other one) so regional weeds
 * come up noticeably more often. Non-regional weeds are still present.
 */
function storedRegionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("weednet-region");
  } catch {
    return null;
  }
}

export function applyRegionPriority(list: Weed[]): Weed[] {
  const region = getRegion(storedRegionId());
  if (!region) return list;
  const priority = new Set(region.priorityWeedIds);
  const regional = list.filter((w) => priority.has(w.id));
  if (regional.length < 6) return list;
  const others = list.filter((w) => !priority.has(w.id));
  const thinned = others.filter((_, i) => i % 2 === 0);
  return [...regional, ...(thinned.length >= 6 ? thinned : others)];
}

/** K-5 (Plant Explorer) curriculum weeds. */
export const ELEMENTARY_WEED_IDS: string[] = [
  "Canada Thistle",
  "Common Milkweed",
  "Common Mullein",
  "Dandelion",
  "Field Bindweed",
  "Giant Foxtail",
  "Giant Ragweed",
  "Kochia",
  "Lambsquarters",
  "Pennsylvania Smartweed",
  "Velvetleaf",
  "Venice Mallow",
  "Wild Carrot",
  "Wild Parsnip",
  "Yellow Nutsedge",
];

/** The curated set of weeds shown to 6-8 (Field Scout) learners. */
export const MIDDLE_SCHOOL_WEED_IDS: string[] = [
  "Barnyardgrass",
  "Canada Thistle",
  "Common Burdock",
  "Common Chickweed",
  "Common Cocklebur",
  "Common Milkweed",
  "Common Morningglory",
  "Common Mullein",
  "Common Pokeweed",
  "Common Ragweed",
  "Common Sunflower",
  "Common Teasel",
  "Curly Dock",
  "Dandelion",
  "Field Bindweed",
  "Field Horsetail",
  "Giant Foxtail",
  "Giant Ragweed",
  "Golden Alexanders",
  "Ground Ivy",
  "Henbit",
  "Horsenettle",
  "Horseweed",
  "Jimsonweed",
  "Kochia",
  "Lambsquarters",
  "Large Crabgrass",
  "Musk Thistle",
  "Pennsylvania Smartweed",
  "Redroot Pigweed",
  "Shepherd's Purse",
  "Velvetleaf",
  "Venice Mallow",
  "Wild Carrot",
  "Wild Parsnip",
  "Witchgrass",
  "Yellow Nutsedge",
];

/** Species ids are compared case- and separator-insensitively. */
export const normalizeWeedId = (id: string): string => id.toLowerCase().replace(/[^a-z0-9]/g, "");

const ELEM_ID_SET = new Set(ELEMENTARY_WEED_IDS.map(normalizeWeedId));
const MIDDLE_ID_SET = new Set(MIDDLE_SCHOOL_WEED_IDS.map(normalizeWeedId));

/** 9-12 (High School) curriculum weeds. */
export const HIGH_SCHOOL_WEED_IDS: string[] = [
  "Asiatic Dayflower",
  "Barnyardgrass",
  "Buffalobur",
  "Canada Thistle",
  "Catchweed Bedstraw",
  "Common Burdock",
  "Common Chickweed",
  "Common Cocklebur",
  "Common Mallow",
  "Common Milkweed",
  "Common Morningglory",
  "Common Mullein",
  "Common Pokeweed",
  "Common Ragweed",
  "Common Sunflower",
  "Common Teasel",
  "Curly Dock",
  "Dandelion",
  "Eastern Black Nightshade",
  "Field Bindweed",
  "Field Horsetail",
  "Garlic Mustard",
  "Giant Foxtail",
  "Giant Ragweed",
  "Golden Alexanders",
  "Goosegrass",
  "Green Foxtail",
  "Ground Ivy",
  "Hemp",
  "Hemp Dogbane",
  "Henbit",
  "Honeyvine Milkweed",
  "Horsenettle",
  "Horseweed",
  "Ivyleaf Morningglory",
  "Jimsonweed",
  "Kochia",
  "Lambsquarters",
  "Large Crabgrass",
  "Musk Thistle",
  "Palmer Amaranth",
  "Pennsylvania Smartweed",
  "Prickly Lettuce",
  "Quackgrass",
  "Redroot Pigweed",
  "Shepherd's Purse",
  "Spotted Spurge",
  "Star of Bethlehem",
  "Velvetleaf",
  "Venice Mallow",
  "Waterhemp",
  "Wild Carrot",
  "Wild Mustard",
  "Wild Parsnip",
  "Witchgrass",
  "Yellow Foxtail",
  "Yellow Nutsedge",
  "Yellow Rocket",
];

const HIGH_ID_SET = new Set(HIGH_SCHOOL_WEED_IDS.map(normalizeWeedId));

/** Full collegiate species list. */
export const COLLEGE_WEED_IDS: string[] = [
  "Annual Ryegrass",
  "Asian Copperleaf",
  "Asiatic Dayflower",
  "Barnyardgrass",
  "Buffalobur",
  "Burcucumber",
  "Canada Thistle",
  "Caraway",
  "Catchweed Bedstraw",
  "Common Burdock",
  "Common Chickweed",
  "Common Cocklebur",
  "Common Copperleaf",
  "Common Mallow",
  "Common Milkweed",
  "Common Morningglory",
  "Common Mullein",
  "Common Pokeweed",
  "Common Ragweed",
  "Common Sunflower",
  "Common Teasel",
  "Corn Speedwell",
  "Curly Dock",
  "Dandelion",
  "Downy Brome",
  "Eastern Black Nightshade",
  "Fall Panicum",
  "Field Bindweed",
  "Field Horsetail",
  "Field Pennycress",
  "Foxtail Barley",
  "Garlic Mustard",
  "Giant Foxtail",
  "Giant Ragweed",
  "Golden Alexanders",
  "Goosegrass",
  "Green Foxtail",
  "Ground Ivy",
  "Hedge Bindweed",
  "Hemp",
  "Hemp Dogbane",
  "Henbit",
  "Honeyvine Milkweed",
  "Horsenettle",
  "Horseweed",
  "Ivyleaf Morningglory",
  "Jimsonweed",
  "Johnsongrass",
  "Kochia",
  "Lady's Thumb",
  "Lambsquarters",
  "Large Crabgrass",
  "Longspine Sandbur",
  "Mouseear Chickweed",
  "Musk Thistle",
  "Nimblewill",
  "Palmer Amaranth",
  "Pennsylvania Smartweed",
  "Pinnate Tansymustard",
  "Poison Hemlock",
  "Prickly Lettuce",
  "Prickly Sida",
  "Quackgrass",
  "Redroot Pigweed",
  "Russian Thistle",
  "Scouring-rush",
  "Shattercane / Sorghums",
  "Shepherd's Purse",
  "Smooth Groundcherry",
  "Spotted Spurge",
  "Star of Bethlehem",
  "Tall Hedge Mustard",
  "Toothed Spurge",
  "Velvetleaf",
  "Venice Mallow",
  "Water Smartweed",
  "Waterhemp",
  "White Campion",
  "Wild Buckwheat",
  "Wild Carrot",
  "Wild Four-o'clock",
  "Wild Mustard",
  "Wild Oat",
  "Wild Parsnip",
  "Witchgrass",
  "Woolly Cupgrass",
  "Yellow Foxtail",
  "Yellow Nutsedge",
  "Yellow Rocket",
];

/** The master weeds list filtered to the K-5 curriculum. */
export const elementaryWeeds = weeds.filter((w) => ELEM_ID_SET.has(normalizeWeedId(w.id)));

/** The master weeds list filtered to the 6-8 curriculum. */
export const middleSchoolWeeds = applyRegionPriority(weeds.filter((w) => MIDDLE_ID_SET.has(normalizeWeedId(w.id))));

/** The master weeds list filtered to the 9-12 (high school) curriculum. */
export const highSchoolWeeds = applyRegionPriority(weeds.filter((w) => HIGH_ID_SET.has(normalizeWeedId(w.id))));

/** Full collegiate pool, region-prioritized. */
export const collegiateWeeds = applyRegionPriority(weeds);

/** Complete, unfiltered collegiate species list. */
export const collegiateWeedsAll: Weed[] = weeds;

/** Grade levels usable for content pools, including collegiate. */
export type PoolGrade = GradeLevel | "collegiate";

/** Convenience predicates for one-off checks. */
export const isMiddleSchoolWeed = (id: string): boolean => MIDDLE_ID_SET.has(normalizeWeedId(id));
export const isElementaryWeed = (id: string): boolean => ELEM_ID_SET.has(normalizeWeedId(id));
export const isHighSchoolWeed = (id: string): boolean => HIGH_ID_SET.has(normalizeWeedId(id));

/** Return the weed pool a learning module or practice game should use. */
export function weedsForGrade(grade: GradeLevel): Weed[] {
  if (grade === "elementary") return elementaryWeeds;
  if (grade === "middle") return middleSchoolWeeds;
  return highSchoolWeeds;
}

/**
 * Weed pool for learning-module content. Collegiate always receives the
 * complete species list (no region thinning, no 9-12 subset).
 */
export function weedsForPool(grade: PoolGrade): Weed[] {
  if (grade === "collegiate") return collegiateWeedsAll;
  return weedsForGrade(grade);
}
