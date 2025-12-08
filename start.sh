#!/bin/bash

# Fix file watcher limit for macOS
ulimit -n 10240

# Start the app
cd "$(dirname "$0")"
npm start

