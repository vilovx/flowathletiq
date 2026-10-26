/* FlowAthletiq tournaments — the ONE place to edit tournament details.
 * Add a new cup by copying an object below. Newest/upcoming first is not required (sorted by date).
 *  - time:        start time "HH:MM" (Riga time) or null -> shows "tiks paziņots" / "TBA" / "будет объявлено"
 *  - registerUrl: link for the "Reģistrēties FACEIT" button (swap for the tournament page link when ready)
 *  - status:      "open" (registration open), "soon" (announced), "finished"
 */
window.FA_TOURNAMENTS = [
  {
    id: "2v2-cup-1",
    name: "FlowAthletiq 2v2 Cup #1",
    date: "2026-11-27",
    time: null,
    registerUrl: "https://www.faceit.com/en/organizers/4ef59ef0-7a33-439f-8613-462e610f93dd/FlowAthletiq",
    status: "open",
    format: "2v2",
    series: "BO3",
    bracket: "single",
    maps: ["Nuke", "Inferno", "Overpass"],
    teams: 16,
    platform: "FACEIT",
    region: "EU",
    prize: null
  }
];
