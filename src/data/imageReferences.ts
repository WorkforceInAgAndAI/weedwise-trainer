/**
 * Image references keyed by "speciesFolder/filename"
 * e.g. "annual-ryegrass/seed_1.jpg"
 * Any image NOT listed here was sourced from iNaturalist.
 */

export interface ImageReference {
  image: string; // e.g. "annual-ryegrass/seed_1.jpg"
  citation: string;
}

const INATURALIST_CITATION = 'iNaturalist. Available from https://www.inaturalist.org. Accessed 4 Apr. 2026.';

const refs: Record<string, string> = {
  'annual-ryegrass/leaf_2.jpg': 'NC State Extension. (n.d.). Annual ryegrass | nc state extension publications. Retrieved June 21, 2026, from https://content.ces.ncsu.edu/annual-ryegrass',
  'annual-ryegrass/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Lolium Persicum (Persian Darnel). Fact sheet. 7 Nov. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/lolium-persicum.',
  'annual-ryegrass/seed_2.jpg': 'Annual ryegrass. (n.d.). Ernst Seeds. Retrieved June 21, 2026, from https://www.ernstseed.com/product/annual-ryegrass/',
  'annual-ryegrass/seedling_1.jpg': '“Annual Ryegrass.” Nufarm UK, Nufarm Global, https://nufarm.com/uk/annual-ryegrass/.',
  'annual-ryegrass/seedling_2.jpg': 'Sullivan, Cathryn A. O’, et al. “Biological Nitrification Inhibition by Weeds: Wild Radish, Brome Grass, Wild Oats and Annual Ryegrass Decrease Nitrification Rates in Their Rhizospheres.” Crop & Pasture Science, vol. 68, no. 8, Oct. 2017, pp. 798–804. DOI.org (Crossref), https://doi.org/10.1071/CP17243.',
  'Asian_copperleaf/seed_1.jpg': 'Iowa Plants. (n.d.). Acalypha virginica. Retrieved June 21, 2026, from http://iowaplants.com/flora/family/Euphorbiaceae/Acalypha/a_virginica/Acalypha_virginica.html',
  'Asian_copperleaf/seed_2.jpg': 'European and Mediterranean Plant Protection Organization. (n.d.). Acalypha australis (Accau)[photos]| eppo global database. EPPO Global Database. Retrieved June 20, 2026, from https://gd.eppo.int/taxon/ACCAU/photos',
  'Asian_copperleaf/seedling_1.jpg': '“Watch for Asian Copperleaf This Spring.” Integrated Crop Management, https://crops.extension.iastate.edu/cropnews/2023/05/watch-asian-copperleaf-spring. Accessed 1 Apr. 2026.',
  'Asiatic_dayflower/seed_1.jpg': 'Iowa Plants. (n.d.). Commelina communis. Retrieved June 21, 2026, from http://www.iowaplants.com/flora/family/Commelinaceae/commelina/ccommunis.html',
  'Asiatic_dayflower/seed_2.jpg': 'Nov 29, P., & MarshallLGP 1101, 2020 | Printable Version| Michael W. (n.d.). Herbicide options for benghal dayflower control in field crops. Land-Grant Press | Clemson University, South Carolina. Retrieved June 21, 2026, from https://lgpress.clemson.edu/publication/herbicide-options-for-benghal-dayflower-control-in-field-crops/',
  'Asiatic_dayflower/seedling_1.jpg': 'University of Missouri. (n.d.). Weed of the month: Asiatic dayflower(Kevin bradley). Integrated Pest Management. Retrieved June 21, 2026, from https://ipm.missouri.edu/croppest/2010/5/Weed-of-the-Month-Asiatic-Dayflower/index.cfm',
  'Asiatic_dayflower/seedling_2.jpg': 'Iowa State University Extension and Outreach. (2026, June 5). Asiatic dayflower. Integrated Crop Management. https://crops.extension.iastate.edu/encyclopedia/asiatic-dayflower',
  'barnyardgrass/seed_1.jpg': 'University of Missouri. (n.d.). Barnyardgrass // mizzou weedid. Division of Plant Sciences. Retrieved June 21, 2026, from https://weedid.missouri.edu/weedinfo.cfm?weed_id=98',
  'barnyardgrass/seedling_1.jpg': 'University of Missouri. (n.d.). Barnyardgrass // mizzou weedid. Division of Plant Sciences. Retrieved June 21, 2026, from https://weedid.missouri.edu/weedinfo.cfm?weed_id=98',
  'barnyardgrass/seedling_2.jpg': 'University of Missouri. (n.d.). Barnyardgrass // mizzou weedid. Division of Plant Sciences. Retrieved June 21, 2026, from https://weedid.missouri.edu/weedinfo.cfm?weed_id=98',
  'Buffalobur/seed_1.jpg': 'Solanum rostratum. (2011, December 1). Identification Tool to Weed Disseminules of California Central Valley Table Grape Production Areas. https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Sol-ros.html',
  'Buffalobur/seedling_1.jpg': 'University of Missouri Division of Plant Sciences. (n.d.). Buffalobur // mizzou weedid. Weed ID Guide. Retrieved June 21, 2026, from https://weedid.missouri.edu/weedinfo.cfm?weed_id=271',
  'Buffalobur/seedling_2.jpg': 'University of Minnesota. (n.d.). Strand Memorial Herbarium. College of Food, Agricultural and Natural Resource Sciences. Retrieved June 21, 2026, from http://herbarium.cfans.umn.edu/Detail.aspx?SpCode=568&LimitKeyword=',
  'Burcucumber/seed_1.jpg': 'Lady Bird Johnson Wildflower Center—The University of Texas at Austin. (n.d.). Retrieved June 21, 2026, from https://www.wildflower.org/gallery/result.php?id_image=27147',
  'Burcucumber/seed_2.jpg': 'Sicyos angulatus. (n.d.). Prairie Moon Nursery. Retrieved June 21, 2026, from https://www.prairiemoon.com/sicyos-angulatus-bur-cucumber',
  'canada-thistle/seed_1.jpg': 'B, Murali Krishna. “Weed Identification Using Convolution Neural Networks.” International Journal of Computer Communication and Informatics, vol. 5, no. 2, Dec. 2023, pp. 1–11. DOI.org (Crossref), https://doi.org/10.34256/ijcci2321.',
  'canada-thistle/seed_2.jpg': '(Canadian Food Inspection Agency, n.d.)',
  'canada-thistle/seedling_1.jpg': 'Thistle, Canada (Cirsium arvense)-selective control in crops. (2015, November 10). [Text]. Pacific Northwest Pest Management Handbooks. https://pnwhandbooks.org/weed/problem-weeds/thistle-canada-cirsium-arvense-selective-control',
  'canada-thistle/seedling_2.jpg': 'Canada Thistle | Weed identification guide for Ontario crops | ontario.ca. (2023, January 13). http://www.ontario.ca/document/weed-identification-guide-ontario-crops/canada-thistle',
  'caraway/seed_1.jpg': '“Caraway.” Plant Identification, https://plantsam.com/caraway/. Accessed 3 Apr. 2026.',
  'caraway/seed_2.jpg': 'September 25, 2024. (n.d.). Herb study – caraway | garden notes. University of California Agriculture and Natural Resources. Retrieved June 21, 2026, from https://ucanr.edu/blog/garden-notes/article/herb-study-caraway',
  'Catchweed_bedstraw/seed_1.jpg': 'Catchweed Bedstraw. https://smallgrains.wsu.edu/weed-resources/common-weed-list/catchweed-bedstraw/. Accessed 1 Apr. 2026.',
  'Catchweed_bedstraw/seedling_1.jpg': '“Catchweed Bedstraws and False Cleavers.” Weed Science, Cornell College of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/catchweed-bedstraws-and-false-cleavers. Accessed 1 Apr. 2026.',
  'Catchweed_bedstraw/seedling_2.jpg': '“Weed Biology Galium Aparine L.” Crop Protection Online    , Department of Agroecology, Aarhus University, https://plantevaernonline.dlbr.dk/cp/graphics/Name.asp?id=djf&Language=en-la&TaskID=1&DatasourceID=1&NameID=145.',
  'common-ragweed/seed_1.jpg': 'Common Ragweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=17. Accessed 3 Apr. 2026.',
  'common-ragweed/seedling_1.jpg': '“Common Ragweed.” Integrated Pest Management, https://www.canr.msu.edu/resources/common_ragweed1. Accessed 1 Apr. 2026.',
  'common-ragweed/seedling_2.jpg': '“Ragweed, Common.” SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/common-ragweed/. Accessed 1 Apr. 2026.',
  'Common_Burdock/seed_1.jpg': 'Common Burdock // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=30. Accessed 3 Apr. 2026.',
  'Common_Burdock/seedling_1.jpg': 'Common Burdock // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=30. Accessed 1 Apr. 2026.',
  'Common_Burdock/seedling_2.jpg': 'Common Burdock // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=30. Accessed 1 Apr. 2026.',
  'common_Cocklebur/seed_1.jpg': '“Weed Science.” Common Cocklebur Xanthium Strumarium L., Cornell College of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/common-cocklebur.',
  'common_Cocklebur/seedling_1.jpg': '“Cocklebur.” Getting Rid Of Weeds, https://growiwm.org/weeds/cocklebur/. Accessed 3 Apr. 2026.',
  'common_Cocklebur/seedling_2.jpg': '“Cocklebur.” Getting Rid Of Weeds, https://growiwm.org/weeds/cocklebur/. Accessed 3 Apr. 2026.',
  'Common_Mallow/seed_1.jpg': 'Common Mallow // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=169. Accessed 3 Apr. 2026.',
  'Common_Mallow/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Malva L. spp. Seed ID Guide.',
  'Common_Mallow/seedling_1.jpg': '“Common Mallow – Malva Neglecta.” Plant & Pest Diagnostics, https://www.canr.msu.edu/resources/common-mallow-malva-neglecta. Accessed 1 Apr. 2026.',
  'Common_Mallow/seedling_2.jpg': 'Common Mallow // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=169. Accessed 1 Apr. 2026.',
  'Common_mullein/seed_1.jpg': 'A Glimpse of Nature: Weeds in Winter — Mullein. Ames Free Library. https://amesfreelibrary.org/glimpse-nature-weeds-winter-mullein.',
  'Common_mullein/seed_2.jpg': 'SDSU Extension. Common Mullein and Houndstongue Have Germinated in the Black Hills and Surrounding Areas West River. https://extension.sdstate.edu/common-mullein-and-houndstongue-have-germinated-black-hills-and-surrounding-areas-west-river.',
  'Common_mullein/seedling_2.jpg': 'The Ohio State University Weed Guide. Common Mullein. https://weedguide.cfaes.osu.edu/singlerecord.asp?id=78.',
  'common_Milkweed/seed_1.jpg': '“9 Wild Facts about Milkweeds.” Gulo in Nature, 5 Aug. 2022, https://guloinnature.com/9-wild-facts-about-milkweeds/.',
  'Common_teasel/seed_1.jpg': 'Common Teasel | Minnesota Department of Agriculture. https://www.mda.state.mn.us/plants/pestmanagement/weedcontrol/noxiouslist/commonteasel. Accessed 3 Apr. 2026.',
  'Common_teasel/seedling_1.jpg': 'Common Teasel // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=95. Accessed 1 Apr. 2026.',
  'Common_teasel/seedling_2.jpg': 'Dipsacus Fullonum...Fullers Teasel...Common Teasel...Roots for Tincture, Leaves as Infusion (Plants Forum at Permies). https://permies.com/t/222576/Dipsacus-fullonum-fullers-teasel-common. Accessed 1 Apr. 2026.',
  'CommonChickweed/seed_1.jpg': 'Common Chickweed, Stellaria Media (L.) Vill. https://friendsofeloisebutler.org/pages/plants/commonchickweed.html. Accessed 1 Apr. 2026.',
  'commonPokeweed/seed_1.jpg': 'Common Pokeweed: Phytolacca Americana (Caryophyllales: Phytolaccaceae): Invasive Plant Atlas of the United States. https://www.invasiveplantatlas.org/subject.cfm?sub=6167. Accessed 1 Apr. 2026.',
  'Corn_speedwell/seed_1.jpg': 'Veronica Arvensis. https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Vero-arv.html. Accessed 1 Apr. 2026.',
  'Corn_speedwell/seed_2.jpg': 'Veronica arvensis. (n.d.). Identification Tool to Weed Disseminules of California Central Valley Table Grape Production Areas. Retrieved June 21, 2026, from https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Vero-arv.html',
  'Curly_dock/seed_1.jpg': 'Curly Dock. https://www.agry.purdue.edu/courses/agry105/restricted/curlydock.htm. Accessed 1 Apr. 2026.',
  'Curly_dock/seedling_1.jpg': '“Curly Dock – Rumex Crispus.” Plant & Pest Diagnostics, https://www.canr.msu.edu/resources/curly-dock-rumex-crispus. Accessed 1 Apr. 2026.',
  'Curly_dock/seedling_2.jpg': 'Curly Dock // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=246. Accessed 1 Apr. 2026.',
  'Dandelion/seed_1.jpg': 'Dandelion | Turfgrass and Landscape Weed ID. https://turfweeds.cals.cornell.edu/plant/dandelion. Accessed 3 Apr. 2026.',
  'Dandelion/seed_2.jpg': 'Smithsonian. (n.d.). Habitat of Flight Spreading Their Seeds.',
  'Dandelion/seedling_2.jpg': '“Dandelion – Taraxacum Officinale.” Plant & Pest Diagnostics, https://www.canr.msu.edu/resources/dandelion-taraxacum-officinale. Accessed 1 Apr. 2026.',
  'Downy_brome/leaf_2.jpg': 'Downy Brome | Weed identification guide for Ontario crops | ontario.ca. (2023, January 13). http://www.ontario.ca/document/weed-identification-guide-ontario-crops/downy-brome',
  'Downy_brome/seed_1.jpg': '“Common Weeds: Agronomy 105’s Weed ID.” Downy Bromegrass, https://www.agry.purdue.edu/courses/agry105/common/dbromegrass.htm. Accessed 1 Apr. 2026.',
  'Downy_brome/seed_2.jpg': 'Oregon State University. (n.d.). How to Manage Cheatgrass. Solve Pest Problems. Retrieved June 21, 2026, from https://solvepestproblems.oregonstate.edu/weeds/cheatgrass',
  'Downy_brome/seedling_1.jpg': 'Downy Brome // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=43. Accessed 1 Apr. 2026.',
  'Downy_brome/seedling_2.jpg': 'Image: Seedling of Downy Brome (Cheatgrass), Bromus Tectorum, at the Three-Leaf Stage. Credit: Jack Kelly Clark, UC IPM (W-GM-BTEC-SG.001). https://ipm.ucanr.edu/PMG/B/W-GM-BTEC-SG.001.html#gsc.tab=0. Accessed 1 Apr. 2026.',
  'Eastern_black_nightshade/seed_1.jpg': 'Eastern Black Nightshade // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=270. Accessed 1 Apr. 2026.',
  'Eastern_black_nightshade/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Solanum emulans Raf. Seed ID Guide.',
  'Eastern_black_nightshade/seedling_1.jpg': 'Weed of the Month: Eastern Black Nightshade (Kevin Bradley). https://ipm.missouri.edu/cropPest/2011/6/weed-of-the-month-eastern-black-nightshade/. Accessed 1 Apr. 2026.',
  'Eastern_black_nightshade/seedling_2.jpg': '“Black Nightshade.” Crop Science | New Zealand, Bayer Group, https://www.cropscience.bayer.co.nz/pests/weeds/black-nightshade. Accessed 3 Apr. 2026.',
  'False_London-rocket/leaf_1.jpg': 'University of Arizona. (n.d.). London rocket | AZ invasive plants. Retrieved June 21, 2026, from https://azinvasiveplants.arizona.edu/invasive-plant/london-rocket',
  'False_London-rocket/leaf_2.jpg': 'University of Arizona. (n.d.). London rocket | AZ invasive plants. Retrieved June 21, 2026, from https://azinvasiveplants.arizona.edu/invasive-plant/london-rocket',
  'False_London-rocket/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Sisymbrium Loeselii (Tall Hedge Mustard). Fact sheet. 7 Nov. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/sisymbrium-loeselii.',
  'False_London-rocket/seed_2.jpg': 'University of California Agriculture and Natural Resources. (2026, January). London rocket / weeds identification gallery . Intergrated Pest Management. https://ipm.ucanr.edu/weeds-identification-gallery/london-rocket/',
  'False_London-rocket/seedling_1.jpg': 'Kenraiz, Krzysztof Ziarnek. English:  Sisymbrium Loeselii Seedling, Szczecin, NW Poland. 28 Mar. 2019, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Sisymbrium_loeselii_kz09.jpg.',
  'False_London-rocket/seedling_2.jpg': 'Image: Seedling of London Rocket Credit: Jack Kelly Clark, UC IPM (W-CF-SIRI-SG.003). https://ipm.ucanr.edu/PMG/S/W-CF-SIRI-SG.003.html#gsc.tab=0. Accessed 3 Apr. 2026.',
  'Field_bindweed/leaf_2.jpg': 'Saha, D. (2020, May 6). How to identify field bindweed in Christmas tree production – Part 1. Michigan State University Extension. https://www.canr.msu.edu/news/how-to-identify-field-bindweed-in-christmas-tree-production-part-1',
  'Field_bindweed/seed_1.jpg': 'Field Bindweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=72. Accessed 1 Apr. 2026.',
  'Field_bindweed/seed_2.jpg': 'International Seed Morphology Association Seed ID Guide. (n.d.). Convolvulus Arvensis L.',
  'Field_bindweed/seedling_1.jpg': '“Field Bindweed – Convolvulus Arvensis.” Plant & Pest Diagnostics, https://www.canr.msu.edu/resources/field-bindweed-convolvulus-arvensis. Accessed 1 Apr. 2026.',
  'Field_bindweed/seedling_2.jpg': 'Field Bindweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=72. Accessed 1 Apr. 2026.',
  'Field_Horsetail/seed_2.jpg': 'Flies, J., & Hill, E. (n.d.). Field Horsetail: A Plant As Old As Time. Michigan State University. Plant & Pest Diagnostics. Retrieved June 21, 2026, from https://www.canr.msu.edu/resources/field-horsetail-a-plant-as-old-as-time',
  'Field_Pennycress/leaf_2.jpg': 'Jones, E., Rozeboom, P., Shires, M., Tande, C., Alms, J., & Vos, D. (2024, May 20). Early Season Prevalence of Field Pennycress and Shepherd’s Purse. South Dakota State University Extension .',
  'Field_Pennycress/seed_1.jpg': 'Field Pennycress // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=285. Accessed 1 Apr. 2026.',
  'Field_Pennycress/seed_2.jpg': 'Thlaspi arvense L. (n.d.). USDA Plants Database. Retrieved June 21, 2026, from https://plants.sc.egov.usda.gov/plant-profile/THAR5',
  'Field_Pennycress/seedling_1.jpg': 'Iowa State University Extension and Outreach. (2026, June 5). Field pennycress. Integrated Crop Management. https://crops.extension.iastate.edu/encyclopedia/field-pennycress',
  'Field_Pennycress/seedling_2.jpg': '“Field Pennycress.” SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/field-pennycress/. Accessed 1 Apr. 2026.',
  'Foxtail_barley/leaf_2.jpg': 'University of Missouri Division of Plant Sciences. (n.d.). Foxtail barley. Weed ID Guide. Retrieved June 21, 2026, from https://weedid.missouri.edu/weedinfo.cfm?weed_id=349',
  'Foxtail_barley/ligu_1.jpg': 'Foxtail Barley // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=349. Accessed 3 Apr. 2026.',
  'Foxtail_barley/ligu_2.jpg': 'Foxtail Barley | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/grasses-parent/grasses-pages-perennials/foxtail-barley.html. Accessed 1 Apr. 2026.',
  'Foxtail_barley/seed_1.jpg': '“Seeds.” Tennessee Council for Professional Archaeology, 11 Sept. 2015, https://tennesseearchaeologycouncil.wordpress.com/tag/seeds/.',
  'Foxtail_barley/seedling_1.jpg': 'Foxtail, Green in Barley | Syngenta Canada. https://www.syngenta.ca/pests/weed/foxtail--green/barley. Accessed 1 Apr. 2026.',
  'Foxtail_barley/seedling_2.jpg': '“Foxtails.” SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/foxtails/. Accessed 1 Apr. 2026.',
  'Garlic_mustard/seed_2.jpg': 'Becker, R., Gerber, E., Hinz, H. L., Katovich, E., Brendon, P., Reardon, R., Renz, M., & Van Riper, L. (2015). Biology and Biological Control of Garlic Mustard. Biological Control.',
  'Garlic_mustard/seedling_1.jpg': '“Alliaria Petiolata.” Plant Identification, https://plantsam.com/alliaria-petiolata/. Accessed 1 Apr. 2026.',
  'Garlic_mustard/seedling_2.jpg': 'Ohio Weedguide. https://weedguide.cfaes.osu.edu/singlerecord.asp?id=80. Accessed 3 Apr. 2026.',
  'giant-foxtail/leaf_2.jpg': 'Giant Foxtail (Setaria faberi). (n.d.). Illinois Wildflowers Info. Retrieved June 21, 2026, from https://www.illinoiswildflowers.info/grasses/plants/giant_foxtail.htm',
  'giant-foxtail/seed_1.jpg': 'Giant Foxtail. https://www.agry.purdue.edu/courses/agry105/restricted/gfoxtail.htm. Accessed 1 Apr. 2026.',
  'giant-foxtail/seed_2.jpg': 'Giant Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=256. Accessed 1 Apr. 2026.',
  'giant-foxtail/seedling_1.jpg': 'Giant Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=256. Accessed 1 Apr. 2026.',
  'giant-foxtail/seedling_2.jpg': 'Giant Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=256. Accessed 1 Apr. 2026.',
  'giant-ragweed/seed_1.jpg': 'Giant Ragweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=18. Accessed 1 Apr. 2026.',
  'giant-ragweed/seedling_1.jpg': '“Giant Ragweed.” Integrated Crop Management, 1 May 2020, https://crops.extension.iastate.edu/encyclopedia/giant-ragweed.',
  'giant-ragweed/seedling_2.jpg': 'Weed Seed: Ambrosia trifida (Giant ragweed). (n.d.). Canadian Food Inspection Agency.',
  'golden-alexanders/seed_1.jpg': '“Golden Alexanders, PA Ecotype.” Ernst Seeds, https://www.ernstseed.com/product/golden-alexanders-pa-ecotype/. Accessed 3 Apr. 2026.',
  'golden-alexanders/seed_2.jpg': 'Heart-leaf golden alexanders (Zizia aptera) six-pack plugs | native perennial for pollinators. (n.d.). MNL Corp. Retrieved June 21, 2026, from https://mnlcorp.com/product/heart-leaf-golden-alexanders-six-pack-plugs/',
  'golden-alexanders/seedling_1.jpg': 'Golden Alexanders (Zizia Aurea) Six-Pack Plugs | Versatile Native Perennial. https://mnlcorp.com/product/golden-alexanders-six-pack-plugs/. Accessed 1 Apr. 2026.',
  'golden-alexanders/seedling_2.jpg': '“Golden Alexanders (Zizia Aurea).” Plant Database, garden.org, https://garden.org/plants/photo/460988/.',
  'Goosegrass/seed_1.jpg': 'Goosegrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=103. Accessed 1 Apr. 2026.',
  'Goosegrass/seed_2.jpg': 'Petelewicz, P., & Macdonald, G. E. (n.d.). Identification, biology, and management of goosegrass [eleusine indica (L.) gaertn. ] In Florida turfgrasses. Ask IFAS - Powered by EDIS. Retrieved June 21, 2026, from https://ask.ifas.ufl.edu/publication/AG483',
  'Goosegrass/seedling_1.jpg': 'Goosegrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=103. Accessed 1 Apr. 2026.',
  'Goosegrass/seedling_2.jpg': 'Eleusine Indica. https://herbarium.ncsu.edu/containerWeeds/Eleusine_indica.htm. Accessed 1 Apr. 2026.',
  'green-foxtail/seed_1.jpg': 'Green Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=258. Accessed 1 Apr. 2026.',
  'green-foxtail/seed_2.jpg': 'Iowa State University Extension and Outreach. (2026, June 5). Green foxtail. Integrated Crop Management. https://crops.extension.iastate.edu/encyclopedia/green-foxtail',
  'green-foxtail/seedling_1.jpg': 'Green Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=258. Accessed 1 Apr. 2026.',
  'green-foxtail/seedling_2.jpg': 'Weed of the Month: The Foxtails (Kevin Bradley). https://ipm.missouri.edu/cropPest/2014/5/Weed-of-the-Month-the-Foxtails/. Accessed 1 Apr. 2026.',
  'Ground_ivy/seed_1.jpg': 'USDA Plants Database. https://plants.sc.egov.usda.gov/plant-profile/glhe2. Accessed 1 Apr. 2026.',
  'Ground_ivy/seed_2.jpg': 'Ohio Weedguide. https://weedguide.cfaes.osu.edu/singlerecord.asp?id=58. Accessed 1 Apr. 2026.',
  'Ground_ivy/seedling_1.jpg': 'Ohio Weedguide. https://weedguide.cfaes.osu.edu/singlerecord.asp?id=58. Accessed 1 Apr. 2026.',
  'Ground_ivy/seedling_2.jpg': 'Kenraiz, Krzysztof Ziarnek. English:  Glechoma Hederacea Seedling in Leśno Górne near Szczecin, NW Poland. 12 May 2019, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Glechoma_hederacea_kz03.jpg.',
  'Hedge_bindweed/seed_1.jpg': 'Hedge Bindweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=45. Accessed 1 Apr. 2026.',
  'Hedge_bindweed/seed_2.jpg': 'Calystegia Sepium (L.) R. Br. (n.d.). International Seed Morphology Association Seed ID Guide.',
  'Hedge_bindweed/seedling_1.jpg': 'Salicyna. Polski:  Kielisznik Zaroślowy (Calystegia Sepium) - Siewka, Ogródek Działkowy w Lublinie. 1 May 2018, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Calystegia_sepium_2018-05-01_0033.jpg.',
  'Hedge_bindweed/seedling_2.jpg': 'Bindweeds: Field and Hedge Bindweed | Cornell Weed Identification. https://blogs.cornell.edu/weedid/859-2/. Accessed 1 Apr. 2026.',
  'Hemp_dogbane/male.jpg': 'Learn how to identify cannabis hermies, pollen sacs & bananas. (n.d.). Grow Weed Easy. Retrieved June 21, 2026, from https://www.growweedeasy.com/cannabis-plant-problems/male-plants-hermies-bananas',
  'Hemp_dogbane/seed_1.jpg': 'Hemp Dogbane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=26. Accessed 1 Apr. 2026.',
  'Hemp_dogbane/seed_2.jpg': 'The Ohio State University College of Food, Agricultural, and Environmental Sciences. (n.d.). Hemp Dogbane. Ohio Perennial and Biennial Weed Guide. Retrieved June 21, 2026, from https://weedguide.cfaes.osu.edu/singlerecord.asp?id=40',
  'Hemp_dogbane/seedling_1.jpg': 'Hemp Dogbane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=26. Accessed 1 Apr. 2026.',
  'Hemp_dogbane/seedling_2.jpg': 'Hemp Dogbane | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/broadleaf-weeds-parent/broadleaf-pages4/hemp-dogbane.html. Accessed 1 Apr. 2026.',
  'Henbit_deadnettle/seed_1.jpg': 'Henbit Deadnettle, Lamium Amplexicaule L. https://www.friendsofeloisebutler.org/pages/plants/henbitdeadnettle.html. Accessed 1 Apr. 2026.',
  'Henbit_deadnettle/seed_2.jpg': 'Henbit / weeds identification gallery. (2025, November). University of California Integrated Pest Management. https://ipm.ucanr.edu/weeds-identification-gallery/henbit/',
  'Honey-vine_climbing_milkweed/seed_1.jpg': 'Honeyvine Milkweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=19. Accessed 1 Apr. 2026.',
  'Honey-vine_climbing_milkweed/seed_2.jpg': 'The Ohio State University College of Food, Agricultural, and Environmental Sciences. (n.d.). Ohio Perrennial and Biennial Weed Guide. Retrieved June 22, 2026, from https://weedguide.cfaes.osu.edu/singlerecord.asp?id=71',
  'Honey-vine_climbing_milkweed/seedling_1.jpg': 'Honeyvine Milkweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=19. Accessed 1 Apr. 2026.',
  'Honey-vine_climbing_milkweed/seedling_2.jpg': 'Honeyvine Milkweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=19. Accessed 3 Apr. 2026.',
  'horsenettle/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Solanum Carolinense (Horse Nettle). 6 Nov. 2014, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/solanum-carolinense.',
  'horsenettle/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Solanum carolinense L. Seed ID Guide.',
  'horsenettle/seedling_1.jpg': 'Horsenettle // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=266. Accessed 1 Apr. 2026.',
  'horsenettle/seedling_2.jpg': 'Carolina Horsenettle | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/broadleaf-weeds-parent/broadleaf-pages/carolina-horsenettle.html. Accessed 1 Apr. 2026.',
  'Horseweed/seed_1.jpg': '“Marestail (Horseweed).” Weeds, https://www.canr.msu.edu/weeds/extension/marestail-horseweed. Accessed 1 Apr. 2026.',
  'Horseweed/seed_2.jpg': 'Hill, E. (2016, August 8). Time to collect weed samples for resistance screening is almost here. Michican State University Extension. https://www.canr.msu.edu/news/time_to_collect_weed_samples_for_resistance_screening_is_almost_here',
  'Horseweed/seedling_1.jpg': '“Weed Science Horseweed.” Conyza Canadensis (L.) Cronquist = Erigeron Canadensis L., https://cals.cornell.edu/weed-science/weed-profiles/horseweed. Accessed 1 Apr. 2026.',
  'Horseweed/seedling_2.jpg': 'Horseweed - Agricultural Solutions. https://www.agro.basf.co.ke/en/Services/Pest-Overview/Weeds/Broadleaf-weeds/Horseweed/. Accessed 1 Apr. 2026.',
  'Jimsonweed/seed_1.jpg': 'Jimsonweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=84. Accessed 1 Apr. 2026.',
  'Jimsonweed/seed_2.jpg': 'Weed Seed: Datura stramonium (Jimsonweed). (n.d.). Canadian Food Inspection Agency . Retrieved https://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/datura-stramonium',
  'Jimsonweed/seedling_2.jpg': '“Weed Science Jimsonweed.” Datura Stramonium L., Cornell College of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/jimsonweed. Accessed 1 Apr. 2026.',
  'johnsongrass/leaf_2.jpg': 'Oregon State University. (2026, April 3). How to Manage Johnsongrass. Solve Pest Problems. https://solvepestproblems.oregonstate.edu/weeds/johnsongrass',
  'johnsongrass/seed_1.jpg': 'Johnsongrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=275. Accessed 1 Apr. 2026.',
  'johnsongrass/seed_2.jpg': 'Weed Seed: Sorghum halepense (Johnson grass). (https://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/sorghum-halepense). Canadian Food Inspection Agency.',
  'johnsongrass/seedling_1.jpg': 'Johnsongrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=275. Accessed 1 Apr. 2026.',
  'johnsongrass/seedling_2.jpg': 'Johnsongrass / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/johnsongrass/. Accessed 1 Apr. 2026.',
  'kochia/seed_1.jpg': 'Kochia // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=148. Accessed 1 Apr. 2026.',
  'kochia/seed_2.jpg': 'Washington State Recreation and Conservation Office. (n.d.). Kochia. Washington Invasive Species Council. Retrieved June 22, 2026, from https://invasivespecies.wa.gov/kochia/',
  'kochia/seedling_1.jpg': '“Kochia.” SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/kochia/. Accessed 1 Apr. 2026.',
  'kochia/seedling_2.jpg': 'Kochia in Wheat | Syngenta Canada. https://www.syngenta.ca/pests/weed/kochia/wheat. Accessed 1 Apr. 2026.',
  'Ladysthumb/seed_1.jpg': 'Ladysthumb // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=224. Accessed 1 Apr. 2026.',
  'Ladysthumb/seed_2.jpg': 'Ladysthumb / Weeds Identification Gallery . (2024, November). University of Califronia Intergrated Pest Management. https://ipm.ucanr.edu/weeds-identification-gallery/ladysthumb/',
  'Ladysthumb/seedling_1.jpg': '“Weeds of Australia .” Fact Sheet Index, Identic Pty Ltd., https://keyserver.lucidcentral.org/weeds/data/media/Html/persicaria_maculosa.htm.',
  'Ladysthumb/seedling_2.jpg': 'Kenraiz, Krzysztof Ziarnek. English:  Persicaria Maculosa Seedling. Vicinity of Golczewo, NW Poland. 27 June 2019, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Persicaria_maculosa_kz01.jpg.',
  'lambsquarters/seed_1.jpg': 'Searching for the Lost Traits of an Extinct Crop | Society of Ethnobiology. https://ethnobiology.org/forage/blog/searching-lost-traits-extinct-crop. Accessed 1 Apr. 2026.',
  'lambsquarters/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Chenopodium L. spp. . Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/32126/',
  'lambsquarters/seedling_1.jpg': '“Common Lambsquarters.” Integrated Pest Management, https://www.canr.msu.edu/resources/common_lambsquarters. Accessed 1 Apr. 2026.',
  'lambsquarters/seedling_2.jpg': '“Common Lambsquarters.” Integrated Crop Management, 1 May 2020, https://crops.extension.iastate.edu/encyclopedia/common-lambsquarters.',
  'large-crabgrass/seed_1.jpg': 'Large Crabgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=89. Accessed 1 Apr. 2026.',
  'large-crabgrass/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Digitaria sanguinalis (L.) Scop. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/31670/',
  'large-crabgrass/seedling_1.jpg': 'Large Crabgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=89. Accessed 1 Apr. 2026.',
  'large-crabgrass/seedling_2.jpg': 'Large Crabgrass / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/large-crabgrass/. Accessed 1 Apr. 2026.',
  'Longspine_sandbur/leaf_2.jpg': 'Longspine sandbur(Cenchrus longispinus (hack. ) Fern). (2026, June 23). Invasive.Org. https://www.invasive.org/browse/image/5362341',
  'Longspine_sandbur/seed_1.jpg': 'Washington State Noxious Weed Control Board. https://www.nwcb.wa.gov/weeds/longspine-sandbur. Accessed 3 Apr. 2026.',
  'Longspine_sandbur/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Cenchrus longispinus (Hack.) Fernald. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/cenchrus-longispinus/',
  'Marijuana/seed_1.jpg': 'Nelson, Dan. “What Do Cannabis Seeds Look Like?” Happy Valley Genetics, 8 Aug. 2024, https://happyvalleygenetics.com/resources/what-do-cannabis-seeds-look-like/.',
  'Marijuana/seed_2.jpg': 'Strzelczyk, M., Lochynska, M., & Chudy, M. (2022). Systematics and botanical characteristics of industrial hemp cannabis sativa l. Journal of Natural Fibers, 19(13), 5804–5826. https://doi.org/10.1080/15440478.2021.1889443',
  'Marijuana/seedling_1.jpg': 'The Natural Life Cycle of Cannabis in the Wild - Cannabis College. 8 Dec. 2022, https://cannabiscollege.com/knowledge-base/cannabis-cultivation/life-cycle-cannabis-wild/.',
  'Marijuana/seedling_2.jpg': 'Growing Autoflowering Cannabis: Discover All the Secrets. https://www.linda-seeds.com/en/home-grow/beginners-infos/how-to-grow-autoflowers-part-2-vegetative-and-flowering. Accessed 3 Apr. 2026.',
  'morningglory/seed_1.jpg': 'Ivyleaf Morningglory // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=138. Accessed 1 Apr. 2026.',
  'morningglory/seed_2.jpg': 'Ipomoea L. spp. (n.d.). [International Seed Morphology Association]. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/32219/',
  'morningglory/seedling_1.jpg': 'Ivyleaf Morningglory // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=138. Accessed 1 Apr. 2026.',
  'morningglory/seedling_2.jpg': '“Ivyleaf Morningglory.” Integrated Pest Management, https://www.canr.msu.edu/resources/ivyleaf_morningglory1. Accessed 1 Apr. 2026.',
  'Mouseear_chickweed/leaf_1.jpg': 'Cerastium fontanum. (n.d.). Missouri Plants. Retrieved June 22, 2026, from https://www.missouriplants.com/Cerastium_fontanum_page.html',
  'Mouseear_chickweed/leaf_2.jpg': 'Cerastium fontanum, Common Mouse-ear. (n.d.). Free Nature Images. Retrieved June 22, 2026, from https://www.freenatureimages.eu/plants/flora%20c/Cerastium%20fontanum%2C%20Common%20Mouse-ear/index.html#Cerastium%2520fontanum%2520ssp%2520holosteoides%252021%252C%2520Glanzige%2520hoornbloem%252C%2520Saxifraga-Sonja%2520Bouwman.JPG',
  'Mouseear_chickweed/seed_1.jpg': 'Mouseear Chickweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=57. Accessed 1 Apr. 2026.',
  'Mouseear_chickweed/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Cerastium L. spp. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/cerastium-spp/',
  'Mouseear_chickweed/seedling_2.jpg': '“Crop Science | New Zealand.” Bayer Group, Bayer AG, https://www.cropscience.bayer.co.nz/pests/weeds/mouse-eared-chickweed.',
  'Musk_thistle/seed_1.jpg': 'Musk Thistle // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=49. Accessed 1 Apr. 2026.',
  'Musk_thistle/seed_2.jpg': 'International Seed Morpholgoy Association. (n.d.). Carduus nutans L. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/carduus-nutans-l/',
  'Musk_thistle/seedling_1.jpg': 'Lamb, Bruce Ackley &. Alyssa, and Bruce Ackley. Musk Thistle. ohiostate.pressbooks.pub, https://ohiostate.pressbooks.pub/ohionoxiousweeds/chapter/musk-thistle/. Accessed 1 Apr. 2026.',
  'Musk_thistle/seedling_2.jpg': 'Musk Thistle - Plant Identification by Pamela Borden Trewatha, Ph.D. - Darr College of Agriculture - Missouri State. https://Ag.MissouriState.edu/PBTrewatha/musk-thistle.htm. Accessed 1 Apr. 2026.',
  'Nimblewill/leaf_2.jpg': 'Nimblewill Ohio Perennial and Biennial Weed Guide. (n.d.). The Ohio State University College of Food, Agriculture, and Environmental Science. Retrieved June 22, 2026, from https://weedguide.cfaes.osu.edu/singlerecord.asp?id=83',
  'Nimblewill/seed_1.jpg': 'Nimblewill | Turfgrass and Landscape Weed ID. https://turfweeds.cals.cornell.edu/plant/nimblewill. Accessed 3 Apr. 2026.',
  'Nimblewill/seed_2.jpg': 'Nimblewill Ohio Perennial and Biennial Weed Guide. (n.d.). The Ohio State University College of Food, Agriculture, and Environmental Science. Retrieved June 22, 2026, from https://weedguide.cfaes.osu.edu/singlerecord.asp?id=83',
  'Nimblewill/seedling_1.jpg': 'Nimblewill. https://u.osu.edu/osuweeds/weed-id/grasses/nimblewill/. Accessed 3 Apr. 2026.',
  'Nimblewill/seedling_2.jpg': 'Nimblewill // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=181. Accessed 3 Apr. 2026.',
  'palmer-amaranth/seed_1.jpg': '“Management of Glyphosate-Resistant Palmer Amaranth in Corn and Soybean in New York.” Weed Science, https://cals.cornell.edu/weed-science/herbicides/management-of-glyphosate-resistant-palmer-amaranth-corn-and-soybean-new-york. Accessed 1 Apr. 2026.',
  'palmer-amaranth/seed_2.jpg': 'Amaranthus palmeri. (n.d.). Identification Tool to Weed Disseminules of California Central Valley Table Grape Production Area. Retrieved June 22, 2026, from https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Ama-pal.html',
  'palmer-amaranth/seedling_1.jpg': 'Lamb, Bruce Ackley &. Alyssa, and Bruce Ackley. Palmer Amaranth. ohiostate.pressbooks.pub, https://ohiostate.pressbooks.pub/ohionoxiousweeds/chapter/palmer-amaranth/. Accessed 1 Apr. 2026.',
  'palmer-amaranth/seedling_2.jpg': 'Hager, Aaron. “Is It Waterhemp or Palmer Amaranth?” Farmdoc, 5 June 2013, https://farmdoc.illinois.edu/field-crop-production/weeds/923.html.',
  'pennsylvania-smartweed/leaf_2.jpg': 'Persicaria pensylvanica. (n.d.). Missouri Plants. Retrieved June 22, 2026, from https://www.missouriplants.com/Persicaria_pensylvanica_page.html',
  'pennsylvania-smartweed/seed_1.jpg': 'Pennsylvania Smartweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=225. Accessed 1 Apr. 2026.',
  'pennsylvania-smartweed/seed_2.jpg': 'The University of Texas at Austin. (n.d.). Lady bird johnson wildflower center . Retrieved June 22, 2026, from https://www.wildflower.org/gallery/result.php?id_image=87600',
  'pennsylvania-smartweed/seedling_1.jpg': 'Pennsylvania Smartweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=225. Accessed 1 Apr. 2026.',
  'pennsylvania-smartweed/seedling_2.jpg': 'Pennsylvania Smartweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=225. Accessed 1 Apr. 2026.',
  'Pinnate_tansymustard/leaf_2.jpg': 'Descurainia pinnata page. (n.d.). Missouri Plants. Retrieved June 22, 2026, from https://www.missouriplants.com/Descurainia_pinnata_page.html',
  'Pinnate_tansymustard/seed_1.jpg': 'Tansy Mustard // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=373. Accessed 1 Apr. 2026.',
  'Pinnate_tansymustard/seed_2.jpg': 'Descurainia sophia. (n.d.). Identification Tool to Weed Disseminules of California Central Valley Table Grape Production Areas. Retrieved June 22, 2026, from https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Des-sop.html',
  'Pinnate_tansymustard/seedling_1.jpg': 'Pinnate Tansymustard | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/broadleaf-weeds-parent/broadleaf-pages7/pinnate-tansymustard.html. Accessed 1 Apr. 2026.',
  'poison-hemlock/leaf_2.jpg': 'Iowa State University Extension and Outreach. (2026, June 8). Poison hemlock. Integrated Crop Management. https://crops.extension.iastate.edu/encyclopedia/poison-hemlock',
  'poison-hemlock/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Conium Maculatum (Poison Hemlock). Fact sheet. 16 Oct. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/conium-maculatum.',
  'poison-hemlock/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Conium maculatum L. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/conium-maculatum/',
  'poison-hemlock/seedling_1.jpg': 'Poison Hemlock / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/poison-hemlock/. Accessed 1 Apr. 2026.',
  'poison-hemlock/seedling_2.jpg': '“Poisonous Hemlock (Conium Maculatum).” Horticulture For Home Gardeners, 6 Sept. 2021, https://horticultureforhomegardeners.ca/2021/09/06/poisonous-hemlock-conium-maculatum/.',
  'Prickly_lettuce/leaf_1.jpg': 'Prickly lettuce . (n.d.). NC State Extension Publications. Retrieved June 22, 2026, from https://content.ces.ncsu.edu/prickly-lettuce',
  'Prickly_lettuce/leaf_2.jpg': 'Prickly lettuce . (n.d.). NC State Extension Publications. Retrieved June 22, 2026, from https://content.ces.ncsu.edu/prickly-lettuce',
  'Prickly_lettuce/seed_1.jpg': 'Prickly Lettuce // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=151. Accessed 1 Apr. 2026.',
  'Prickly_lettuce/seed_2.jpg': 'Sea to Sky Invasive Species Control. (n.d.). Prickly lettuce. Retrieved https://ssisc.ca/prickly-lettuce',
  'Prickly_lettuce/seedling_1.jpg': '“Prickly Lettuce.” SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/prickly-lettuce/. Accessed 1 Apr. 2026.',
  'Prickly_lettuce/seedling_2.jpg': 'Prickly Lettuce // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=151. Accessed 1 Apr. 2026.',
  'Prickly_sida/seed_1.jpg': 'Prickly Sida // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=261. Accessed 1 Apr. 2026.',
  'Prickly_sida/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Sida rhombifolia L. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/sida-rhombifolia-l/',
  'Prickly_sida/seedling_1.jpg': '“Prickly Sida Sida Spinosa L.” Weed Science, Cornell of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/prickly-sida. Accessed 1 Apr. 2026.',
  'Prickly_sida/seedling_2.jpg': 'Prickly Sida // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=261. Accessed 1 Apr. 2026.',
  'Quackgrass/leaf_2.jpg': 'Quack grass (Elytrigia repens aristata). (n.d.). Illinois Wildflowers. Retrieved June 22, 2026, from https://www.illinoiswildflowers.info/grasses/plants/quack_grass.htm',
  'Quackgrass/seed_1.jpg': 'Quackgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=5. Accessed 1 Apr. 2026.',
  'Quackgrass/seed_2.jpg': 'Elymus repens (L.) Gould. (n.d.). [International Seed Morphology Association]. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/elymus-repens/',
  'Quackgrass/seedling_1.jpg': 'Hager, Heather A., et al. “Effects of Elevated CO2 on Photosynthetic Traits of Native and Invasive C3 and C4 Grasses.” BMC Ecology, vol. 16, no. 1, Dec. 2016, p. 28. DOI.org (Crossref), https://doi.org/10.1186/s12898-016-0082-z.',
  'Quackgrass/seedling_2.jpg': '“Quackgrass.” Integrated Crop Management, 1 July 2020, https://crops.extension.iastate.edu/encyclopedia/quackgrass.',
  'Redroot_pigweed/seed_1.jpg': 'Redroot Pigweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=15. Accessed 1 Apr. 2026.',
  'Redroot_pigweed/seed_2.jpg': 'Amaranthus L. spp. (n.d.). [International Seed Morphology Association]. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/31966/',
  'Redroot_pigweed/seedling_1.jpg': 'Redroot Pigweed. https://uspest.org/mint/redpigweed.htm. Accessed 1 Apr. 2026.',
  'Redroot_pigweed/seedling_2.jpg': 'Redroot Pigweed | Weed Identification Guide for Ontario Crops | Ontario.Ca. 13 Jan. 2023, http://www.ontario.ca/document/weed-identification-guide-ontario-crops/redroot-pigweed.',
  'Russian_thistle/seed_1.jpg': 'Russian Thistle // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=335. Accessed 1 Apr. 2026.',
  'Russian_thistle/seed_2.jpg': 'Salsola tragus/ paulsenii complex. (n.d.). Identification Tool to Weed Disseminules of California Central Valley Table Grape Production Areas. Retrieved June 22, 2026, from https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Sal-tra.html',
  'Russian_thistle/seedling_1.jpg': 'Russian Thistle | Center for Invasive Species Research. https://cisr.ucr.edu/invasive-species/russian-thistle. Accessed 3 Apr. 2026.',
  'Russian_thistle/seedling_2.jpg': '“Russian-Thistle.” SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/russian-thistle/. Accessed 1 Apr. 2026.',
  'Scouringrush/seed_1.jpg': 'Weeds: Horsetails (Scouringrush) – Equisetum Spp. | Hortsense | Washington State University. https://hortsense.cahnrs.wsu.edu/fact-sheet/weeds-horsetails-scouringrush-equisetum-spp/. Accessed 1 Apr. 2026.',
  'Scouringrush/seed_2.jpg': 'Equisetum hyemale page. (n.d.). Missouri Plants. Retrieved June 22, 2026, from https://www.missouriplants.com/Equisetum_hyemale_page.html',
  'Shattercane_Sorghums/seed_1.jpg': 'Shattercane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=315. Accessed 1 Apr. 2026.',
  'Shattercane_Sorghums/seed_2.jpg': 'Sorghum bicolor. (n.d.). Identification Tool to Weed Disseminules of California Central Valley Table Grape Production Areas. Retrieved June 22, 2026, from https://idtools.org/id/weed-tool/key/GrapeGrassKey/Media/Html/fact_sheets/Sor-bic.html',
  'Shattercane_Sorghums/seedling_1.jpg': 'Shattercane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=315. Accessed 1 Apr. 2026.',
  'Shattercane_Sorghums/seedling_2.jpg': 'Shattercane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=315. Accessed 1 Apr. 2026.',
  'Shepherds_Purse/leaf_1.jpg': 'Shepherd’s purse – Capsella bursa-pastoris. (n.d.). Michigan State University Plant & Pest Diagnostics. Retrieved June 22, 2026, from https://www.canr.msu.edu/resources/shepherd-s-purse-capsella-bursa-pastoris',
  'Shepherds_Purse/leaf_2.jpg': 'Capsella bursa-pastoris page. (n.d.). Missouri Plants. Retrieved June 22, 2026, from https://www.missouriplants.com/Capsella_bursa-pastoris_page.html',
  'Shepherds_Purse/seed_1.jpg': '“Agriculture.” Province of Manitoba, https://www.gov.mb.ca/agriculture/. Accessed 3 Apr. 2026.',
  'Shepherds_Purse/seed_2.jpg': 'Capsella bursa-pastoris. (n.d.). Identification Tool to Weed Disseminules of California Central Valley Table Grape Production Areas. Retrieved June 22, 2026, from https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Cap-bur.html',
  'Shepherds_Purse/seedling_1.jpg': 'Shepherd’s-Purse // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=47. Accessed 1 Apr. 2026.',
  'Shepherds_Purse/seedling_2.jpg': 'Shepherd’s Purse in Wheat | Syngenta Canada. https://www.syngenta.ca/pests/weed/shepherd%27s-purse/wheat. Accessed 1 Apr. 2026.',
  'Smooth_Groundcherry/leaf_1.jpg': 'Iowa State University Extension and Outreach. (2026, June 8). Smooth groundcherry. Integrated Crop Management. https://crops.extension.iastate.edu/encyclopedia/smooth-groundcherry',
  'Smooth_Groundcherry/leaf_2.jpg': 'Smooth ground cherry(Physalis subglabrata). (n.d.). Illinois Wildflowers. Retrieved June 22, 2026, from https://www.illinoiswildflowers.info/prairie/plantx/sg_cherryx.htm',
  'Smooth_Groundcherry/seed_1.jpg': 'Smooth Groundcherry | Turfgrass and Landscape Weed ID. https://turfweeds.cals.cornell.edu/plant/smooth-groundcherry. Accessed 3 Apr. 2026.',
  'Smooth_Groundcherry/seed_2.jpg': 'Physalis lancifolia. (n.d.). Identification Tool to Weed Disseminules of California Central Valley Table Grape Production Areas. Retrieved June 22, 2026, from https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Phy-lan.html',
  'Smooth_Groundcherry/seedling_1.jpg': 'Smooth Groundcherry // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=379. Accessed 1 Apr. 2026.',
  'Smooth_Groundcherry/seedling_2.jpg': 'Smooth Groundcherry // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=379. Accessed 1 Apr. 2026.',
  'Smooth_Witchgrass/leaf_2.jpg': 'Fall panicum midvein. (n.d.). Michigan State University College of Agriculture and Natural Resources. Retrieved https://www.canr.msu.edu/pestid/uploads/images/Fall-panicum-midvein.jpg',
  'Smooth_Witchgrass/seed_1.jpg': 'Fall Panicum // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=197. Accessed 1 Apr. 2026.',
  'Smooth_Witchgrass/seed_2.jpg': 'Carr, R. (2019, December 24). Panicum dichotomiflorum ssp. Dichotomiflorum. Flora of Eastern Washington and Adjacent Idaho. https://inside.ewu.edu/ewflora/panicum-dichotomiflorum/',
  'Smooth_Witchgrass/seedling_1.jpg': '“Weed Science.” Cornell College of Agriculture and Life Sciences. Fall Panicum Panicum Dichotomiflorum Michx., https://cals.cornell.edu/weed-science/weed-profiles/fall-panicum. Accessed 1 Apr. 2026.',
  'Smooth_Witchgrass/seedling_2.jpg': 'Fall Panicum // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=197. Accessed 1 Apr. 2026.',
  'Spotted_spurge/seed_1.jpg': '“Spotted Spurge (Euphorbia Maculata (L.) Small).” Insect Images, 1 Apr. 2026, https://www.insectimages.org/browse/image/5459583.',
  'Spotted_spurge/seed_2.jpg': 'Spotted spurge / weeds identification gallery . (2026, January). University of California Integrated Pest Management. https://ipm.ucanr.edu/weeds-identification-gallery/spotted-spurge/',
  'Star_of_Bethlehem/seed_1.jpg': 'Ornithogalum Umbellatum. https://www.vanengelen.com/flower-bulbs-index/ornithogalum/ornithogalum-umbellatum.html. Accessed 3 Apr. 2026.',
  'Star_of_Bethlehem/seed_2.jpg': 'Drooping Star of Bethlehem . (n.d.). BloomingBulb. Retrieved June 22, 2026, from https://bloomingbulb.com/products/drooping-star-of-bethlehem-25-bulbs',
  'Tall_morningglory/seed_1.jpg': 'Tall Morningglory // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=142. Accessed 1 Apr. 2026.',
  'Tall_morningglory/seed_2.jpg': 'Burnham, R. J. (n.d.). Climbers Censusing Lianas In Mesic Biomes of Eastern Regions. University of Michigan.',
  'Tall_morningglory/seedling_1.jpg': 'Tall Morningglory / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/tall-morningglory/. Accessed 3 Apr. 2026.',
  'Tall_morningglory/seedling_2.jpg': '“Morningglories.” Weed Science, https://cals.cornell.edu/weed-science/weed-profiles/morningglories. Accessed 3 Apr. 2026.',
  'Toothed_spurge/seed_1.jpg': 'Euphorbia Dentata Page. https://www.missouriplants.com/Euphorbia_dentata_page.html. Accessed 1 Apr. 2026.',
  'Toothed_spurge/seed_2.jpg': 'Euphorbia dentata toothed spurge. (n.d.). Wildflower Search. Retrieved June 22, 2026, from https://wildflowersearch.org/search?&tsn=502535',
  'Toothed_spurge/seedling_2.jpg': 'Toothed Spurge | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/broadleaf-weeds-parent/broadleaf-pages/toothed-spurge.html. Accessed 1 Apr. 2026.',
  'velvetleaf/seed_1.jpg': 'Velvetleaf // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=1. Accessed 1 Apr. 2026.',
  'velvetleaf/seedling_1.jpg': '“Velvetleaf, <em>Abutilon Theophrasti</Em>.” Wisconsin Horticulture, https://hort.extension.wisc.edu/articles/velvetleaf-abutilon-theophrasti/. Accessed 1 Apr. 2026.',
  'velvetleaf/seedling_2.jpg': '“Velvetleaf.” Integrated Pest Management, https://www.canr.msu.edu/resources/velvetleaf. Accessed 1 Apr. 2026.',
  'Venice_mallow/seed_1.jpg': 'Venice Mallow // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=128. Accessed 1 Apr. 2026.',
  'Venice_mallow/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Hibiscus trionum L. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/hibiscus-trionum-l/',
  'volunteer-sunflower/seed_1.jpg': 'Common Sunflower // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=339. Accessed 1 Apr. 2026.',
  'volunteer-sunflower/seed_2.jpg': 'Sunflowers / weeds identification gallery. (n.d.). University of California Statewide Integrated Pest Management. Retrieved June 23, 2026, from https://ipm.ucanr.edu/weeds-identification-gallery/sunflowers/',
  'volunteer-sunflower/seedling_1.jpg': '“Sunflower, Common.” SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/common-sunflower/. Accessed 1 Apr. 2026.',
  'volunteer-sunflower/seedling_2.jpg': 'Image: Seedling of Sunflower Credit: Jack Kelly Clark, UC IPM (W-CO-HANN-SG.004). https://ipm.ucanr.edu/PMG/H/W-CO-HANN-SG.004.html#gsc.tab=0. Accessed 1 Apr. 2026.',
  'Water_smartweed/seed_1.jpg': 'Water Smartweed, Persicaria Amphibia (L.) Gray. https://www.friendsofeloisebutler.org/pages/plants/smartweed_water.html. Accessed 1 Apr. 2026.',
  'Water_smartweed/seed_2.jpg': 'Lionakis Meyer, D. J., & Effenberger, J. (2024). Identification of Polygonaceae Seed Units. California Department of Food & Agriculture- Plant Pest Diagnostics Center. https://analyzeseeds.com/wp-content/uploads/2024/05/Identification-of-Polygonaceae-Seed-Units-2024-COMPLETE.pdf',
  'waterhemp/seed_1.jpg': 'Common Waterhemp // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=319. Accessed 1 Apr. 2026.',
  'waterhemp/seed_2.jpg': 'Amaranthus tuberculatus (Mog.) J. D. Sauer. (n.d.). Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/amaranthus-tuberculatus/',
  'waterhemp/seedling_1.jpg': '“Weed Science.” Waterhemp Amaranthus Tuberculatus (Moq.) Sauer  Amaranthus Rudis Sauer, Cornell College of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/waterhemp. Accessed 1 Apr. 2026.',
  'waterhemp/seedling_2.jpg': 'Common Waterhemp // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=319. Accessed 1 Apr. 2026.',
  'White_campion/leaf_1.jpg': 'Evening campion(Silene latifolia). (n.d.). Illinois Wildflowers. Retrieved June 23, 2026, from https://www.illinoiswildflowers.info/weeds/plants/evening_campion.htm',
  'White_campion/leaf_2.jpg': 'Silene latifolia page. (n.d.). Missouri Plants. Retrieved June 23, 2026, from https://www.missouriplants.com/Silene_latifolia_page.html',
  'White_campion/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Silene Latifolia Subsp. Alba (White Cockle). Fact sheet. 7 Nov. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/silene-latifolia-subsp-alba.',
  'White_campion/seed_2.jpg': 'Silene latifolia page. (n.d.). Missouri Plants. Retrieved June 23, 2026, from https://www.missouriplants.com/Silene_latifolia_page.html',
  'White_campion/seedling_1.jpg': '“Silene Latifolia Poir.” Idseed, https://seedidguide.idseed.org/fact_sheets/silene-latifolia-subsp-alba/. Accessed 1 Apr. 2026.',
  'wild-oat/leaf_2.jpg': 'Avena fatua. (n.d.). Weeds of Australia. Retrieved June 23, 2026, from https://keyserver.lucidcentral.org/weeds/data/media/Html/avena_fatua.htm',
  'wild-oat/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Avena Fatua (Wild Oat). Fact sheet. 7 Nov. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/avena-fatua.',
  'wild-oat/seed_2.jpg': 'Avena fatua. (n.d.). Weeds of Australia. Retrieved June 23, 2026, from https://keyserver.lucidcentral.org/weeds/data/media/Html/avena_fatua.htm',
  'wild-oat/seedling_1.jpg': '“Agriculture.” Province of Manitoba, https://www.gov.mb.ca/agriculture/. Accessed 1 Apr. 2026.',
  'wild-oat/seedling_2.jpg': '“Agriculture | Province of Manitoba.” Province of Manitoba - Agriculture, https://www.gov.mb.ca/agriculture/. Accessed 1 Apr. 2026.',
  'wild-parsnip/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Pastinaca Sativa (Wild Parsnip). Fact sheet. 14 July 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/pastinaca-sativa.',
  'wild-parsnip/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Pastinaca sativa l. Subsp. Sylvestris (Mill.) rouy & e. G. Camus. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/pastinaca-sativa/',
  'wild-parsnip/seedling_1.jpg': 'Lamb, Bruce Ackley &. Alyssa, and Bruce Ackley. Wild Parsnip. ohiostate.pressbooks.pub, https://ohiostate.pressbooks.pub/ohionoxiousweeds/chapter/wild-parsnip/. Accessed 1 Apr. 2026.',
  'wild-parsnip/seedling_2.jpg': '“Poisonous to Touch Weed Series: Wild Parsnip (Pastinaca Sativa).” Horticulture For Home Gardeners, 15 Mar. 2021, https://horticultureforhomegardeners.ca/2021/03/15/poisonous-to-touch-weed-series-wild-parsnip-pastinaca-sativa/.',
  'Wild_buckwheat/leaf_1.jpg': 'Iowa State University Extension and Outreach. (2026, June 9). Wild buckwheat. Integrated Crop Management. https://crops.extension.iastate.edu/encyclopedia/wild-buckwheat',
  'Wild_buckwheat/seed_1.jpg': 'Wild Buckwheat // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=222. Accessed 1 Apr. 2026.',
  'Wild_buckwheat/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Fallopia convolvulus (L.) Á. Löve. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/fallopia-convolvulus/',
  'Wild_buckwheat/seedling_2.jpg': 'Black Bindweed - BASF Agricultural Solutions UK. https://www.agricentre.basf.co.uk/en/Services/Pest-Guide/Weeds/Broadleaf-weeds/Black-Bindweed/. Accessed 1 Apr. 2026.',
  'Wild_Carrot/leaf_1.jpg': 'Wild carrot (Queen Anne’s lace) – Daucus carota. (n.d.). Michigan State University Plant & Pest Diagnostics. Retrieved June 23, 2026, from https://www.canr.msu.edu/resources/wild-carrot-queen-anne-s-lace-daucus-carota',
  'Wild_Carrot/leaf_2.jpg': 'Cornell University. (n.d.). Wild carrot. Cornell Weed Identification Agricultural Weed ID for New York State. Retrieved June 23, 2026, from https://blogs.cornell.edu/weedid/wild-carrot/',
  'Wild_Carrot/seed_1.jpg': 'Wild Carrot // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=85. Accessed 1 Apr. 2026.',
  'Wild_Carrot/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Daucus carota  L. subsp. Carota. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/daucus-carota-subsp-carota/',
  'Wild_Carrot/seedling_1.jpg': 'Wild Carrot // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=85. Accessed 1 Apr. 2026.',
  'Wild_Carrot/seedling_2.jpg': 'Wild Carrot // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=85. Accessed 1 Apr. 2026.',
  'Wild_Four-o\'clock/seed_1.jpg': '“Four O’Clock Flower.” Vineyard Gazette, Vineyard Gazette, https://vineyardgazette.com/news/2024/04/24/four-oclock-flower.',
  'Wild_Four-o\'clock/seed_2.jpg': 'Painter, P. (2023, July 12). Iowa wildflower wednesday: Wild four-o’clock. Bleeding Heartland. https://www.bleedingheartland.com/2023/07/12/iowa-wildflower-wednesday-wild-four-oclock/',
  'Wild_Four-o\'clock/seedling_1.jpg': '“Wild Four-o’ Clock.” Integrated Crop Management, 1 Mar. 2021, https://crops.extension.iastate.edu/encyclopedia/wild-four-o-clock.',
  'Wild_mustard/leaf_1.jpg': 'Michigan State University. (n.d.). Wild mustard – Sinapis arvensis. Plant & Pest Diagnostics. Retrieved June 23, 2026, from https://www.canr.msu.edu/resources/wild-mustard-sinapis-arvensis',
  'Wild_mustard/seed_1.jpg': 'Wild Mustard // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=263. Accessed 1 Apr. 2026.',
  'Wild_mustard/seed_2.jpg': 'Sinapis arvensis L. charlock mustard. (n.d.). USDA Plants Database. Retrieved June 23, 2026, from https://plants.sc.egov.usda.gov/plant-profile/SIAR4',
  'Wild_mustard/seedling_1.jpg': '“Wild Mustard.” Weed Science, https://cals.cornell.edu/weed-science/weed-profiles/wild-mustard. Accessed 3 Apr. 2026.',
  'Wild_mustard/seedling_2.jpg': 'Michigan State University. (n.d.). Wild mustard – Sinapis arvensis. Plant & Pest Diagnostics. Retrieved June 23, 2026, from https://www.canr.msu.edu/resources/wild-mustard-sinapis-arvensis',
  'Witchgrass/leaf_2.jpg': 'Weed Herbarium Panicum capillare. (n.d.). UMass Extension Landscape, Nursey & Urban Forestry Program. Retrieved June 23, 2026, from https://extension.umass.edu/weed-herbarium/weeds/panicum-capillare/index.html',
  'Witchgrass/seed_1.jpg': 'Witchgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=195. Accessed 1 Apr. 2026.',
  'Witchgrass/seed_2.jpg': 'Native Plant Trust. (n.d.). Panicum capillare (Witch panicgrass). Go Botany. Retrieved June 23, 2026, from https://gobotany.nativeplanttrust.org/species/panicum/capillare/',
  'Witchgrass/seedling_1.jpg': 'Witchgrass | Cornell Weed Identification. https://blogs.cornell.edu/weedid/witchgrass-2/. Accessed 1 Apr. 2026.',
  'Witchgrass/seedling_2.jpg': 'Witchgrass | Cornell Weed Identification. https://blogs.cornell.edu/weedid/witchgrass-2/. Accessed 1 Apr. 2026.',
  'Woolly_cupgrass/leaf_2.jpg': 'Ph. D. Borden Trewatha, P. (n.d.). Woolly cupgrass. Darr School of Agriculture Missouri State. Plant Identification. Retrieved June 23, 2026, from https://Ag.MissouriState.edu/PBTrewatha/woolly-cupgrass.htm',
  'Woolly_cupgrass/seed_1.jpg': 'Woolly Cupgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=426. Accessed 1 Apr. 2026.',
  'Woolly_cupgrass/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Eriochloa villosa (Thunb.) Kunth. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/eriochloa-villosa/',
  'Woolly_cupgrass/seedling_1.jpg': '“Woolly Cupgrass.” Integrated Crop Management, 1 May 2020, https://crops.extension.iastate.edu/encyclopedia/woolly-cupgrass.',
  'Woolly_cupgrass/seedling_2.jpg': 'Woolly Cupgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=426. Accessed 1 Apr. 2026.',
  'yellow-foxtail/leaf_2.jpg': 'Setaria pumila (Yellow Foxtail). (n.d.). Minnesota Wildflowers. Retrieved June 23, 2026, from https://www.minnesotawildflowers.info/grass-sedge-rush/yellow-foxtail',
  'yellow-foxtail/seed_1.jpg': 'Yellow Foxtail / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/yellow-foxtail/. Accessed 1 Apr. 2026.',
  'yellow-foxtail/seed_2.jpg': 'University of Missouri Division of Plant Sciences. (n.d.). Yellow foxtail. Weed ID Guide. Retrieved June 23, 2026, from https://weedid.missouri.edu/weedinfo.cfm?weed_id=257',
  'yellow-foxtail/seedling_1.jpg': 'Yellow Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=257. Accessed 1 Apr. 2026.',
  'yellow-foxtail/seedling_2.jpg': 'Weed of the Month: The Foxtails (Kevin Bradley). https://ipm.missouri.edu/cropPest/2014/5/Weed-of-the-Month-the-Foxtails/. Accessed 1 Apr. 2026.',
  'yellow-nutsedge/leaf_1.jpg': 'Clemson Cooperative Extension. (2019, May 16). Weed of the month—Yellow nutsedge(Cyperus esculentus). Home & Garden Information Center. https://hgic.clemson.edu/weed-of-the-month-yellow-nutsedge-cyperus-esculentus/',
  'yellow-nutsedge/leaf_2.jpg': 'Cornell College of Agriculture and Life Sciences. (n.d.). Yellow nutsedge | turfgrass and landscape weed id. School of Integrative Plant Science Horticulture Section. Retrieved June 23, 2026, from https://turfweeds.cals.cornell.edu/plant/yellow-nutsedge',
  'yellow-nutsedge/seed_1.jpg': 'Washington State Noxious Weed Control Board. https://www.nwcb.wa.gov/weeds/yellow-nutsedge. Accessed 1 Apr. 2026.',
  'yellow-nutsedge/seed_2.jpg': 'International Seed Morphology Association. (n.d.). Cyperus L. spp. Seed ID Guide. Retrieved https://seedidguide.idseed.org/fact_sheets/32165/',
  'yellow-nutsedge/seedling_1.jpg': '“Yellow Nutsedge.” Turfgrass Science at Purdue University, 27 June 2014, https://turf.purdue.edu/yellow-nutsedge/.',
  'yellow-nutsedge/seedling_2.jpg': 'Nutsedge, Yellow in Corn | Syngenta Canada. https://www.syngenta.ca/pests/weed/nutsedge--yellow/corn. Accessed 1 Apr. 2026.',
  'yellow_Rocket/leaf_1.jpg': 'Barbarea vulgaris page. (n.d.). Missouri Plants. Retrieved June 23, 2026, from https://missouriplants.com/Barbarea_vulgaris_page.html',
  'yellow_Rocket/leaf_2.jpg': 'Barbarea vulgaris page. (n.d.). Missouri Plants. Retrieved June 23, 2026, from https://missouriplants.com/Barbarea_vulgaris_page.html',
  'yellow_Rocket/seed_1.jpg': 'Yellow Rocket // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=36. Accessed 1 Apr. 2026.',
  'yellow_Rocket/seed_2.jpg': 'Canadian Food Inspection Agency. (n.d.). Weed Seed: Barbarea spp. (Yellow rocket). Seeds Identification. Retrieved https://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/barbarea-spp',
  'yellow_Rocket/seedling_1.jpg': 'Yellow Rocket | Cornell Weed Identification. https://blogs.cornell.edu/weedid/yellow-rocket/. Accessed 1 Apr. 2026.',
  'yellow_Rocket/seedling_2.jpg': 'Kenraiz, Krzysztof Ziarnek. English:  Barbarea Vulgaris Seedling in Glinna near Szczecin, WN Poland. 20 Apr. 2019, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Barbarea_vulgaris_kz01.jpg.',
};

export const IMAGE_REFERENCES = refs;
export const INATURALIST_DEFAULT_CITATION = INATURALIST_CITATION;

/**
 * Get the citation for a specific image.
 * @param speciesFolder - The folder name (weed id), e.g. "annual-ryegrass"
 * @param filename - The image filename, e.g. "seed_1.jpg"
 * @returns The citation string, or the iNaturalist default if not found.
 */
export function getImageCitation(speciesFolder: string, filename: string): string {
  const key = `${speciesFolder}/${filename}`;
  return refs[key] || INATURALIST_CITATION;
}

/**
 * Get all citations for a given set of weed IDs and image stages used in a session.
 * Returns deduplicated citations.
 */
export function getSessionCitations(weedIds: string[], stages: string[]): string[] {
  const STAGE_PREFIX_MAP: Record<string, string> = {
    seed: 'seed',
    seedling: 'seedling',
    vegetative: 'leaf',
    flower: 'repro',
    whole: 'repro',
    ligule: 'lig',
  };

  const citations = new Set<string>();

  for (const weedId of weedIds) {
    for (const stage of stages) {
      const prefix = STAGE_PREFIX_MAP[stage] || 'leaf';
      // Check variants 1 and 2, common extensions
      for (const variant of [1, 2, 3]) {
        for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
          const key = `${weedId}/${prefix}_${variant}.${ext}`;
          if (refs[key]) {
            citations.add(refs[key]);
          }
        }
      }
    }
    // If no specific citation was found for any of this weed's images, add iNaturalist
    const hasSpecific = Object.keys(refs).some(k => k.startsWith(`${weedId}/`));
    if (!hasSpecific) {
      citations.add(INATURALIST_CITATION);
    }
  }

  // Always include iNaturalist if any weed might have unlisted images
  citations.add(INATURALIST_CITATION);

  return Array.from(citations).sort();
}

/**
 * Get all references grouped by species folder for the full references page.
 */
export function getAllReferencesGrouped(): Record<string, Array<{ image: string; citation: string }>> {
  const grouped: Record<string, Array<{ image: string; citation: string }>> = {};

  for (const [key, citation] of Object.entries(refs)) {
    const slashIdx = key.indexOf('/');
    const species = key.substring(0, slashIdx);
    const image = key.substring(slashIdx + 1);
    if (!grouped[species]) grouped[species] = [];
    grouped[species].push({ image, citation });
  }

  // Sort species alphabetically
  const sorted: Record<string, Array<{ image: string; citation: string }>> = {};
  for (const species of Object.keys(grouped).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))) {
    sorted[species] = grouped[species];
  }

  return sorted;
}
