/**
 * Content for /local-ai: the case for running open-weight models on your own
 * hardware, with outside frontier models reached only through a scrubber.
 * Copy comes from the client's three drafts (main page, architecture
 * animation, egress proof console), set in the site's sentence case. Every
 * figure here is the client's and is illustrative until they confirm it.
 */

/* ── Page sections, in order, for the in-page bar ──────────────────────── */

export const LOCAL_SECTIONS = [
  { id: "how-it-works", label: "How it works" },
  { id: "value", label: "Value" },
  { id: "scrubber", label: "Live scrubber" },
  { id: "leak-test", label: "Leak test" },
  { id: "models", label: "American models" },
  { id: "why-hybrid", label: "Why hybrid" },
  { id: "sizing", label: "ROI and sizing" },
  { id: "faq", label: "FAQ" },
] as const;

/* ── Hero: the three-step overview ─────────────────────────────────────── */

export const HERO_STEPS = [
  {
    key: "office",
    tab: "Inside your office",
    zone: "Your office",
    title: "Local American AI does 85% of the work",
    body: "Your employees and AI agents search private contracts, patient records and source code on your own office server. Nothing touches the internet.",
    sampleLabel: "Internal office query",
    sample: "Audit {{Project Titan}}'s {{$42M}} supplier contract for tariff risks.",
    caption:
      "Your local NVIDIA Nemotron and Arcee Trinity models read all internal PDFs, emails and databases with zero cloud fees and zero internet exposure.",
  },
  {
    key: "scrubber",
    tab: "The secret scrubber",
    zone: "The airlock",
    title: "Strips names and numbers before leaving",
    body: "Need outside intelligence? Our hardware airlock swaps every secret name, dollar figure and code variable with placeholder tags stored only in your office vault.",
    sampleLabel: "Scrubbed at the firewall",
    sample: "Audit [[PROJECT_A]]'s [[AMOUNT_1]] supplier contract for tariff risks.",
    caption:
      "Before asking outside models for help, the airlock strips every company name, dollar figure and code schema into harmless placeholder tags.",
  },
  {
    key: "frontier",
    tab: "Frontier double-check",
    zone: "Frontier models",
    title: "Three giant models check the puzzle",
    body: "Gemini, Claude and GPT solve the anonymised puzzle at the same time. Your local AI compares their answers, puts your real names back inside your office and delivers the verified answer.",
    sampleLabel: "Unlocked back in your office",
    sample: "Verified by 3 models: <<Project Titan>> saves 14% on <<$42M>> via a Section 301 exemption.",
    caption:
      "Gemini, Claude and GPT check the anonymised logic in parallel. Your local AI cross-checks their answers and unlocks the real names back inside your office.",
  },
] as const;

/* ── How the system works: the architecture map ────────────────────────── */

export type NodeKey =
  | "employees"
  | "firewall"
  | "local-model"
  | "private-data"
  | "router"
  | "policy-gate"
  | "openai"
  | "ensemble"
  | "anthropic";

export const SYSTEM_NODES: Record<NodeKey, { stage: string; zone: string; title: string; desc: string }> = {
  employees: {
    stage: "Internal ingress",
    zone: "Corporate intranet",
    title: "Company employees, in a private AI app",
    desc: "Employees ask natural-language questions containing sensitive source code, M&A financials or customer records inside a dedicated internal workspace.",
  },
  firewall: {
    stage: "Perimeter enforcement",
    zone: "Zero-trust firewall",
    title: "Hardware and cryptographic security perimeter",
    desc: "Enforces strict ingress and egress packet inspection. Unsanitised corporate documents or raw embeddings are blocked from leaving the perimeter.",
  },
  "local-model": {
    stage: "On-site compute",
    zone: "100% local GPU cluster",
    title: "Local AI model, an open-weight cluster",
    desc: "Handles 85–90% of day-to-day enterprise queries (summarisation, internal code generation, document Q&A) with zero external API cost.",
  },
  "private-data": {
    stage: "Sovereign storage",
    zone: "Encrypted at rest",
    title: "Private company data: documents, records, IP",
    desc: "Vector databases, ERP records and trade secrets stay mounted inside the local enclave and are never indexed by external AI providers.",
  },
  router: {
    stage: "Agentic sanitisation engine",
    zone: "Deterministic masking",
    title: "AI router and security controls",
    desc: "When frontier reasoning is needed, a specialised local agent strips and tokenises all proprietary context, replacing names, dollar figures and IP with anonymous tokens.",
  },
  "policy-gate": {
    stage: "Audit gate",
    zone: "Policy filter locked",
    title: "Sanitised transfers only",
    desc: "Generates an immutable cryptographic audit log proving to compliance officers that zero corporate IP crossed the firewall.",
  },
  openai: {
    stage: "External frontier API",
    zone: "Sanitised tokens only",
    title: "OpenAI, GPT models via API",
    desc: "Receives only anonymised, non-IP logic puzzles or sanitised validation prompts. No corporate context is exposed.",
  },
  ensemble: {
    stage: "Multi-model validation",
    zone: "Approved queries only",
    title: "External frontier ensemble",
    desc: "Combines frontier reasoning and returns it across the firewall, where the local enclave puts the real values back in for the employee.",
  },
  anthropic: {
    stage: "External frontier API",
    zone: "Sanitised tokens only",
    title: "Anthropic, Claude via API",
    desc: "Used selectively when frontier reasoning materially improves the result, without ever receiving raw company documents or IP.",
  },
};

export type FlowMode = "all" | "local" | "sanitized";

export const FLOW_MODES: { key: FlowMode; label: string; short: string; status: string; body: string; path: NodeKey[] }[] = [
  {
    key: "all",
    label: "Full hybrid architecture",
    short: "Full hybrid",
    status: "Enclave active",
    body: "The local cluster answers, and only sanitised questions go out to the frontier ensemble.",
    path: ["employees", "firewall", "local-model", "private-data", "router", "policy-gate", "ensemble"],
  },
  {
    key: "local",
    label: "Routine query, 100% local",
    short: "Routine query",
    status: "100% local · egress locked",
    body: "Answered entirely on site. The gate stays locked and nothing leaves the building.",
    path: ["employees", "firewall", "local-model", "private-data"],
  },
  {
    key: "sanitized",
    label: "Frontier query, tokenised and sanitised",
    short: "Frontier query",
    status: "Tokenised dispatch · 0 IP egress",
    body: "The router strips and tokenises the question, the gate checks it, and the ensemble sees only placeholders.",
    path: ["employees", "firewall", "router", "policy-gate", "openai", "ensemble", "anthropic"],
  },
];

/** The IP protection guarantee, verbatim from the architecture draft. */
export const IP_GUARANTEE = [
  "In this design, your intellectual property never leaves the building. Your local cluster handles 100% of internal data ingestion, agentic reasoning, and initial execution.",
  "When external knowledge or frontier-level validation is required, a specialized local agent strips and tokenizes all proprietary context before dispatching sanitized queries to an external frontier ensemble.",
] as const;

/* ── Economic and IP value ─────────────────────────────────────────────── */

export type ValueKey = "local" | "selective" | "shared" | "digital" | "physical" | "ip";

export const VALUE_GROUPS: {
  title: string;
  items: { key: ValueKey; title: string; body: string; tag?: string; meter?: [string, string] }[];
}[] = [
  {
    title: "The economic mechanism",
    items: [
      {
        key: "local",
        title: "Most queries run locally",
        body: "Instead of paying an external provider for every request, the business uses an open-weight AI model on dedicated or shared GPU infrastructure.",
        meter: ["Answered on your hardware", "About 85–90 in every 100"],
      },
      {
        key: "selective",
        title: "Expensive cloud AI, used selectively",
        body: "ChatGPT and Claude handle only the requests where advanced reasoning materially improves the result.",
        meter: ["Sent out, scrubbed", "Only the hard ones"],
      },
      {
        key: "shared",
        title: "Infrastructure costs shared",
        body: "A regional data center can spread GPUs, electricity, cooling, security and maintenance across multiple businesses, lowering the cost per customer.",
        meter: ["Cost per customer", "Split across tenants"],
      },
    ],
  },
  {
    title: "Security and IP value",
    items: [
      {
        key: "digital",
        title: "The digital security value",
        tag: "AES-256-GCM",
        body: "Enforces zero-trust network isolation, air-gapped cryptographic tokenization, and TLS 1.3 / AES-256-GCM in-memory encryption. Eliminates third-party model training exposure with immutable audit logs proving zero raw payload egress across the firewall.",
        meter: ["External attack surface", "Zero raw egress"],
      },
      {
        key: "physical",
        title: "The physical security value",
        tag: "SOC 2 Type II",
        body: "Deployed inside sovereign on-site facilities or SOC 2 Type II / ISO 27001 regional colocation cages with biometric and hardware-key access controls, dedicated non-shared NVMe/VRAM enclaves, automatic power-off memory scrubbing, and direct physical custody of the silicon.",
        meter: ["Silicon residency", "100% sovereign cage"],
      },
      {
        key: "ip",
        title: "The intellectual property value",
        tag: "100% retained IP",
        body: "Guarantees 100% retention of trade secrets, R&D formulas, source code, M&A strategy, and customer records. Institutional intelligence, fine-tuning weights, and RAG vector embeddings compound as a company-owned balance-sheet asset rather than leaking into public frontier models.",
        meter: ["Model weight ownership", "Proprietary asset"],
      },
    ],
  },
];

/* ── Live scrubber ─────────────────────────────────────────────────────── */

export type Secret = { raw: string; tag: string };

export const SCRUB_SCENARIOS: Record<
  "finance" | "healthcare" | "manufacturing" | "legal",
  { label: string; prompt: string; secrets: Secret[]; answer: string }
> = {
  finance: {
    label: "Finance and M&A",
    prompt:
      "We are acquiring Apex Robotics for $420M at 13.5x EBITDA ($31.1M) under Project Horizon. What debt covenant structure protects us if Q3 rates rise 75bps?",
    secrets: [
      { raw: "Apex Robotics", tag: "[TARGET_COMPANY_A]" },
      { raw: "$420M", tag: "[DEAL_SIZE_1]" },
      { raw: "$31.1M", tag: "[EARNINGS_BASE_1]" },
      { raw: "Project Horizon", tag: "[DEAL_CODENAME_X]" },
    ],
    answer:
      "For <<Project Horizon>>'s acquisition of <<Apex Robotics>> at <<$420M>> (<<$31.1M>> EBITDA), all 3 frontier models recommend a 65% floating-to-fixed interest rate swap collar capped at 4.25x senior leverage.",
  },
  healthcare: {
    label: "Healthcare and biotech",
    prompt:
      "Patient John Doe (ID: PT-9042) in our Phase-3 trial for compound BioVax-77 showed mild liver enzyme elevation at 60mg dosing. What step-down protocol meets FDA guidance?",
    secrets: [
      { raw: "John Doe", tag: "[PATIENT_NAME_REDACTED]" },
      { raw: "PT-9042", tag: "[HIPAA_ID_88A]" },
      { raw: "BioVax-77", tag: "[MOLECULE_CODE_B]" },
      { raw: "60mg", tag: "[DOSE_LEVEL_1]" },
    ],
    answer:
      "For patient <<John Doe>> (<<PT-9042>>) receiving <<BioVax-77>> at <<60mg>>, FDA CTCAE grade-2 guidance verified across Gemini, Claude and GPT recommends holding dosing for 7 days, followed by a 50% step-down titration.",
  },
  manufacturing: {
    label: "Manufacturing and R&D",
    prompt:
      "Our Austin Fab 2nm line saw wafer yield dip to 64.2% on Project Titan due to photoresist outgassing. What nitrogen purge cycle restores throughput?",
    secrets: [
      { raw: "Austin Fab 2nm", tag: "[FACILITY_LINE_A]" },
      { raw: "64.2%", tag: "[YIELD_METRIC_1]" },
      { raw: "Project Titan", tag: "[PRODUCT_CODE_9]" },
    ],
    answer:
      "To restore <<Project Titan>> wafer yield above <<64.2%>> at the <<Austin Fab 2nm>> line, run a 40-second ultra-high-purity nitrogen purge before EUV exposure.",
  },
  legal: {
    label: "Legal and contracts",
    prompt:
      "Review Section 14 of our Master Supply Agreement with GlobalChips Inc. carrying a $85M liability cap under Delaware law. Does the force majeure clause cover port strikes?",
    secrets: [
      { raw: "GlobalChips Inc.", tag: "[COUNTERPARTY_1]" },
      { raw: "$85M", tag: "[LIABILITY_CAP_A]" },
    ],
    answer:
      "Under Delaware precedent verified by 3 frontier models, your agreement with <<GlobalChips Inc.>> (<<$85M>> cap) needs labour disputes listed explicitly; add Rider 14.2 to cover port strikes.",
  },
};

/** Patterns the demo also catches in whatever the visitor types. */
export const EXTRA_RULES = [
  { re: /\$[0-9]+(?:\.[0-9]+)?[BMK]?/g, prefix: "AMOUNT" },
  { re: /\bProject\s+[A-Z][a-zA-Z0-9_-]+/g, prefix: "CODENAME" },
  { re: /\b[A-Z][a-zA-Z]+\s+(?:Corp|Inc|LLC|Labs|Robotics)\.?/g, prefix: "COMPANY" },
  { re: /\b\d{3}-\d{2}-\d{4}\b/g, prefix: "PII_SSN" },
  { re: /\b[0-9]+(?:\.[0-9]+)?%/g, prefix: "METRIC" },
] as const;

/* ── Leak test: the three proofs ───────────────────────────────────────── */

export const PROOFS = [
  { key: "overlap", tab: "Zero overlap", formula: "S ∩ P = ∅" },
  { key: "information", tab: "Zero information", formula: "I(X ; Y) = 0" },
  { key: "audit", tab: "Audit chain", formula: "Hₙ = SHA256(Hₙ₋₁ ∥ P)" },
] as const;

export const VENN = {
  secrets: ["Project Titan", "$42.8M EBITDA", "Austin Fab 2nm"],
  packet: ["[ENTITY_ALPHA]", "[METRIC_VAL_1]", "[NODE_SPEC_A]"],
};

export const SALT_SECRETS = [
  "Acquisition of BioGenX for $4.2B",
  "Divestiture of CloudCore for $95M",
  "Licensing of Alloy-99 for $12K",
];

export const AUDIT_LOG = [
  { time: "22:12:48", dept: "Silicon engineering · agent 04", entities: 4, hash: "0x8f91e3b2…c40a" },
  { time: "22:11:19", dept: "Corporate development · agent 01", entities: 4, hash: "0x3c74a19d…91be" },
  { time: "22:09:05", dept: "Quant research · agent 12", entities: 4, hash: "0x7a12f08c…55d2" },
  { time: "22:06:51", dept: "Oncology R&D · agent 07", entities: 4, hash: "0xe509b41a…28f7" },
  { time: "22:02:14", dept: "Legal IP review · agent 02", entities: 6, hash: "0x1d44c90e…73a1" },
];

/* ── Four guarantees ───────────────────────────────────────────────────── */

export const GUARANTEES = [
  {
    key: "brains",
    title: "100% American local brains",
    chip: "US sovereign stack",
    body: "Your office runs top-tier American open-weight models (NVIDIA Nemotron, Arcee AI Trinity, Poolside Laguna and Meta Llama) on your own hardware. Zero foreign supply-chain risk, zero per-seat cloud rent, and total ownership of your intelligence.",
    foot: ["NVIDIA Nemotron", "Arcee Trinity", "Poolside Code", "Meta Llama 4"],
  },
  {
    key: "workforce",
    title: "A 24/7 multi-agent workforce",
    chip: "Unlimited local agents",
    body: "Deploy specialised local AI agents for legal, finance, engineering and HR. Because they run on your local server with department-level access control, an HR agent can never accidentally read an M&A folder.",
    foot: ["Role-based security", "$0 per-token local cost", "5x faster response"],
  },
  {
    key: "verify",
    title: "Trust, but verify across 3 giants",
    chip: "Anti-hallucination engine",
    body: "Relying on a single AI model leads to costly mistakes. When your local AI faces a complex legal, medical or maths question, it scrubs your secrets and asks Gemini, Claude and GPT at once, spotting errors automatically.",
    foot: ["Single-model error rate ~14%", "3-model consensus error <0.8%"],
  },
  {
    key: "proof",
    title: "Mathematical proof for your board",
    chip: "Courtroom-ready audit",
    body: "Don't rely on “trust us” privacy policies. Every query generates a cryptographic receipt proving that the overlap between your company IP and outbound internet traffic is the empty set: 0 bytes.",
    foot: ["SOC2 · HIPAA · ISO-42001 · ITAR", "1-click audit export"],
  },
] as const;

/* ── Cloud-only vs hybrid ──────────────────────────────────────────────── */

export const COMPARISON = {
  cloud: [
    { label: "Where your secrets go", value: "Sent to public cloud servers", desc: "Every prompt, contract and spreadsheet leaves your building." },
    { label: "Monthly cost model", value: "$30–$60 per user, plus token rent", desc: "Costs climb as you add employees and autonomous agents." },
    { label: "AI accuracy check", value: "Single-model blind spots", desc: "You rely on one vendor's model, with ~14% hallucination risk." },
    { label: "Compliance proof", value: "The vendor's “trust us” policy", desc: "No mathematical proof if an auditor asks what leaked." },
  ],
  hybrid: [
    { label: "Where your secrets go", value: "100% stay in your office", desc: "Processed on your local server. Only placeholder tags ever go outside." },
    { label: "Monthly cost model", value: "$0 per-seat local AI", desc: "Own your office server once. Cut external API bills by ~88%." },
    { label: "AI accuracy check", value: "3-model frontier consensus", desc: "Local AI cross-checks Gemini, Claude and GPT to catch errors." },
    { label: "Compliance proof", value: "A mathematical 0-byte receipt", desc: "Courtroom-ready SHA-256 proof for SOC2, HIPAA and your board." },
  ],
} as const;

/* ── Sizing and ROI ────────────────────────────────────────────────────── */

export type Tier = "standard" | "regulated" | "defense";

export const TIERS: Record<Tier, { label: string; who: string; badge: string; title: string; split: string; splitNote: string }> = {
  standard: {
    label: "Standard enterprise IP protection",
    who: "Software, manufacturing, media, retail",
    badge: "SOC2",
    title: "Core · enterprise IP protection",
    split: "85% local / 15% scrubbed",
    splitNote: "Frontier API bill cut by 85%",
  },
  regulated: {
    label: "Regulated finance, healthcare and legal",
    who: "M&A, biotech, HIPAA, law firms",
    badge: "HIPAA / SEC",
    title: "Pro cluster · regulated enterprise",
    split: "88% local / 12% scrubbed",
    splitNote: "Frontier API bill cut by 88%",
  },
  defense: {
    label: "Defense, semiconductor and critical infrastructure",
    who: "Dual-NIC hardware kill-switch plus ITAR",
    badge: "ITAR / CMMC",
    title: "Sovereign vault · defense and air-gapped",
    split: "95% local / 5% scrubbed",
    splitNote: "Frontier API bill cut by 95%",
  },
};

/** The client's estimate: $75 per user per month in cloud seats and agent usage, over 3 years, less the hardware. */
export function sizeOffice(users: number) {
  const cloud = users * 75 * 36;
  const hardware = users <= 150 ? 45000 : users <= 750 ? 115000 : 240000;
  const savings = Math.max(48000, cloud - hardware);
  const server =
    users <= 150
      ? "1× quiet office tower (2× RTX PRO 6000)"
      : users <= 800
        ? "1× 4U rack server (4× NVIDIA H200)"
        : "2× 4U sovereign node cluster (8× NVIDIA B200)";
  return { savings, server };
}

export const MODEL_STACK = [
  ["Primary brain", "NVIDIA Nemotron 3 + Arcee Trinity Large (local vLLM)"],
  ["Secret scrubber", "Hardware Presidio airlock + local Redis RAM vault"],
  ["Frontier validation", "Anonymised zero-retention fan-out (Gemini + Claude + GPT)"],
] as const;

/* ── FAQ ───────────────────────────────────────────────────────────────── */

export const FAQ = [
  {
    q: "What if an employee, or a rogue AI agent, tries to paste a secret straight to the outside internet?",
    tag: "Hardware blocked",
    a: "They physically can't. Your local AI server has no direct internet connection. Every outbound question must pass through the cryptographic airlock, which checks the packet against your company's secret dictionary and database schemas. If a single unmasked secret is detected, the network card drops the packet immediately: 0 bytes sent.",
  },
  {
    q: "Why not just buy ChatGPT Enterprise or Claude Enterprise for everyone?",
    tag: "Cost and sovereignty",
    a: "Three reasons. With cloud-only AI, 100% of your raw trade secrets leave your building and sit on third-party servers. You pay monthly per-employee rent forever, plus large API fees for autonomous agents. And you are locked into a single provider's blind spots instead of cross-checking difficult answers across several frontier models.",
  },
  {
    q: "If the outside models only see placeholders like [COMPANY_A], how do they give useful answers?",
    tag: "Reversible vault",
    a: "The hardest part of legal, financial, medical or engineering analysis is the logic, the maths and the rules, not the proper nouns. Outside models solve the structural puzzle using [COMPANY_A] and [VALUATION_1]. When their answer returns to your office, your local AI swaps “Project Titan” and “$42M” back in from local memory in about 2 milliseconds.",
  },
] as const;
