/* FlowAthletiq tournaments — the ONE place to edit tournament details.
 * Add a new cup by copying an object below. Newest/upcoming first is not required (sorted by date).
 *  - time:        start time "HH:MM" (Riga time) or null -> shows "tiks paziņots" / "TBA" / "будет объявлено"
 *  - registerUrl: link for the "Reģistrēties FACEIT" button (swap for the tournament page link when ready)
 *  - faceitChampionshipId: FACEIT championship id (from the tournament URL .../championship/<id>/...).
 *                 When set (and status is not "finished"), the "CS2 server status" workflow fetches the
 *                 registered teams via the official FACEIT Data API and the page lists them automatically.
 *  - prize:       null, or { lv, en, ru } text for the "Balvas" row (first sentence is shown bold)
 *  - status:      "open" (registration open), "soon" (announced), "finished"
 */
window.FA_TOURNAMENTS = [
  {
    id: "2v2-cup-1",
    name: "FlowAthletiq 2v2 Cup #1",
    date: "2026-11-28",
    time: "15:00",
    faceitChampionshipId: "6ec9f571-8137-485b-8ae6-40661daee26a",
    registerUrl: "https://www.faceit.com/en/championship/6ec9f571-8137-485b-8ae6-40661daee26a/FlowAthletiq%202v2%20Cup%201",
    status: "open",
    format: "2v2",
    series: "BO3",
    bracket: "single",
    maps: ["Nuke", "Inferno", "Overpass"],
    teams: 16,
    platform: "FACEIT",
    region: "EU",
    // prize: shown as a full-width "Balvas" row; first sentence is highlighted
    prize: {
      lv: "Pie balvu fonda pašlaik strādājam. Šis ir pirmais FlowAthletiq kopienas turnīrs — iesildīšanās organizatoriem un iespēja redzēt, cik liela ir interese.",
      en: "We're currently working on a prize pool. This is the first FlowAthletiq community tournament — a warm-up for the organizers and a chance to see how much interest there is.",
      ru: "Над призовым фондом сейчас работаем. Это первый комьюнити-турнир FlowAthletiq — разминка для организаторов и возможность понять, насколько велик интерес."
    }
  }
];
