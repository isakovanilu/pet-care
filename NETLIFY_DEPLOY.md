# Deploy to Netlify

## Quick Deploy Steps

1. **Go to [Netlify](https://www.netlify.com)** and sign in
2. **Click "Add new site"** → **"Import an existing project"**
3. **Connect to GitHub** and select your `pet-care` repository
4. **Configure build settings:**
   - **Build command:** `npm install && npx expo export:web`
   - **Publish directory:** `web-build`
   - **Node version:** `18` (set in Environment variables)

5. **Add Environment Variables** (optional):
   - `NODE_VERSION` = `18`
   - `EXPO_NO_DOTENV` = `1`

6. **Click "Deploy site"**

## Build Settings Summary

- **Base directory:** (leave empty)
- **Build command:** `npm install && npx expo export:web`
- **Publish directory:** `web-build`
- **Node version:** `18`

## Notes

- The `netlify.toml` file is already configured in the repository
- Netlify will automatically detect the build settings from `netlify.toml`
- The app uses localStorage, so no backend is required
- Authentication is currently disabled (direct access to app)

## After Deployment

Your app will be available at: `https://your-site-name.netlify.app`

You can also set up a custom domain in Netlify's domain settings.

