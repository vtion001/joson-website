#!/bin/bash
# start-watcher.sh — Start the Joson Dev Watcher
# Usage: ./scripts/start-watcher.sh

cd "$(dirname "$0")/.." || exit 1

echo "Starting Joson Dev Watcher..."
echo "Make sure dev server is running first: npm run dev"
echo ""

# Check if watcher is already running
if pgrep -f "node scripts/watch-dev.js" > /dev/null; then
    echo "Watcher already running. Kill it first: pkill -f watch-dev"
    exit 1
fi

node scripts/watch-dev.js
