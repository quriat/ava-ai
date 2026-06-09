# Coolify Deployment Instructions

## Current Issue
Coolify is using `Dockerfile.site` (static nginx) instead of `Dockerfile` (Flask backend)

## Solution - Choose ONE:

### Option 1: Change Dockerfile in Coolify (Recommended)
1. Go to Coolify Dashboard → Your project
2. Click "Settings" or "Build" tab
3. Find "Dockerfile" field
4. Change from `Dockerfile.site` to `Dockerfile`
5. Save and Redeploy

### Option 2: Delete Dockerfile.site
1. In your GitHub repo, delete `Dockerfile.site`
2. Keep only `Dockerfile`
3. Coolify will auto-detect and use `Dockerfile`
4. Redeploy

### Option 3: Rename Files
1. Rename `Dockerfile` to `Dockerfile.site` (overwrite)
2. Commit and push
3. Coolify will use the Flask version
