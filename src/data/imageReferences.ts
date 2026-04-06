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
  'annual-ryegrass/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Lolium Persicum (Persian Darnel). Fact sheet. 7 Nov. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/lolium-persicum.',
  'annual-ryegrass/seedling_1.jpg': '"Annual Ryegrass." Nufarm UK, Nufarm Global, https://nufarm.com/uk/annual-ryegrass/.',
  'annual-ryegrass/seedling_2.jpg': 'Sullivan, Cathryn A. O\', et al. "Biological Nitrification Inhibition by Weeds: Wild Radish, Brome Grass, Wild Oats and Annual Ryegrass Decrease Nitrification Rates in Their Rhizospheres." Crop & Pasture Science, vol. 68, no. 8, Oct. 2017, pp. 798–804. DOI.org (Crossref), https://doi.org/10.1071/CP17243.',
  'Asian_copperleaf/seed_1.jpg': 'Acalypha Virginica. http://iowaplants.com/flora/family/Euphorbiaceae/Acalypha/a_virginica/Acalypha_virginica.html. Accessed 3 Apr. 2026.',
  'Asian_copperleaf/seedling_1.jpg': '"Watch for Asian Copperleaf This Spring." Integrated Crop Management, https://crops.extension.iastate.edu/cropnews/2023/05/watch-asian-copperleaf-spring. Accessed 1 Apr. 2026.',
  'Asian_copperleaf/seedling_2.jpg': '"Acalypha Australis -- Earthpedia Plant." Earthpedia, https://earthpedia.earth.com/angiosperms/euphorbiaceae/acalypha-australis/. Accessed 1 Apr. 2026.',
  'Asiatic_dayflower/seed_1.jpg': 'Commelina Communis. http://www.iowaplants.com/flora/family/Commelinaceae/commelina/ccommunis.html. Accessed 3 Apr. 2026.',
  'Asiatic_dayflower/seedling_1.jpg': 'Weed of the Month: Asiatic Dayflower (Kevin Bradley). https://ipm.missouri.edu/croppest/2010/5/Weed-of-the-Month-Asiatic-Dayflower/index.cfm. Accessed 1 Apr. 2026.',
  'Asiatic_dayflower/seedling_2.jpg': '"Asiatic Dayflower." Integrated Crop Management, 1 May 2020, https://crops.extension.iastate.edu/encyclopedia/asiatic-dayflower.',
  'barnyardgrass/seed_1.jpg': 'Barnyardgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=98. Accessed 1 Apr. 2026.',
  'barnyardgrass/seedling_1.jpg': 'Barnyardgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=98. Accessed 1 Apr. 2026.',
  'barnyardgrass/seedling_2.jpg': 'Barnyardgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=98. Accessed 1 Apr. 2026.',
  'Buffalobur/seed_1.jpg': 'Solanum Rostratum. https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Sol-ros.html. Accessed 1 Apr. 2026.',
  'Buffalobur/seedling_1.jpg': 'Buffalobur // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=271. Accessed 1 Apr. 2026.',
  'Buffalobur/seedling_2.jpg': '"University of Minnesota." Strand Memorial Herbarium, University of Minnesota CFANS, http://herbarium.cfans.umn.edu/Detail.aspx?SpCode=568&LimitKeyword=.',
  'Burcucumber/seed_1.jpg': 'Lady Bird Johnson Wildflower Center - The University of Texas at Austin. https://www.wildflower.org/gallery/result.php?id_image=27147. Accessed 3 Apr. 2026.',
  'canada-thistle/seed_1.jpg': 'B, Murali Krishna. "Weed Identification Using Convolution Neural Networks." International Journal of Computer Communication and Informatics, vol. 5, no. 2, Dec. 2023, pp. 1–11. DOI.org (Crossref), https://doi.org/10.34256/ijcci2321.',
  'canada-thistle/seedling_1.jpg': '"Thistle, Canada (Cirsium Arvense)-Selective Control in Crops." Text. Pacific Northwest Pest Management Handbooks, 10 Nov. 2015, https://pnwhandbooks.org/weed/problem-weeds/thistle-canada-cirsium-arvense-selective-control.',
  'canada-thistle/seedling_2.jpg': 'Canada Thistle | Weed Identification Guide for Ontario Crops | Ontario.Ca. 13 Jan. 2023, http://www.ontario.ca/document/weed-identification-guide-ontario-crops/canada-thistle.',
  'caraway/seed_1.jpg': '"Caraway." Plant Identification, https://plantsam.com/caraway/. Accessed 3 Apr. 2026.',
  'caraway/seedling_1.jpg': 'Government of Saskatchewan. "Caraway." Saskatchewan Agriculture Knowledge Centre, https://plantsam.com/caraway/. Accessed 3 Apr. 2026.',
  'caraway/seedling_2.jpg': 'Caraway | University of Maryland Extension. https://extension.umd.edu/resource/caraway. Accessed 1 Apr. 2026.',
  'Catchweed_bedstraw/seed_1.jpg': 'Catchweed Bedstraw. https://smallgrains.wsu.edu/weed-resources/common-weed-list/catchweed-bedstraw/. Accessed 1 Apr. 2026.',
  'Catchweed_bedstraw/seedling_1.jpg': '"Catchweed Bedstraws and False Cleavers." Weed Science, Cornell College of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/catchweed-bedstraws-and-false-cleavers. Accessed 1 Apr. 2026.',
  'Catchweed_bedstraw/seedling_2.jpg': '"Weed Biology Galium Aparine L." Crop Protection Online, Department of Agroecology, Aarhus University, https://plantevaernonline.dlbr.dk/cp/graphics/Name.asp?id=djf&Language=en-la&TaskID=1&DatasourceID=1&NameID=145.',
  'Common_Burdock/seed_1.jpg': 'Common Burdock // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=30. Accessed 3 Apr. 2026.',
  'Common_Burdock/seedling_1.jpg': 'Common Burdock // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=30. Accessed 1 Apr. 2026.',
  'Common_Burdock/seedling_2.jpg': 'Common Burdock // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=30. Accessed 1 Apr. 2026.',
  'common_Cocklebur/seed_1.jpg': '"Weed Science." Common Cocklebur Xanthium Strumarium L., Cornell College of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/common-cocklebur.',
  'common_Cocklebur/seedling_1.jpg': '"Cocklebur." Getting Rid Of Weeds, https://growiwm.org/weeds/cocklebur/. Accessed 3 Apr. 2026.',
  'common_Cocklebur/seedling_2.jpg': '"Cocklebur." Getting Rid Of Weeds, https://growiwm.org/weeds/cocklebur/. Accessed 3 Apr. 2026.',
  'Common_Mallow/seed_1.jpg': 'Common Mallow // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=169. Accessed 3 Apr. 2026.',
  'Common_Mallow/seedling_1.jpg': '"Common Mallow – Malva Neglecta." Plant & Pest Diagnostics, https://www.canr.msu.edu/resources/common-mallow-malva-neglecta. Accessed 1 Apr. 2026.',
  'Common_Mallow/seedling_2.jpg': 'Common Mallow // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=169. Accessed 1 Apr. 2026.',
  'Common_Mallow/seedling_3.jpg': 'Common Mallow // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=169. Accessed 1 Apr. 2026.',
  'common_Milkweed/seed_1.jpg': '"9 Wild Facts about Milkweeds." Gulo in Nature, 5 Aug. 2022, https://guloinnature.com/9-wild-facts-about-milkweeds/.',
  'Common_teasel/seed_1.jpg': 'Common Teasel | Minnesota Department of Agriculture. https://www.mda.state.mn.us/plants/pestmanagement/weedcontrol/noxiouslist/commonteasel. Accessed 3 Apr. 2026.',
  'Common_teasel/seedling_1.jpg': 'Common Teasel // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=95. Accessed 1 Apr. 2026.',
  'Common_teasel/seedling_2.jpg': 'Dipsacus Fullonum...Fullers Teasel...Common Teasel...Roots for Tincture, Leaves as Infusion (Plants Forum at Permies). https://permies.com/t/222576/Dipsacus-fullonum-fullers-teasel-common. Accessed 1 Apr. 2026.',
  'CommonChickweed/seed_1.jpg': 'Common Chickweed, Stellaria Media (L.) Vill. https://friendsofeloisebutler.org/pages/plants/commonchickweed.html. Accessed 1 Apr. 2026.',
  'commonPokeweed/seed_1.jpg': 'Common Pokeweed: Phytolacca Americana (Caryophyllales: Phytolaccaceae): Invasive Plant Atlas of the United States. https://www.invasiveplantatlas.org/subject.cfm?sub=6167. Accessed 1 Apr. 2026.',
  'common-ragweed/seed_1.jpg': 'Common Ragweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=17. Accessed 3 Apr. 2026.',
  'common-ragweed/seedling_1.jpg': '"Common Ragweed." Integrated Pest Management, https://www.canr.msu.edu/resources/common_ragweed1. Accessed 1 Apr. 2026.',
  'common-ragweed/seedling_2.jpg': '"Ragweed, Common." SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/common-ragweed/. Accessed 1 Apr. 2026.',
  'Corn_speedwell/seed_1.jpg': 'Veronica Arvensis. https://idtools.org/id/weed-tool/key/GrapeSeedKey/Media/Html/fact_sheets/Vero-arv.html. Accessed 1 Apr. 2026.',
  'Curly_dock/seed_1.jpg': 'Curly Dock. https://www.agry.purdue.edu/courses/agry105/restricted/curlydock.htm. Accessed 1 Apr. 2026.',
  'Curly_dock/seedling_1.jpg': '"Curly Dock – Rumex Crispus." Plant & Pest Diagnostics, https://www.canr.msu.edu/resources/curly-dock-rumex-crispus. Accessed 1 Apr. 2026.',
  'Curly_dock/seedling_2.jpg': 'Curly Dock // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=246. Accessed 1 Apr. 2026.',
  'Dandelion/seed_1.jpg': 'Dandelion | Turfgrass and Landscape Weed ID. https://turfweeds.cals.cornell.edu/plant/dandelion. Accessed 3 Apr. 2026.',
  'Dandelion/seedling_2.jpg': '"Dandelion – Taraxacum Officinale." Plant & Pest Diagnostics, https://www.canr.msu.edu/resources/dandelion-taraxacum-officinale. Accessed 1 Apr. 2026.',
  'Downy_brome/seed_1.jpg': '"Common Weeds: Agronomy 105\'s Weed ID." Downy Bromegrass, https://www.agry.purdue.edu/courses/agry105/common/dbromegrass.htm. Accessed 1 Apr. 2026.',
  'Downy_brome/seedling_1.jpg': 'Downy Brome // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=43. Accessed 1 Apr. 2026.',
  'Downy_brome/seedling_2.jpg': 'Image: Seedling of Downy Brome (Cheatgrass), Bromus Tectorum, at the Three-Leaf Stage. Credit: Jack Kelly Clark, UC IPM (W-GM-BTEC-SG.001). https://ipm.ucanr.edu/PMG/B/W-GM-BTEC-SG.001.html#gsc.tab=0. Accessed 1 Apr. 2026.',
  'Eastern_black_nightshade/seed_1.jpg': 'Eastern Black Nightshade // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=270. Accessed 1 Apr. 2026.',
  'Eastern_black_nightshade/seedling_1.jpg': 'Weed of the Month: Eastern Black Nightshade (Kevin Bradley). https://ipm.missouri.edu/cropPest/2011/6/weed-of-the-month-eastern-black-nightshade/. Accessed 1 Apr. 2026.',
  'Eastern_black_nightshade/seedling_2.jpg': '"Black Nightshade." Crop Science | New Zealand, Bayer Group, https://www.cropscience.bayer.co.nz/pests/weeds/black-nightshade. Accessed 3 Apr. 2026.',
  'False_London-rocket/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Sisymbrium Loeselii (Tall Hedge Mustard). Fact sheet. 7 Nov. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/sisymbrium-loeselii.',
  'False_London-rocket/seedling_1.jpg': 'Kenraiz, Krzysztof Ziarnek. English: Sisymbrium Loeselii Seedling, Szczecin, NW Poland. 28 Mar. 2019, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Sisymbrium_loeselii_kz09.jpg.',
  'False_London-rocket/seedling_2.jpg': 'Image: Seedling of London Rocket Credit: Jack Kelly Clark, UC IPM (W-CF-SIRI-SG.003). https://ipm.ucanr.edu/PMG/S/W-CF-SIRI-SG.003.html#gsc.tab=0. Accessed 3 Apr. 2026.',
  'Field_bindweed/seed_1.jpg': 'Field Bindweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=72. Accessed 1 Apr. 2026.',
  'Field_bindweed/seedling_1.jpg': '"Field Bindweed – Convolvulus Arvensis." Plant & Pest Diagnostics, https://www.canr.msu.edu/resources/field-bindweed-convolvulus-arvensis. Accessed 1 Apr. 2026.',
  'Field_bindweed/seedling_2.jpg': 'Field Bindweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=72. Accessed 1 Apr. 2026.',
  'Field_Pennycress/seed_1.jpg': 'Field Pennycress // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=285. Accessed 1 Apr. 2026.',
  'Field_Pennycress/seedling_2.jpg': '"Field Pennycress." SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/field-pennycress/. Accessed 1 Apr. 2026.',
  'Foxtail_barley/ligu_1.jpg': 'Foxtail Barley // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=349. Accessed 3 Apr. 2026.',
  'Foxtail_barley/ligu_2.jpg': 'Foxtail Barley | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/grasses-parent/grasses-pages-perennials/foxtail-barley.html. Accessed 1 Apr. 2026.',
  'Foxtail_barley/seed_1.jpg': '"Seeds." Tennessee Council for Professional Archaeology, 11 Sept. 2015, https://tennesseearchaeologycouncil.wordpress.com/tag/seeds/.',
  'Foxtail_barley/seedling_1.jpg': 'Foxtail, Green in Barley | Syngenta Canada. https://www.syngenta.ca/pests/weed/foxtail--green/barley. Accessed 1 Apr. 2026.',
  'Foxtail_barley/seedling_2.jpg': '"Foxtails." SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/foxtails/. Accessed 1 Apr. 2026.',
  'Garlic_mustard/seedling_1.jpg': '"Alliaria Petiolata." Plant Identification, https://plantsam.com/alliaria-petiolata/. Accessed 1 Apr. 2026.',
  'Garlic_mustard/seedling_2.jpg': 'Ohio Weedguide. https://weedguide.cfaes.osu.edu/singlerecord.asp?id=80. Accessed 3 Apr. 2026.',
  'giant-foxtail/seed_1.jpg': 'Giant Foxtail. https://www.agry.purdue.edu/courses/agry105/restricted/gfoxtail.htm. Accessed 1 Apr. 2026.',
  'giant-foxtail/seedling_1.jpg': 'Giant Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=256. Accessed 1 Apr. 2026.',
  'giant-foxtail/seedling_2.jpg': 'Giant Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=256. Accessed 1 Apr. 2026.',
  'giant-ragweed/seed_1.jpg': 'Giant Ragweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=18. Accessed 1 Apr. 2026.',
  'giant-ragweed/seedling_1.jpg': '"Giant Ragweed." Integrated Crop Management, 1 May 2020, https://crops.extension.iastate.edu/encyclopedia/giant-ragweed.',
  'golden-alexanders/seed_1.jpg': '"Golden Alexanders, PA Ecotype." Ernst Seeds, https://www.ernstseed.com/product/golden-alexanders-pa-ecotype/. Accessed 3 Apr. 2026.',
  'golden-alexanders/seedling_1.jpg': 'Golden Alexanders (Zizia Aurea) Six-Pack Plugs | Versatile Native Perennial. https://mnlcorp.com/product/golden-alexanders-six-pack-plugs/. Accessed 1 Apr. 2026.',
  'golden-alexanders/seedling_2.jpg': '"Golden Alexanders (Zizia Aurea)." Plant Database, garden.org, https://garden.org/plants/photo/460988/.',
  'Goosegrass/seed_1.jpg': 'Goosegrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=103. Accessed 1 Apr. 2026.',
  'Goosegrass/seedling_1.jpg': 'Goosegrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=103. Accessed 1 Apr. 2026.',
  'Goosegrass/seedling_2.jpg': 'Eleusine Indica. https://herbarium.ncsu.edu/containerWeeds/Eleusine_indica.htm. Accessed 1 Apr. 2026.',
  'green-foxtail/seed_1.jpg': 'Green Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=258. Accessed 1 Apr. 2026.',
  'green-foxtail/seedling_1.jpg': 'Green Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=258. Accessed 1 Apr. 2026.',
  'green-foxtail/seedling_2.jpg': 'Weed of the Month: The Foxtails (Kevin Bradley). https://ipm.missouri.edu/cropPest/2014/5/Weed-of-the-Month-the-Foxtails/. Accessed 1 Apr. 2026.',
  'Ground_ivy/seed_1.jpg': 'USDA Plants Database. https://plants.sc.egov.usda.gov/plant-profile/glhe2. Accessed 1 Apr. 2026.',
  'Ground_ivy/seedling_1.jpg': 'Ohio Weedguide. https://weedguide.cfaes.osu.edu/singlerecord.asp?id=58. Accessed 1 Apr. 2026.',
  'Ground_ivy/seedling_2.jpg': 'Kenraiz, Krzysztof Ziarnek. English: Glechoma Hederacea Seedling in Leśno Górne near Szczecin, NW Poland. 12 May 2019, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Glechoma_hederacea_kz03.jpg.',
  'Hedge_bindweed/seed_1.jpg': 'Hedge Bindweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=45. Accessed 1 Apr. 2026.',
  'Hedge_bindweed/seedling_1.jpg': 'Salicyna. Polski: Kielisznik Zaroślowy (Calystegia Sepium) - Siewka, Ogródek Działkowy w Lublinie. 1 May 2018, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Calystegia_sepium_2018-05-01_0033.jpg.',
  'Hedge_bindweed/seedling_2.jpg': 'Bindweeds: Field and Hedge Bindweed | Cornell Weed Identification. https://blogs.cornell.edu/weedid/859-2/. Accessed 1 Apr. 2026.',
  'Hemp_dogbane/seed_1.jpg': 'Hemp Dogbane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=26. Accessed 1 Apr. 2026.',
  'Hemp_dogbane/seedling_1.jpg': 'Hemp Dogbane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=26. Accessed 1 Apr. 2026.',
  'Hemp_dogbane/seedling_2.jpg': 'Hemp Dogbane | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/broadleaf-weeds-parent/broadleaf-pages4/hemp-dogbane.html. Accessed 1 Apr. 2026.',
  'Henbit_deadnettle/seed_1.jpg': 'Henbit Deadnettle, Lamium Amplexicaule L. https://www.friendsofeloisebutler.org/pages/plants/henbitdeadnettle.html. Accessed 1 Apr. 2026.',
  'Honey-vine_climbing_milkweed/seed_1.jpg': 'Honeyvine Milkweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=19. Accessed 1 Apr. 2026.',
  'Honey-vine_climbing_milkweed/seedling_1.jpg': 'Honeyvine Milkweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=19. Accessed 1 Apr. 2026.',
  'Honey-vine_climbing_milkweed/seedling_2.jpg': 'Honeyvine Milkweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=19. Accessed 3 Apr. 2026.',
  'horsenettle/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Solanum Carolinense (Horse Nettle). 6 Nov. 2014, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/solanum-carolinense.',
  'horsenettle/seedling_1.jpg': 'Horsenettle // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=266. Accessed 1 Apr. 2026.',
  'horsenettle/seedling_2.jpg': 'Carolina Horsenettle | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/broadleaf-weeds-parent/broadleaf-pages/carolina-horsenettle.html. Accessed 1 Apr. 2026.',
  'Horseweed/seed_1.jpg': '"Marestail (Horseweed)." Weeds, https://www.canr.msu.edu/weeds/extension/marestail-horseweed. Accessed 1 Apr. 2026.',
  'Horseweed/seedling_1.jpg': '"Weed Science Horseweed." Conyza Canadensis (L.) Cronquist = Erigeron Canadensis L., https://cals.cornell.edu/weed-science/weed-profiles/horseweed. Accessed 1 Apr. 2026.',
  'Horseweed/seedling_2.jpg': 'Horseweed - Agricultural Solutions. https://www.agro.basf.co.ke/en/Services/Pest-Overview/Weeds/Broadleaf-weeds/Horseweed/. Accessed 1 Apr. 2026.',
  'Jimsonweed/seed_1.jpg': 'Jimsonweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=84. Accessed 1 Apr. 2026.',
  'Jimsonweed/seedling_2.jpg': '"Weed Science Jimsonweed." Datura Stramonium L., Cornell College of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/jimsonweed. Accessed 1 Apr. 2026.',
  'johnsongrass/seed_1.jpg': 'Johnsongrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=275. Accessed 1 Apr. 2026.',
  'johnsongrass/seedling_1.jpg': 'Johnsongrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=275. Accessed 1 Apr. 2026.',
  'johnsongrass/seedling_2.jpg': 'Johnsongrass / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/johnsongrass/. Accessed 1 Apr. 2026.',
  'kochia/seed_1.jpg': 'Kochia // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=148. Accessed 1 Apr. 2026.',
  'kochia/seedling_1.jpg': '"Kochia." SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/kochia/. Accessed 1 Apr. 2026.',
  'kochia/seedling_2.jpg': 'Kochia in Wheat | Syngenta Canada. https://www.syngenta.ca/pests/weed/kochia/wheat. Accessed 1 Apr. 2026.',
  'Ladysthumb/seed_1.jpg': 'Ladysthumb // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=224. Accessed 1 Apr. 2026.',
  'Ladysthumb/seedling_1.jpg': '"Weeds of Australia." Fact Sheet Index, Identic Pty Ltd., https://keyserver.lucidcentral.org/weeds/data/media/Html/persicaria_maculosa.htm.',
  'Ladysthumb/seedling_2.jpg': 'Kenraiz, Krzysztof Ziarnek. English: Persicaria Maculosa Seedling. Vicinity of Golczewo, NW Poland. 27 June 2019, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Persicaria_maculosa_kz01.jpg.',
  'lambsquarters/seed_1.jpg': 'Searching for the Lost Traits of an Extinct Crop | Society of Ethnobiology. https://ethnobiology.org/forage/blog/searching-lost-traits-extinct-crop. Accessed 1 Apr. 2026.',
  'lambsquarters/seedling_1.jpg': '"Common Lambsquarters." Integrated Pest Management, https://www.canr.msu.edu/resources/common_lambsquarters. Accessed 1 Apr. 2026.',
  'lambsquarters/seedling_2.jpg': '"Common Lambsquarters." Integrated Crop Management, 1 May 2020, https://crops.extension.iastate.edu/encyclopedia/common-lambsquarters.',
  'large-crabgrass/seed_1.jpg': 'Large Crabgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=89. Accessed 1 Apr. 2026.',
  'large-crabgrass/seedling_1.jpg': 'Large Crabgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=89. Accessed 1 Apr. 2026.',
  'large-crabgrass/seedling_2.jpg': 'Large Crabgrass / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/large-crabgrass/. Accessed 1 Apr. 2026.',
  'Longspine_sandbur/seed_1.jpg': 'Washington State Noxious Weed Control Board. https://www.nwcb.wa.gov/weeds/longspine-sandbur. Accessed 3 Apr. 2026.',
  'marestail/seedling_1.jpg': 'Horseweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=115. Accessed 1 Apr. 2026.',
  'marestail/seedling_2.jpg': '"Horseweed (Marestail) – Conyza Canadensis." Plant & Pest Diagnostics, https://www.canr.msu.edu/resources/horseweed-marestail-conyza-canadensis. Accessed 1 Apr. 2026.',
  'Marijuana/seed_1.jpg': 'Nelson, Dan. "What Do Cannabis Seeds Look Like?" Happy Valley Genetics, 8 Aug. 2024, https://happyvalleygenetics.com/resources/what-do-cannabis-seeds-look-like/.',
  'Marijuana/seedling_1.jpg': 'The Natural Life Cycle of Cannabis in the Wild - Cannabis College. 8 Dec. 2022, https://cannabiscollege.com/knowledge-base/cannabis-cultivation/life-cycle-cannabis-wild/.',
  'Marijuana/seedling_2.jpg': 'Growing Autoflowering Cannabis: Discover All the Secrets. https://www.linda-seeds.com/en/home-grow/beginners-infos/how-to-grow-autoflowers-part-2-vegetative-and-flowering. Accessed 3 Apr. 2026.',
  'morningglory/seed_1.jpg': 'Ivyleaf Morningglory // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=138. Accessed 1 Apr. 2026.',
  'morningglory/seedling_1.jpg': 'Ivyleaf Morningglory // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=138. Accessed 1 Apr. 2026.',
  'morningglory/seedling_2.jpg': '"Ivyleaf Morningglory." Integrated Pest Management, https://www.canr.msu.edu/resources/ivyleaf_morningglory1. Accessed 1 Apr. 2026.',
  'Mouseear_chickweed/seed_1.jpg': 'Mouseear Chickweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=57. Accessed 1 Apr. 2026.',
  'Mouseear_chickweed/seedling_2.jpg': '"Crop Science | New Zealand." Bayer Group, Bayer AG, https://www.cropscience.bayer.co.nz/pests/weeds/mouse-eared-chickweed.',
  'Musk_thistle/seed_1.jpg': 'Musk Thistle // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=49. Accessed 1 Apr. 2026.',
  'Musk_thistle/seedling_1.jpg': 'Lamb, Bruce Ackley &. Alyssa, and Bruce Ackley. Musk Thistle. ohiostate.pressbooks.pub, https://ohiostate.pressbooks.pub/ohionoxiousweeds/chapter/musk-thistle/. Accessed 1 Apr. 2026.',
  'Musk_thistle/seedling_2.jpg': 'Musk Thistle - Plant Identification by Pamela Borden Trewatha, Ph.D. - Darr College of Agriculture - Missouri State. https://Ag.MissouriState.edu/PBTrewatha/musk-thistle.htm. Accessed 1 Apr. 2026.',
  'Nimblewill/seed_1.jpg': 'Nimblewill | Turfgrass and Landscape Weed ID. https://turfweeds.cals.cornell.edu/plant/nimblewill. Accessed 3 Apr. 2026.',
  'Nimblewill/seedling_1.jpg': 'Nimblewill. https://u.osu.edu/osuweeds/weed-id/grasses/nimblewill/. Accessed 3 Apr. 2026.',
  'Nimblewill/seedling_2.jpg': 'Nimblewill // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=181. Accessed 3 Apr. 2026.',
  'palmer-amaranth/seed_1.jpg': '"Management of Glyphosate-Resistant Palmer Amaranth in Corn and Soybean in New York." Weed Science, https://cals.cornell.edu/weed-science/herbicides/management-of-glyphosate-resistant-palmer-amaranth-corn-and-soybean-new-york. Accessed 1 Apr. 2026.',
  'palmer-amaranth/seedling_1.jpg': 'Lamb, Bruce Ackley &. Alyssa, and Bruce Ackley. Palmer Amaranth. ohiostate.pressbooks.pub, https://ohiostate.pressbooks.pub/ohionoxiousweeds/chapter/palmer-amaranth/. Accessed 1 Apr. 2026.',
  'palmer-amaranth/seedling_2.jpg': 'Hager, Aaron. "Is It Waterhemp or Palmer Amaranth?" Farmdoc, 5 June 2013, https://farmdoc.illinois.edu/field-crop-production/weeds/923.html.',
  'pennsylvania-smartweed/seed_1.jpg': 'Pennsylvania Smartweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=225. Accessed 1 Apr. 2026.',
  'pennsylvania-smartweed/seedling_1.jpg': 'Pennsylvania Smartweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=225. Accessed 1 Apr. 2026.',
  'pennsylvania-smartweed/seedling_2.jpg': 'Pennsylvania Smartweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=225. Accessed 1 Apr. 2026.',
  'Pinnate_tansymustard/seed_1.jpg': 'Tansy Mustard // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=373. Accessed 1 Apr. 2026.',
  'Pinnate_tansymustard/seedling_1.jpg': 'Pinnate Tansymustard | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/broadleaf-weeds-parent/broadleaf-pages7/pinnate-tansymustard.html. Accessed 1 Apr. 2026.',
  'poison-hemlock/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Conium Maculatum (Poison Hemlock). Fact sheet. 16 Oct. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/conium-maculatum.',
  'poison-hemlock/seedling_1.jpg': 'Poison Hemlock / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/poison-hemlock/. Accessed 1 Apr. 2026.',
  'poison-hemlock/seedling_2.jpg': '"Poisonous Hemlock (Conium Maculatum)." Horticulture For Home Gardeners, 6 Sept. 2021, https://horticultureforhomegardeners.ca/2021/09/06/poisonous-hemlock-conium-maculatum/.',
  'Prickly_lettuce/seed_1.jpg': 'Prickly Lettuce // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=151. Accessed 1 Apr. 2026.',
  'Prickly_lettuce/seedling_1.jpg': '"Prickly Lettuce." SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/prickly-lettuce/. Accessed 1 Apr. 2026.',
  'Prickly_lettuce/seedling_2.jpg': 'Prickly Lettuce // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=151. Accessed 1 Apr. 2026.',
  'Prickly_sida/seed_1.jpg': 'Prickly Sida // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=261. Accessed 1 Apr. 2026.',
  'Prickly_sida/seedling_1.jpg': '"Prickly Sida Sida Spinosa L." Weed Science, Cornell of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/prickly-sida. Accessed 1 Apr. 2026.',
  'Prickly_sida/seedling_2.jpg': 'Prickly Sida // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=261. Accessed 1 Apr. 2026.',
  'Quackgrass/seed_1.jpg': 'Quackgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=5. Accessed 1 Apr. 2026.',
  'Quackgrass/seedling_1.jpg': 'Hager, Heather A., et al. "Effects of Elevated CO2 on Photosynthetic Traits of Native and Invasive C3 and C4 Grasses." BMC Ecology, vol. 16, no. 1, Dec. 2016, p. 28. DOI.org (Crossref), https://doi.org/10.1186/s12898-016-0082-z.',
  'Quackgrass/seedling_2.jpg': '"Quackgrass." Integrated Crop Management, 1 July 2020, https://crops.extension.iastate.edu/encyclopedia/quackgrass.',
  'Redroot_pigweed/seed_1.jpg': 'Redroot Pigweed // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=15. Accessed 1 Apr. 2026.',
  'Redroot_pigweed/seedling_1.jpg': 'Redroot Pigweed. https://uspest.org/mint/redpigweed.htm. Accessed 1 Apr. 2026.',
  'Redroot_pigweed/seedling_2.jpg': 'Redroot Pigweed | Weed Identification Guide for Ontario Crops | Ontario.Ca. 13 Jan. 2023, http://www.ontario.ca/document/weed-identification-guide-ontario-crops/redroot-pigweed.',
  'Russian_thistle/seed_1.jpg': 'Russian Thistle // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=335. Accessed 1 Apr. 2026.',
  'Russian_thistle/seedling_1.jpg': 'Russian Thistle | Center for Invasive Species Research. https://cisr.ucr.edu/invasive-species/russian-thistle. Accessed 3 Apr. 2026.',
  'Russian_thistle/seedling_2.jpg': '"Russian-Thistle." SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/russian-thistle/. Accessed 1 Apr. 2026.',
  'Scouringrush/seed_1.jpg': 'Weeds: Horsetails (Scouringrush) – Equisetum Spp. | Hortsense | Washington State University. https://hortsense.cahnrs.wsu.edu/fact-sheet/weeds-horsetails-scouringrush-equisetum-spp/. Accessed 1 Apr. 2026.',
  'Shattercane_Sorghums/seed_1.jpg': 'Shattercane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=315. Accessed 1 Apr. 2026.',
  'Shattercane_Sorghums/seedling_1.jpg': 'Shattercane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=315. Accessed 1 Apr. 2026.',
  'Shattercane_Sorghums/seedling_2.jpg': 'Shattercane // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=315. Accessed 1 Apr. 2026.',
  'Shepherds_Purse/seed_1.jpg': '"Agriculture." Province of Manitoba, https://www.gov.mb.ca/agriculture/. Accessed 3 Apr. 2026.',
  'Shepherds_Purse/seedling_1.jpg': 'Shepherd\'s-Purse // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=47. Accessed 1 Apr. 2026.',
  'Shepherds_Purse/seedling_2.jpg': 'Shepherd\'s Purse in Wheat | Syngenta Canada. https://www.syngenta.ca/pests/weed/shepherd%27s-purse/wheat. Accessed 1 Apr. 2026.',
  'Smooth_Groundcherry/seed_1.jpg': 'Smooth Groundcherry | Turfgrass and Landscape Weed ID. https://turfweeds.cals.cornell.edu/plant/smooth-groundcherry. Accessed 3 Apr. 2026.',
  'Smooth_Groundcherry/seedling_1.jpg': 'Smooth Groundcherry // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=379. Accessed 1 Apr. 2026.',
  'Smooth_Groundcherry/seedling_2.jpg': 'Smooth Groundcherry // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=379. Accessed 1 Apr. 2026.',
  'Smooth_Witchgrass/seed_1.jpg': 'Fall Panicum // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=197. Accessed 1 Apr. 2026.',
  'Smooth_Witchgrass/seedling_1.jpg': '"Weed Science." Cornell College of Agriculture and Life Sciences. Fall Panicum Panicum Dichotomiflorum Michx., https://cals.cornell.edu/weed-science/weed-profiles/fall-panicum. Accessed 1 Apr. 2026.',
  'Smooth_Witchgrass/seedling_2.jpg': 'Fall Panicum // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=197. Accessed 1 Apr. 2026.',
  'Spotted_spurge/seed_1.jpg': '"Spotted Spurge (Euphorbia Maculata (L.) Small)." Insect Images, 1 Apr. 2026, https://www.insectimages.org/browse/image/5459583.',
  'Star_of_Bethlehem/seed_1.jpg': 'Ornithogalum Umbellatum. https://www.vanengelen.com/flower-bulbs-index/ornithogalum/ornithogalum-umbellatum.html. Accessed 3 Apr. 2026.',
  'Tall_morningglory/seed_1.jpg': 'Tall Morningglory // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=142. Accessed 1 Apr. 2026.',
  'Tall_morningglory/seedling_1.jpg': 'Tall Morningglory / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/tall-morningglory/. Accessed 3 Apr. 2026.',
  'Tall_morningglory/seedling_2.jpg': '"Morningglories." Weed Science, https://cals.cornell.edu/weed-science/weed-profiles/morningglories. Accessed 3 Apr. 2026.',
  'Toothed_spurge/seed_1.jpg': 'Euphorbia Dentata Page. https://www.missouriplants.com/Euphorbia_dentata_page.html. Accessed 1 Apr. 2026.',
  'Toothed_spurge/seedling_1.jpg': 'Toothed Spurge | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/broadleaf-weeds-parent/broadleaf-pages/toothed-spurge.html. Accessed 3 Apr. 2026.',
  'Toothed_spurge/seedling_2.jpg': 'Toothed Spurge | College of Agriculture, Forestry and Life Sciences | Clemson University, South Carolina. https://www.clemson.edu/cafls/research/weeds/weed-id-bio/broadleaf-weeds-parent/broadleaf-pages/toothed-spurge.html. Accessed 1 Apr. 2026.',
  'velvetleaf/seed_1.jpg': 'Velvetleaf // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=1. Accessed 1 Apr. 2026.',
  'velvetleaf/seedling_1.jpg': '"Velvetleaf, Abutilon Theophrasti." Wisconsin Horticulture, https://hort.extension.wisc.edu/articles/velvetleaf-abutilon-theophrasti/. Accessed 1 Apr. 2026.',
  'velvetleaf/seedling_2.jpg': '"Velvetleaf." Integrated Pest Management, https://www.canr.msu.edu/resources/velvetleaf. Accessed 1 Apr. 2026.',
  'Venice_mallow/seed_1.jpg': 'Venice Mallow // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=128. Accessed 1 Apr. 2026.',
  'volunteer-sunflower/seed_1.jpg': 'Common Sunflower // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=339. Accessed 1 Apr. 2026.',
  'volunteer-sunflower/seedling_1.jpg': '"Sunflower, Common." SARE, https://www.sare.org/publications/manage-weeds-on-your-farm/common-sunflower/. Accessed 1 Apr. 2026.',
  'volunteer-sunflower/seedling_2.jpg': 'Image: Seedling of Sunflower Credit: Jack Kelly Clark, UC IPM (W-CO-HANN-SG.004). https://ipm.ucanr.edu/PMG/H/W-CO-HANN-SG.004.html#gsc.tab=0. Accessed 1 Apr. 2026.',
  'Water_smartweed/seed_1.jpg': 'Water Smartweed, Persicaria Amphibia (L.) Gray. https://www.friendsofeloisebutler.org/pages/plants/smartweed_water.html. Accessed 1 Apr. 2026.',
  'waterhemp/seed_1.jpg': 'Common Waterhemp // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=319. Accessed 1 Apr. 2026.',
  'waterhemp/seedling_1.jpg': '"Weed Science." Waterhemp Amaranthus Tuberculatus (Moq.) Sauer Amaranthus Rudis Sauer, Cornell College of Agriculture and Life Sciences, https://cals.cornell.edu/weed-science/weed-profiles/waterhemp. Accessed 1 Apr. 2026.',
  'waterhemp/seedling_2.jpg': 'Common Waterhemp // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=319. Accessed 1 Apr. 2026.',
  'White_campion/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Silene Latifolia Subsp. Alba (White Cockle). Fact sheet. 7 Nov. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/silene-latifolia-subsp-alba.',
  'White_campion/seedling_1.jpg': '"Silene Latifolia Poir." Idseed, https://seedidguide.idseed.org/fact_sheets/silene-latifolia-subsp-alba/. Accessed 1 Apr. 2026.',
  'Wild_buckwheat/seed_1.jpg': 'Wild Buckwheat // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=222. Accessed 1 Apr. 2026.',
  'Wild_buckwheat/seedling_2.jpg': 'Black Bindweed - BASF Agricultural Solutions UK. https://www.agricentre.basf.co.uk/en/Services/Pest-Guide/Weeds/Broadleaf-weeds/Black-Bindweed/. Accessed 1 Apr. 2026.',
  'Wild_Carrot/seed_1.jpg': 'Wild Carrot // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=85. Accessed 1 Apr. 2026.',
  'Wild_Carrot/seedling_1.jpg': 'Wild Carrot // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=85. Accessed 1 Apr. 2026.',
  'Wild_Carrot/seedling_2.jpg': 'Wild Carrot // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=85. Accessed 1 Apr. 2026.',
  "Wild_Four-o'clock/seed_1.jpg": '"Four O\'Clock Flower." Vineyard Gazette, Vineyard Gazette, https://vineyardgazette.com/news/2024/04/24/four-oclock-flower.',
  "Wild_Four-o'clock/seedling_1.jpg": '"Wild Four-o\' Clock." Integrated Crop Management, 1 Mar. 2021, https://crops.extension.iastate.edu/encyclopedia/wild-four-o-clock.',
  'Wild_mustard/seed_1.jpg': 'Wild Mustard // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=263. Accessed 1 Apr. 2026.',
  'Wild_mustard/seedling_1.jpg': '"Wild Mustard." Weed Science, https://cals.cornell.edu/weed-science/weed-profiles/wild-mustard. Accessed 3 Apr. 2026.',
  'Wild_mustard/seedling_2.jpg': '"Weed Science." Wild Mustard Sinapis Arvensis L. = Brassica Kaber (DC.) L.C. Wheeler, Cornell CALS, https://cals.cornell.edu/weed-science/weed-profiles/wild-mustard. Accessed 1 Apr. 2026.',
  'wild-oat/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Avena Fatua (Wild Oat). Fact sheet. 7 Nov. 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/avena-fatua.',
  'wild-oat/seedling_1.jpg': '"Agriculture." Province of Manitoba, https://www.gov.mb.ca/agriculture/. Accessed 1 Apr. 2026.',
  'wild-oat/seedling_2.jpg': '"Agriculture | Province of Manitoba." Province of Manitoba - Agriculture, https://www.gov.mb.ca/agriculture/. Accessed 1 Apr. 2026.',
  'wild-parsnip/seed_1.jpg': 'Agency, Canadian Food Inspection. Weed Seed: Pastinaca Sativa (Wild Parsnip). Fact sheet. 14 July 2017, http://inspection.canada.ca/en/plant-health/seeds/seed-testing-and-grading/seeds-identification/pastinaca-sativa.',
  'wild-parsnip/seedling_1.jpg': 'Lamb, Bruce Ackley &. Alyssa, and Bruce Ackley. Wild Parsnip. ohiostate.pressbooks.pub, https://ohiostate.pressbooks.pub/ohionoxiousweeds/chapter/wild-parsnip/. Accessed 1 Apr. 2026.',
  'wild-parsnip/seedling_2.jpg': '"Poisonous to Touch Weed Series: Wild Parsnip (Pastinaca Sativa)." Horticulture For Home Gardeners, 15 Mar. 2021, https://horticultureforhomegardeners.ca/2021/03/15/poisonous-to-touch-weed-series-wild-parsnip-pastinaca-sativa/.',
  'Witchgrass/seed_1.jpg': 'Witchgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=195. Accessed 1 Apr. 2026.',
  'Witchgrass/seedling_1.jpg': 'Witchgrass | Cornell Weed Identification. https://blogs.cornell.edu/weedid/witchgrass-2/. Accessed 1 Apr. 2026.',
  'Witchgrass/seedling_2.jpg': 'Witchgrass | Cornell Weed Identification. https://blogs.cornell.edu/weedid/witchgrass-2/. Accessed 1 Apr. 2026.',
  'Woolly_cupgrass/seed_1.jpg': 'Woolly Cupgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=426. Accessed 1 Apr. 2026.',
  'Woolly_cupgrass/seedling_1.jpg': '"Woolly Cupgrass." Integrated Crop Management, 1 May 2020, https://crops.extension.iastate.edu/encyclopedia/woolly-cupgrass.',
  'Woolly_cupgrass/seedling_2.jpg': 'Woolly Cupgrass // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=426. Accessed 1 Apr. 2026.',
  'yellow_Rocket/seed_1.jpg': 'Yellow Rocket // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=36. Accessed 1 Apr. 2026.',
  'yellow_Rocket/seedling_1.jpg': 'Yellow Rocket | Cornell Weed Identification. https://blogs.cornell.edu/weedid/yellow-rocket/. Accessed 1 Apr. 2026.',
  'yellow_Rocket/seedling_2.jpg': 'Kenraiz, Krzysztof Ziarnek. English: Barbarea Vulgaris Seedling in Glinna near Szczecin, WN Poland. 20 Apr. 2019, Own work. Wikimedia Commons, https://commons.wikimedia.org/wiki/File:Barbarea_vulgaris_kz01.jpg.',
  'yellow-foxtail/seed_1.jpg': 'Yellow Foxtail / UC Statewide IPM Program (UC IPM). https://ipm.ucanr.edu/weeds-identification-gallery/yellow-foxtail/. Accessed 1 Apr. 2026.',
  'yellow-foxtail/seedling_1.jpg': 'Yellow Foxtail // Mizzou WeedID. https://weedid.missouri.edu/weedinfo.cfm?weed_id=257. Accessed 1 Apr. 2026.',
  'yellow-foxtail/seedling_2.jpg': 'Weed of the Month: The Foxtails (Kevin Bradley). https://ipm.missouri.edu/cropPest/2014/5/Weed-of-the-Month-the-Foxtails/. Accessed 1 Apr. 2026.',
  'yellow-nutsedge/seed_1.jpg': 'Washington State Noxious Weed Control Board. https://www.nwcb.wa.gov/weeds/yellow-nutsedge. Accessed 1 Apr. 2026.',
  'yellow-nutsedge/seedling_1.jpg': '"Yellow Nutsedge." Turfgrass Science at Purdue University, 27 June 2014, https://turf.purdue.edu/yellow-nutsedge/.',
  'yellow-nutsedge/seedling_2.jpg': 'Nutsedge, Yellow in Corn | Syngenta Canada. https://www.syngenta.ca/pests/weed/nutsedge--yellow/corn. Accessed 1 Apr. 2026.',
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
    vegetative: 'veg',
    flower: 'repro',
    whole: 'plant',
    ligule: 'ligu',
  };

  const citations = new Set<string>();

  for (const weedId of weedIds) {
    for (const stage of stages) {
      const prefix = STAGE_PREFIX_MAP[stage] || 'veg';
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
