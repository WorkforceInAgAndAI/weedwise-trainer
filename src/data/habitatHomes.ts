// Habitat preference + first-person characteristics for the "Pick a House"
// habitat games (6-8, 9-12 and collegiate). Keyed by normalized common name.

export type HabitatId = "cropland" | "pasture" | "roadside" | "woodland" | "wetland" | "wet" | "dry";

export interface HabitatHome {
  name: string;
  habitats: HabitatId[];
  traits: string[];
  learningTraits: string[];
  scientificName?: string;
}

export const HABITAT_HOMES: HabitatHome[] = [
  {
    "name": "Annual Ryegrass",
    "scientificName": "Lolium multiflorum",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I sprout fast on bare soil",
      "my shallow, fibrous roots grab hold of freshly turned ground",
      "I pump out seed even when the earth keeps getting churned up"
    ],
    "learningTraits": [
      "Sprouts fast on open soil",
      "shallow, fibrous roots anchor in freshly turned ground",
      "high seed output even under repeated soil disturbance"
    ]
  },
  {
    "name": "Asian Copperleaf",
    "scientificName": "Acalypha australis",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My seedlings shrug off heat but need moisture",
      "my foliage handles baking sun",
      "I germinate readily once the ground has been turned"
    ],
    "learningTraits": [
      "Seedlings tolerate heat but require moisture",
      "foliage withstands baking sun",
      "germinates readily once ground has been turned"
    ]
  },
  {
    "name": "Asiatic Dayflower",
    "scientificName": "Commelina communis",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "My succulent stems hold their own water reserve",
      "I root wherever a stem node touches packed-down earth",
      "I keep growing even in soggy, heavy ground"
    ],
    "learningTraits": [
      "Succulent stems store internal water reserves",
      "roots from stem nodes in firm soil",
      "continues growth in heavy, poorly drained ground"
    ]
  },
  {
    "name": "Barnyardgrass",
    "scientificName": "Echinochloa crus-galli",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "I run C4 photosynthesis built for warm, soggy conditions",
      "I tolerate flooding and low-oxygen soil",
      "my roots sprout from stem nodes to anchor in hard-packed earth"
    ],
    "learningTraits": [
      "C4 photosynthesis suited to warm, waterlogged conditions",
      "tolerates flooding and low-oxygen soil",
      "roots sprout from stem nodes to anchor in firm soil"
    ]
  },
  {
    "name": "Buffalobur",
    "scientificName": "Solanum rostratum",
    "habitats": [
      "dry"
    ],
    "traits": [
      "My deep taproot reaches moisture far below a parched surface",
      "my spines keep grazers off open bare ground",
      "my foliage takes the heat without wilting"
    ],
    "learningTraits": [
      "Deep taproot reaches moisture far below parched surface",
      "spines deter grazers on open ground",
      "foliage withstands heat without wilting"
    ]
  },
  {
    "name": "Burcucumber",
    "scientificName": "Sicyos angulatus",
    "habitats": [
      "woodland",
      "wet"
    ],
    "traits": [
      "My vigorous vine chases light gaps along the tree line",
      "I handle heavy, soggy soil without trouble",
      "my tendrils grip whatever's nearby to climb toward the sun"
    ],
    "learningTraits": [
      "Vigorous vine chases light gaps along tree lines",
      "tolerates heavy, poorly drained soil",
      "tendrils grip nearby structures to climb toward sun"
    ]
  },
  {
    "name": "Canada Thistle",
    "scientificName": "Cirsium arvense",
    "habitats": [
      "pasture",
      "dry"
    ],
    "traits": [
      "My creeping underground roots outlast grazing and mowing",
      "I dig deep for moisture when the surface turns parched",
      "I resprout from pieces no matter how much the ground gets torn up"
    ],
    "learningTraits": [
      "Creeping underground roots outlast grazing and mowing",
      "digs deep for moisture when surface dries",
      "resprouts from root fragments after ground disturbance"
    ]
  },
  {
    "name": "Caraway",
    "scientificName": "Carum carvi",
    "habitats": [
      "roadside",
      "dry"
    ],
    "traits": [
      "My taproot is built for gravelly deeply worked soil",
      "after my first year my biennial self shrugs off regular mowing and I barely need any water"
    ],
    "learningTraits": [
      "Taproot suited to gravelly, deeply worked soil",
      "biennial form shrugs off regular mowing after first year",
      "minimal water requirements"
    ]
  },
  {
    "name": "Catchweed Bedstraw",
    "scientificName": "Galium aparine",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "My weak, sprawling stems do fine in heavy, waterlogged soil",
      "my hooked bristles hitch a ride through freshly worked fields",
      "my shallow roots don't mind trampled ground"
    ],
    "learningTraits": [
      "Weak, sprawling stems tolerate heavy, poorly drained soil",
      "hooked bristles disperse through freshly worked fields",
      "shallow roots tolerate trafficked ground"
    ]
  },
  {
    "name": "Common Burdock",
    "scientificName": "Arctium minus",
    "habitats": [
      "dry"
    ],
    "traits": [
      "My deep taproot carries me through drought",
      "as a rosette I settle happily into bare, exposed soil",
      "my burred seeds hitch a ride whenever the ground gets stirred up"
    ],
    "learningTraits": [
      "Deep taproot persists through drought",
      "rosette form settles into open, exposed soil",
      "burred seeds disperse when ground is stirred up"
    ]
  },
  {
    "name": "Common Chickweed",
    "scientificName": "Stellaria media",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "My shallow, fibrous roots are at home in packed soil",
      "I thrive when things turn cool and soggy",
      "my low, sprawling habit shakes off foot and equipment traffic"
    ],
    "learningTraits": [
      "Shallow, fibrous roots at home in firm soil",
      "thrives in cool, poorly drained conditions",
      "low, sprawling habit tolerates foot and equipment traffic"
    ]
  },
  {
    "name": "Common Cocklebur",
    "scientificName": "Xanthium strumarium",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "I tolerate saturated, heavy ground without flinching",
      "my oversized cotyledons carry enough stored energy to push through a crusted surface",
      "my spiny burs travel easily through churned-up fields"
    ],
    "learningTraits": [
      "Tolerates saturated, heavy ground",
      "oversized cotyledons carry enough stored energy to push through crusted surface",
      "spiny burs travel through churned-up fields"
    ]
  },
  {
    "name": "Common Copperleaf",
    "scientificName": "Acalypha rhomboidea",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I germinate quickly on bare, freshly tilled earth",
      "my foliage handles heat and low moisture",
      "my short life cycle fits right into a field that keeps getting turned over"
    ],
    "learningTraits": [
      "Germinates quickly on open, freshly tilled earth",
      "foliage tolerates heat and low moisture",
      "short life cycle fits a field that is regularly turned"
    ]
  },
  {
    "name": "Common Mallow",
    "scientificName": "Malva neglecta",
    "habitats": [
      "dry"
    ],
    "traits": [
      "My deep taproot keeps me going through drought",
      "my low rosette shrugs off mowing and trampling",
      "I make do with poor, packed-in soil"
    ],
    "learningTraits": [
      "Deep taproot persists through drought",
      "low rosette shrugs off mowing and trampling",
      "tolerates poor, firm soil"
    ]
  },
  {
    "name": "Common Milkweed",
    "scientificName": "Asclepias syriaca",
    "habitats": [
      "pasture",
      "dry"
    ],
    "traits": [
      "My spreading underground roots let me come back after grazing or mowing",
      "I dig deep for moisture when things turn parched",
      "my milky sap keeps browsers away"
    ],
    "learningTraits": [
      "Spreading underground roots enable regrowth after grazing or mowing",
      "digs deep for moisture when surface dries",
      "milky sap deters browsers"
    ]
  },
  {
    "name": "Common Morningglory",
    "scientificName": "Ipomoea purpurea",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My hard seed coat survives being tilled under or stored in bare soil for years",
      "my twining vine climbs whatever structure is nearby to reach light",
      "once rooted, I barely need rain"
    ],
    "learningTraits": [
      "Hard seed coat survives being tilled under or stored in soil for years",
      "twining vine climbs nearby structures to reach light",
      "minimal water needs once rooted"
    ]
  },
  {
    "name": "Common Mullein",
    "scientificName": "Verbascum thapsus",
    "habitats": [
      "dry"
    ],
    "traits": [
      "My deep taproot pulls me through drought",
      "my woolly leaves cut down on water loss",
      "as a rosette I settle easily into bare, open earth"
    ],
    "learningTraits": [
      "Deep taproot persists through drought",
      "woolly leaves reduce water loss",
      "rosette form settles into open soil"
    ]
  },
  {
    "name": "Common Pokeweed",
    "scientificName": "Phytolacca americana",
    "habitats": [
      "woodland",
      "dry"
    ],
    "traits": [
      "My large taproot stores reserves I can spend colonizing freshly cleared ground",
      "I tolerate the dappled shade along a tree line",
      "birds carry my seed straight to the edge habitats I like"
    ],
    "learningTraits": [
      "Large taproot stores reserves for colonizing freshly cleared ground",
      "tolerates dappled shade along tree lines",
      "bird-dispersed seeds reach edge habitats"
    ]
  },
  {
    "name": "Common Ragweed",
    "scientificName": "Ambrosia artemisiifolia",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My taproot digs in fast on bare soil",
      "I handle low moisture without slowing down",
      "my water carried and hitchhiking seed spreads easily."
    ],
    "learningTraits": [
      "Taproot establishes quickly on open soil",
      "tolerates low moisture without slowing",
      "hitchhiking seeds disperse easily"
    ]
  },
  {
    "name": "Common Sunflower",
    "scientificName": "Helianthus annuus",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My deep taproot carries me through dry spells",
      "I grow fast early on to outcompete neighbors on bare soil",
      "my leaves handle high heat."
    ],
    "learningTraits": [
      "Deep taproot persists through dry spells",
      "rapid early growth outcompetes neighbors on open soil",
      "leaves tolerate high heat"
    ]
  },
  {
    "name": "Common Teasel",
    "scientificName": "Dipsacus fullonum",
    "habitats": [
      "wetland",
      "wet"
    ],
    "traits": [
      "My deep taproot tolerates soil that's saturated part of the year",
      "as a rosette I hold on in heavy, packed ground",
      "my tall stalk takes advantage of open, soggy sites"
    ],
    "learningTraits": [
      "Deep taproot tolerates seasonally saturated soil",
      "rosette form holds in heavy, firm ground",
      "tall stalk exploits open, poorly drained sites"
    ]
  },
  {
    "name": "Corn Speedwell",
    "scientificName": "Veronica arvensis",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "My shallow, spreading roots are built for packed-down soil",
      "my low growth shrugs off traffic",
      "I thrive when conditions turn cool and soggy"
    ],
    "learningTraits": [
      "Shallow, spreading roots suited to firm soil",
      "low growth tolerates traffic",
      "thrives in cool, poorly drained conditions"
    ]
  },
  {
    "name": "Curly Dock",
    "scientificName": "Rumex crispus",
    "habitats": [
      "pasture",
      "wet"
    ],
    "traits": [
      "My deep taproot handles heavy, poorly drained ground",
      "I resprout from root fragments after grazing or mowing",
      "I tolerate standing water just fine"
    ],
    "learningTraits": [
      "Deep taproot tolerates heavy, poorly drained ground",
      "resprouts from root fragments after grazing or mowing",
      "tolerates standing water"
    ]
  },
  {
    "name": "Dandelion",
    "scientificName": "Taraxacum officinale",
    "habitats": [
      "pasture",
      "wet"
    ],
    "traits": [
      "My deep taproot survives trampling and mowing",
      "my rosette habit shrugs off grazing pressure",
      "I do fine in moist, heavy soil and my fluffy seeds readily spread."
    ],
    "learningTraits": [
      "Deep taproot survives trampling and mowing",
      "rosette habit shrugs off grazing pressure",
      "tolerates moist, heavy soil",
      "fluffy seeds disperse readily"
    ]
  },
  {
    "name": "Downy Brome",
    "scientificName": "Bromus tectorum",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My shallow, fibrous roots take advantage of early-season moisture",
      "I germinate fast on bare ground",
      "I finish my life cycle before the worst of a dry spell hits"
    ],
    "learningTraits": [
      "Shallow, fibrous roots exploit early-season moisture",
      "germinates fast on open ground",
      "completes life cycle before peak drought"
    ]
  },
  {
    "name": "Eastern Black Nightshade",
    "scientificName": "Solanum emulans",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I germinate quickly in freshly worked soil",
      "my foliage tolerates low moisture",
      "my short life cycle keeps pace with a field that's regularly turned over"
    ],
    "learningTraits": [
      "Germinates quickly in freshly worked soil",
      "foliage tolerates low moisture",
      "short life cycle matches a field that is regularly turned"
    ]
  },
  {
    "name": "Fall Panicum",
    "scientificName": "Panicum dichotomiflorum",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I run C4 photosynthesis suited to hot, moist fields",
      "my shallow roots establish quickly on bare ground",
      "I produce seed prolifically"
    ],
    "learningTraits": [
      "C4 photosynthesis suited to hot, moist fields",
      "shallow roots establish quickly on open ground",
      "prolific seed production"
    ]
  },
  {
    "name": "Field Bindweed",
    "scientificName": "Convolvulus arvensis",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My deep, far-reaching root system taps subsoil moisture",
      "I regrow from root fragments left behind after tillage",
      "I hold up well through dry spells"
    ],
    "learningTraits": [
      "Deep, far-reaching root system taps subsoil moisture",
      "regrows from root fragments after tillage",
      "tolerates dry spells"
    ]
  },
  {
    "name": "Field Horsetail",
    "scientificName": "Equisetum arvense",
    "habitats": [
      "wetland",
      "wet"
    ],
    "traits": [
      "My deep underground stems tolerate saturated, heavy ground",
      "my hollow stems are built for low-oxygen soil",
      "I spread vegetatively through soggy, freshly opened ground"
    ],
    "learningTraits": [
      "Deep underground stems tolerate saturated, heavy ground",
      "hollow stems suited to low-oxygen soil",
      "spreads vegetatively through soggy, freshly opened ground"
    ]
  },
  {
    "name": "Field Pennycress",
    "scientificName": "Thlaspi arvense",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My winter-annual habit lets me take advantage of bare soil in fall and spring",
      "my shallow roots suit freshly worked ground",
      "my rosette handles cold and low moisture"
    ],
    "learningTraits": [
      "Winter-annual habit exploits open soil in fall and spring",
      "shallow roots suit freshly worked ground",
      "rosette tolerates cold and low moisture"
    ]
  },
  {
    "name": "Foxtail Barley",
    "scientificName": "Hordeum jubatum",
    "habitats": [
      "roadside",
      "dry"
    ],
    "traits": [
      "I tolerate salty, packed-in roadside soil",
      "my fibrous roots suit ground that's been recently scraped or graded",
      "my bunchgrass habit shrugs off dry conditions"
    ],
    "learningTraits": [
      "Tolerates salty, firm roadside soil",
      "fibrous roots suit recently scraped or graded ground",
      "bunchgrass habit shrugs off dry conditions"
    ]
  },
  {
    "name": "Garlic Mustard",
    "scientificName": "Alliaria petiolata",
    "habitats": [
      "woodland",
      "dry"
    ],
    "traits": [
      "As a rosette I tolerate shaded, freshly opened soil along a tree line",
      "my shallow roots colonize bare ground quickly",
      "my seedlings establish even in low light"
    ],
    "learningTraits": [
      "Rosette form tolerates shaded, freshly opened soil along tree lines",
      "shallow roots colonize open ground quickly",
      "seedlings establish even in low light"
    ]
  },
  {
    "name": "Giant Foxtail",
    "scientificName": "Setaria faberi",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I run C4 metabolism suited to hot, low-moisture fields",
      "I emerge quickly on bare ground",
      "my fibrous roots handle swings in moisture"
    ],
    "learningTraits": [
      "C4 metabolism suited to hot, low-moisture fields",
      "emerges quickly on open ground",
      "fibrous roots handle moisture swings"
    ]
  },
  {
    "name": "Giant Ragweed",
    "scientificName": "Ambrosia trifida",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "My rapid, tall growth takes advantage of open, soggy fields",
      "my taproot tolerates heavy ground that floods seasonally",
      "my oversized cotyledons push right through a crusted surface"
    ],
    "learningTraits": [
      "Rapid, tall growth exploits open, poorly drained fields",
      "taproot tolerates heavy ground that floods seasonally",
      "oversized cotyledons push through crusted surface"
    ]
  },
  {
    "name": "Golden Alexanders",
    "scientificName": "Zizia aurea",
    "habitats": [
      "pasture",
      "wet"
    ],
    "traits": [
      "My fibrous roots tolerate moist, packed-in pasture soil",
      "I handle seasonal saturation without trouble",
      "my low-key growth habit suits ground that's grazed"
    ],
    "learningTraits": [
      "Fibrous roots tolerate moist, firm pasture soil",
      "handles seasonal saturation",
      "low-key growth habit suits grazed ground"
    ]
  },
  {
    "name": "Goosegrass",
    "scientificName": "Eleusine indica",
    "habitats": [
      "dry"
    ],
    "traits": [
      "I'm famous for tolerating hard, trampled soil",
      "my fibrous, shallow roots suit ground that's been walked or driven over",
      "I take heat and low moisture in stride"
    ],
    "learningTraits": [
      "Tolerates hard, trampled soil",
      "fibrous, shallow roots suit ground that is walked or driven over",
      "tolerates heat and low moisture"
    ]
  },
  {
    "name": "Green Foxtail",
    "scientificName": "Setaria viridis",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I run C4 photosynthesis for hot fields",
      "I germinate fast on bare soil",
      "my fibrous roots tolerate low moisture but prefer wet soils."
    ],
    "learningTraits": [
      "C4 photosynthesis for hot fields",
      "germinates fast on open soil",
      "fibrous roots tolerate low moisture but prefer poorly drained soils"
    ]
  },
  {
    "name": "Ground Ivy",
    "scientificName": "Glechoma hederacea",
    "habitats": [
      "woodland",
      "wet"
    ],
    "traits": [
      "My creeping stems root at every node, letting me hold on in packed, moist soil",
      "I tolerate the shade along a tree line",
      "my low mat resists being walked over"
    ],
    "learningTraits": [
      "Creeping stems root at every node, holding in firm, moist soil",
      "tolerates shade along tree lines",
      "low mat resists being walked over"
    ]
  },
  {
    "name": "Hedge Bindweed",
    "scientificName": "Calystegia sepium",
    "habitats": [
      "woodland",
      "dry"
    ],
    "traits": [
      "My twining vine climbs neighboring plants to reach light at the tree line",
      "my deep underground stems tolerate freshly opened soil",
      "once established, I barely need rain"
    ],
    "learningTraits": [
      "Twining vine climbs neighboring plants to reach light at tree lines",
      "deep underground stems tolerate freshly opened soil",
      "minimal water needs once established"
    ]
  },
  {
    "name": "Hemp",
    "scientificName": "Cannabis sativa",
    "habitats": [
      "dry"
    ],
    "traits": [
      "My deep taproot carries me through dry spells",
      "I grow fast to colonize bare, open soil",
      "I adapt easily to poor ground but do better in well-drained soils with nutrients."
    ],
    "learningTraits": [
      "Deep taproot persists through dry spells",
      "rapid growth colonizes open soil",
      "adapts easily to poor ground but performs better in well-drained, nutrient-rich soils"
    ]
  },
  {
    "name": "Hemp Dogbane",
    "scientificName": "Apocynum cannabinum",
    "habitats": [
      "pasture",
      "dry"
    ],
    "traits": [
      "My deep, spreading underground roots let me survive grazing and mowing",
      "I hold up well through dry conditions",
      "my milky sap discourages browsers"
    ],
    "learningTraits": [
      "Deep, spreading underground roots survive grazing and mowing",
      "tolerates dry conditions",
      "milky sap discourages browsers"
    ]
  },
  {
    "name": "Henbit",
    "scientificName": "Lamium amplexicaule",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "As a winter annual I take advantage of bare fall soil",
      "my shallow roots suit freshly worked ground",
      "my low growth handles cold"
    ],
    "learningTraits": [
      "Winter annual exploits open fall soil",
      "shallow roots suit freshly worked ground",
      "low growth tolerates cold"
    ]
  },
  {
    "name": "Honeyvine Milkweed",
    "scientificName": "Cynanchum laeve",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My deep perennial roots tolerate dry spells",
      "my twining habit lets me climb through a crop canopy for light",
      "I regrow from root buds after tillage"
    ],
    "learningTraits": [
      "Deep perennial roots tolerate dry spells",
      "twining habit climbs through crop canopy for light",
      "regrows from root buds after tillage"
    ]
  },
  {
    "name": "Horsenettle",
    "scientificName": "Solanum carolinense",
    "habitats": [
      "pasture",
      "dry"
    ],
    "traits": [
      "My deep, spreading underground roots survive grazing and mowing",
      "my spines keep browsers away",
      "my taproot holds up through low moisture"
    ],
    "learningTraits": [
      "Deep, spreading underground roots survive grazing and mowing",
      "spines deter browsers",
      "taproot tolerates low moisture"
    ]
  },
  {
    "name": "Horseweed",
    "scientificName": "Erigeron canadensis",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My windblown seed colonizes bare, open ground easily",
      "my taproot tolerates low moisture",
      "my rosette adapts to whatever conditions a field throws at it"
    ],
    "learningTraits": [
      "Windblown seed colonizes open ground easily",
      "taproot tolerates low moisture",
      "rosette adapts to varied field conditions"
    ]
  },
  {
    "name": "Ivyleaf Morningglory",
    "scientificName": "Ipomoea hederacea",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My hard seed coat survives being tilled under",
      "my twining vine climbs whatever crop structure is nearby",
      "once rooted, I handle low moisture just fine"
    ],
    "learningTraits": [
      "Hard seed coat survives being tilled under",
      "twining vine climbs nearby crop structures",
      "tolerates low moisture once rooted"
    ]
  },
  {
    "name": "Jimsonweed",
    "scientificName": "Datura stramonium",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My taproot grows fast in bare, freshly worked soil",
      "my broad leaves tolerate low moisture",
      "my toxic compounds keep grazers away in open fields"
    ],
    "learningTraits": [
      "Taproot grows fast in open, freshly worked soil",
      "broad leaves tolerate low moisture",
      "toxic compounds deter grazers in open fields"
    ]
  },
  {
    "name": "Johnsongrass",
    "scientificName": "Sorghum halepense",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My underground stems let me regrow after tillage",
      "I run C4 metabolism suited to hot fields",
      "my root system tolerates low moisture"
    ],
    "learningTraits": [
      "Underground stems enable regrowth after tillage",
      "C4 metabolism suited to hot fields",
      "root system tolerates low moisture"
    ]
  },
  {
    "name": "Kochia",
    "scientificName": "Bassia scoparia",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My deep taproot gives me extreme tolerance for low moisture",
      "I break off and roll to spread seed across open ground",
      "I handle salty, hot conditions"
    ],
    "learningTraits": [
      "Deep taproot provides extreme tolerance for low moisture",
      "breaks off and tumbles to spread seed across open ground",
      "tolerates salty, hot conditions"
    ]
  },
  {
    "name": "Lady's Thumb",
    "scientificName": "Persicaria maculosa",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "My shallow, fibrous roots tolerate packed-in soil",
      "I thrive in low-lying, moist spots",
      "I grow rapidly on soggy, freshly worked ground"
    ],
    "learningTraits": [
      "Shallow, fibrous roots tolerate firm soil",
      "thrives in low-lying, moist spots",
      "grows rapidly on poorly drained, freshly worked ground"
    ]
  },
  {
    "name": "Lambsquarters",
    "scientificName": "Chenopodium album",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My deep taproot tolerates low moisture",
      "I emerge quickly on bare, freshly tilled ground",
      "I adapt to a wide range of soils"
    ],
    "learningTraits": [
      "Deep taproot tolerates low moisture",
      "emerges quickly on open, freshly tilled ground",
      "adapts to a wide range of soils"
    ]
  },
  {
    "name": "Large Crabgrass",
    "scientificName": "Digitaria sanguinalis",
    "habitats": [
      "dry"
    ],
    "traits": [
      "I run C4 photosynthesis suited to hot, hard-packed soil",
      "my low, sprawling habit tolerates being walked on",
      "my fibrous roots colonize bare ground quickly"
    ],
    "learningTraits": [
      "C4 photosynthesis suited to hot, firm soil",
      "low, sprawling habit tolerates being walked on",
      "fibrous roots colonize open ground quickly"
    ]
  },
  {
    "name": "Longspine Sandbur",
    "scientificName": "Cenchrus longispinus",
    "habitats": [
      "roadside",
      "dry"
    ],
    "traits": [
      "I'm well suited to sandy, low-moisture soil",
      "my spiny burs hitch rides along roadside corridors",
      "my low growth shrugs off mowing"
    ],
    "learningTraits": [
      "Suited to sandy, low-moisture soil",
      "spiny burs disperse along roadside corridors",
      "low growth shrugs off mowing"
    ]
  },
  {
    "name": "Mouseear Chickweed",
    "scientificName": "Cerastium fontanum",
    "habitats": [
      "pasture",
      "wet"
    ],
    "traits": [
      "My mat-forming, shallow roots tolerate packed, moist pasture soil",
      "my low growth resists grazing and trampling",
      "I spread by creeping stems"
    ],
    "learningTraits": [
      "Mat-forming, shallow roots tolerate firm, moist pasture soil",
      "low growth resists grazing and trampling",
      "spreads by creeping stems"
    ]
  },
  {
    "name": "Musk Thistle",
    "scientificName": "Carduus nutans",
    "habitats": [
      "pasture",
      "dry"
    ],
    "traits": [
      "My deep taproot carries me through low moisture",
      "my spiny rosette resists grazing",
      "I colonize bare ground in pastures readily"
    ],
    "learningTraits": [
      "Deep taproot persists through low moisture",
      "spiny rosette resists grazing",
      "colonizes open ground readily"
    ]
  },
  {
    "name": "Nimblewill",
    "scientificName": "Muhlenbergia schreberi",
    "habitats": [
      "woodland",
      "wet"
    ],
    "traits": [
      "My shallow, spreading stems tolerate packed, moist, shaded soil",
      "my low mat suits ground that gets walked over near the tree line",
      "I handle shade well"
    ],
    "learningTraits": [
      "Shallow, spreading stems tolerate firm, moist, shaded soil",
      "low mat suits ground that is walked over near tree lines",
      "tolerates shade"
    ]
  },
  {
    "name": "Palmer Amaranth",
    "scientificName": "Amaranthus palmeri",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I run C4 photosynthesis and grow fast on bare, freshly tilled soil",
      "my deep taproot tolerates low moisture",
      "my seed bank has varied dormancy that keeps me coming back"
    ],
    "learningTraits": [
      "C4 photosynthesis and rapid growth on open, freshly tilled soil",
      "deep taproot tolerates low moisture",
      "seed bank has varied dormancy for persistent return"
    ]
  },
  {
    "name": "Pennsylvania Smartweed",
    "scientificName": "Persicaria pensylvanica",
    "habitats": [
      "wetland",
      "wet"
    ],
    "traits": [
      "I tolerate saturated, low-oxygen soil",
      "my roots sprout from stem nodes to anchor in heavy, packed ground",
      "my jointed stems handle flooding"
    ],
    "learningTraits": [
      "Tolerates saturated, low-oxygen soil",
      "roots sprout from stem nodes to anchor in heavy, firm ground",
      "jointed stems handle flooding"
    ]
  },
  {
    "name": "Pinnate Tansymustard",
    "scientificName": "Descurainia pinnata",
    "habitats": [
      "dry"
    ],
    "traits": [
      "My taproot suits arid, freshly opened soil",
      "my quick winter-annual life cycle helps me dodge the worst of a dry spell",
      "my low rosette settles into bare ground easily"
    ],
    "learningTraits": [
      "Taproot suits arid, freshly opened soil",
      "quick winter-annual life cycle dodges peak drought",
      "low rosette settles into open ground easily"
    ]
  },
  {
    "name": "Poison Hemlock",
    "scientificName": "Conium maculatum",
    "habitats": [
      "wetland",
      "wet"
    ],
    "traits": [
      "I tolerate moist, low-lying, packed ground",
      "my deep taproot reaches subsurface water",
      "my toxic compounds keep grazers off soggy margins"
    ],
    "learningTraits": [
      "Tolerates moist, low-lying, firm ground",
      "deep taproot reaches subsurface water",
      "toxic compounds deter grazers on poorly drained margins"
    ]
  },
  {
    "name": "Prickly Lettuce",
    "scientificName": "Lactuca serriola",
    "habitats": [
      "roadside",
      "dry"
    ],
    "traits": [
      "My deep taproot carries me through low moisture",
      "my spiny leaf margins deter herbivory along exposed roadsides",
      "I colonize bare ground readily"
    ],
    "learningTraits": [
      "Deep taproot persists through low moisture",
      "spiny leaf margins deter herbivory along exposed roadsides",
      "colonizes open ground readily"
    ]
  },
  {
    "name": "Prickly Sida",
    "scientificName": "Sida spinosa",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My deep taproot tolerates low moisture in tilled fields",
      "my spiny fruit holds up through field work",
      "my foliage takes the heat"
    ],
    "learningTraits": [
      "Deep taproot tolerates low moisture in tilled fields",
      "spiny fruit withstands field work",
      "foliage tolerates heat"
    ]
  },
  {
    "name": "Quackgrass",
    "scientificName": "Elytrigia repens",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My extensive underground stems let me regrow after tillage",
      "my fibrous roots tolerate swings in moisture",
      "I adapt to a wide range of soils"
    ],
    "learningTraits": [
      "Extensive underground stems enable regrowth after tillage",
      "fibrous roots tolerate moisture swings",
      "adapts to a wide range of soils"
    ]
  },
  {
    "name": "Redroot Pigweed",
    "scientificName": "Amaranthus retroflexus",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I run C4 photosynthesis and send down a deep taproot to handle low moisture",
      "I emerge fast on bare, freshly tilled ground",
      "I produce seed prolifically"
    ],
    "learningTraits": [
      "C4 photosynthesis with deep taproot to handle low moisture",
      "emerges fast on open, freshly tilled ground",
      "prolific seed production"
    ]
  },
  {
    "name": "Russian Thistle",
    "scientificName": "Salsola tragus",
    "habitats": [
      "dry"
    ],
    "traits": [
      "My deep taproot gives me extreme tolerance for low moisture",
      "I break off and tumble to spread seed across open ground",
      "I handle salty soil"
    ],
    "learningTraits": [
      "Deep taproot provides extreme tolerance for low moisture",
      "breaks off and tumbles to spread seed across open ground",
      "tolerates salty soil"
    ]
  },
  {
    "name": "Scouring-rush",
    "scientificName": "Equisetum hyemale",
    "habitats": [
      "wetland",
      "wet"
    ],
    "traits": [
      "My deep underground stems tolerate saturated, packed wetland soil",
      "my hollow, silica-rich stems suit low-oxygen ground",
      "I spread vegetatively"
    ],
    "learningTraits": [
      "Deep underground stems tolerate saturated, firm soil",
      "hollow, silica-rich stems suit low-oxygen ground",
      "spreads vegetatively"
    ]
  },
  {
    "name": "Shattercane / Sorghums",
    "scientificName": "Sorghum bicolor",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I run C4 metabolism suited to hot fields",
      "my deep and spreading roots tolerate low moisture",
      "I grow rapidly on freshly worked ground"
    ],
    "learningTraits": [
      "C4 metabolism suited to hot fields",
      "deep, spreading roots tolerate low moisture",
      "grows rapidly on freshly worked ground"
    ]
  },
  {
    "name": "Shepherd's Purse",
    "scientificName": "Capsella bursa-pastoris",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My quick winter-annual life cycle takes advantage of bare, freshly worked soil",
      "my shallow roots handle swings in field moisture",
      "my rosette shrugs off cold"
    ],
    "learningTraits": [
      "Quick winter-annual life cycle exploits open, freshly worked soil",
      "shallow roots handle moisture swings",
      "rosette shrugs off cold"
    ]
  },
  {
    "name": "Smooth Groundcherry",
    "scientificName": "Physalis longifolia",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My underground roots regrow after tillage",
      "my foliage tolerates low moisture",
      "my husk-covered fruit protects my seed on freshly worked ground"
    ],
    "learningTraits": [
      "Underground roots regrow after tillage",
      "foliage tolerates low moisture",
      "husk-covered fruit protects seed on freshly worked ground"
    ]
  },
  {
    "name": "Spotted Spurge",
    "scientificName": "Euphorbia maculata",
    "habitats": [
      "dry"
    ],
    "traits": [
      "My flat, ground level mat shrugs off trampling and hard-packed soil",
      "my milky sap and low-moisture tolerance keep me going",
      "I thrive in bare, poor ground"
    ],
    "learningTraits": [
      "Flat, ground-level mat shrugs off trampling and firm soil",
      "milky sap and low-moisture tolerance maintain growth",
      "thrives in open, poor ground"
    ]
  },
  {
    "name": "Star of Bethlehem",
    "scientificName": "Ornithogalum umbellatum",
    "habitats": [
      "woodland",
      "wet"
    ],
    "traits": [
      "My underground bulb stores reserves that carry me through seasonally soggy, packed soil",
      "I tolerate the shade at the tree line",
      "my early-season growth beats the competition to the punch"
    ],
    "learningTraits": [
      "Underground bulb stores reserves through seasonally soggy, firm soil",
      "tolerates shade at tree lines",
      "early-season growth outpaces competition"
    ]
  },
  {
    "name": "Tall Hedge Mustard",
    "scientificName": "Sisymbrium loeselii",
    "habitats": [
      "roadside",
      "dry"
    ],
    "traits": [
      "My taproot suits packed roadside soil",
      "I tolerate low moisture",
      "I colonize bare, open ground quickly"
    ],
    "learningTraits": [
      "Taproot suits firm roadside soil",
      "tolerates low moisture",
      "colonizes open ground quickly"
    ]
  },
  {
    "name": "Toothed Spurge",
    "scientificName": "Euphorbia dentata",
    "habitats": [
      "dry"
    ],
    "traits": [
      "My milky sap and low-moisture tolerance keep grazers away and keep me going",
      "my branching habit suits open, hard-packed ground",
      "I colonize bare soil fast"
    ],
    "learningTraits": [
      "Milky sap and low-moisture tolerance deter grazers and maintain growth",
      "branching habit suits open, firm ground",
      "colonizes open soil quickly"
    ]
  },
  {
    "name": "Velvetleaf",
    "scientificName": "Abutilon theophrasti",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My deep taproot carries me through low moisture",
      "my large, soft, hairy leaves cut down on water loss",
      "I grow quickly on freshly tilled soil"
    ],
    "learningTraits": [
      "Deep taproot persists through low moisture",
      "large, soft, hairy leaves reduce water loss",
      "grows quickly on freshly tilled soil"
    ]
  },
  {
    "name": "Venice Mallow",
    "scientificName": "Hibiscus trionum",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My taproot tolerates low moisture",
      "I germinate quickly on bare soil after my seed coat is broken",
      "however, my hard seed coat survives field work and long dormancy"
    ],
    "learningTraits": [
      "Taproot tolerates low moisture",
      "germinates quickly on open soil once seed coat is broken",
      "hard seed coat survives field work and long dormancy"
    ]
  },
  {
    "name": "Water Smartweed",
    "scientificName": "Persicaria amphibia",
    "habitats": [
      "wetland",
      "wet"
    ],
    "traits": [
      "I tolerate fully saturated conditions, even standing water",
      "my roots sprout from nodes at or below the surface",
      "my internal air channels let me handle low-oxygen soil"
    ],
    "learningTraits": [
      "Tolerates fully saturated conditions, even standing water",
      "roots sprout from nodes at or below surface",
      "internal air channels handle low-oxygen soil"
    ]
  },
  {
    "name": "Waterhemp",
    "scientificName": "Amaranthus tuberculatus",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "I run C4 photosynthesis and tolerate heavy, soggy soil",
      "my lower stem nodes send out roots when conditions allow",
      "I produce seed prolifically on soggy, freshly worked ground"
    ],
    "learningTraits": [
      "C4 photosynthesis tolerates heavy, poorly drained soil",
      "lower stem nodes produce roots when conditions allow",
      "prolific seed production on soggy, freshly worked ground"
    ]
  },
  {
    "name": "White Campion",
    "scientificName": "Silene latifolia",
    "habitats": [
      "roadside",
      "dry"
    ],
    "traits": [
      "My deep taproot carries me through low moisture",
      "my hairy leaves cut down on water loss along exposed roadsides",
      "I colonize bare ground easily"
    ],
    "learningTraits": [
      "Deep taproot persists through low moisture",
      "hairy leaves reduce water loss along exposed roadsides",
      "colonizes open ground easily"
    ]
  },
  {
    "name": "Wild Buckwheat",
    "scientificName": "Fallopia convolvulus",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My twining vine climbs crop structure to reach light",
      "once established, I tolerate low moisture",
      "my hard seed coat survives field work"
    ],
    "learningTraits": [
      "Twining vine climbs crop structures to reach light",
      "tolerates low moisture once established",
      "hard seed coat survives field work"
    ]
  },
  {
    "name": "Wild Carrot",
    "scientificName": "Daucus carota",
    "habitats": [
      "roadside",
      "dry"
    ],
    "traits": [
      "My deep taproot carries me through low moisture",
      "my biennial rosette shrugs off regular mowing",
      "I colonize roadside soil readily"
    ],
    "learningTraits": [
      "Deep taproot persists through low moisture",
      "biennial rosette shrugs off regular mowing",
      "colonizes roadside soil readily"
    ]
  },
  {
    "name": "Wild Four-o'clock",
    "scientificName": "Mirabilis nyctaginea",
    "habitats": [
      "roadside",
      "dry"
    ],
    "traits": [
      "My deep, thickened taproot carries me through low moisture",
      "I tolerate packed roadside soil",
      "I regrow readily after mowing or field work"
    ],
    "learningTraits": [
      "Deep, thickened taproot persists through low moisture",
      "tolerates firm roadside soil",
      "regrows readily after mowing or field work"
    ]
  },
  {
    "name": "Wild Mustard",
    "scientificName": "Rhamphospermum arvense",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I germinate quickly on bare, freshly tilled soil",
      "my shallow roots suit freshly worked ground",
      "my cool-season growth lets me dodge the worst of a dry spell"
    ],
    "learningTraits": [
      "Germinates quickly on open, freshly tilled soil",
      "shallow roots suit freshly worked ground",
      "cool-season growth avoids peak drought"
    ]
  },
  {
    "name": "Wild Oat",
    "scientificName": "Avena fatua",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "My fibrous roots take advantage of early-season moisture",
      "I germinate fast on freshly worked soil",
      "my seed dormancy fits right into a field that's tilled regularly"
    ],
    "learningTraits": [
      "Fibrous roots exploit early-season moisture",
      "germinates fast on freshly worked soil",
      "seed dormancy fits a field that is tilled regularly"
    ]
  },
  {
    "name": "Wild Parsnip",
    "scientificName": "Pastinaca sativa",
    "habitats": [
      "roadside",
      "dry"
    ],
    "traits": [
      "My deep taproot carries me through low moisture",
      "my biennial rosette tolerates packed roadside soil",
      "my toxic sap keeps grazers away in exposed sites"
    ],
    "learningTraits": [
      "Deep taproot persists through low moisture",
      "biennial rosette tolerates firm roadside soil",
      "toxic sap deters grazers in exposed sites"
    ]
  },
  {
    "name": "Witchgrass",
    "scientificName": "Panicum capillare",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I run C4 photosynthesis suited to hot fields",
      "my fibrous roots establish quickly on bare soil",
      "I tolerate low moisture"
    ],
    "learningTraits": [
      "C4 photosynthesis suited to hot fields",
      "fibrous roots establish quickly on open soil",
      "tolerates low moisture"
    ]
  },
  {
    "name": "Woolly Cupgrass",
    "scientificName": "Eriochloa villosa",
    "habitats": [
      "cropland",
      "wet"
    ],
    "traits": [
      "My fibrous, shallow roots tolerate packed, moist soil",
      "I run C4 metabolism suited to warm-season, soggy fields",
      "I establish quickly on freshly worked ground"
    ],
    "learningTraits": [
      "Fibrous, shallow roots tolerate firm, moist soil",
      "C4 metabolism suited to warm-season, poorly drained fields",
      "establishes quickly on freshly worked ground"
    ]
  },
  {
    "name": "Yellow Foxtail",
    "scientificName": "Setaria pumila",
    "habitats": [
      "cropland",
      "dry"
    ],
    "traits": [
      "I run C4 photosynthesis suited to hot fields",
      "I germinate fast on bare soil",
      "my fibrous roots tolerate low moisture"
    ],
    "learningTraits": [
      "C4 photosynthesis suited to hot fields",
      "germinates fast on open soil",
      "fibrous roots tolerate low moisture"
    ]
  },
  {
    "name": "Yellow Nutsedge",
    "scientificName": "Cyperus esculentus",
    "habitats": [
      "wetland",
      "wet"
    ],
    "traits": [
      "My underground tubers tolerate saturated, low-oxygen soil",
      "my extensive network of underground stems spreads through packed, soggy ground",
      "I run C4 metabolism suited to warm wetlands"
    ],
    "learningTraits": [
      "Underground tubers tolerate saturated, low-oxygen soil",
      "extensive underground stem network spreads through firm, soggy ground",
      "C4 metabolism suited to warm wetlands"
    ]
  },
  {
    "name": "Yellow Rocket",
    "scientificName": "Barbarea vulgaris",
    "habitats": [
      "pasture",
      "wet"
    ],
    "traits": [
      "My stout deep taproot tolerates packed pasture soil",
      "I handle seasonal saturation without trouble",
      "my rosette resists grazing pressure"
    ],
    "learningTraits": [
      "Stout, deep taproot tolerates firm pasture soil",
      "handles seasonal saturation",
      "rosette resists grazing pressure"
    ]
  }
] as HabitatHome[];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const BY_NAME = new Map<string, HabitatHome>(HABITAT_HOMES.map((h) => [norm(h.name), h]));

export function getHabitatHome(commonName: string): HabitatHome | undefined {
  return BY_NAME.get(norm(commonName));
}

// Name aliases where the site's common name differs from the habitat list.
const ALIASES: Record<string, string> = {
  volunteersunflower: "commonsunflower",
  henbitpurpledeadnettle: "henbit",
  fallpanicumsmoothwitchgrass: "fallpanicum",
  burcucumber: "burcucumber",
};

export function resolveHabitatHome(commonName: string): HabitatHome | undefined {
  const key = norm(commonName);
  return BY_NAME.get(key) ?? BY_NAME.get(ALIASES[key] ?? "");
}

export const HABITAT_HOUSES: Array<{ id: HabitatId; label: string; blurb: string; shortBlurb: string }> = [
  {
    id: "cropland",
    label: "Cropland",
    blurb: "Tilled crop fields that get worked and planted every year.",
    shortBlurb: "Annually tilled, planted crop fields.",
  },
  {
    id: "pasture",
    label: "Pasture",
    blurb: "Grazed and mowed grassland where livestock feed.",
    shortBlurb: "Grazed, mowed grassland.",
  },
  {
    id: "roadside",
    label: "Roadside",
    blurb: "Gravelly, salty, mowed strips along roads and ditches.",
    shortBlurb: "Gravelly, mowed road margins.",
  },
  {
    id: "woodland",
    label: "Woodland Edge",
    blurb: "Shady tree lines and fencerows with dappled light.",
    shortBlurb: "Shaded tree lines and fencerows.",
  },
  {
    id: "wetland",
    label: "Wetland",
    blurb: "Saturated, low-oxygen ground that floods for part of the year.",
    shortBlurb: "Saturated, seasonally flooded ground.",
  },
  {
    id: "wet",
    label: "Wet & Compacted",
    blurb: "Heavy, poorly drained soil that stays soggy and packed down.",
    shortBlurb: "Heavy, soggy, packed soil.",
  },
  {
    id: "dry",
    label: "Dry & Disturbed",
    blurb: "Bare, hot, hard-packed ground that keeps getting torn up.",
    shortBlurb: "Bare, hot, disturbed ground.",
  },
];



/** Formal habitat definitions used by the Habitats & Climate learning modules (6-8 and up). */
export const HABITAT_DEFINITIONS: Record<HabitatId, string> = {
  cropland:
    "Land under active or recent cultivation for annual or perennial agronomic crops, characterized by periodic soil disturbance (tillage, planting, harvest), managed nutrient and moisture inputs, and open canopy conditions between crop rows that allow light penetration to the soil surface.",
  pasture:
    "Land maintained in perennial forage (grasses/legumes) for livestock grazing, subject to recurring defoliation pressure (grazing and/or mowing), generally undisturbed at the soil-profile level but with surface compaction and nutrient redistribution from animal traffic and manure deposition.",
  roadside:
    "The margin zone adjacent to paved or graveled transportation corridors, typically an engineered or graded substrate with poor structure, elevated salinity (from deicing agents), periodic mowing regimes, and exposure to vehicle-generated disturbance and runoff.",
  woodland:
    "The ecotone between closed-canopy forest and open habitat, marked by a light gradient (partial shade to full sun), altered microclimate (wind and temperature buffering), and soil influenced by leaf litter accumulation and tree root competition.",
  wetland:
    "Land where hydrology is the dominant site-forming factor, defined by periodic or permanent saturation or inundation, hydric soils with reduced (anaerobic) conditions below the surface, and vegetation adapted to low-oxygen root zones.",
  dry: "Sites with low available soil moisture (whether from climate, texture, or drainage) combined with a history of mechanical or physical disruption to the soil surface — tillage, grading, construction, erosion, or trampling — that removes existing vegetation and exposes bare mineral soil for colonization.",
  wet: "Sites where excess soil moisture (from poor drainage, flooding, or seasonal saturation) coincides with reduced soil porosity from compaction, typically caused by heavy equipment, foot or vehicle traffic, or livestock, resulting in restricted aeration, slower infiltration, and periodic standing water.",
};

const IRREGULAR: Record<string, string> = {
  am: "is",
  are: "is",
  have: "has",
  "don't": "does not",
  do: "does",
  go: "goes",
  can: "can",
  will: "will",
  may: "may",
  must: "must",
  could: "could",
  should: "should",
  would: "would",
};

function conjugate(verb: string): string {
  const lower = verb.toLowerCase();
  if (IRREGULAR[lower]) return IRREGULAR[lower];
  if (/(s|sh|ch|x|z|o)$/.test(lower)) return `${lower}es`;
  if (/[^aeiou]y$/.test(lower)) return `${lower.slice(0, -1)}ies`;
  return `${lower}s`;
}

/**
 * Rewrites the first-person game traits ("I tolerate shade", "my deep taproot")
 * into objective, third-person statements for the learning modules.
 */
export function objectiveTrait(trait: string): string {
  let out = trait
    .replace(/\bI'm\b/gi, "it is")
    .replace(/\bI've\b/gi, "it has")
    .replace(/\bI\s+([a-z']+)/g, (_m, v: string) => conjugate(v))
    .replace(/\bmyself\b/gi, "itself")
    .replace(/\bmy\b/gi, "its")
    .replace(/\bme\b/gi, "it")
    .replace(/\bmine\b/gi, "its");
  out = out.trim();
  return out.charAt(0).toUpperCase() + out.slice(1);
}

export function objectiveTraits(traits: string[]): string[] {
  return traits.map(objectiveTrait);
}
