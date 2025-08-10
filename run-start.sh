#!/bin/zsh
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
export NODE_ENV=production
export PORT=3001
export DATABASE_URL="file:/Users/lancehebert/job-tracker/dev.db"
cd /Users/lancehebert/job-tracker
exec node .next/standalone/server.js
