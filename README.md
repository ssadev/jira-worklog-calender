# Jira Worklog Calendar

This project is now a Next.js application for viewing Jira worklogs in a month calendar.

The original Vite frontend depended on a separate proxy process at `http://<host>:8080/?url=...` to reach Jira from the browser. That dependency has been removed. Jira API calls now run through local Next.js API routes on the same app server.

## What Changed

- Migrated the UI from Vite to Next.js app router
- Replaced the external proxy with internal server-side Jira requests
- Moved Jira request code into server-only modules
- Switched month loading to a normal `useEffect` flow
- Added optional environment-based default Jira domain
- Synced selected month and day into the page URL

## Current Architecture

- `app/page.jsx`
  App entrypoint that renders the client UI
- `components/worklog-calendar-app.jsx`
  Client-side settings form, calendar UI, month navigation, and state
- `app/api/jira/myself/route.js`
  Validates Jira credentials with `GET /rest/api/3/myself`
- `app/api/jira/worklogs/route.js`
  Loads month worklogs through Jira JQL search
- `lib/jira.js`
  Server-only Jira client helpers and response normalization
- `app/globals.css`
  Global styles and font imports

## Runtime Flow

1. The user enters Jira domain, email, and API token.
2. The client posts those credentials to `/api/jira/myself`.
3. The Next.js route handler calls Jira server-side and returns `accountId` plus `displayName`.
4. The calendar client posts the selected month to `/api/jira/worklogs`.
5. The Next.js route handler fetches Jira data server-side, filters worklogs to the authenticated user, and returns a `{ "YYYY-MM-DD": WorklogEntry[] }` map.
6. The UI renders the month heatmap and selected-day details from in-memory state.
7. The active month and selected day are mirrored into query params so reloads and shared links preserve the same calendar view.

## Security Model

- Credentials are persisted in browser `localStorage` so the session survives page reloads.
- The login screen also keeps the most recent successful connection as a one-click quick-connect card after logout.
- Credentials are sent only to the same-origin Next.js server routes, not to an external proxy service.
- The app does not persist tokens in cookies or a database.
- `localStorage` improves convenience but is less secure than in-memory-only storage because any script running in the page origin can read it.

## Jira API Usage

- `GET /rest/api/3/myself`
- `POST /rest/api/3/search/jql`

The worklog query remains month-bounded and filtered by Jira `accountId`.

## Local Development

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production build:

```bash
npm run start
```

Run linting:

```bash
npm run lint
```

## Docker

Build the production image:

```bash
docker build -t jira-worklog-calendar .
```

Run it directly:

```bash
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_JIRA_DOMAIN_DEFAULT=your-company \
  jira-worklog-calendar
```

Or run it with Compose:

```bash
cp .env.example .env
docker compose up --build
```

The container serves the app on port `3000`. Jira API requests are still made server-side from inside the container, so the container needs outbound access to `*.atlassian.net`.

## Environment

You can optionally prefill the Jira domain in the login form:

```bash
cp .env.example .env.local
```

Then set:

```bash
NEXT_PUBLIC_JIRA_DOMAIN_DEFAULT=your-company
```

For Docker Compose, put runtime values in `.env`:

```bash
cp .env.example .env
```

## Important Notes

- This removes the extra proxy dependency, but the Next.js server still needs outbound access to `*.atlassian.net`.
- The app still assumes Jira search results include the relevant embedded worklogs for the selected month.
- Credentials now survive refreshes through `localStorage`.
- The Docker image is built from a standalone Next.js production output for a smaller runtime container.

## Remaining Improvement Areas

- Split the client UI further into smaller presentational components
- Add tests around Jira response parsing and calendar calculations
- Consider a server session if you want to avoid resending credentials on each request
- Add follow-up worklog fetches if Jira truncates embedded worklogs on search results
