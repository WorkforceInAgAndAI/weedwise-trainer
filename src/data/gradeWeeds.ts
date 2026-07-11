import { weeds } from "./weeds";

/**
 * The curated set of weeds shown to 6-8 (Field Scout / middle school)
 * learners. Practice games in `practice-games/middle/` filter the master
 * `weeds` list down to these IDs so students only see the species defined
 * in the 6-8 curriculum.
 *
 * NOTE: `Henbit_deadnettle` covers both "Henbit" and "Purple deadnettle"
 * from the curriculum list — the dataset stores them as a single entry.
 */
export const MIDDLE_SCHOOL_WEED_IDS: string[] = [
  "Dandelion",
  "lambsquarters",
  "common_Milkweed",
  "Wild_Carrot",
  "canada-thistle",
  "giant-ragweed",
  "pennsylvania-smartweed",
  "kochia",
  "wild-parsnip",
  "velvetleaf",
  "Tall_morningglory",
  "Venice_mallow",
  "giant-foxtail",
  "yellow-nutsedge",
  "common-ragweed",
  "Redroot_pigweed",
  "commonPokeweed",           // replaces Common purslane
  "volunteer-sunflower",      // replaces Broadleaf plantain
  "Common_teasel",            // replaces Buckhorn plantain
  "Field_bindweed",
  "common_Cocklebur",
  "Jimsonweed",
  "Horsenettle",
  "Curly_dock",
  "CommonChickweed",
  "Henbit_deadnettle",        // covers Henbit + Purple deadnettle
  "Shepherds_Purse",
  "Ground_ivy",
  "Common_Burdock",           // replaces Common mullein
  "Musk_thistle",             // replaces Bull thistle
  "Horseweed",
  "Field_Horsetail",          // replaces Yellow woodsorrel
  "large-crabgrass",
  "barnyardgrass",
];

const MIDDLE_ID_SET = new Set(MIDDLE_SCHOOL_WEED_IDS);

/**
 * The master weeds list filtered to the 6-8 curriculum.
 * Use this in place of `weeds` for any grades-6-8 practice game.
 */
export const middleSchoolWeeds = weeds.filter((w) => MIDDLE_ID_SET.has(w.id));

/** Convenience predicate for one-off checks. */
export const isMiddleSchoolWeed = (id: string): boolean => MIDDLE_ID_SET.has(id);