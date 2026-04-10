# Interactive QA with Claude + Playwright MCP

Use these prompts with Claude Code to run exploratory QA tests via the Playwright MCP browser tools. No test files or setup needed — just start your dev server and paste a prompt.

## Prerequisites

1. Start the dev server: `npm run dev`
2. Ensure Playwright MCP is configured in `.mcp.json` (already done)

---

## Prompt Templates

### Smoke Test — Page Load

```
Navigate to http://localhost:3000 in the browser. Take a snapshot and verify:
1. The page loads without console errors
2. "worklog calendar" text is visible
3. Three input fields exist: JIRA DOMAIN, EMAIL, API TOKEN
4. A "Connect & Load Calendar" button is present
Take a screenshot for visual reference.
```

### Form Validation — Empty Submission

```
Navigate to http://localhost:3000. Click "Connect & Load Calendar" without
filling any fields. Check:
1. Error message "All fields are required." appears
2. No network requests were made to /api/jira/myself
3. Check console for JavaScript errors
Report findings.
```

### Form Validation — Invalid Credentials

```
Navigate to http://localhost:3000. Fill in:
- JIRA DOMAIN: "fake-company"
- EMAIL: "test@example.com"
- API TOKEN: "invalid-token"
Click "Connect & Load Calendar". Verify:
1. Button text changes to "Connecting…" during request
2. An error containing "Connection failed" appears
3. Button returns to "Connect & Load Calendar"
Take screenshots before and after.
```

### Auth Flow with Real Credentials

```
Navigate to http://localhost:3000. Fill in:
- JIRA DOMAIN: "<YOUR_DOMAIN>"
- EMAIL: "<YOUR_EMAIL>"
- API TOKEN: "<YOUR_TOKEN>"
Click "Connect & Load Calendar". Verify:
1. Settings panel disappears, calendar view appears
2. Month/year header with navigation is visible
3. User's display name appears in header
4. Logout button is visible
5. localStorage key "jira-worklog-creds" contains accountId
Take a screenshot of the calendar.
```

### Calendar Navigation

```
Assuming you're on the calendar view (authenticated), test:
1. Note the current month
2. Click "←" — verify month changes to previous
3. Click "→" — verify it returns to original
4. Click "today" — verify it shows current month
5. Click "↻ refresh" — verify loading state then data returns
6. Check each navigation triggers /api/jira/worklogs call
Take screenshots after each step.
```

### Day Selection and Detail Panel

```
On the calendar view, click a day cell with logged hours (look for cells
showing "4h" or "2h 30m"). Verify:
1. Cell gets purple highlight border
2. Detail panel shows the selected date
3. Worklog entries show issue keys, time, and summaries
4. Double-click the same day — verify navigation to /daily-worklog?day=YYYY-MM-DD
Take screenshots.
```

### Daily Worklog Page

```
Navigate to http://localhost:3000/daily-worklog?day=2026-04-09. Verify:
1. "← Calendar" back button visible
2. Date with weekday shown
3. Clock visualization (SVG/pie chart) renders
4. Worklog entries listed below clock
5. Day navigation ‹/› arrows work
6. "← Calendar" returns to home
Check console errors throughout.
```

### Responsive Design

```
Test responsive behavior across viewports:
1. Resize to 1200x800 (desktop) — screenshot calendar page
2. Resize to 768x1024 (tablet) — verify layout adapts
3. Resize to 375x812 (mobile) — verify everything accessible
4. Navigate to /daily-worklog on mobile — verify clock stacks above list
Check for overflow, clipping, or broken layouts at each size.
```

### Console Error Sweep

```
Navigate through the full app and monitor for console errors:
1. http://localhost:3000 — check console
2. Fill credentials and connect — check console
3. Navigate 3 different months — check console
4. Select 3 different days — check console
5. Double-click to daily worklog — check console
6. Navigate days on daily worklog — check console
7. Go back to calendar — check console
Report ALL console messages found.
```

### LocalStorage Persistence

```
Test credential persistence:
1. Navigate to http://localhost:3000 — should show settings
2. Use browser_evaluate to inject localStorage:
   localStorage.setItem('jira-worklog-creds', JSON.stringify({
     domain: 'test', email: 'test@test.com', token: 'tok',
     accountId: 'abc123', displayName: 'Test User'
   }))
3. Refresh — verify calendar loads (not settings)
4. Verify "Test User" in header
5. Click logout — verify settings panel returns
6. Check jira-worklog-creds removed from localStorage
7. Check jira-worklog-last-session still has old data
8. Verify "LAST CONNECTION" section shows "Test User"
```

---

## Tips

- Always start with `browser_navigate` then `browser_snapshot` to understand DOM state
- Use `browser_console_messages` after each test to catch silent errors
- Use `browser_network_requests` to verify API calls during data flows
- Use `browser_evaluate` for localStorage checks or injecting test data
- Use `browser_take_screenshot` for anything visual — Claude analyzes the image
- Chain multiple steps in a single prompt for end-to-end flow testing
