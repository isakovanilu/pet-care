# Deployment Guide

This guide will help you deploy the Pet Care app to Netlify.

## Prerequisites

- GitHub account
- Netlify account (free tier works)
- Node.js 18+ installed locally

## Step 1: Push to GitHub

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `pet-care-app`)
   - Don't initialize with README, .gitignore, or license

3. **Push your code**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pet-care-app.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify**: https://app.netlify.com
2. **Click "Add new site"** > **"Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - **Build command**: `npm run build:web`
   - **Publish directory**: `web-build`
   - **Node version**: `18` (or latest LTS)
5. **Click "Deploy site"**

### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Build the project**:
   ```bash
   npm run build:web
   ```

4. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

## Step 3: Environment Variables (Optional)

If you want to use Firebase or other services, add environment variables in Netlify:

1. Go to **Site settings** > **Environment variables**
2. Add your variables:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - etc.

Note: The app currently works without Firebase (uses localStorage), so this is optional.

## Step 4: Custom Domain (Optional)

1. Go to **Domain settings** in Netlify
2. Click **Add custom domain**
3. Follow the instructions to configure DNS

## Troubleshooting

### Build Fails

- Check Node version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs in Netlify dashboard

### App Not Loading

- Verify `netlify.toml` redirects are correct
- Check browser console for errors
- Ensure `web-build` directory is being published

### localStorage Not Working

- localStorage works in browsers, but data is per-domain
- Users will need to re-enter data if they clear browser data

## Post-Deployment

After deployment:

1. **Test the app** on the Netlify URL
2. **Update README** with your live URL
3. **Set up continuous deployment** (automatic on push to main branch)

## Notes

- The app uses localStorage for data persistence (no backend required)
- Firebase integration is optional
- Stripe integration requires a backend server (not included in this deployment)
- The app is optimized for web deployment

