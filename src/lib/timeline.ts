/**
 * The /timeline page: the line of companies behind HubTech, from 2002.
 *
 * Every fact here comes from 783hz.me (Keith DeLucia's site), the client's
 * meetings, or the companies' own videos; nothing is rounded up or filled in.
 * Where the source gives no years (DestinationKP, today's products) none are
 * shown. PlayerHub is left out on purpose: it is not a HubTech product.
 *
 * Each chapter is told full screen: an opening over the company's own footage
 * or pictures, its figures, then its products as slides. The footage under
 * loops/ is cut from the companies' own YouTube videos (Elite Gudz, ICONIC
 * Motors, VEEDIMS) at the client's request, 14 Nov 2026; the stills are their
 * own screenshots, 783hz.me's images and a dated capture of ChuChu TV. Each
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

/** A full-screen slide: one product, its picture or footage, and its number. */
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
}

/** A chapter told full screen: an opening over the company's footage or pictures, its figures, then its slides. */
export interface TimelineScene {
  /** One plain line saying what the company was. */
  summary: string;
  figures: TimelineNumber[];
  /** Stills behind the opening, one after another; under the montage, the first is its poster. */
  backdrop?: TimelineBackdrop[];
  /** One silent cut of the company's own footage, played behind the opening; its first frame sits beside it as .webp. */
  montage?: string;
  slides?: TimelineSlide[];
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
    id: "zaah",
    company: "Zaah",
    years: { from: 2002, to: 2013 },
    marker: "02–13",
    place: "New York, Chennai",
    scene: {
      summary: "A development studio that grew from four people to 180 in New York and Chennai, and took its games to #1 on the App Store.",
      figures: [
        { figure: "100M+", label: "downloads on the App Store" },
        { figure: "#1", label: "Graffiti Spray Can, globally" },
        { figure: "98.2M", label: "ChuChu TV subscribers on YouTube" },
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
        },
        {
          name: "Get Out of My Island",
          kind: "GOMI, an iPhone game",
          line: "The first multiplayer build-your-own game with cloud integration on iOS: build a board, then play it with friends.",
          figure: { figure: "1st", label: "multiplayer build-your-own game on iOS" },
          backdrop: footage("zaah-gomi"),
          picture: {
            src: `${STILL}/gomi-title.webp`,
            width: 725,
            height: 340,
            alt: "The GOMI title screen: a monkey over Play and Boards with Friends signs on a tropical island",
          },
        },
        {
          name: "ChuChu TV",
          kind: "Built by the Chennai office",
          line: "Nursery rhymes and kids' songs, started in Zaah's Chennai office.",
          figure: { figure: "98.2M", label: "subscribers on YouTube, November 2026" },
          backdrop: { src: `${STILL}/chuchu-tv-channel.webp`, soft: true },
          picture: {
            src: `${STILL}/chuchu-tv-channel.webp`,
            width: 982,
            height: 354,
            alt: "The ChuChu TV Nursery Rhymes & Kids Songs YouTube channel header: 98.2M subscribers, 1.1K videos",
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
      slides: [
        {
          name: "The ICONIC AC Roadster",
          kind: "AC and Shelby, together again",
          line: "A limited run of 100 50th-anniversary cars with AC Bristol and Carroll Shelby, built in Detroit and New York.",
          figure: { figure: "100", label: "50th-anniversary cars" },
          backdrop: footage("iconic-roadster"),
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
        },
        {
          name: "Track tested",
          kind: "Palm Beach International Raceway",
          line: "With the Iconic Track Club app, owners raced former Le Mans winners' times on multiple tracks.",
          figure: { figure: "200+", label: "mph" },
          backdrop: footage("iconic-track"),
        },
        {
          name: "A connected car",
          kind: "Connected-vehicle platform",
          line: "Patented and running on the OSIsoft real-time database: the cars were tracked live on every major track in the country.",
          backdrop: footage("iconic-connected"),
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
      slides: [
        {
          name: "At sea",
          kind: "Seabulk tug New River, and more",
          line: "Contender Boats, Benetti and Azimut yachts, Seacor work boats and military patrol boats, monitored live.",
          backdrop: footage("veedims-sea"),
        },
        {
          name: "At the helm",
          kind: "Trip, speed and fuel, live",
          line: "Every system on board on one screen, and on the owner's phone.",
          backdrop: footage("veedims-helm"),
        },
        {
          name: "One platform",
          kind: "Cloud dashboard and AI",
          line: "Proprietary algorithms and predictive analytics that make the decisions, for boats, airline cabins, buildings and renewable energy.",
          figure: { figure: "22", label: "patents" },
          backdrop: footage("veedims-platform"),
        },
        {
          name: "One wire",
          kind: "Sensors, switches and controllers",
          line: "Power and data on a single wire to patented modules. Its first installation controlled every electric and electronic device in a vehicle.",
          figure: { figure: "1", label: "wire" },
          backdrop: footage("veedims-wire"),
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
          picture: { src: `${SHOTS}/connected-athlete-dashboard.png`, width: 767, height: 580, alt: "The Connected Athlete dashboard: steps, calories, active energy, stand minutes, sleep and resting heart rate" },
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
          backdrop: { src: `${STILL}/hub-barca.webp` },
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
  { figure: "100MM+", label: "downloads on the iTunes store, from Zaah's games and apps", chapter: "zaah" },
  { figure: "#1", label: "on the App Store in Canada, Greece and Luxembourg: Graffiti Spray Can", chapter: "zaah" },
  { figure: "98.2M", label: "YouTube subscribers for ChuChu TV, built by the Chennai office", chapter: "zaah" },
  { figure: "52+", label: "patents across Data Treasury, ICONIC Motors and VEEDIMS", chapter: "veedims" },
  { figure: "79", label: "US municipalities on Data Treasury's document products", chapter: "data-treasury" },
  { figure: "#13", label: "Robb Report Car of the Year 2009: the ICONIC AC Roadster", chapter: "iconic-motors" },
];
