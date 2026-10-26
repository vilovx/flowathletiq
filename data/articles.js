/*
 * FlowAthletiq content data. Edit this file to change what the site shows.
 *
 * ALL ARTICLES, MATCHES AND BANNERS BELOW ARE EXAMPLE / PLACEHOLDER CONTENT.
 * They do not describe real teams, players, results, events or brands.
 */

/* ---------------------------------------------------------------------------
 * CATEGORIES
 * Each category has a unique "slug" (used in URLs: category.html?cat=<slug>).
 * "parent" makes it a subcategory of another slug. Top-level categories have
 * no parent. Order here = order in the nav. A parent page also lists all
 * articles of its children (and grandchildren).
 * ------------------------------------------------------------------------- */
window.FA_CATEGORIES = [
  { slug: "fps", name: "FPS", color: "#00f0ff", description: "First-person shooters, with a focus on Counter-Strike 2." },
  { slug: "cs2", name: "Counter-Strike 2", short: "CS2", parent: "fps", color: "#f5a623", description: "News, analysis and guides for Counter-Strike 2." },
  { slug: "cs2-majors", name: "Majors", parent: "cs2", color: "#ffcc33", description: "Coverage of the biggest CS2 events." },
  { slug: "cs2-latvia", name: "Latvian CS League", parent: "cs2", color: "#a4343a", description: "Coverage of the Latvian Counter-Strike league scene." },
  // Valorant: to remove it, delete this line and the Valorant entries in FA_ARTICLES / FA_MATCHES.
  { slug: "valorant", name: "Valorant", parent: "fps", color: "#ff4655", description: "Valorant news and guides." },
  { slug: "dota2", name: "Dota 2", color: "#e2473b", description: "Dota 2 news, patches and tournaments." },
  { slug: "lol", name: "League of Legends", short: "LoL", color: "#c8aa6e", description: "League of Legends news, patches and esports." },
  { slug: "mmorpg", name: "MMORPG", color: "#3ddc97", description: "MMORPG news, expansions and guides." }
];

/* ---------------------------------------------------------------------------
 * ARTICLES (newest first is not required; the site sorts by date)
 * "category" must be a slug from FA_CATEGORIES (use the most specific one).
 * Set "featured": true on ONE article to put it in the homepage hero.
 * Body lines: "## " = sub-heading, "> " = pull quote, anything else = paragraph.
 * ------------------------------------------------------------------------- */
window.FA_ARTICLES = [
  {
    id: "sample-cs2-major-preview",
    category: "cs2-majors",
    featured: true,
    title: "Sample article: How a CS2 Major preview could look",
    excerpt: "Placeholder top story for the homepage hero. Replace it with your real Major coverage: format, schedule and storylines.",
    author: "FlowAthletiq Staff",
    date: "2026-10-25",
    readMinutes: 6,
    tags: ["example", "major", "preview"],
    body: [
      "This is an example article used to preview the FlowAthletiq layout. None of the names, results or details here are real.",
      "A Major preview usually opens with the one thing readers need to know: when it starts and why it matters.",
      "## Format",
      "Describe the stages, how many teams take part and how they advance. Placeholder text.",
      "## Teams to watch",
      "List the teams you are following, with a sentence on each. Use only confirmed information and link to sources.",
      "> Pull quotes start with a greater-than sign. This one is placeholder text, not a quote from anyone.",
      "Close with how readers can follow the event on FlowAthletiq."
    ]
  },
  {
    id: "sample-cs2-major-recap",
    category: "cs2-majors",
    title: "Sample article: Major stage recap template",
    excerpt: "Example of a day-by-day recap format for a big CS2 event. No real results are shown.",
    author: "Example Writer",
    date: "2026-10-22",
    readMinutes: 5,
    tags: ["example", "major", "recap"],
    body: [
      "Example content: a stage recap summarises each day of matches in a few short paragraphs.",
      "## Day one",
      "Summarise the day's key moments here.",
      "## Looking ahead",
      "Explain what is at stake in the next stage."
    ]
  },
  {
    id: "sample-latvian-league-round-preview",
    category: "cs2-latvia",
    title: "Sample article: Latvian CS League round preview (example)",
    excerpt: "Placeholder preview for a round of the Latvian Counter-Strike league, using example team names.",
    author: "FlowAthletiq Staff",
    date: "2026-10-24",
    readMinutes: 4,
    tags: ["example", "latvia", "league"],
    body: [
      "Example content: this preview uses placeholder teams (LV Team A, LV Team B) to show the layout.",
      "## Matches this round",
      "LV Team A vs LV Team B, LV Team C vs LV Team D. Add the real fixtures, times and stream links here.",
      "## Why it matters",
      "Explain the standings picture and what each team needs. Placeholder text."
    ]
  },
  {
    id: "sample-latvian-league-standings",
    category: "cs2-latvia",
    title: "Sample article: Latvian league standings explainer",
    excerpt: "Example explainer for how the Latvian CS league table and playoffs work. Placeholder teams only.",
    author: "Example Writer",
    date: "2026-10-20",
    readMinutes: 3,
    tags: ["example", "latvia", "standings"],
    body: [
      "Example content: a standings explainer helps new readers follow the local scene.",
      "## How points work",
      "Describe the points system here.",
      "## Playoff spots",
      "Describe how teams qualify for playoffs."
    ]
  },
  {
    id: "sample-cs2-map-pool",
    category: "cs2",
    title: "Sample article: Breaking down a CS2 map pool (example)",
    excerpt: "Placeholder analysis piece showing how a CS2 strategy article appears in the news grid.",
    author: "Example Writer",
    date: "2026-10-23",
    readMinutes: 6,
    tags: ["example", "analysis"],
    body: [
      "This is example content. It shows how a longer analysis article renders on the article page.",
      "## What to cover",
      "A real version could explain map picks, common strategies and what changed in the latest update.",
      "Replace this text with your own writing when you publish."
    ]
  },
  {
    id: "sample-cs2-settings-guide",
    category: "cs2",
    title: "Sample article: CS2 settings and gear guide template",
    excerpt: "Example guide format for settings, crosshairs and gear. A natural place to link partner banners later.",
    author: "FlowAthletiq Staff",
    date: "2026-10-21",
    readMinutes: 5,
    tags: ["example", "guide", "gear"],
    body: [
      "Example content: a settings guide walks readers through options step by step.",
      "## Video settings",
      "Describe recommended settings here.",
      "## Gear",
      "Mention gear categories (mouse, headset, monitor). If you link products, use partner links and disclose them."
    ]
  },
  {
    id: "sample-fps-genre-overview",
    category: "fps",
    title: "Sample article: FPS esports overview for new fans",
    excerpt: "Placeholder explainer covering the shooter games FlowAthletiq follows.",
    author: "Example Writer",
    date: "2026-10-19",
    readMinutes: 4,
    tags: ["example", "explainer"],
    body: [
      "Example content: an overview article introduces the FPS games covered on the site.",
      "## Counter-Strike 2",
      "Short placeholder description.",
      "## Other shooters",
      "Short placeholder description."
    ]
  },
  {
    id: "sample-valorant-guide",
    category: "valorant",
    title: "Sample article: Valorant beginner guide (example)",
    excerpt: "Placeholder guide showing how a smaller secondary game appears under FPS.",
    author: "FlowAthletiq Staff",
    date: "2026-10-18",
    readMinutes: 3,
    tags: ["example", "guide"],
    body: [
      "Example content: a short beginner guide.",
      "## Tip one",
      "Write a short, actionable tip here."
    ]
  },
  {
    id: "sample-dota2-patch-roundup",
    category: "dota2",
    title: "Sample article: Dota 2 patch roundup template",
    excerpt: "Example of a recurring patch-notes column for Dota 2. Swap in real patch details when you publish.",
    author: "FlowAthletiq Staff",
    date: "2026-10-23",
    readMinutes: 5,
    tags: ["example", "patch"],
    body: [
      "Example content: a patch roundup lists the biggest changes first, then smaller tweaks.",
      "## Biggest changes",
      "List the headline changes here.",
      "## Smaller tweaks",
      "List minor balance changes here."
    ]
  },
  {
    id: "sample-dota2-tournament-preview",
    category: "dota2",
    title: "Sample article: Dota 2 tournament preview format",
    excerpt: "Placeholder preview piece. Use this structure for groups, schedules and storylines.",
    author: "Example Writer",
    date: "2026-10-17",
    readMinutes: 6,
    tags: ["example", "preview"],
    body: [
      "Example content: introduce the format, the schedule and storylines to follow.",
      "## Format",
      "Describe the group stage and playoffs here."
    ]
  },
  {
    id: "sample-lol-patch-notes",
    category: "lol",
    title: "Sample article: League of Legends patch notes template",
    excerpt: "Example of a patch-notes column for LoL. Placeholder text only.",
    author: "FlowAthletiq Staff",
    date: "2026-10-22",
    readMinutes: 5,
    tags: ["example", "patch"],
    body: [
      "Example content: list the biggest champion and item changes first.",
      "## Biggest changes",
      "List the headline changes here."
    ]
  },
  {
    id: "sample-lol-viewer-guide",
    category: "lol",
    title: "Sample article: Beginner's guide to watching LoL esports",
    excerpt: "Placeholder explainer for newcomers to League of Legends esports.",
    author: "Example Writer",
    date: "2026-10-16",
    readMinutes: 7,
    tags: ["example", "explainer"],
    body: [
      "Example content: explain the basics a new viewer needs to enjoy a match.",
      "## Roles",
      "Describe each role briefly here."
    ]
  },
  {
    id: "sample-mmorpg-expansion-preview",
    category: "mmorpg",
    title: "Sample article: MMORPG expansion preview template",
    excerpt: "Example format for covering a new MMORPG expansion or season. No real game details.",
    author: "FlowAthletiq Staff",
    date: "2026-10-21",
    readMinutes: 5,
    tags: ["example", "expansion"],
    body: [
      "Example content: an expansion preview covers what is new, when it launches and who it is for.",
      "## What's new",
      "List new zones, classes or systems here."
    ]
  },
  {
    id: "sample-mmorpg-leveling-guide",
    category: "mmorpg",
    title: "Sample article: MMORPG leveling guide (example)",
    excerpt: "Placeholder guide showing how evergreen MMORPG content appears in its category.",
    author: "Example Writer",
    date: "2026-10-15",
    readMinutes: 6,
    tags: ["example", "guide"],
    body: [
      "Example content: a leveling guide gives practical tips in order.",
      "## Early levels",
      "Write tips here."
    ]
  }
];

/* ---------------------------------------------------------------------------
 * UPCOMING MATCHES (sidebar). "category" = a slug from FA_CATEGORIES.
 * Dates are ISO strings; they display in each visitor's local timezone.
 * ------------------------------------------------------------------------- */
window.FA_MATCHES = [
  { category: "cs2-majors", event: "Example Major — Stage 1", teamA: "Team Alpha", teamB: "Team Bravo", date: "2026-10-27T15:00:00Z" },
  { category: "cs2-latvia", event: "Latvian CS League (example) — Round 5", teamA: "LV Team A", teamB: "LV Team B", date: "2026-10-28T17:00:00Z" },
  { category: "cs2-majors", event: "Example Major — Stage 1", teamA: "Team Charlie", teamB: "Team Delta", date: "2026-10-28T19:00:00Z" },
  { category: "cs2-latvia", event: "Latvian CS League (example) — Round 5", teamA: "LV Team C", teamB: "LV Team D", date: "2026-10-29T17:00:00Z" },
  { category: "cs2", event: "Sample Online Cup", teamA: "Team Echo", teamB: "Team Foxtrot", date: "2026-10-30T18:00:00Z" },
  { category: "valorant", event: "Example Cup — Group A", teamA: "Team Golf", teamB: "Team Hotel", date: "2026-10-31T18:00:00Z" },
  { category: "dota2", event: "Placeholder Invitational", teamA: "Team India", teamB: "Team Juliet", date: "2026-11-01T14:00:00Z" },
  { category: "lol", event: "Demo Series — Final", teamA: "Team Kilo", teamB: "Team Lima", date: "2026-11-02T19:00:00Z" }
];

/* ---------------------------------------------------------------------------
 * PARTNER BANNERS (affiliate links for PC and gaming gear)
 * image:     path in assets/ or a full https:// URL
 * alt:       describe the banner for screen readers
 * href:      your affiliate link
 * label:     short title shown on the partners page
 * size:      "728x90", "300x250", "970x250" ... (used for width/height)
 * placements: where it may appear: "sidebar", "in-feed", "full-width".
 *            All banners are always listed on partners.html.
 * Links automatically get rel="sponsored nofollow noopener" and open in a new tab.
 * ------------------------------------------------------------------------- */
window.FA_BANNERS = [
  {
    id: "placeholder-leaderboard",
    image: "assets/banners/placeholder-728x90.svg",
    alt: "Placeholder partner banner, 728 by 90",
    href: "https://example.com/?ref=flowathletiq",
    label: "Example partner: PC hardware (placeholder)",
    size: "728x90",
    placements: ["in-feed"]
  },
  {
    id: "placeholder-rectangle",
    image: "assets/banners/placeholder-300x250.svg",
    alt: "Placeholder partner banner, 300 by 250",
    href: "https://example.com/?ref=flowathletiq-sidebar",
    label: "Example partner: gaming peripherals (placeholder)",
    size: "300x250",
    placements: ["sidebar"]
  },
  {
    id: "placeholder-billboard",
    image: "assets/banners/placeholder-970x250.svg",
    alt: "Placeholder partner banner, 970 by 250",
    href: "https://example.com/?ref=flowathletiq-billboard",
    label: "Example partner: monitors and chairs (placeholder)",
    size: "970x250",
    placements: ["full-width"]
  }
];
