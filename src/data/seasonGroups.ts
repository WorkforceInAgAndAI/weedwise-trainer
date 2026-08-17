// Cool-season vs warm-season species groupings. Displayed in the Life Cycles
// learning module (6-8, 9-12 and collegiate).

const normName = (s: string) =>
  s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/g, '');

export const COOL_SEASON_NAMES = [
  'Annual ryegrass', 'Downy brome', 'Field horsetail', 'Foxtail barley', 'Quackgrass', 'Scouringrush',
  'Wild oat', 'Catchweed bedstraw', 'Common chickweed', 'Corn speedwell', 'Curly dock', 'Dandelion',
  'Field pennycress', 'Garlic mustard', 'Ground ivy', 'Henbit', 'Mouseear chickweed', 'Poison hemlock',
  "Shepherd's purse", 'Star of Bethlehem', 'Wild carrot', 'Wild mustard', 'Yellow rocket', 'Canada thistle',
  'Caraway', 'Common teasel', 'Tall hedge mustard', 'Golden alexanders', 'Musk thistle', 'Pinnate tansymustard',
  'Prickly lettuce', 'Russian thistle', 'White campion', 'Wild parsnip',
].map(normName);

export const WARM_SEASON_NAMES = [
  'Barnyardgrass', 'Goosegrass', 'Johnsongrass', 'Large crabgrass', 'Nimblewill', 'Yellow nutsedge',
  'Asiatic dayflower', 'Common pokeweed', 'Eastern black nightshade', 'Ladysthumb', 'Pennsylvania smartweed',
  'Water smartweed', 'Waterhemp', 'Burcucumber', 'Honeyvine milkweed', 'Giant foxtail', 'Green foxtail',
  'Longspine sandbur', 'Shattercane', 'Fall panicum', 'Witchgrass', 'Woolly cupgrass', 'Yellow foxtail',
  'Asian copperleaf', 'Common copperleaf', 'Buffalobur', 'Common burdock', 'Common cocklebur', 'Common mallow',
  'Common milkweed', 'Common ragweed', 'Giant ragweed', 'Hemp dogbane', 'Horsenettle', 'Horseweed',
  'Jimsonweed', 'Kochia', 'Hemp', 'Palmer amaranth', 'Prickly sida', 'Redroot pigweed', 'Smooth groundcherry',
  'Spotted spurge', 'Toothed spurge', 'Velvetleaf', 'Venice mallow', 'Volunteer sunflower', 'Wild buckwheat',
  "Wild four o'clock", 'Field bindweed', 'Hedge bindweed', 'Ivyleaf morningglory', 'Common morningglory',
].map(normName);

export function matchesSeason(commonName: string, list: string[]): boolean {
  const n = normName(commonName);
  return list.some(x => x === n || n.includes(x) || x.includes(n));
}
