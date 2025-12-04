// const MAP_LOCATION = [-71.41220993323749, 41.82584977266063];
const MAP_LOCATION = [-71.41101368514123, 41.825960539744244];

const BASIN_COORDS = [-71.41397245285212, 41.82683612316379];
const STEEPLE_ST_COORDS = [-71.40950598748309, 41.827326655457426];
const CANAL_WALK_COORDS = [-71.40971126085167, 41.82695216340048];
const WASHINGTON_ST_COORDS = [-71.40911667592111, 41.826830848602896];
const WATERFIRE_CIRCLE_TENT_COORDS = [-71.40839467993477, 41.82574427972813];
const COLLEGE_ST_COORDS = [-71.40829558244626, 41.825522744005156];
const STAR_WALK_COORDS = [-71.40785672214079, 41.825148241397045];

const FIRE_COORDS = [
  // river pre-basin, in -> out
  [-71.41512816754688, 41.82716050251955],
  [-71.41494725419231, 41.82714687010798],
  [-71.41480496278989, 41.82713020826799],
  [-71.41465250771626, 41.82711506113705],
  [-71.41448582350186, 41.82709991400253],
  [-71.41428661553873, 41.82707870800809],

  // from basin, clockwise
  [-71.41397357445243, 41.8270514431473],
  [-71.41379469383236, 41.82702720770635],
  [-71.41368899164765, 41.826887853741255],
  [-71.41374997367734, 41.826746984750685],
  [-71.41389226507974, 41.82667882222461],
  [-71.41407724390268, 41.82667882222461],
  [-71.41417888061898, 41.82674395530685],
  [-71.41423376444526, 41.82688936846],
  [-71.41415855327539, 41.827004486971845],

  // river post-basin in -> out
  [-71.41357109305721, 41.826740925862396],
  [-71.41341253978017, 41.82678788223163],
  [-71.4132397573635, 41.826846956324175],
  [-71.41305681127446, 41.82691057451717],
  [-71.41291451987203, 41.826952986610394],
  [-71.41277832667362, 41.82700145753972],
  [-71.41262180613106, 41.82705295786218],

  // out of first frame, river in -> out
  [-71.41245715465142, 41.82709385514954],
  [-71.41208922973941, 41.827157473097344],
  [-71.41193474193037, 41.827166561369836],
  [-71.41173146849954, 41.82717413493009],
  [-71.41154648967657, 41.82717262021848],
  [-71.4113696417894, 41.82716807608159],
  [-71.411172466562, 41.827145355397874],
  [-71.41097325859829, 41.82710748757256],
  [-71.41079031251012, 41.827062046152264],

  // around the U
  [-71.41064192290273, 41.8270075164053],
  [-71.41031668541216, 41.82682272080757],
  [-71.41022724510154, 41.82676213197044],
  [-71.41013170658921, 41.826686395844064],
  [-71.41004633174725, 41.826621262703526],

  // between washington and college
  [-71.40965026555152, 41.82649116758009],
  [-71.40958928352242, 41.826413916403624],
  [-71.40949577774313, 41.82631848835018],
  [-71.40947693794898, 41.826198818596055],
  [-71.40937584641881, 41.82612611708029],
  [-71.40927274813966, 41.826033701785775],
  [-71.40914751850272, 41.82593297630052],
  [-71.40904994725564, 41.82584209176099],
  [-71.4089518673563, 41.825754340295504],
  [-71.40882583782854, 41.825655881763396],
  [-71.40872623384668, 41.82555742308054],
  [-71.40865428928602, 41.82545288505659],

  // between college and crawford
  [-71.4085590263154, 41.825295302042406],
  [-71.40850210975496, 41.825218049423],
  [-71.4084390949911, 41.8251165605451],
  [-71.40837608022635, 41.82500295340199],
  [-71.40832141427293, 41.82490032258369],
  [-71.40824598673433, 41.82478028240905],
  [-71.40817280829837, 41.8246515269546],
  [-71.40811795135664, 41.82453469701133],
  [-71.40804274018679, 41.824407455840685],
  [-71.40798579674151, 41.82429858420613],
];

mapboxgl.accessToken =
  "pk.eyJ1IjoiYXNpbmcxMjIiLCJhIjoiY2x1MXV6Z29lMHFzMTJrcHBsMDgwYzRjeiJ9.XOdMvSBM5o_sG4IwTVhTwA";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/asing122/cmidezdpf001701s06jo5fy8g",
  zoom: 16.6,
  center: MAP_LOCATION,
});

var boatMarker;

let mapStart;

window.addEventListener("load", () => {
  const mapSection = document.getElementById("map");
  mapStart = mapSection.offsetTop;
});

map.on("load", () => {
  for (const coord of FIRE_COORDS) {
    const el = document.createElement("div");
    el.className = "marker-fire";
    new mapboxgl.Marker(el).setLngLat(coord).addTo(map);
  }

  const el = document.createElement("div");
  el.className = "marker-boat";

  boatMarker = new mapboxgl.Marker(el)
    .setLngLat([-71.41512816754688, 41.82716050251955])
    .addTo(map);
});

map.scrollZoom.disable();
// map.panRotate.disable();

map.on("click", (e) => {
  console.log(`${e.lngLat.lng}, ${e.lngLat.lat}`);
});

const messages = [
  {
    id: "liz-knights",
    name: "Liz Knights, fire performer",
    grafs:
      "Fire performer Liz Knights has been lighting up the Providence River as part of WaterFire for over a decade. Knights’s company, Cirque de Light, now employs most of the fireball-twirling performers on WaterFire boats — and occasionally, Knights performs with them, she said.<br/><br/>Knights’s path to performance began while she was a student at Brown, where she joined the juggling club and found a community that cultivated her interest in circus arts and gymnastics. After leaving school due to illness, she began performing professionally and soon crossed paths with WaterFire’s original fire spinner. After asking him if she could join the act, she received a formal invitation from the organizers.<br/><br/>Since then, Cirque de Light has grown to include over 60 fire performers, with about 10 rotating through WaterFire performances each season. “They’ll light their fire prop off of one of the torches, and then perform in the basin, and then perform going up and down the river, which is really fun, because you get to see so many different people,” Knights said. <br/><br/>For Knights, the choreography and spectacle are part of what makes the event so rewarding — and surprisingly safe. “People think it’s way more dangerous than it is,” she said, adding that she’s gotten more severe burns from household objects than the fire she performs with. <br/><br/>The night “is incredibly immersive,” she said. “You’re surrounded by the audience. You’re surrounded by fire and music.”<br/><br/>Having performed at WaterFire for so many years, it feels “like a family,” Knight said. She expressed gratitude that this year’s season was able to happen, but worried about the event’s uncertain future. “It’s one of those things where people might not recognize the effect until it’s gone,” she added.<br/><br/>“I just like making people happy,” Knights added. “I’m there to make them feel joy, awe, wonder. All those things are very gratifying.”",
    photo: {
      src: "images/FireDancerLizKnights_CO_Jake_Parker.jpg",
      alt: "A woman dressed in a red and black costume holds multiple burning sticks in between her fingers in a pose as onlookers watch and film in front of her. ",
      credit: "Jake Parker",
    },
  },
  {
    id: "staff-sergeant",
    name: "Barry Lima Jr., Staff sergeant",
    grafs:
      "This year’s Nov. 1 lighting featured a “Salute to Veterans” event at the basin. Barry Lima Jr., a veteran staff sergeant, was one of the torch holders at the ceremony. Around 50 veterans participated in this year’s event, lighting the braziers that line the river, according to Lima.<br/><br/> Lima and his wife come to WaterFire each year. After seeing a call for veterans to perform at the Nov. 1 lighting, Lima signed up. The experience was incredibly meaningful, he told The Herald. <br/><br/>Lima recalled taking a photo with his late father at the same spot where he lit the torches on Nov. 1. “This place is pretty special. With my dad not being here, I think of him a lot when I come here,” Lima said.<br/><br/>He added that he felt instantly connected to his fellow veterans during the ceremony. “Even just being down there — I didn’t know any of them — we all still felt like brothers and sisters. Strangers, but we’ve all been through the same hardship of wearing the uniform.”",
    photo: {
      src: "images/Barry LimaStaffsergeant_CO_Kaia_Yalamanchili.jpg",
      alt: "A man with glasses in a veteran’s uniform smiling at the camera. He has his cap in his hand. He stands next to a blonde woman in a tan fuzzy coat, who is also smiling.",
      credit: "Kaia Yalamanchili",
    },
  },
  {
    id: "pourever-creations",
    name: "Cathy Tague, owner of Pourever Creations",
    grafs:
      "Cathy Tague is the owner of Pourever Creations, a small family business that works with acrylic paint and epoxy to create designs on everything from wine glasses to charcuterie boards. Using a technique called pour painting, Tague primarily designs ocean-themed glassware. <br/><br/>Pourever Creations started around seven years ago when Tague’s husband suggested that Tague pour epoxy over acrylic paint to make a glossy finish. They began selling their creations at local crafts fairs and Small Business Saturday, a WaterFire initiative that features local businesses at their arts center. <br/><br/>Since being accepted as a WaterFire vendor, Pourever Creations has been at nearly every lighting. <br/><br/>“WaterFire is, by far, our biggest and best event that we do,” Tague said. <br/><br/>But the preparation process can be complicated, Tague said, given that vendors often only find out if they’ve been selected for an upcoming lighting around a month in advance. Since she works with epoxy, which can take up to a few weeks to fully set, Tague said it’s “about a month-long process to really get things up and going.” <br/><br/>Tague added that while their ocean designs are most popular, she likes to design her products for WaterFire based on the upcoming event. For the Veterans WaterFire, she designed red, white and blue pieces to sell.<br/><br/>WaterFire has been crucial for building her business, Tague said, as she often gets repeat customers across multiple WaterFires. “Every year they come back and get a new gift for someone that matches what they brought them last year.” <br/><br/>She also emphasized “the excitement and energy” of event staff, attendees and other vendors. One rainy WaterFire night, she recalled, staff and vendors tried to help each other keep their stalls dry. <br/><br/>“You’d think it would be the most miserable thing ever, but it’s one of our favorite memories,” Tague said. “You build a community.”<br/><br/>Tague expressed concern about the recent decrease in WaterFire lightings. “I’m a small business, and I rely on WaterFire,” she said.",
    photo: {
      src: "images/PoureverCreations_CO_Mia_Santomassimo.jpg",
      alt: "Photo of various glasses with blue, ocean-like designs on a white tiered display.",
      credit: "Mia Santomassimo",
    },
  },
  {
    id: "honey-shack",
    name: "Paul Octeau, owner of Paul & Sandy’s Honey Shack",
    grafs:
      "Paul Octeau is a local beekeeper and owner of Paul & Sandy’s Honey Shack, selling raw honey, beeswax candles and honey sticks. He has worked as a beekeeper for over 10 years, helping manage 37 hives throughout Rhode Island, he told The Herald.<br/><br/>Octeau said he found out about WaterFire from some of his friends who are also vendors. <br/><br/>This is the Honey Shack’s second year as a vendor at WaterFire, which he said has been “great for sales.” He said that the Honey Shack usually sets up shop at about one WaterFire lighting per month. <br/><br/>Octeau noted the importance of donations for WaterFire, especially due to the loss of sponsors. “The more people they can get to donate, then they can keep the fires burning,” he added.",
    photo: {
      src: "images/PaulOctau(honey-shack)_CO_Mia_Santomassimo.jpg",
      alt: "Photo of various flavors of honey sticks on display in jars in wood frames with 3 crocheted bumble bees behind them.",
      credit: "Mia Santomassimo",
    },
  },
  {
    id: "tigris-handmade",
    name: "Selahattin Sep, Tigris Handmade",
    grafs:
      "For Selahattin Sep, founder and owner of shoe store Tigris Handmade, shoemaking is “a family tradition.” His family has been making shoes for 700 years, he said, with “no glue, no synthetic materials, no machine (and) no electricity.”<br/><br/>“Everything is made by hand,” he said, explaining that different pieces of leather are hand-stitched together to construct the shoes.<br/><br/>This method requires at least three days to produce five or six pairs. But the shoes he produces last a long time: “Six years old, and they still look brand new,” Sep said.<br/><br/>Since the shoes don’t use any chemicals, they can also be composted.<br/><br/>Since Tigris Handmade doesn’t mass produce its merchandise, Sep doesn’t have enough pieces to keep his shop open while he displays his work at WaterFire. Despite the additional effort required to move the shoes to the riverfront, “it’s fun to be here,” he said. <br/><br/>“It’s not all about making money,” he said, adding that often, it’s “not worth it” financially to be part of the event.<br/><br/>Instead, he continues to come back to WaterFire because of the diverse crowds it attracts, he said. He believes that the community he builds at these events is sometimes “better than money.”",
    photo: {
      src: "images/TigrisHandmade_CO_Horatio_Hamilton.jpg",
      alt: "Photo of Selahattin Sep, founder and owner of Tigris Handmade, sitting on a white chair in the Tigris Handmade vendor tent. Various colored shoes hang around the tent.",
      credit: "Horatio Hamilton",
    },
  },
  {
    id: "origami-master",
    name: "Andrew Anselmo, origami",
    grafs:
      "Andrew Anselmo, a mechanical engineer and origami street performer, has been folding paper creations at WaterFire for over two decades. His journey with origami began “peripherally” as a child, but it wasn’t until a university conference in Turkey that he discovered the joy of folding for others after being asked by attendees to perform origami, he said. <br/><br/>“And next thing you know, I’m making a couple of bucks,” said Anselmo, who is now a self-described origami master and street performer.<br/><br/>Anselmo first brought origami to WaterFire when he folded peace cranes along the canal after the attacks on Sept. 11, 2001. “My primary and best gig ever has been WaterFire,” he said. Since then, he has returned year after year, driving down from Boston with his wooden box and knapsack, quietly folding for hours as crowds wander past, absorbing the music and firelight.<br/><br/>For Anselmo, the performance is about connection, not compensation. “You’re interacting with the crowd by giving stuff away,” he said. “I’ve got a sign on my little tip jar that says, ‘If you can’t leave a tip, leave a note,’ and that allows people to interact with you, and they don’t feel guilty if they don’t have any money.”<br/><br/>The reactions he receives are as varied as they are memorable. “I’ve had people say, ‘Can you make a ring for me? I want to propose to my girlfriend,’” Anselmo said. “I’ve had people come up to me saying, ‘This is my last WaterFire because I got cancer and I’m going to be gone.’”<br/><br/>Despite the funding cuts, Anselmo remains committed to the event: “You need music. You need paints. You need sculpture. … You need people doing all sorts of wacky stuff to make life worthwhile.”",
    photo: {
      src: "images/OrigamiMaster_CO_Kaia_Yalamanchili.jpg",
      alt: "Photo of Andrew Anselmo wearing a black, black trenchcoat grey scarf and fingerless gloves, gesturing to either side with his hands.",
      credit: "Kaia Yalamanchili",
    },
  },
  {
    id: "brown-students",
    name: "Tiziano Pardo ’28 and Emily Benitez ’28",
    grafs:
      'For Tiziano Pardo ’28 and Emily Benitez ’28, WaterFire has become a defining part of their time in Providence.<br/><br/>“It’s the one thing I feel like Providence has that’s very unique,” Pardo said. “It’s really beautiful seeing how the community engages with each other.”<br/><br/>Benitez said she was drawn to the event’s atmosphere and the sense of calm it provides. “I love the water, so being here with the fires — I think it’s a nice visual,” she said. “It gives me a break from school.” <br/><br/>Pardo, who attended a recent state budget hearing about WaterFire, said he’s concerned about cuts to the event’s funding. “It’s quite unfortunate,” he said, referring to <a href="https://www.browndailyherald.com/article/2025/02/proposed-142-billion-state-budget-seeks-to-close-deficit" target="_blank">statewide budget deficits</a>. Pardo highlighted the economic footprint of an event like WaterFire, describing how “you’re propping up local vendors, local artists, hotels, restaurants.”<br/><br/>He added that the budget cuts “only (make) it more important for private actors like Brown to support the event.”<br/><br/>“I can only hope that they continue doing this,” Benitez said. “It’s been a big part of my Brown experience, and I would love to keep coming and seeing this.”',
    photo: {
      src: "images/EmilyBenitezandTizianoPardo_CO_Kaia_Yalamanchili.jpg",
      alt: "A black haired man and a brunette woman smile at the camera. The woman wears a black leather jacket, and the man wears an orange cargo jacket.",
      credit: "Kaia Yalamanchili",
    },
  },
  {
    id: "juliana-craige",
    name: "Juliana Craige, event day staff and cashier",
    grafs:
      "Event-day staffer Juliana Craige has been working with WaterFire since June 2023. She helps unload trucks and set up the WaterFire merchandise stand. <br/><br/>“The amount of work that it takes and coordination with the city to make a WaterFire happen is insane,” Craige said, pointing to staffers who come to set up early in the morning and the police that block off the streets the night before a lighting.<br/><br/>One of Craige’s favorite memories of setting up at WaterFire is of a lighting on a rainy day. <br/><br/>“We got halfway through setup, and it started torrentially pouring,” Craige said. From there, she and her supervisors brainstormed a solution: to pull two trucks onto the street facing one another and set up the merchandise tents in the middle. <br/><br/>“We were working out of the trucks, and everybody was gathering under the tents,” Craige said. “It was super hectic, but super fun.” ",
    photo: {
      src: "images/JulianaCraige(merchtent)_CO_Caleb_Lee-Kong.jpg",
      alt: "PHoto of a street tent with items for sale on display, including various pictures laid out on a black table and other miscellaneous items in boxes.      ",
      credit: "Caleb Lee-Kong",
    },
  },
  {
    id: "patio-ri",
    name: "Angel Winpenny, The Patio on Broadway and Trinity Brewhouse",
    grafs:
      "Angel Winpenny — owner of local eateries the Patio on Broadway and the recently acquired Trinity Brewhouse — ran a stall at WaterFire where she served alcoholic beverages from both locations.<br/><br/>“This is an opportunity that we’re thankful to partake in by representing our business to the local community,” she said. “We like to participate in community events.”<br/><br/>Events like WaterFire, she added, give tourists “an idea of what the city of Providence has to offer.” <br/><br/>Winpenny added that a portion of her sales from WaterFire will be donated back to the event, noting the importance of doing “all that we can to help support” WaterFire.<br/><br/>She said she finds “a lot of joy” in being part of the event. “It’s nice to connect with other individuals, other vendors and visitors,” she said.",
    photo: {
      src: "images/PatioOnMain_CO_Horatio_Hamilton.jpg",
      alt: "Photo of someone facing away from the camera wearing a black shirt that reads “The Patio on Main.” Along with someone else, they are working at The Patio on Main’s tent.",
      credit: "Horatio Hamilton",
    },
  },
  {
    id: "gather-glass",
    name: "Matt Stone, co-owner of Gather Glass",
    grafs:
      "Since 2011, Matt Stone has been working with WaterFire as the co-owner of Gather Glass, a Federal Hill-based glassblowing studio that offers handcrafted products, lessons and more.<br/><br/>With help from event staff, Gather Glass originally sold “wearable necklaces and earrings,” Stone said, along with WaterFire-themed glasses. Over the years, Gather Glass’s live demonstrations and range of product offerings have evolved and grown.<br/><br/>WaterFire has “never been anything but wonderful,” Stone said. The festival brings together “such a big group of people from such a variety of places,” he added.<br/><br/>Gather Glass has held live glassblowing demonstrations for its entire tenure at WaterFire. Equipped with a mobile furnace, two glassmakers often work on a piece at the same time next to the sales tent. That piece “could be a vase, or a cup or a bird,” Stone said.<br/><br/>“It’s a dance with the medium, and everyone can be part of something special” watching the demonstration, Stone added. “Sometimes we’ll have 50, 100 people watching us make a piece.”<br/><br/>WaterFire is “such an important part of our business,” Stone said. The festival provides a chance for attendees to purchase glass products and for people to “learn about who we are” and sign up for glassblowing classes, he added.<br/><br/>The financial boost that WaterFire provides Gather Glass “carries over” for “weeks and months beyond” the event, Stone said. “The business that we get from WaterFire is huge.”<br/><br/>As a whole, WaterFire nights are “so important for the economy and the jobs that are here” in Providence, Stone said. Despite funding changes throughout the years, Stone emphasized the consistency of “really big, fun crowds” that attend the festival.<br/><br/>“It brings this beautiful atmosphere and energy to the city that you just can’t replicate anywhere else,” Stone said. “When I think of Providence, I think of WaterFire.”",
    photo: {
      src: "images/GlassblowingGatherGlass(MattStone)_CO_Horatio_Hamilton.jpg",
      alt: "A small wooden stair-shaped shelf holds a variety of colorful glass-blown figures. A small chalk sign next to the shelf reads “birds $40.”",
      credit: "Horatio Hamilton",
    },
  },
  {
    id: "joseph-mushipi",
    name: "Joseph Mushipi, visual artist",
    grafs:
      "Hailing from Zambia, visual artist Joseph Mushipi has been participating in WaterFire since 2002.<br/><br/>“Nature is the source of my inspiration,” he said. “I paint magical trees. I paint leaves. I’m so obsessed with nature.”<br/><br/>Mushipi describes his experience with WaterFire as simply “phenomenal.”<br/><br/>“I sell my art to a lot of big festivals,” he said. But his experience with WaterFire in particular has helped him “learn a lot and improve so much.” <br/><br/>Especially because of its frequency compared to other festivals across New England, WaterFire has provided him the most “exposure,” he said.<br/><br/>The process of preparing for WaterFire “takes so much work,” Mushipi explained. Throughout the year, he has to stay stocked with art materials and build a strong inventory of prints. The night of the festival, he comes early to set up his booth and string lights across the inside.<br/><br/>“It’s art on its own, just arranging the paintings on the wall,” he added. “So I love it.”<br/><br/>But his work has not come without financial difficulties.<br/><br/>“Especially this year, sales have gone way down,” he said. “Looking at what is happening in the country,” he believes that more people are choosing to spend their money on basic necessities, such as food.<br/><br/>“But I signed up for this,” he added. “Two paintings, or prints, whatever comes out of it — you just say, ‘Thank God for that.’”<br/><br/>During WaterFire nights, Mushipi’s booth often sees hundreds of faces taking a peek at the work hanging inside.<br/><br/>“Watching people walk past, I see a lot of sad faces,” he said. “But the moment they come close to my art, their face changes. The customer came very sad, and he goes home very happy. I want to achieve that.”",
    photo: {
      src: "images/Joseph_Mushipi_CO_Vanson_Vu.jpg",
      alt: "Photo of Joseph Mushipi wearing a rainbow splatter-painted jacket and shirt with a multicolored hat standing in front of various brightly colored artworks.",
      credit: "Vanson Vu",
    },
  },
  {
    id: "good-vibes",
    name: "Tommy Tainsh, owner of Good Vibes Beverages",
    grafs:
      "Tommy Tainsh, owner of Good Vibes Beverages, said that he and many of his coworkers “have worked for other companies that have done WaterFire … for probably 30 years.”<br/><br/>But Good Vibes is a new company, Tainsh noted. “This is our first summer, and it’s been great,” he said.<br/><br/>Their WaterFire menu advertised several seasonal offerings, including a hot apple cider with caramel whiskey and a spiced fall sangria. At the events they cater, Tainsh said, “we try to bring a little bit of everything.”<br/><br/>He said that Good Vibes tries “to do something a little extra special” for each event — for WaterFire that day, the company had “glow-in-the-dark ice cubes,” he said. <br/><br/>The company also sells several locally sourced beers, since for the last three decades, Tainsh has worked as a brewer. “We support a lot of local breweries, because it’s tough in this day and age,” he said.<br/><br/>Preparing for the event takes weeks, Tainsh noted. For WaterFire, Good Vibes made 50 gallons of hot apple cider.<br/><br/>In catering, Tainsh added, Good Vibes model its approach after the company name: They “bring the positive energy and hope for the best.”<br/><br/>“It seems like a five-hour event, but it’s more like a three-week event,” he joked, adding that “it’s worth the effort, because when you have people and they enjoy what you bring … that’s all you could ask for,” he said.<br/><br/>WaterFire is “huge” for local businesses, Tainsh said. “Not everybody goes out anymore … the new generation stays in,” he added, but he sees WaterFire as “an excuse to come out.”<br/><br/>Tainsh said there may be a silver lining despite funding cuts: With fewer WaterFire lightings, more visitors may flock to each. “If you have one every week, maybe as many people won’t come,” he said. ",
    photo: {
      src: "images/GoodVibes_CO_Horatio_Hamilton.jpg",
      alt: "A food truck’s menu. Below the menu is a long line of different levers.",
      credit: "Horatio Hamilton",
    },
  },
  {
    id: "felicia-laroche",
    name: "Felicia LaRoche, event attendee",
    grafs:
      "Felicia LaRoche, a senior at Rhode Island College, said her Nov. 1 visit to WaterFire was her “fifth or sixth time” there.<br/><br/>She expressed enthusiasm for “the live music” and the bustle of the event. In particular, LaRoche explained that she regularly comes to see Gather Glass’s live glassblowing demonstrations.<br/><br/>“It’s just really pretty,” she said, watching a glassblower place a sculpture into the kiln. “It’s nice art.”",
  },
  {
    id: "living-statue",
    name: "Tara Smith, living statue performance artist",
    grafs:
      "Tara Smith, a performance artist and living statue, has spent the last 20 seasons bringing WaterFire to life — without moving an inch. She “fell into” the craft 21 years ago, she told The Herald, starting to busk in her hometown of Bridgewater, Massachusetts. <br/><br/>“I’ve always been a generally artsy person, but living statuary and performance art in general has been the art form that really gripped my soul,” Smith said.<br/><br/>Smith started out performing near the Washington Street Bridge, an area that wasn’t originally part of the event. But after a few years, WaterFire organizers reached out to her, inviting Smith to become a formal fixture of the event. <br/><br/>“It’s central to my life at this point,” Smith said. “It’s been nice seeing the same people coming to WaterFire year after year. I have adults, they’re in their 20s now, talking about seeing me when they were a little kid.”<br/><br/>During performances, she scans the crowd looking for chances to connect — with a wave to a child or a gentle gesture to ease someone’s nerves. Her characters, Smith said, are pieces of herself she “pluck(s) out and put on display … and give them a moment to shine.”<br/><br/>WaterFire’s atmosphere sets it apart from other performance events, Smith said. “There is inherently this sort of unwinding at the end of the day with something fun,” encouraging reflection and small, meaningful interactions, she said.<br/><br/>For Smith, the WaterFire season provides the bulk of her annual income, and she relies on the event not just financially but creatively. Smith worries about the event’s future, particularly after funding cuts and the slowdown caused by the pandemic. “I rely on the WaterFire season to be the bulk of my income for the year,” she said.<br/><br/>But she remains committed. “I have no plans to retire anytime soon,” she said. “I’m going to keep performing until my body says, ‘No, we can’t do this anymore.’”",
  },
  {
    id: "waterfire-circle",
    name: "WaterFire Circle",
    grafs:
      'At WaterFire, “we don’t have any fancy seats by the river where you get the best view. We don’t sell seats on a boat to ride because it’s meant to be seen by everybody from the shore,” Evans told The Herald.<br/><br/>WaterFire does, however, offer boat rides to members of the WaterFire Circle, their “most generous supporters.”<br/><br/>WaterFire Circle offers both individual and corporate membership plans. The lowest individual plan, which grants the purchaser 16 WaterFire Circle tickets, costs $1,500. The pricier gold plan costs $5,000, granting the purchaser 30 tickets and the ability to reserve a private boat ride, <a href="https://waterfire.org/support/waterfire-circle/" target="_blank">according to their website</a>.<br/><br/>Circle members also have access to the WaterFire Circle reception tent, a private seating area with refreshments, beverages and a private fire-dancer show.',
  },
  {
    id: "waterfire-circle-volunteer",
    name: "Jeanine Palumbo, volunteer with WaterFire Circle",
    grafs:
      "Since 2007, Jeanine Palumbo has volunteered at WaterFire. She currently works at the welcome tent for the WaterFire Circle.<br/><br/>She said the WaterFire Circle aims to make up for the recent decrease in donations for the event. While the state and city contribute funds, “it’s nowhere near what it takes to put on a WaterFire,” she said.  <br/><br/>Palumbo said that people can become “members” of the WaterFire Circle, which grants them entry into the reception tent. “It’s the only place that you can have access to our wooden boats, where you can go in amongst the fire.” <br/><br/>While WaterFire is still struggling with their sponsorship, Palumbo said individual donations have become even more important. “It certainly isn’t going to affect the deficit we have in a big way, but it will all add up,” she added.",
  },
  {
    id: "chills-cheesecakes",
    name: "Chris Hill, co-owner of Chill’s Cheesecakes",
    grafs:
      "This year marks the first season Chill’s Cheesecakes has been a vendor at WaterFire. The business, co-founded about a year ago by Chris Hill and Tom Ladue, serves gourmet miniature cheesecake.<br/><br/>Chill’s Cheesecakes bakes out of a shared kitchen space in Warren, Rhode Island. The business first heard about WaterFire from those they share the kitchen with, Hill said. <br/><br/>The event has “been a really steady, nice source of income for us,” Hill added. Though it’s only his first year, Hill said that he’s aware of the recent lack of sponsors.<br/><br/>“It’s really unique,” Hill said. “And to have it go away, I think that would be very disappointing.” ",
  },
  {
    id: "cassandra-constancio",
    name: "Cassandra Constancio, event attendee",
    grafs:
      "Cassandra Constancio has been attending WaterFire for over 15 years. She said she attended the Nov. 1 WaterFire to enjoy the last full lighting of the season.<br/><br/>Constancio also volunteered at WaterFire briefly while she lived in Providence, she said. “It was great meeting people in the community and just seeing the energy and artistry that went into it,” she said.<br/><br/>“Big businesses and small businesses in the area thrive from the amount of people that it brings in,” Constancio said. “It’s done nothing but positive things in all these years, so it’s sad to see that it still struggles to be seen as that linchpin that really holds the community together.” ",
    photo: {
      src: "images/CassandraConstancio_CO_Kai_La_Forte.jpg",
      alt: "A portrait of a brunette woman in a flannel jacket.",
      credit: "Kai La Forte",
    },
  },
  {
    id: "the-farmers",
    name: "Susan and Anthony Farmer, event attendees",
    grafs:
      "At the Nov. 1 lighting, Susan and Anthony Farmer were enjoying their first WaterFire, visiting from New Hampshire. They said that they appreciated the walkability of the event and how it made the city center more attractive to visitors.",
    photo: {
      src: "images/SusanandAnthonyFarmer_CO_Kai_La_Forte.jpg",
      alt: "Photo of Susan and Anthony Farmer.",
      credit: "Kai La Forte",
    },
  },
  {
    id: "star-field",
    name: "Sarah Voykovic, Star Field volunteer",
    grafs:
      "Sarah Voykovic began volunteering with WaterFire in June. On the night of the Nov. 1 lighting, she was stationed at “Starry, Starry Night,” an art installation at which visitors wrote their wishes on a ribbon, which were then suspended from light-up blue stars by Hemenway’s Restaurant.<br/><br/>Voykovic explained that the exhibit also offers several different types of products, including “little trinkets” with names like “dream orbs” and “dreamworms.” But the main attraction is the dozens of stars hanging from the trees.",
    photo: {
      src: "images/SarahVoykovi(StarFieldVolunteer)_CO_Vanson_Vu.jpg",
      alt: "Photo of Sarah Voykovic standing in front of two large, blue, star-shaped lights.",
      credit: "Vanson Vu",
    },
  },
];

const body = document.querySelector("body");
messages.forEach((person) => {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = `modal-${person.id}`;
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal('${person.id}')">&times;</span>
      <div class="text-container">
        <div class="card-title">${person.name},</div>
        ${
          person.photo
            ? `<div class="embedded-img">
          <img src="${person.photo.src}" alt="${person.photo.alt}" />
          <p id="photo-credit">By ${person.photo.credit} | The Brown Daily Herald</p>
        </div><br/>`
            : ""
        }
        <p class="full-quote">${person.grafs}</p>
      </div>
    </div>
  `;
  body.appendChild(modal);
});

function openModal(id) {
  console.log("opening modal " + id);
  document.getElementById("modal-" + id).style.display = "block";
  document.getElementById("label").style.visibility = "hidden";
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  console.log("closing modal " + id);
  document.getElementById("modal-" + id).style.display = "none";
  document.getElementById("label").style.visibility = "visible";
  document.body.style.overflow = "";
}

var main = d3.select("main");
var scroll = main.select(".scroll");
var scrolly = scroll.select(".scrolly");
var article = scrolly.select("article");
var step = article.selectAll(".step");

var scroller = scrollama();

const el = document.createElement("div");
el.className = "marker";
const basin_marker = new mapboxgl.Marker(el).setLngLat(BASIN_COORDS);
const steeple_st_marker = new mapboxgl.Marker(el).setLngLat(STEEPLE_ST_COORDS);
const canal_walk_marker = new mapboxgl.Marker(el).setLngLat(CANAL_WALK_COORDS);
const washington_st_marker = new mapboxgl.Marker(el).setLngLat(
  WASHINGTON_ST_COORDS
);
const waterfire_circle_tent_marker = new mapboxgl.Marker(el).setLngLat(
  WATERFIRE_CIRCLE_TENT_COORDS
);
const college_st_marker = new mapboxgl.Marker(el).setLngLat(COLLEGE_ST_COORDS);
const star_walk_marker = new mapboxgl.Marker(el).setLngLat(STAR_WALK_COORDS);

function removeMarkers() {
  basin_marker.remove();
  steeple_st_marker.remove();
  canal_walk_marker.remove();
  washington_st_marker.remove();
  waterfire_circle_tent_marker.remove();
  college_st_marker.remove();
  star_walk_marker.remove();
}

function handleStepEnter(response) {
  const info = response.element.dataset.info;
  const label = document.getElementById("label");

  switch (info) {
    case "basin":
      label.innerHTML =
        '<b>At Waterplace Park,</b> The Herald spoke to a <button class="hyperlinked" onclick="openModal(\'liz-knights\')">fire performer</button> who has been performing at WaterFire for over a decade, and a <button class="hyperlinked" onclick="openModal(\'staff-sergeant\')">veteran staff sergeant</button> who held one of the torches at Waterfire\'s ceremony, which featured a “Salute to Veterans” event on Nov. 1.<br/><br/>Navigate the links above (or below) to learn more about: <ul><li>Liz Knights, <button class="hyperlinked" onclick="openModal(\'liz-knights\')">fire performer</button></li><li>Barry Lima Jr., <button class="hyperlinked" onclick="openModal(\'staff-sergeant\')">staff sergeant</button></li></ul><div class="embedded-img"><img src="images/Basin_CO_JakeParker.jpg" alt="A basin at night with bright fires lining the perimeter of the basin." /><p id="photo-credit">By Jake Parker | The Brown Daily Herald</p></div>';
      label.style.opacity = "1";
      removeMarkers();
      basin_marker.addTo(map);
      break;
    case "steeple-st":
      label.innerHTML =
        '<b>On Steeple Street,</b> several art vendors advertised their businesses\' offerings, including <button class="hyperlinked" onclick="openModal(\'pourever-creations\')"> painted homeware </button>, <button class="hyperlinked" onclick="openModal(\'honey-shack\')">honey</button> and <button class="hyperlinked" onclick="openModal(\'tigris-handmade\')">handmade shoes</button>.<br/><br/>Navigate the links above (or below) to learn more about: <ul><li>Cathy Tague, owner of <button class="hyperlinked" onclick="openModal(\'pourever-creations\')">Pourever Creations</button></li><li>Paul Octeau, owner of Paul & Sandy’s <button class="hyperlinked" onclick="openModal(\'honey-shack\')">Honey Shack</button></li><li>Selahattin Sep, owner of <button class="hyperlinked" onclick="openModal(\'tigris-handmade\')">Tigris Handmade</button></li></ul><div class="embedded-img"><img src="images/SteepleStreet_CO_JakeParker.jpg" alt="Photo of Steeple Street full of vendor tents and aglow with nighttime lights." /><p id="photo-credit">By Jake Parker | The Brown Daily Herald</p></div>';
      label.style.opacity = "1";
      removeMarkers();
      steeple_st_marker.addTo(map);
      break;
    case "canal-walk":
      label.innerHTML =
        '<b>On Canal Walk,</b> The Herald spoke to an <button class="hyperlinked" onclick="openModal(\'origami-master\')">origami street performer</button>, a <button class="hyperlinked" onclick="openModal(\'patio-ri\')">beverage vendor</button> and <button class="hyperlinked" onclick="openModal(\'juliana-craige\')">event-day staff</button>, as well as Brown <button class="hyperlinked" onclick="openModal(\'brown-students\')">students</button> who made the trek down College Hill to attend WaterFire.<br/><br/>Navigate the links above (or below) to learn more about: <ul><li>Andrew Anselmo, <button class="hyperlinked" onclick="openModal(\'origami-master\')">origami</button> street performer</li><li>Tiziano Pardo ’28 and Emily Benitez ’28, event <button class="hyperlinked" onclick="openModal(\'brown-students\')">attendees</button></li><li>Juliana Craige, event day <button class="hyperlinked" onclick="openModal(\'juliana-craige\')">staff</button> and cashier</li><li>Angel Winpenny, <button class="hyperlinked" onclick="openModal(\'patio-ri\')">The Patio</button> on Broadway and Trinity Brewhouse</li></ul><div class="embedded-img"><img src="images/CanalWalk_CO_CalebLeeKong.jpg" alt="Canal Walk in Providence in midday. The street is lined with vendor tents on the left side, with a brick sidewalk on the right." /><p id="photo-credit">By Caleb Lee-Kong | The Brown Daily Herald</p></div>';

      label.style.opacity = "1";
      removeMarkers();
      canal_walk_marker.addTo(map);
      break;
    case "washington-st":
      label.innerHTML =
        '<b>On Washington Street,</b> food and art vendors set up stalls selling their <button class="hyperlinked" onclick="openModal(\'gather-glass\')">glass-blown products</button>, <button class="hyperlinked" onclick="openModal(\'joseph-mushipi\')">paintings</button> and <button class="hyperlinked" onclick="openModal(\'good-vibes\')">seasonal cocktails</button>. The Herald also spoke to more WaterFire <button class="hyperlinked" onclick="openModal(\'felicia-laroche\')">attendees</button> and a <button class="hyperlinked" onclick="openModal(\'living-statue\')">living statue</button> performance artist.<br/><br/>Navigate the links above (or below) to learn more about: <ul><li>Tara Smith, <button class="hyperlinked" onclick="openModal(\'living-statue\')">living statue</button> performance artist</li><li>Matt Stone, co-owner of <button class="hyperlinked" onclick="openModal(\'gather-glass\')">Gather Glass</button></li><li>Felicia LaRoche, event <button class="hyperlinked" onclick="openModal(\'felicia-laroche\')">attendee</button></li><li>Joseph Mushipi, <button class="hyperlinked" onclick="openModal(\'joseph-mushipi\')">visual artist</button></li><li>Tommy Tainsh, owner of <button class="hyperlinked" onclick="openModal(\'good-vibes\')">Good Vibes Beverages</button></li></ul><div class="embedded-img"><img src="images/WashingtonStreet_CO_HoratioHamilton.jpg" alt="Photo of Washington Street lined with vendor tents." /><p id="photo-credit">By Horatio Hamilton | The Brown Daily Herald</p></div>';
      label.style.opacity = "1";
      removeMarkers();
      washington_st_marker.addTo(map);
      break;
    case "waterfire-circle-tent":
      label.innerHTML =
        '<b>At the WaterFire Circle Tent,</b> The Herald spoke to a <button class="hyperlinked" onclick="openModal(\'waterfire-circle-volunteer\')">volunteer</button> with WaterFire Circle — a <button class="hyperlinked" onclick="openModal(\'waterfire-circle\')">membership program</button> that supports the event.<br/><br/>Navigate the links above (or below) to learn more about: <ul><li><button class="hyperlinked" onclick="openModal(\'waterfire-circle\')">WaterFire Circle</button></li><li>Jeanine Palumbo, <button class="hyperlinked" onclick="openModal(\'waterfire-circle-volunteer\')">volunteer</button> with WaterFire Circle</li></ul><div class="embedded-img"><img src="images/Waterfirecircletent_CO_JakeParker-2.jpg" alt="Photo of people chatting and grabbing food from a central table in the WaterFire Circle Tent." /><p id="photo-credit">By Jake Parker | The Brown Daily Herald</p></div>';
      label.style.opacity = "1";
      removeMarkers();
      waterfire_circle_tent_marker.addTo(map);
      break;
    case "college-st":
      label.innerHTML =
        '<b>On College Street,</b> The Herald spoke to a <button class="hyperlinked" onclick="openModal(\'chills-cheesecakes\')">cheesecake vendor</button> and several more attendees. Some visitors were based <button class="hyperlinked" onclick="openModal(\'cassandra-constancio\')">nearby</button>, while <button class="hyperlinked" onclick="openModal(\'the-farmers\')">others</button> traveled across state borders to attend the performance.<br/><br/>Navigate the links above (or below) to learn more about: <ul><li>Chris Hill, co-owner of <button class="hyperlinked" onclick="openModal(\'chills-cheesecakes\')">Chill’s Cheesecakes</button></li><li>Cassandra Constancio, event <button class="hyperlinked" onclick="openModal(\'cassandra-constancio\')">attendee</button></li><li>Susan and Anthony Farmer, event <button class="hyperlinked" onclick="openModal(\'the-farmers\')">attendees</button></li></ul><div class="embedded-img"><img src="images/CollegeStreet_CO_CalebLee-Kong-1.jpg" alt="A couple sitting in a gondola that has just emerged from under a bridge. A gondolier stands behind them with a row." /><p id="photo-credit">By Caleb Lee-Kong | The Brown Daily Herald</p></div>';
      label.style.opacity = "1";
      removeMarkers();
      college_st_marker.addTo(map);
      break;
    case "star-walk":
      label.innerHTML =
        '<b>At Star Walk,</b> near the Crawford Street Bridge, <button class="hyperlinked" onclick="openModal(\'star-field\')">volunteers</button> maintained the “Starry, Starry Night” art installation.<br/><br/>Navigate the links above (or below) to learn more about: <ul><li>Sarah Voykovic, Star Field <button class="hyperlinked" onclick="openModal(\'star-field\')">volunteer</button></li></ul>';
      label.style.opacity = "1";
      removeMarkers();
      star_walk_marker.addTo(map);
      break;
    default:
      label.style.opacity = "0";
      removeMarkers();
      break;
  }
}

var imgScroller = scrollama();

function handleImgStepEnter(response) {
  response.element.classList.add("active");
}

function handleImgStepExit(response) {
  response.element.classList.remove("active");
}

function init() {
  scroller
    .setup({
      step: ".scroll .scrolly article .step",
      offset: 0.1,
      debug: false,
      container: ".scroll",
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(function () {
      const label = document.getElementById("label");
      label.style.opacity = "0";
    });

  imgScroller
    .setup({
      step: ".img-step",
      offset: 0.6,
      debug: false,
    })
    .onStepEnter(handleImgStepEnter)
    .onStepExit(handleImgStepExit);

  // window.addEventListener("resize", handleResize);
}

init();

function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  document.getElementById("progress-bar").style.width = scrollPercent + "%";
}

window.addEventListener("scroll", updateProgressBar);

const toggleBtn = document.getElementById("toggle-button");
const toggleContent = document.getElementById("toggle-content");

toggleBtn.addEventListener("click", () => {
  const isOpen = toggleBtn.classList.contains("open");

  toggleBtn.classList.toggle("open", !isOpen);
  toggleContent.classList.toggle("open", !isOpen);

  if (isOpen) {
    toggleContent.style.display = "none";
  } else {
    toggleContent.style.display = "block";
  }
});

function interpolateCoords(coord1, coord2, t) {
  const lng = coord1[0] + (coord2[0] - coord1[0]) * t;
  const lat = coord1[1] + (coord2[1] - coord1[1]) * t;
  return [lng, lat];
}

function moveBoatSmooth() {
  const scrolly = document.querySelector(".scrolly");
  if (!scrolly || !boatMarker) return;

  const scrollyHeight = scrolly.scrollHeight;
  let localScroll = -scrolly.getBoundingClientRect().top;
  const progress = Math.min(Math.max(localScroll / scrollyHeight, 0), 1);

  const scaledIndex = progress * (FIRE_COORDS.length - 1);
  const lowerIndex = Math.floor(scaledIndex);
  const upperIndex = Math.min(lowerIndex + 1, FIRE_COORDS.length - 1);
  const t = scaledIndex - lowerIndex;

  const newPos = interpolateCoords(
    FIRE_COORDS[lowerIndex],
    FIRE_COORDS[upperIndex],
    t
  );

  boatMarker.setLngLat(newPos);
}

window.addEventListener("scroll", moveBoatSmooth);

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};
