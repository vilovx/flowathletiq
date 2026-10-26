/*
 * FlowAthletiq content data.
 * To add an article: copy one object in ARTICLES, give it a unique "id",
 * and put it at the TOP of the list (newest first). Set "featured": true
 * on the one article you want in the homepage hero.
 *
 * ALL CONTENT BELOW IS EXAMPLE / PLACEHOLDER TEXT. It does not describe
 * real teams, players, results, or events.
 */
window.FA_GAMES = [
  { slug: "valorant", name: "Valorant", color: "#ff4655" },
  { slug: "cs2", name: "CS2", color: "#f5a623" },
  { slug: "lol", name: "League of Legends", color: "#c8aa6e" },
  { slug: "dota2", name: "Dota 2", color: "#e2473b" },
  { slug: "fortnite", name: "Fortnite", color: "#8a5cff" }
];

window.FA_ARTICLES = [
  {
    id: "sample-valorant-agent-guide",
    game: "valorant",
    featured: true,
    title: "Sample article: How a featured story looks on FlowAthletiq",
    excerpt: "This is placeholder text for the homepage hero. Replace it with your real top story, a short summary, and an author name.",
    author: "FlowAthletiq Staff",
    date: "2026-10-24",
    readMinutes: 4,
    tags: ["example", "guide"],
    body: [
      "This is an example article used to preview the FlowAthletiq layout. None of the names, results, or details here are real.",
      "Use the opening paragraph to sum up the story in one or two sentences. Readers skimming the page should get the main point right away.",
      "## Section heading example",
      "Paragraphs starting with two hash marks become sub-headings. Everything else becomes a normal paragraph, so writing new articles only needs plain text.",
      "> Pull quotes start with a greater-than sign. This one is placeholder text, not a quote from anyone.",
      "Close with what readers should watch for next, and link to related coverage."
    ]
  },
  {
    id: "sample-cs2-map-pool",
    game: "cs2",
    title: "Sample article: Breaking down a map pool (example)",
    excerpt: "Placeholder analysis piece showing how a strategy article card appears in the latest news grid.",
    author: "Example Writer",
    date: "2026-10-23",
    readMinutes: 6,
    tags: ["example", "analysis"],
    body: [
      "This is example content. It shows how a longer analysis article renders on the article page.",
      "## What to cover",
      "A real version of this article could explain map picks, common strategies, and what changed in the latest patch.",
      "Replace this text with your own writing when you publish."
    ]
  },
  {
    id: "sample-lol-patch-notes",
    game: "lol",
    title: "Sample article: Patch notes roundup template",
    excerpt: "Example of a recurring patch-notes column. Swap in real patch details when you publish.",
    author: "FlowAthletiq Staff",
    date: "2026-10-22",
    readMinutes: 5,
    tags: ["example", "patch"],
    body: [
      "Example content: a patch roundup usually lists the biggest changes first, then smaller tweaks.",
      "## Biggest changes",
      "List the headline changes here.",
      "## Smaller tweaks",
      "List minor balance changes here."
    ]
  },
  {
    id: "sample-dota2-tournament-preview",
    game: "dota2",
    title: "Sample article: Tournament preview format",
    excerpt: "A placeholder preview piece. Use this structure for groups, schedules, and storylines to follow.",
    author: "Example Writer",
    date: "2026-10-21",
    readMinutes: 7,
    tags: ["example", "preview"],
    body: [
      "Example content: a tournament preview can introduce the format, the schedule, and storylines to follow.",
      "## Format",
      "Describe the group stage and playoffs here.",
      "## Storylines",
      "Highlight the matchups readers should care about."
    ]
  },
  {
    id: "sample-fortnite-season-guide",
    game: "fortnite",
    title: "Sample article: New season survival guide (example)",
    excerpt: "Placeholder guide showing how a beginner-friendly how-to article looks in the grid.",
    author: "FlowAthletiq Staff",
    date: "2026-10-20",
    readMinutes: 3,
    tags: ["example", "guide"],
    body: [
      "Example content: a season guide gives new players quick, practical tips.",
      "## Tip one",
      "Write a short, actionable tip here.",
      "## Tip two",
      "Write another tip here."
    ]
  },
  {
    id: "sample-valorant-interview",
    game: "valorant",
    title: "Sample article: Interview layout example",
    excerpt: "This placeholder shows how a Q&A-style interview could be laid out. No real person is quoted.",
    author: "Example Writer",
    date: "2026-10-19",
    readMinutes: 5,
    tags: ["example", "interview"],
    body: [
      "Example content: interviews work well as short questions followed by answers.",
      "## Question example",
      "Answer text goes here. This is placeholder text, not a real quote."
    ]
  },
  {
    id: "sample-cs2-roster-watch",
    game: "cs2",
    title: "Sample article: Roster watch column template",
    excerpt: "Example of a weekly roster-changes column. Fill it with confirmed news only.",
    author: "FlowAthletiq Staff",
    date: "2026-10-18",
    readMinutes: 4,
    tags: ["example", "roster"],
    body: [
      "Example content: a roster column collects confirmed team changes from the week.",
      "Always link to the official source for each change."
    ]
  },
  {
    id: "sample-lol-beginner-guide",
    game: "lol",
    title: "Sample article: Beginner's guide to watching pro games",
    excerpt: "Placeholder explainer for newcomers. Shows how evergreen guides appear in category pages.",
    author: "Example Writer",
    date: "2026-10-17",
    readMinutes: 8,
    tags: ["example", "explainer"],
    body: [
      "Example content: explain the basics a new viewer needs to enjoy a match.",
      "## Roles",
      "Describe each role briefly here."
    ]
  }
];

/* Upcoming matches / tournaments sidebar. Example placeholders only. */
window.FA_MATCHES = [
  { game: "valorant", event: "Example Cup — Group A", teamA: "Team Alpha", teamB: "Team Bravo", date: "2026-10-27T18:00:00Z" },
  { game: "cs2", event: "Sample League — Week 3", teamA: "Team Charlie", teamB: "Team Delta", date: "2026-10-28T16:00:00Z" },
  { game: "lol", event: "Demo Series — Final", teamA: "Team Echo", teamB: "Team Foxtrot", date: "2026-10-30T19:00:00Z" },
  { game: "dota2", event: "Placeholder Invitational", teamA: "Team Golf", teamB: "Team Hotel", date: "2026-11-01T14:00:00Z" },
  { game: "fortnite", event: "Example Solo Cup", teamA: "Open bracket", teamB: "", date: "2026-11-02T20:00:00Z" }
];
