# AGENTS.md

## Project Purpose

This repository contains a small React + Vite frontend for viewing Jira worklogs as a month calendar.

The app:
- asks the user for Jira domain, email, and API token
- validates the credentials with `GET /rest/api/3/myself`
- fetches worklogs for the selected month with Jira JQL search
- groups entries by day
- renders a heatmap-style calendar and a day detail panel

## Current Architecture

- `src/App.jsx`
  The entire application lives here: helpers, Jira client, settings screen, calendar screen, and root state.
- `src/main.jsx`
  React entry point.
- `vite.config.js`
  Vite config with a custom allowed host entry.
- `README.md`
  Project documentation.

There is no backend in this repository. The frontend assumes an HTTP proxy is available at:

`http://<current-host>:8080/?url=<encoded-target-url>`

Without that proxy, Jira API requests will fail due to CORS/network restrictions.

## Runtime Flow

1. `App` starts with `creds = null`.
2. `SettingsPanel` collects Jira domain, email, and API token.
3. `makeClient(...).getMyself()` verifies credentials and returns `accountId`.
4. `Calendar` creates a Jira client and loads the active month.
5. `fetchMonthWorklogs()`:
   - builds a month-bounded JQL query
   - pages through `/search/jql`
   - filters worklogs to the authenticated account
   - flattens ADF comments to plain text
   - stores entries in `{ "YYYY-MM-DD": WorklogEntry[] }`
6. The UI computes month totals, per-day totals, ticket counts, and selected-day details from that in-memory map.

## Important Implementation Notes

- Credentials are only stored in React state. A page refresh logs the user out.
- The default Jira domain in the settings form is currently hardcoded to `datasutram`.
- The app fetches data per month and caches fetched month keys in memory.
- The UI is implemented almost entirely with inline styles inside `src/App.jsx`.
- `src/App.css` and `src/index.css` still contain Vite template styling and are mostly not relevant to the current UI.

## Known Risks / Caveats

- `Calendar` triggers data loading with render-time logic instead of a normal `useEffect`. Under React `StrictMode`, this is easy to re-trigger unexpectedly and is a good candidate for cleanup before adding more features.
- `makeClient.call()` still contains a `console.log({ window })` debug statement.
- The app depends on Jira search results containing enough embedded worklog data for the selected month. If Jira truncates embedded worklogs for an issue, a follow-up fetch strategy may be needed.
- `vite.config.js` only allows the host `jira-calender.saz` during dev server use.

## Editing Guidance

- Keep the proxy contract explicit. Any API-layer change must preserve or intentionally replace the `http://<host>:8080/?url=` behavior.
- If you split `src/App.jsx`, separate concerns along these lines first:
  - Jira API client/helpers
  - authentication/settings screen
  - calendar grid and summary widgets
  - selected-day detail panel
- If you change Jira query behavior, verify:
  - month boundaries
  - pagination
  - filtering by `accountId`
  - comment flattening
  - total time calculations
- If you persist credentials later, document the storage choice and security tradeoffs in `README.md`.

## Useful Commands

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`

## Recommended Next Improvements

- Move data fetching into `useEffect`.
- Extract the Jira client and calendar UI into separate modules.
- Replace the hardcoded default domain and proxy contract with environment-based configuration.
- Add a documented local proxy setup so the app can be run without tribal knowledge.
