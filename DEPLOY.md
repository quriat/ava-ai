# AvaLimo — 5-Minute Deployment Checklist

## Step 1: Push to GitHub (30 seconds)
```bash
cd /tmp/avalimo-site
git remote add origin https://github.com/YOUR_USERNAME/avalimo-site.git
git branch -M main
git push -u origin main
git checkout staging && git push -u origin staging && git checkout main
```

## Step 2: GitHub Secrets (1 minute)
Repo → Settings → Secrets and variables → Actions → New repository secret:
- `N8N_WEBHOOK_URL` = `https://n8napp.adamj.fit/webhook/github-deploy`

## Step 3: Coolify (2 minutes)
- New Application → GitHub → `avalimo-site`
- Branch: `main`
- Build Pack: `Dockerfile`
- Port: `80`
- Domain: `avalimo.net`

## Step 4: DNS (1 minute)
Point A record `avalimo.net` and `www.avalimo.net` to your Coolify server IP.

## Step 5: n8n (1 minute)
1. n8napp.adamj.fit → Workflows → Import from JSON
2. Import all 5 files from `n8n-workflows/`
3. Set Telegram credentials (Bot Token + Chat ID)
4. Activate workflows, copy webhook URLs, paste into GitHub Secrets

## Step 6: Tracking Codes (30 seconds)
Edit `index.html`, replace:
- `YOUR_GSC_CODE_HERE` → Google Search Console meta verification string
- `YOUR_PIXEL_ID_HERE` (2 places) → Facebook Pixel ID
```bash
git add index.html && git commit -m "Add tracking codes" && git push origin main
```

Done. Every future push to `main` auto-deploys.
