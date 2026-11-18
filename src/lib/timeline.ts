/**
 * The /timeline page: the line of companies behind HubTech, from 2002.
 *
 * Every fact here comes from 783hz.me (Keith DeLucia's site), the client's
 * meetings, DestinationKP's own planning deck, or the companies' own videos;
 * nothing is rounded up or filled in. The games studio is credited as Elite
 * Gudz and 21st Street Games, not by its old name, at the client's request.
 * Where the source gives no years (DestinationKP, today's products) none are
 * shown. PlayerHub is left out on purpose: it is not a HubTech product.
 *
 * Each chapter is told full screen: an opening over the company's own footage
 * or pictures and its figures. Then two boxes side by side, with the timeline's
 * line between them: an overview of the company that stays put, and a picture
 * box that changes as you scroll through its products (client call, 16 Nov
 * 2026, after the NeoCloud hardware stack on the Xura site). A picture with a
 * film carries a play button that opens it in a popup. The footage under
 * loops/ is cut from the companies' own YouTube videos (Elite Gudz, ICONIC
 * Motors, VEEDIMS) at the client's request, 14 Nov 2026; the stills are their
 * own screenshots and video thumbnails, 783hz.me's images and the DestinationKP
 * deck's renderings and drawings. Each
 * file under public/static/timeline carries its origin in a .json sidecar.
 */

export interface TimelineItem {
  name: string;
  line: string;
}

export interface TimelineStill {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** A figure shown large, with what it counts. */
export interface TimelineNumber {
  figure: string;
  label: string;
}

/** A headline figure from the record, linking to the chapter it comes from. */
export interface TimelineFigure extends TimelineNumber {
  chapter: string;
}

/** A picture behind the words. `soft` blurs it, for a picture too small to fill a screen sharply. */
export interface TimelineBackdrop {
  src: string;
  soft?: boolean;
}

/** One of the company's own films on YouTube. Nothing loads from YouTube until it is played. */
export interface TimelineFilm {
  id: string;
  title: string;
  note: string;
  seconds: number;
}

/** A patent, shown as its own front page. */
export interface TimelinePatent {
  /** As printed, with commas: "5,910,988". */
  number: string;
  title: string;
  granted: string;
  inventor: string;
  /** From the patent's abstract, word for word. */
  abstract: string;
  page: TimelineStill;
}

/** One step in a chapter's picture box: one product, its picture or footage, and its number. */
export interface TimelineSlide {
  name: string;
  /** What it was, in a few words. */
  kind: string;
  line: string;
  figure?: TimelineNumber;
  /** Fills the slide behind the words; `video` is a silent cut of the product's own footage that plays over it. */
  backdrop: TimelineBackdrop & { video?: string };
  /** Phone screens, side by side. */
  phones?: TimelineStill[];
  /** One picture, shown no bigger than it is. */
  picture?: TimelineStill;
  /** Products with no picture of their own, named in a row. */
  cards?: TimelineItem[];
  /** Several photos at once, the first one large. */
  gallery?: TimelineStill[];
  /** One patent, its words set large over its front page. */
  patent?: TimelinePatent;
  /** Patents to page through, one front page at a time. */
  patents?: TimelinePatent[];
  /** The id of one of the scene's `films`: a play button over the picture opens it. */
  film?: string;
  /** One of our own products, shown as its coded interface recreation (a slug from PRODUCTS). */
  product?: string;
}

/** A chapter told full screen: an opening over the company's footage or pictures, its figures, then its slides. */
export interface TimelineScene {
  /** One plain line saying what the company was. */
  summary: string;
  /** The box that stays beside the pictures. Without one, it shows the company's name and the summary. */
  overview?: { title?: string; text: string };
  figures: TimelineNumber[];
  /** Stills behind the opening, one after another; under the montage, the first is its poster. */
  backdrop?: TimelineBackdrop[];
  /** One silent cut of the company's own footage, played behind the opening; its first frame sits beside it as .webp. */
  montage?: string;
  slides?: TimelineSlide[];
  /** The company's own films, in the order the popup lists them. */
  films?: TimelineFilm[];
  /** The rest of the record, one line each. */
  also?: string[];
}

export interface TimelineChapter {
  id: string;
  company: string;
  /** Years as the source gives them; absent when it gives none. */
  years?: { from: number; to: number };
  /** What the year index shows for the chapter when it has no years. */
  marker: string;
  place: string;
  scene: TimelineScene;
}

const IMG = "/static/timeline";
const STILL = `${IMG}/stills`;
const LOOP = `${IMG}/loops`;
const SHOTS = "/static/landing-page/projects";

/** A slide backdrop cut from the company's own footage: the poster is the cut's first frame. */
const footage = (name: string) => ({ src: `${LOOP}/${name}.webp`, video: `${LOOP}/${name}.mp4` });

/** Where a film's poster is kept: its YouTube thumbnail, stored with the site. */
export const FILM = `${IMG}/film`;

/** A patent's front page, from Data Treasury's own PDF at datatreasury.com/intellectual.php. */
const page = (n: string, height: number, title: string): TimelineStill => ({
  src: `${STILL}/patent-${n}.webp`,
  width: 1100,
  height,
  alt: `The front page of U.S. Patent ${Number(n).toLocaleString("en-US")}, ${title}`,
});

/** Data Treasury's patent portfolio, as datatreasury.com lists it; the client named 988 and 137 as the main two. */
const DT_PATENTS: TimelinePatent[] = [
  {
    number: "5,910,988",
    title: "Remote image capture with centralized processing and storage",
    granted: "June 8, 1999",
    inventor: "Claudio R. Ballard",
    abstract:
      "The system retrieves transaction data at one or more remote locations, encrypts the data, transmits the encrypted data to a central location, transforms the data to a usable form, performs identification verification using signature data and biometric data, generates informative reports from the data and transmits the informative reports to the remote location(s).",
    page: page("5910988", 1616, "Remote image capture with centralized processing and storage"),
  },
  {
    number: "6,032,137",
    title: "Remote image capture with centralized processing and storage",
    granted: "February 29, 2000",
    inventor: "Claudio R. Ballard",
    abstract:
      "The DataTreasury™ System provides comprehensive support for the processing of documents and electronic data associated with different applications including sale, business, banking and general consumer transactions. The system retrieves transaction data such as credit card receipts checks in either electronic or paper form at one or more remote locations, encrypts the data, transmits the encrypted data to a central location.",
    page: page("6032137", 1616, "Remote image capture with centralized processing and storage"),
  },
  {
    number: "5,930,778",
    title: "System for expediting the clearing of financial instruments and coordinating the same with invoice processing at the point of receipt",
    granted: "July 27, 1999",
    inventor: "Terry L. Geer",
    abstract:
      "A system and process are described for effecting the expedited submission into the payment system for collection of funds represented by financial instruments that are received by a payee at an item capture facility remote from the payee's depository bank.",
    page: page("5930778", 1424, "System for expediting the clearing of financial instruments"),
  },
  {
    number: "5,265,007",
    title: "Central check clearing system",
    granted: "November 23, 1993",
    inventor: "John L. Barnhard, Jr. et al.",
    abstract:
      "A central check clearing association by which different member banks and financial institutions can each settle debit and credit balances with respect to other member institutions on a predetermined periodic basis.",
    page: page("5265007", 1424, "Central check clearing system"),
  },
  {
    number: "5,583,759",
    title: "Mechanism for expediting the deposit, transport and submission of checks into the payment system",
    granted: "December 10, 1996",
    inventor: "Terry L. Geer",
    abstract:
      "A mechanism and process for effecting the expedited deposit, settlement and submission into the payment system for collection of funds represented by tangible financial instruments that are received by a payee at a location remote from the payee's collecting and clearing bank.",
    page: page("5583759", 1424, "Mechanism for expediting the deposit, transport and submission of checks"),
  },
  {
    number: "5,717,868",
    title: "Electronic payment interchange concentrator",
    granted: "February 10, 1998",
    inventor: "David L. James",
    abstract:
      "An apparatus, system and process for effecting one or more of the reception, transmission, translation and storage of data files containing information relating to financial instruments among and between multiple institutions.",
    page: page("5717868", 1424, "Electronic payment interchange concentrator"),
  },
];

/** Photos of the ICONIC AC Roadster being made, from the company's own chassis film. */
const ICONIC_BUILD: TimelineStill[] = [
  { src: `${STILL}/iconic-build-1.webp`, width: 1280, height: 720, alt: "A cutaway of the ICONIC AC Roadster: the blue body over its exposed chassis, engine and suspension" },
  { src: `${STILL}/iconic-build-3.webp`, width: 1280, height: 720, alt: "The roadster's chassis frame drawn in CAD" },
  { src: `${STILL}/iconic-build-2.webp`, width: 1280, height: 720, alt: "A spray gun finishing a part of the frame" },
  { src: `${STILL}/iconic-build-4.webp`, width: 1280, height: 720, alt: "The engine's intakes between the machined chassis braces" },
  { src: `${STILL}/iconic-build-5.webp`, width: 1280, height: 720, alt: "A machined aluminium engine block" },
];

export const TIMELINE: TimelineChapter[] = [
  {
    id: "data-treasury",
    company: "Data Treasury",
    years: { from: 2002, to: 2016 },
    marker: "02–16",
    place: "Texas, New York, Florida",
    scene: {
      summary: "A bankrupt company with two patents and unfinished technology, turned into document and biometric products in the cloud.",
      figures: [
        { figure: "79", label: "US municipalities on its document products" },
        { figure: "11", label: "patents: two to start, nine more granted" },
        { figure: "10,000", label: "square feet of raised-floor data center" },
        { figure: "4", label: "Congressional acts to close it, defeated" },
      ],
      backdrop: [{ src: `${STILL}/dt-patent.webp` }, { src: `${IMG}/data-treasury.webp`, soft: true }],
      slides: [
        {
          name: "Secure remote image capture",
          kind: "The invention",
          line: "Patented remote image capture with transaction processing and centralized storage, built to end the pitfalls of conventional imaging and transaction processing.",
          figure: { figure: "6", label: "patents in the DTC portfolio" },
          backdrop: { src: `${STILL}/dt-wright.webp`, soft: true },
          picture: {
            src: `${STILL}/dt-wright.webp`,
            width: 810,
            height: 334,
            alt: "The Wright Brothers' flyer trailing a ribbon of binary past the Earth",
          },
        },
        {
          name: `U.S. Patent ${DT_PATENTS[0].number}`,
          kind: "The first of the two",
          line: DT_PATENTS[0].title,
          backdrop: { src: `${STILL}/dt-patent.webp`, soft: true },
          patent: DT_PATENTS[0],
        },
        {
          name: `U.S. Patent ${DT_PATENTS[1].number}`,
          kind: "The second",
          line: "The same invention, continued: credit card receipts and checks, on paper or electronic.",
          backdrop: { src: `${STILL}/dt-patent.webp`, soft: true },
          patent: DT_PATENTS[1],
        },
        {
          name: "The portfolio",
          kind: "Intellectual property",
          line: "Every patent in the DTC portfolio, from check clearing to remote image capture. Select a page to read it.",
          figure: { figure: "6", label: "patents, 1993 to 2000" },
          backdrop: { src: `${STILL}/dt-patent.webp` },
          patents: DT_PATENTS,
        },
        {
          name: "The vaults",
          kind: "Document products",
          line: "Documents, checks and medical records, captured by patented software and stored in remote repositories hosted at SAIC.",
          figure: { figure: "79", label: "US municipalities, with Bank Hapoalim, Signature Bank and Giant Eagle" },
          backdrop: { src: `${STILL}/dt-patent.webp` },
          cards: [
            { name: "eImageVault", line: "Documents scanned straight into a remote repository." },
            { name: "eCheckVault", line: "Check scanners that image a check and turn it into an electronic transaction." },
            { name: "ePharmaVault", line: "A HIPAA-compliant platform for research, medical records and doctor authentication." },
          ],
        },
        {
          name: "Verify Me",
          kind: "Remote multi-factor biometrics",
          line: "For entry, time and attendance, financial transactions, password replacement and threat detection. Sold to LaserLock Technologies, a public company.",
          figure: { figure: "9", label: "more multi-factor authentication patents granted" },
          backdrop: { src: `${IMG}/data-treasury.webp`, soft: true },
          picture: {
            src: `${IMG}/data-treasury.webp`,
            width: 900,
            height: 1080,
            alt: "Collage from the Verify Me years: an iris scan, a fingerprint, a palm on a scanner and a voice waveform",
          },
        },
        {
          name: "The patents",
          kind: "Valued in Washington",
          line: "The Congressional Budget Office put a multi-billion-dollar value on Data Treasury's patents.",
          figure: { figure: "Billions", label: "the CBO's value on its patents" },
          backdrop: { src: `${STILL}/dt-capitol.webp` },
        },
      ],
    },
  },
  {
    id: "elite-gudz",
    company: "Elite Gudz and 21st Street Games",
    years: { from: 2002, to: 2013 },
    marker: "02–13",
    place: "New York, Chennai",
    scene: {
      summary: "A development studio that grew from four people to 180 in New York and Chennai, and took its games to #1 on the App Store.",
      // Drafted from the client's own words in the 16 Nov 2026 call; he is writing the final copy.
      overview: {
        title: "Elite Gudz and 21st Street Games",
        text: "An eclectic mix of creative artists, physical and digital graffiti artists among them, who came together in New York City as a digital brand for games and app development. From four people in 2002 to 180 in New York and Chennai, and #1 on the App Store.",
      },
      films: [
        { id: "Mn9w3L5Drpc", title: "Graffiti Spray Can", note: "The launch promo, with Gloria Velez", seconds: 22 },
        { id: "bSaG5wuZQs0", title: "Techno Kitten Adventure", note: "On the floor at E3 2011", seconds: 15 },
        { id: "hOnqRSa0gpE", title: "Get Off My Island", note: "The iPad game's trailer", seconds: 91 },
        { id: "8y2OeIhEKHY", title: "Get Off My Island", note: "The game's promo", seconds: 48 },
      ],
      figures: [
        { figure: "100M+", label: "downloads on the App Store" },
        { figure: "#1", label: "Graffiti Spray Can, globally" },
        { figure: "180", label: "people, from four in 2002" },
      ],
      backdrop: [{ src: `${LOOP}/zaah-montage.webp` }],
      montage: `${LOOP}/zaah-montage.mp4`,
      slides: [
        {
          name: "Graffiti Spray Can",
          kind: "iPhone app, published by Elite Gudz",
          line: "Shake the phone, then spray: a can of paint and a wall to tag, in your pocket.",
          figure: { figure: "#1", label: "on the App Store, globally" },
          backdrop: footage("zaah-gsc"),
          film: "Mn9w3L5Drpc",
          phones: [
            { src: `${STILL}/gsc-shake.webp`, width: 320, height: 480, alt: "Graffiti Spray Can on iPhone: a paint can with arrows telling you to shake the phone" },
            { src: `${STILL}/gsc-wall.webp`, width: 320, height: 480, alt: "Graffiti Spray Can on iPhone: an Elite Gudz-branded wall ready to paint" },
            { src: `${STILL}/gsc-brick.webp`, width: 320, height: 480, alt: "Graffiti Spray Can on iPhone: a red brick wall with a tag and the background picker" },
            { src: `${STILL}/gsc-art.webp`, width: 320, height: 480, alt: "Graffiti Spray Can artwork: a gas-mask spray can in yellow smoke" },
          ],
          picture: {
            src: `${STILL}/gsc-charts.webp`,
            width: 740,
            height: 355,
            alt: "App Store top charts for Canada, Greece and Luxembourg, each with Graffiti Spray Can by Elite Gudz at number one",
          },
        },
        {
          name: "Techno Kitten Adventure",
          kind: "iPhone game",
          line: "Launched on the floor at E3 2011, and another #1.",
          figure: { figure: "#1", label: "on the App Store" },
          backdrop: footage("zaah-tka"),
          film: "bSaG5wuZQs0",
        },
        {
          name: "Get Off My Island",
          kind: "GOMI, an iOS game",
          line: "The first multiplayer build-your-own game with cloud integration on iOS: build a board, then play it with friends.",
          figure: { figure: "1st", label: "multiplayer build-your-own game on iOS" },
          backdrop: footage("zaah-gomi"),
          film: "hOnqRSa0gpE",
          picture: {
            src: `${STILL}/gomi-trailer.webp`,
            width: 1280,
            height: 720,
            alt: "From the Get Off My Island trailer: GOMI the monkey roaring out of the jungle, 'Mad as can be, GOMI started whylin'",
          },
        },
      ],
      also: [
        "Platforms for photo products and apparel, for Disney, Walmart, Target, Fuji, Kodak and CVS.",
        "The Michael J. Fox Parkinson's research repository, for research and grants worldwide.",
      ],
    },
  },
  {
    id: "iconic-motors",
    company: "ICONIC Motors",
    years: { from: 2009, to: 2014 },
    marker: "09–14",
    place: "New York, Michigan",
    scene: {
      summary: "An 800 HP, 2,500-pound supercar on a Formula One chassis and drivetrain, with connected-vehicle technology built in.",
      figures: [
        { figure: "800", label: "horsepower" },
        { figure: "200+", label: "mph top speed" },
        { figure: "<3 s", label: "from 0 to 60" },
        { figure: "#13", label: "Robb Report Car of the Year 2009" },
      ],
      backdrop: [{ src: `${LOOP}/iconic-montage.webp` }],
      montage: `${LOOP}/iconic-montage.mp4`,
      films: [
        { id: "cdF8m2WRGZ8", title: "The ICONIC AC Roadster", note: "The 2010 film", seconds: 46 },
        { id: "zfp3ptQ7KQc", title: "Chassis", note: "Titanium, aluminium and carbon fibre", seconds: 39 },
        { id: "ZCzD7tpjSSY", title: "12-point fasteners", note: "The hardware, piece by piece", seconds: 43 },
        { id: "jjVUllSs-m4", title: "Track test", note: "In the pits and on the circuit", seconds: 102 },
        { id: "UOOkD5N7b0E", title: "Secret track test", note: "The roadster at speed", seconds: 69 },
        { id: "qndxCH5swwM", title: "In the ICONIC roadster", note: "The VEEDIMS modules that run the car", seconds: 55 },
      ],
      slides: [
        {
          name: "The ICONIC AC Roadster",
          kind: "AC and Shelby, together again",
          line: "A limited run of 100 50th-anniversary cars with AC Bristol and Carroll Shelby, built in Detroit and New York.",
          figure: { figure: "100", label: "50th-anniversary cars" },
          backdrop: footage("iconic-roadster"),
          film: "cdF8m2WRGZ8",
          picture: {
            src: `${IMG}/iconic-motors.webp`,
            width: 882,
            height: 1080,
            alt: "ICONIC Motors collage: the roadster on track, its gauges, and Robb Report and duPont Registry covers",
          },
        },
        {
          name: "Titanium, aluminium, carbon fibre",
          kind: "The chassis",
          line: "A Formula One chassis and drivetrain under a 2,500-pound body, built piece by piece.",
          figure: { figure: "19+", label: "patents issued" },
          backdrop: footage("iconic-chassis"),
          gallery: ICONIC_BUILD,
          film: "zfp3ptQ7KQc",
        },
        {
          name: "Track tested",
          kind: "Palm Beach International Raceway",
          line: "With the Iconic Track Club app, owners raced former Le Mans winners' times on multiple tracks.",
          figure: { figure: "200+", label: "mph" },
          backdrop: footage("iconic-track"),
          film: "jjVUllSs-m4",
        },
        {
          name: "A connected car",
          kind: "Connected-vehicle platform",
          line: "Patented and running on the OSIsoft real-time database: the cars were tracked live on every major track in the country.",
          backdrop: footage("iconic-connected"),
          film: "qndxCH5swwM",
        },
      ],
      also: [
        "Unveiled at Amelia Island, and on the covers of duPont Registry and Robb Report.",
        "Shown at Jay Leno's shop, the New York Auto Show, Boca d'Elegance and Pebble Beach.",
      ],
    },
  },
  {
    id: "veedims",
    company: "VEEDIMS",
    years: { from: 2009, to: 2016 },
    marker: "09–16",
    place: "New York, Florida",
    scene: {
      summary: "A connected IoT platform: one wire carries power and data to patented sensors, switches and controllers, with AI on top.",
      figures: [
        { figure: "22", label: "patents" },
        { figure: "1", label: "wire for power and data" },
        { figure: "5", label: "standards listed: PMA, UL, DO-254, DO-326A, DO-178C" },
        { figure: "6", label: "companies its engineers came from, IBM to Pfizer" },
      ],
      backdrop: [{ src: `${LOOP}/veedims-montage.webp` }],
      montage: `${LOOP}/veedims-montage.mp4`,
      films: [
        { id: "hOc5PMTST9k", title: "Seabulk tug New River", note: "Live fuel and engine monitoring", seconds: 22 },
        { id: "n5q5juNAxkc", title: "At the helm", note: "Trip, speed and fuel, live on board", seconds: 25 },
        { id: "hvFgm-LPc_w", title: "One platform", note: "Every system on one screen", seconds: 57 },
        { id: "qndxCH5swwM", title: "In the ICONIC roadster", note: "The modules that run the car", seconds: 55 },
        { id: "XEKs36JOyzs", title: "The VEEDIMS story", note: "The company presentation", seconds: 141 },
      ],
      slides: [
        {
          name: "At sea",
          kind: "Seabulk tug New River, and more",
          line: "Contender Boats, Benetti and Azimut yachts, Seacor work boats and military patrol boats, monitored live.",
          backdrop: footage("veedims-sea"),
          film: "hOc5PMTST9k",
        },
        {
          name: "At the helm",
          kind: "Trip, speed and fuel, live",
          line: "Every system on board on one screen, and on the owner's phone.",
          backdrop: footage("veedims-helm"),
          film: "n5q5juNAxkc",
        },
        {
          name: "One platform",
          kind: "Cloud dashboard and AI",
          line: "Proprietary algorithms and predictive analytics that make the decisions, for boats, airline cabins, buildings and renewable energy.",
          figure: { figure: "22", label: "patents" },
          backdrop: footage("veedims-platform"),
          film: "hvFgm-LPc_w",
        },
        {
          name: "One wire",
          kind: "Sensors, switches and controllers",
          line: "Power and data on a single wire to patented modules. Its first installation controlled every electric and electronic device in a vehicle.",
          figure: { figure: "1", label: "wire" },
          backdrop: footage("veedims-wire"),
          film: "qndxCH5swwM",
        },
      ],
      also: [
        "Remote Dr: medical devices on a waterproof, mil-spec laptop, so doctors could diagnose in real time at sea.",
        "A micro-licence deal with OSIsoft, whose real-time database usually runs nuclear power plants at six-figure fees per asset.",
      ],
    },
  },
  {
    id: "hub-technology",
    company: "Hub Technology",
    years: { from: 2017, to: 2022 },
    marker: "17–22",
    place: "New York, Florida",
    scene: {
      summary: "Products for the youth sports market and FC Barcelona's academies worldwide: streamed, scouted and played.",
      figures: [
        { figure: "4", label: "products, from live streams to esports" },
        { figure: "1st", label: "FC Barcelona joint-venture academy in America" },
        { figure: "4,000+", label: "players at Barça Academy NY's first tryouts" },
      ],
      backdrop: [{ src: `${STILL}/hub-barca.webp` }, { src: `${SHOTS}/ysn-streaming-crop.jpg`, soft: true }],
      slides: [
        {
          name: "YSN",
          kind: "Youth sports, streamed",
          line: "Live streams of youth games from mobile and fixed cameras, with live team chat, player profiles and game analytics.",
          backdrop: { src: `${SHOTS}/ysn-streaming-crop.jpg`, soft: true },
          picture: { src: `${SHOTS}/ysn-live-interface.jpeg`, width: 650, height: 600, alt: "YSN's live interface: a youth game streaming with the team chat beside it" },
        },
        {
          name: "College Reels",
          kind: "Recruiting",
          line: "Players post video, documents, grades and statistics; coaches search, follow, message and share.",
          backdrop: { src: `${SHOTS}/ysn-team-dashboard.jpeg`, soft: true },
          picture: { src: `${SHOTS}/ysn-team-dashboard.jpeg`, width: 650, height: 600, alt: "A team dashboard with recent matches and the roster" },
        },
        {
          name: "Connected Athlete",
          kind: "Wearables, video and medical records",
          line: "One HIPAA-compliant place for sensor data, video and medical records, shared with doctors, therapists, trainers and coaches.",
          backdrop: { src: `${SHOTS}/connected-athlete-dashboard.png`, soft: true },
          product: "connected-athlete",
        },
        {
          name: "Battle's Lounge",
          kind: "Esports leagues and tournaments",
          line: "Online, mobile and in-person leagues for venues, influencers, athletes and game developers.",
          backdrop: { src: `${SHOTS}/battle-lounge-2.jpg`, soft: true },
          picture: { src: `${SHOTS}/battle-lounge-2.jpg`, width: 650, height: 600, alt: "Battle's Lounge: an Apex weekly qualifier open for registration" },
        },
        {
          name: "Barça Academy NY",
          kind: "2017 to 2020, alongside",
          line: "FC Barcelona's first joint-venture youth academy in America, with a player platform for fees, communication, events and statistics. Within a year, several teams ranked in the national top 25.",
          figure: { figure: "4,000+", label: "boys and girls at the first tryouts" },
          backdrop: { src: `${STILL}/hub-barca-crop.webp`, soft: true },
          picture: {
            src: `${STILL}/hub-barca-crop.webp`,
            width: 790,
            height: 1080,
            alt: "FC Barcelona's assembly ratifying the agreement with Barça Academy NY, in the USA: the vote on screen above the club's banner",
          },
        },
      ],
    },
  },
  {
    id: "destination-kp",
    company: "DestinationKP",
    marker: "KP",
    place: "Kings Park, New York",
    scene: {
      summary: "New York's only designated youth sports and medical tourism destination: a former sand mine, planned as a sports complex and medical facility.",
      figures: [
        { figure: "42", label: "acres" },
        { figure: "170,000", label: "square feet of medical and commercial space" },
        { figure: "10", label: "outdoor turf fields, with 4K live streaming" },
      ],
      backdrop: [{ src: `${STILL}/dkp-aerial.webp` }, { src: `${STILL}/dkp-complex.webp` }],
      slides: [
        {
          name: "The site",
          kind: "Kings Park, from above",
          line: "A former sand mine on Long Island, planned as one place for youth sports and medical care.",
          figure: { figure: "42", label: "acres" },
          backdrop: { src: `${STILL}/dkp-aerial.webp`, soft: true },
          picture: {
            src: `${STILL}/dkp-aerial.webp`,
            width: 1996,
            height: 690,
            alt: "Rendering of the DestinationKP complex from above: the indoor buildings, the parking and the turf fields",
          },
        },
        {
          name: "The fields",
          kind: "Outdoor turf",
          line: "Ten outdoor turf fields beside the indoor complex, every game streamed live in 4K.",
          figure: { figure: "10", label: "outdoor turf fields" },
          backdrop: { src: `${STILL}/dkp-complex.webp` },
        },
        {
          name: "The buildings",
          kind: "Indoor sports, medical and offices",
          line: "An indoor sports complex with a medical tenant building, and a café and office building beside it.",
          figure: { figure: "170,000", label: "square feet of medical and commercial space" },
          backdrop: { src: `${STILL}/dkp-render-indoor.webp`, soft: true },
          gallery: [
            { src: `${STILL}/dkp-render-indoor.webp`, width: 637, height: 352, alt: "Rendering of the indoor sports complex and medical tenant building" },
            { src: `${STILL}/dkp-render-west.webp`, width: 637, height: 352, alt: "Rendering of the complex seen from the west" },
            { src: `${STILL}/dkp-render-east.webp`, width: 637, height: 352, alt: "Rendering of the complex seen from the east" },
            { src: `${STILL}/dkp-render-cafe.webp`, width: 637, height: 352, alt: "Rendering of the café and office building" },
          ],
        },
        {
          name: "The stadium",
          kind: "Stands drawn by Dreamseat",
          line: "A stadium on Field 1, its stands and suites drawn by Dreamseat.",
          backdrop: { src: `${STILL}/dkp-complex.webp`, soft: true },
          picture: {
            src: `${STILL}/dkp-stadium-a2.webp`,
            width: 1504,
            height: 1004,
            alt: "Dreamseat's drawing sheet A2: the stadium's stands along Field 1",
          },
        },
      ],
      also: [
        "Biomechanical analysis and connected-athlete sensors on site.",
        "Variances, site approval, building permits and financing approvals, won with the community, the town and the state.",
      ],
    },
  },
];

/**
 * The record: headline figures from the chapters below, each as its source gives it. The patents are the sum of
 * Data Treasury's 2 + 9, ICONIC's 19+ and VEEDIMS's 22.
 */
export const RECORD: TimelineFigure[] = [
  { figure: "100MM+", label: "downloads on the iTunes store, from Elite Gudz and 21st Street Games", chapter: "elite-gudz" },
  { figure: "#1", label: "on the App Store in Canada, Greece and Luxembourg: Graffiti Spray Can", chapter: "elite-gudz" },
  { figure: "180", label: "people at the studio in New York and Chennai, from four in 2002", chapter: "elite-gudz" },
  { figure: "52+", label: "patents across Data Treasury, ICONIC Motors and VEEDIMS", chapter: "veedims" },
  { figure: "79", label: "US municipalities on Data Treasury's document products", chapter: "data-treasury" },
  { figure: "#13", label: "Robb Report Car of the Year 2009: the ICONIC AC Roadster", chapter: "iconic-motors" },
];
