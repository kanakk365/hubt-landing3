/**
 * The /timeline page: the line of companies behind HubTech, from 2002.
 *
 * Every fact here comes from 783hz.me (Keith DeLucia's site) or the client
 * meeting of 27 October 2026; nothing is rounded up or filled in. Where the
 * source gives no years (DestinationKP, today's products) none are shown.
 * PlayerHub is left out on purpose: it is not a HubTech product.
 *
 * The films and stills (13 Nov 2026, from the client's voice note) are the
 * companies' own public record: videos on their YouTube channels, embedded,
 * Elite Gudz's own app screenshots, and a dated capture of ChuChu TV. Each
 * file under public/static/timeline carries its origin in a .json sidecar.
 */

export interface TimelineItem {
  name: string;
  line: string;
}

/** A video on YouTube, embedded on click; its poster is stored locally. */
export interface TimelineFilm {
  /** The YouTube video id; the poster is `${FILM}/<id>.webp`. */
  id: string;
  title: string;
  note: string;
  /** Running time, as YouTube gives it. */
  seconds: number;
  /** The channel that published it, when it is the company's own. */
  channel?: string;
  /**
   * A short silent cut (6–10 s, H.264 MP4, no audio track) from the team's original footage, played over the poster
   * while it is in view, e.g. `${LOOP}/<id>.mp4`. Left out until the original files are in hand: these are not cut
   * from the YouTube copies.
   */
  loop?: string;
}

export interface TimelineStill {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

/** The chapter's footage: a player with its clips, and optional stills beneath. */
export interface TimelineMedia {
  films: TimelineFilm[];
  /** Phone screenshots, shown at phone proportions. */
  screens?: TimelineStill[];
  /** One wide capture, captioned with its date. */
  proof?: TimelineStill;
  /** Captioned landscape images from the company's own record. */
  stills?: TimelineStill[];
}

/** A headline figure from the record, linking to the chapter it comes from. */
export interface TimelineFigure {
  figure: string;
  label: string;
  chapter: string;
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
  media?: TimelineMedia;
}

const IMG = "/static/timeline";
export const FILM = `${IMG}/film`;
export const LOOP = `${IMG}/loops`;

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
      "The Congressional Budget Office put a multi-billion-dollar value on its patents.",
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
      { name: "ChuChu TV", line: "Built by the Chennai office. Today the channel has 98.2 million subscribers on YouTube." },
    ],
    media: {
      films: [
        { id: "Mn9w3L5Drpc", title: "Graffiti Spray Can", note: "The launch promo, with Gloria Velez", seconds: 22, channel: "Elite Gudz" },
        { id: "bSaG5wuZQs0", title: "Techno Kitten Adventure", note: "On the floor at E3 2011", seconds: 15 },
      ],
      screens: [
        { src: `${IMG}/stills/gsc-shake.webp`, width: 320, height: 480, alt: "Graffiti Spray Can on iPhone: a paint can with arrows telling you to shake the phone" },
        { src: `${IMG}/stills/gsc-wall.webp`, width: 320, height: 480, alt: "Graffiti Spray Can on iPhone: an Elite Gudz-branded wall ready to paint" },
        { src: `${IMG}/stills/gsc-brick.webp`, width: 320, height: 480, alt: "Graffiti Spray Can on iPhone: a red brick wall with a tag and the background picker" },
        { src: `${IMG}/stills/gsc-art.webp`, width: 320, height: 480, alt: "Graffiti Spray Can artwork: a gas-mask spray can in yellow smoke" },
      ],
      proof: {
        src: `${IMG}/stills/chuchu-tv-channel.webp`,
        width: 982,
        height: 354,
        alt: "The ChuChu TV Nursery Rhymes & Kids Songs YouTube channel header: 98.2M subscribers, 1.1K videos",
        caption: "ChuChu TV on YouTube, 13 November 2026: 98.2M subscribers.",
      },
      stills: [
        {
          src: `${IMG}/stills/gsc-charts.webp`,
          width: 740,
          height: 355,
          alt: "App Store top charts for Canada, Greece and Luxembourg, each with Graffiti Spray Can by Elite Gudz at number one",
          caption: "Graffiti Spray Can at #1 on the App Store in Canada, Greece and Luxembourg.",
        },
        {
          src: `${IMG}/stills/gomi-title.webp`,
          width: 725,
          height: 340,
          alt: "The GOMI title screen: a monkey over Play and Boards with Friends signs on a tropical island",
          caption: "GOMI, Get Out of My Island: build your own boards and play them with friends.",
        },
      ],
    },
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
    lede: "An 800 HP, 200+ mph, 2,500-pound supercar on a Formula One chassis and drivetrain, with connected-vehicle technology built in. Under three seconds from 0 to 60.",
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
      "Shown at Jay Leno's shop, the New York Auto Show, Boca d'Elegance and Pebble Beach.",
      "Titanium, aluminium and carbon-fibre chassis; 19+ patents issued.",
    ],
    image: {
      src: `${IMG}/iconic-motors.webp`,
      width: 882,
      height: 1080,
      alt: "ICONIC Motors collage: the roadster on track, its gauges, and Robb Report and duPont Registry covers",
      side: "right",
    },
    media: {
      films: [
        { id: "cdF8m2WRGZ8", title: "The ICONIC AC Roadster", note: "The 2010 film", seconds: 46, channel: "ICONIC Motors" },
        { id: "zfp3ptQ7KQc", title: "Chassis", note: "Titanium, aluminium and carbon fibre", seconds: 39, channel: "ICONIC Motors" },
        { id: "ZCzD7tpjSSY", title: "12-point fasteners", note: "The hardware, piece by piece", seconds: 43, channel: "ICONIC Motors" },
        { id: "jjVUllSs-m4", title: "Track test", note: "In the pits and on the circuit", seconds: 102, channel: "ICONIC Motors" },
        { id: "UOOkD5N7b0E", title: "Secret track test", note: "The roadster at speed", seconds: 69, channel: "ICONIC Motors" },
      ],
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
      "Its engineers came from IBM, Qualcomm, General Dynamics, Raytheon, SAIC and Pfizer.",
      "A micro-licence deal with OSIsoft, whose real-time database usually runs nuclear power plants at six-figure fees per asset.",
      "Standards listed for the platform: PMA, UL, DO-254, DO-326A and DO-178C, with Zigbee, Z-Wave and Ethernet device integration.",
    ],
    image: {
      src: `${IMG}/veedims.webp`,
      width: 882,
      height: 1080,
      alt: "VEEDIMS collage: the control modules, a live dashboard and a work boat at sea",
      side: "right",
    },
    media: {
      films: [
        { id: "hOc5PMTST9k", title: "Seabulk tug New River", note: "Live fuel and engine monitoring", seconds: 22, channel: "VEEDIMS" },
        { id: "n5q5juNAxkc", title: "At the helm", note: "Trip, speed and fuel, live on board", seconds: 25, channel: "VEEDIMS" },
        { id: "hvFgm-LPc_w", title: "One platform", note: "Every system on one screen", seconds: 57, channel: "VEEDIMS" },
        { id: "qndxCH5swwM", title: "In the ICONIC roadster", note: "The modules that run the car", seconds: 55, channel: "ICONIC Motors" },
        { id: "XEKs36JOyzs", title: "The VEEDIMS story", note: "The company presentation", seconds: 141, channel: "VEEDIMS" },
      ],
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

/** The era chart: chapters with years, in order. */
export const ERAS = TIMELINE.filter((c) => c.years).map((c) => ({ id: c.id, company: c.company, ...c.years! }));
export const FIRST_YEAR = 2002;
