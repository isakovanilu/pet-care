#!/bin/bash

# Kill any existing Expo processes
pkill -f "expo start" 2>/dev/null || true
pkill -f "node.*expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

# Fix file watcher limit for macOS (must be done in the same shell)
# Try to set a very high limit
ulimit -n 65536 2>/dev/null || ulimit -n 10240

# Verify the limit was set
echo "File descriptor limit set to: $(ulimit -n)"
echo "Starting web-only development server..."

# Start the app (web only)
cd "$(dirname "$0")"
export EXPO_NO_DOTENV=1
# Don't use CI mode as it breaks routing
exec npm start

