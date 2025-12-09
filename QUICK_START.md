# Quick Start Guide

## Start the App

### Option 1: Using the start script (Recommended)

```bash
./start.sh
```

This script automatically:
- Kills any existing Expo processes
- Sets the file descriptor limit
- Starts the web development server

### Option 2: Manual start

```bash
npm start
```

Then press `w` to open in web browser, or visit `http://localhost:19006`

## Troubleshooting

If you encounter "EMFILE: too many open files" error:

1. **Quick fix:**
   ```bash
   ulimit -n 65536 && npm start
   ```

2. **Permanent fix:** Add to `~/.zshrc`:
   ```bash
   ulimit -n 65536
   ```
   Then: `source ~/.zshrc`

