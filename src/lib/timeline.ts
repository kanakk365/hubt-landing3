/**
 * The /timeline page: the line of companies behind HubTech, from 2002.
 *
 * Every fact here comes from 783hz.me (Keith DeLucia's site) or the client
 * meeting of 27 October 2026; nothing is rounded up or filled in. Where the
 * source gives no years (DestinationKP, today's products) none are shown.
 * PlayerHub is left out on purpose: it is not a HubTech product.
 */

export interface TimelineItem {
  name: string;
  line: string;
}

export interface TimelineChapter {
  id: string;
  company: string;
  /** The second, quieter line of the heading. */
  tagline: string;
  /** Years as the source gives them; absent when it gives none. */
  years?: { from: number; to: number };
  /** What the rail shows for the chapter: its years, short, or a tag when it has none. */
  marker: string;
  place: string;
  lede: string;
  items: TimelineItem[];
  facts?: string[];
  image?: { src: string; width: number; height: number; alt: string; side: "left" | "right" };
}

const IMG = "/static/timeline";

export const TIMELINE: TimelineChapter[] = [
  {
    id: "data-treasury",
    company: "Data Treasury",
    tagline: "Documents and identity, in the cloud.",
    years: { from: 2002, to: 2016 },
    marker: "02–16",
    place: "Texas, New York, Florida",
    lede: "A bankrupt company with unfinished technology and two patents, turned around: two remote repositories hosted at SAIC, then the document and biometric products below.",
    items: [
      { name: "eImageVault", line: "Documents scanned straight into a remote repository." },
      { name: "eCheckVault", line: "Check scanners that image a check, extract its data and turn it into an electronic transaction." },
      { name: "ePharmaVault", line: "A HIPAA-compliant platform for research, medical records and doctor authentication." },
      {
        name: "Verify Me",
        line: "Remote multi-factor biometrics for entry, time and attendance, financial transactions, password replacement and threat detection.",
      },
    ],
    facts: [
      "Customers included 79 US municipalities, Bank Hapoalim, Signature Bank and Giant Eagle.",
      "Nine more multi-factor authentication patents granted. Verify Me was sold to LaserLock Technologies, a public company.",
    ],
    image: {
      src: `${IMG}/data-treasury.webp`,
      width: 900,
      height: 1080,
      alt: "Collage from the Verify Me years: an iris scan, a fingerprint, a palm on a scanner and a voice waveform",
      side: "right",
    },
  },
  {
    id: "zaah",
    company: "Zaah",
    tagline: "From four people to a 180-person studio.",
    years: { from: 2002, to: 2013 },
    marker: "02–13",
    place: "New York, Chennai",
    lede: "Started with four people in 2002 and grew into a 180-person development shop in New York and Chennai, with web, .NET, mobile and animation teams.",
    items: [
      {
        name: "Photo-industry platform",
        line: "Front end, middleware and back end for photo products and apparel, for Disney, Walmart, Target, Fuji, Kodak and CVS.",
      },
      {
        name: "Games and apps",
        line: "100MM+ downloads on the iTunes store: Graffiti Spray Can, #1 globally; Techno Kitten Adventure, #1; GOMI, the first multiplayer build-your-own game with cloud integration on iOS; and several other games and apps.",
      },
      { name: "Parkinson's research", line: "The Michael J. Fox Parkinson's research repository, built to streamline research and grants worldwide." },
      { name: "ChuChu TV", line: "Built by the Chennai office: 55 million subscribers and 47 billion views on YouTube." },
    ],
    image: {
      src: `${IMG}/zaah.webp`,
      width: 862,
      height: 1080,
      alt: "Collage from Zaah's app store years: GOMI, Graffiti Spray Can chart listings and Techno Kitten Adventure",
      side: "left",
    },
  },
  {
    id: "iconic-motors",
    company: "ICONIC Motors",
    tagline: "A connected supercar.",
    years: { from: 2009, to: 2014 },
    marker: "09–14",
    place: "New York, Michigan",
    lede: "An 800 HP, 200+ mph, 2,500-pound supercar on a Formula One chassis and drivetrain, with connected-vehicle technology built in.",
    items: [
      {
        name: "AC and Shelby, together again",
        line: "An agreement with AC Bristol and Carroll Shelby for a limited run of 100 50th-anniversary cars, built in Detroit and New York.",
      },
      {
        name: "Connected-vehicle platform",
        line: "Patented, running on the OSIsoft real-time database. The cars were tracked live on every major track in the country.",
      },
      { name: "Iconic Track Club", line: "A cloud and mobile app that let owners race former Le Mans winners' times on multiple tracks." },
    ],
    facts: [
      "#13 in Robb Report's Car of the Year 2009. Unveiled at Amelia Island, and on the covers of duPont Registry and Robb Report.",
      "Titanium, aluminium and carbon-fibre chassis; 19+ patents issued.",
    ],
    image: {
      src: `${IMG}/iconic-motors.webp`,
      width: 882,
      height: 1080,
      alt: "ICONIC Motors collage: the roadster on track, its gauges, and Robb Report and duPont Registry covers",
      side: "right",
    },
  },
  {
    id: "veedims",
    company: "VEEDIMS",
    tagline: "One wire for power and data.",
    years: { from: 2009, to: 2016 },
    marker: "09–16",
    place: "New York, Florida",
    lede: "A connected IoT platform with 22 patents: one wire carries power and data to patented sensors, switches and controllers, with AI on top.",
    items: [
      { name: "Cloud platform", line: "A front-end dashboard with proprietary algorithms and predictive analytics that make the decisions." },
      {
        name: "Installations",
        line: "Contender Boats, Benetti and Azimut yachts, Seacor work boats, military patrol boats, first-class airline cabins, building management and renewable energy.",
      },
      { name: "Remote Dr", line: "Medical devices connected to a waterproof, mil-spec laptop, so doctors could diagnose in real time at sea." },
    ],
    facts: [
      "Its first installation controlled every electric and electronic device in a vehicle.",
      "Standards listed for the platform: PMA, UL, DO-254, DO-326A and DO-178C, with Zigbee, Z-Wave and Ethernet device integration.",
    ],
    image: {
      src: `${IMG}/veedims.webp`,
      width: 882,
      height: 1080,
      alt: "VEEDIMS collage: the control modules, a live dashboard and a work boat at sea",
      side: "right",
    },
  },
  {
    id: "hub-technology",
    company: "Hub Technology",
    tagline: "Youth sports, streamed, scouted and played.",
    years: { from: 2017, to: 2022 },
    marker: "17–22",
    place: "New York, Florida",
    lede: "Products for the youth sports market and FC Barcelona's academies worldwide.",
    items: [
      { name: "YSN", line: "Live streams of youth games from mobile and fixed cameras, with live team chat, player profiles and game analytics." },
      { name: "College Reels", line: "Recruiting: players post video, documents, grades and statistics; coaches search, follow, message and share." },
      {
        name: "Connected Athlete",
        line: "One HIPAA-compliant place for wearable sensor data, video and medical records, shared with doctors, therapists, trainers and coaches.",
      },
      { name: "Battle's Lounge", line: "Online, mobile and in-person esports leagues and tournaments, for venues, influencers, athletes and game developers." },
    ],
    facts: [
      "Alongside, 2017–2020: Barça Academy NY, FC Barcelona's first joint-venture youth academy in America, with a player platform for fees, communication, events and statistics.",
    ],
    image: {
      src: `${IMG}/hub-technology.webp`,
      width: 920,
      height: 1080,
      alt: "Hub Technology's own screens: a YSN live stream, Battle's Lounge tournaments and the Connected Athlete dashboard",
      side: "right",
    },
  },
  {
    id: "destination-kp",
    company: "DestinationKP",
    tagline: "Youth sports and sports medicine, on one site.",
    marker: "KP",
    place: "Kings Park, New York",
    lede: "Designated by New York as the state's only youth sports and medical tourism destination: a former sand mine in Kings Park, planned as a youth sports complex and medical facility.",
    items: [
      { name: "42 acres", line: "The site." },
      { name: "170,000 sq ft", line: "Medical and commercial space." },
      { name: "10 turf fields", line: "Outdoor, with 4K live streaming." },
      { name: "Connected athletes", line: "Biomechanical analysis and connected-athlete sensors." },
    ],
    facts: [
      "Variances, site approval, building permits and financing approvals, won with the community, the town and the state.",
    ],
  },
];

/** The era chart: chapters with years, in order. */
export const ERAS = TIMELINE.filter((c) => c.years).map((c) => ({ id: c.id, company: c.company, ...c.years! }));
export const FIRST_YEAR = 2002;
