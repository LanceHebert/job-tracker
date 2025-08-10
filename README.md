# Job Tracker (Huntr-style Kanban)

A lightweight job-tracking app with a Trello-style board, SQLite + Prisma, and a bookmarklet clipper. Built with Next.js (App Router) and Tailwind. Installable as a PWA and auto-startable on macOS via LaunchAgent.

## Features
- Kanban board with drag-and-drop across statuses
- Persistent ordering and status in SQLite via Prisma
- Job detail modal; color-coded cards by URL/source
- Bookmarklet (Save Job) to clip from boards like LinkedIn/Indeed
- PWA install (Add to Dock/Applications)
- macOS LaunchAgent for auto-start at login

## Requirements
- Node.js 22.x (recommended install via Homebrew)
- macOS (for the provided LaunchAgent setup)

Install Node 22 via Homebrew and use it in your shell:

```bash
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node -v
```

## Quick Start (Development)

```bash
# 1) Clone and enter
git clone git@github.com:LanceHebert/job-tracker.git
cd job-tracker

# 2) Env: SQLite file in repo directory
cat > .env <<'ENV'
DATABASE_URL="file:./dev.db"
ENV

# 3) Install deps and create DB schema
npm install
npx prisma db push

# 4) Run dev server
npm run dev
# Visit http://localhost:3000 (or 3001 if 3000 is busy)
```

## Production Build and Run

```bash
# Build
npm run build

# Start (Next.js recommends standalone server for output: "standalone")
# If you want to run manually without LaunchAgent:
PORT=3001 DATABASE_URL="file:./dev.db" node .next/standalone/server.js
```

If you run the standalone server from the project root, ensure static assets are available. If you see “Loading…” and 404 on `/_next/static/...` when using standalone server, copy assets:

```bash
mkdir -p .next/standalone/.next
rsync -a .next/static/ .next/standalone/.next/static/
rsync -a public/ .next/standalone/public/
```

## PWA Install
- Open the app in Chrome (e.g., `http://localhost:3001`)
- Use the “Install app” icon in the URL bar or Chrome Menu → Install

## Bookmarklet (Clipper)
- Navigate to `/clipper` in the app
- Drag the “Save Job” button to your browser bookmarks bar
- On any job posting page (LinkedIn/Indeed/etc.), click the bookmark to open the pre-filled Add Job form
- If the app’s port changes (e.g., 3000 → 3001), re-drag the bookmarklet from `/clipper`

## macOS Auto-start (LaunchAgent)
This repo includes a simple start script and LaunchAgent steps.

- Start script: `run-start.sh`
  - Runs `node .next/standalone/server.js` on `PORT=3001`
  - Exports `DATABASE_URL` to the SQLite file in repo

- LaunchAgent file location:
  - `~/Library/LaunchAgents/com.jobtracker.app.plist`

- Typical control commands:

```bash
# Load/enable
launchctl load -w ~/Library/LaunchAgents/com.jobtracker.app.plist

# Start or restart now
launchctl kickstart -k gui/$(id -u)/com.jobtracker.app

# Stop/disable
launchctl unload -w ~/Library/LaunchAgents/com.jobtracker.app.plist
```

- Logs:

```bash
# stdout
tail -f ~/Library/Logs/job-tracker/out.log
# stderr
tail -f ~/Library/Logs/job-tracker/err.log
```

- Health checks after reboot:

```bash
# Service status (first 80 lines)
launchctl print gui/$(id -u)/com.jobtracker.app | head -n 80

# HTTP/Server
curl -I http://localhost:3001
```

## Database (Prisma + SQLite)
- Schema: `prisma/schema.prisma`
- Sync schema to local DB:

```bash
npx prisma db push
```

- Reset DB (destructive):

```bash
npx prisma db push --force-reset --accept-data-loss
```

## Troubleshooting
- Infinite “Loading…” on homepage:
  - Check that `/_next/static/...` chunks return 200 (no 404)
  - If running `node .next/standalone/server.js`, copy static assets:
    ```bash
    mkdir -p .next/standalone/.next
    rsync -a .next/static/ .next/standalone/.next/static/
    rsync -a public/ .next/standalone/public/
    ```
- 500 errors from `/api/jobs` complaining about missing tables:
  - Create/refresh schema: `npx prisma db push`
  - Ensure `DATABASE_URL` is set where the server runs
- Port already in use (`EADDRINUSE`):
  - Either free the port or change `PORT` to a free port (e.g., 3001)
- Clipper not opening app / wrong port:
  - Recreate the bookmarklet from `/clipper` after the app’s port changes

## Git & Remotes
- Default branch: `master`
- To push changes:

```bash
git add -A
git commit -m "feat: ..."
git push
```

## Notes
- Next.js v15 App Router, Tailwind CSS
- Prisma client generated at `app/generated/prisma`
- `output: "standalone"` is enabled in `next.config.mjs`; prefer `node .next/standalone/server.js` for production

---

If you need scripted one-liners for build/deploy or a health endpoint page, open an issue or PR.
