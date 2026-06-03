# AvaLimo Website

Houston Premier Limo Service website — deployed via GitHub + Coolify.

## Quick Start

### 1. Push to GitHub
```bash
# Create new private repo at https://github.com/new
# Name it: avalimo-site

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/avalimo-site.git
git branch -M main
git push -u origin main
```

### 2. Deploy with Coolify
1. Log in to your Coolify instance
2. Create new resource → **Application**
3. Source: GitHub → Select `avalimo-site` repo
4. Build pack: **Dockerfile**
5. Port: **80**
6. Domain: `avalimo.net`
7. Deploy 🚀

## SEO Setup Checklist

Before deploying, replace these placeholders in `index.html`:

### Google Search Console
- Go to https://search.google.com/search-console
- Add property: `avalimo.net`
- Choose HTML tag verification
- Replace `YOUR_GSC_CODE_HERE` in the meta tag

### Facebook Pixel
- Go to https://business.facebook.com/events_manager
- Create pixel
- Replace `YOUR_PIXEL_ID_HERE` in both places in the FB pixel code

## File Structure

```
├── index.html      # Main website (single-page app)
├── Dockerfile      # Nginx container for Coolify
├── .gitignore     # Git ignore rules
└── README.md      # This file
```

## Features

- ✅ SEO optimized meta tags
- ✅ Schema.org LocalBusiness markup
- ✅ Google Analytics 4
- ✅ Google Search Console ready
- ✅ Facebook Pixel ready
- ✅ Lazy loading images
- ✅ Booking form
- ✅ Square payment integration
- ✅ Flight tracking
- ✅ Live chat widget

## Domain Setup

Point `avalimo.net` A record to your Coolify server IP.
