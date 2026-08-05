// AUTO-GENERATED region definitions for WeedNet.
// Priority species are the most troublesome weeds reported in each region.

export interface Region {
 id: string;
 name: string;
 blurb: string;
 areas: string[];
 /** Weed ids that are especially prevalent / prioritized in this region. */
 priorityWeedIds: string[];
}

export const REGIONS: Region[] = [
 {
  id: "northeast",
  name: "Northeast & Maritimes",
  blurb: "Cool, humid summers with mixed row crops, pasture, and small grains.",
  areas: ["Delaware", "Maryland", "New Hampshire", "New Jersey", "New York", "Pennsylvania", "New Brunswick", "Nova Scotia", "Prince Edward Island", "Connecticut", "Maine", "Massachusetts", "Rhode Island", "Vermont", "West Virginia", "Quebec", "Newfoundland and Labrador"],
  priorityWeedIds: ["Burcucumber", "CommonChickweed", "Common_Burdock", "Curly_dock", "Dandelion", "Downy_brome", "Eastern_black_nightshade", "Field_Horsetail", "Field_Pennycress", "Field_bindweed", "Goosegrass", "Henbit_deadnettle", "Horsenettle", "Horseweed", "Prickly_lettuce", "Quackgrass", "Redroot_pigweed", "Shepherds_Purse", "Smooth_Groundcherry", "Tall_morningglory", "Venice_mallow", "White_campion", "Wild_Carrot", "Wild_buckwheat", "Wild_mustard", "annual-ryegrass", "barnyardgrass", "canada-thistle", "common-ragweed", "common_Cocklebur", "giant-foxtail", "green-foxtail", "johnsongrass", "lambsquarters", "large-crabgrass", "palmer-amaranth", "velvetleaf", "waterhemp", "wild-oat", "yellow-foxtail", "yellow-nutsedge", "yellow_Rocket"],
 },
 {
  id: "southeast",
  name: "Southeast",
  blurb: "Long, hot growing season — heavy herbicide-resistance pressure.",
  areas: ["Alabama", "Arkansas", "Florida", "Georgia", "Kentucky", "Louisiana", "Mississippi", "North Carolina", "South Carolina", "Tennessee", "Virginia"],
  priorityWeedIds: ["Burcucumber", "CommonChickweed", "Dandelion", "Field_bindweed", "Goosegrass", "Henbit_deadnettle", "Horsenettle", "Horseweed", "Prickly_lettuce", "Prickly_sida", "Redroot_pigweed", "Spotted_spurge", "Tall_morningglory", "annual-ryegrass", "barnyardgrass", "common-ragweed", "commonPokeweed", "common_Cocklebur", "giant-foxtail", "giant-ragweed", "johnsongrass", "lambsquarters", "large-crabgrass", "palmer-amaranth", "pennsylvania-smartweed", "velvetleaf", "waterhemp", "wild-oat", "yellow-nutsedge"],
 },
 {
  id: "midwest",
  name: "Midwest & Great Lakes",
  blurb: "The Corn Belt: corn and soybean rotations across deep prairie soils.",
  areas: ["Illinois", "Indiana", "Iowa", "Michigan", "Minnesota", "Missouri", "Ohio", "Wisconsin", "Ontario"],
  priorityWeedIds: ["Burcucumber", "CommonChickweed", "Common_Mallow", "Curly_dock", "Dandelion", "Downy_brome", "Eastern_black_nightshade", "Field_Horsetail", "Field_Pennycress", "Field_bindweed", "Henbit_deadnettle", "Horsenettle", "Horseweed", "Ladysthumb", "Prickly_lettuce", "Quackgrass", "Redroot_pigweed", "Shattercane_Sorghums", "Shepherds_Purse", "Spotted_spurge", "Tall_morningglory", "Venice_mallow", "White_campion", "Wild_Carrot", "Wild_buckwheat", "Wild_mustard", "Woolly_cupgrass", "annual-ryegrass", "barnyardgrass", "canada-thistle", "common-ragweed", "commonPokeweed", "common_Cocklebur", "common_Milkweed", "giant-foxtail", "giant-ragweed", "green-foxtail", "kochia", "lambsquarters", "large-crabgrass", "palmer-amaranth", "pennsylvania-smartweed", "velvetleaf", "waterhemp", "wild-oat", "yellow-foxtail", "yellow-nutsedge"],
 },
 {
  id: "plains",
  name: "Great Plains & Prairies",
  blurb: "Dry, windy plains and prairies with wheat, sorghum, and irrigated row crops.",
  areas: ["Kansas", "Nebraska", "North Dakota", "South Dakota", "Oklahoma", "Texas", "Alberta", "Manitoba", "Saskatchewan"],
  priorityWeedIds: ["CommonChickweed", "Common_Mallow", "Dandelion", "Downy_brome", "Field_Horsetail", "Field_Pennycress", "Field_bindweed", "Foxtail_barley", "Horseweed", "Ladysthumb", "Longspine_sandbur", "Marijuana", "Prickly_lettuce", "Quackgrass", "Redroot_pigweed", "Russian_thistle", "Tall_morningglory", "White_campion", "Wild_buckwheat", "Wild_mustard", "annual-ryegrass", "barnyardgrass", "canada-thistle", "common-ragweed", "common_Cocklebur", "giant-foxtail", "giant-ragweed", "green-foxtail", "johnsongrass", "kochia", "lambsquarters", "large-crabgrass", "palmer-amaranth", "velvetleaf", "volunteer-sunflower", "waterhemp", "wild-oat", "yellow-foxtail", "yellow-nutsedge"],
 },
 {
  id: "mountain",
  name: "Mountain West & Southwest",
  blurb: "Arid rangeland, high desert, and irrigated valleys.",
  areas: ["Arizona", "Colorado", "Idaho", "Montana", "Nevada", "New Mexico", "Utah", "Wyoming"],
  priorityWeedIds: ["Common_Mallow", "Dandelion", "Downy_brome", "Eastern_black_nightshade", "False_London-rocket", "Field_bindweed", "Foxtail_barley", "Horseweed", "Longspine_sandbur", "Musk_thistle", "Prickly_lettuce", "Quackgrass", "Redroot_pigweed", "Russian_thistle", "Shepherds_Purse", "Tall_morningglory", "Wild_mustard", "annual-ryegrass", "barnyardgrass", "canada-thistle", "giant-foxtail", "green-foxtail", "johnsongrass", "kochia", "lambsquarters", "large-crabgrass", "palmer-amaranth", "pennsylvania-smartweed", "volunteer-sunflower", "wild-oat", "yellow-foxtail", "yellow-nutsedge"],
 },
 {
  id: "pacific",
  name: "Pacific West & Alaska",
  blurb: "Mediterranean and maritime climates with orchards, vegetables, and small grains.",
  areas: ["Alaska", "California", "Oregon", "Washington", "Hawaii", "British Columbia"],
  priorityWeedIds: ["Catchweed_bedstraw", "CommonChickweed", "Corn_speedwell", "Eastern_black_nightshade", "Field_Horsetail", "Field_bindweed", "Horseweed", "Prickly_lettuce", "Quackgrass", "Redroot_pigweed", "Shepherds_Purse", "Wild_Carrot", "Wild_mustard", "annual-ryegrass", "barnyardgrass", "canada-thistle", "kochia", "lambsquarters", "palmer-amaranth", "poison-hemlock", "wild-oat", "yellow-nutsedge"],
 },
];

export type RegionId = string;

export function getRegion(id: string | null | undefined): Region | null {
 if (!id) return null;
 return REGIONS.find((r) => r.id === id) ?? null;
}

