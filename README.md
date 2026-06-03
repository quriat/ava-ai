# AvaLimo Website — Full DevOps + Marketing + Automation Pipeline

Houston Premier Limo Service — complete digital infrastructure with automated SEO, CI/CD, content marketing, social media strategy, and business automation.

---

## What's Included

| Component | Status | Location |
|-----------|--------|----------|
| **SEO-ready Website** | GSC + FB Pixel placeholders | `index.html` |
| **GitHub Actions CI/CD** | Auto-lint, deploy, notify | `.github/workflows/` |
| **Staging Branch** | Test before production | `staging` |
| **n8n Workflows (5)** | Deploy, leads, reviews, competitors, email | `n8n-workflows/` |
| **Google Ads Landing Pages (2)** | Airport + Wedding | `landing-pages/` |
| **Content Calendar** | 12-month SEO blog strategy | `content/calendar/` |
| **Blog Post Template** | SEO-optimized HTML | `content/blog/` |
| **Social Media Strategy** | TikTok + Instagram + 30-day plan | `content/social/` |
| **Email Drip Campaigns** | 5 sequences, 15+ templates | `content/email/` |
| **Dockerfile** | Nginx container for Coolify | `Dockerfile` |

---

## Quick Start

### 1. Push to GitHub

```bash
cd avalimo-site
git remote add origin https://github.com/YOUR_USERNAME/avalimo-site.git
git branch -M main
git push -u origin main
git checkout staging && git push -u origin staging
```

### 2. Add GitHub Secrets

Repo → **Settings** → **Secrets and variables** → **Actions**

| Secret | Value |
|--------|-------|
| `N8N_WEBHOOK_URL` | From n8n after importing workflows |
| `TELEGRAM_BOT_TOKEN` | From @BotFather |

### 3. Deploy on Coolify

1. New **Application** → GitHub → `avalimo-site` → `main` branch
2. Build Pack: **Dockerfile** | Port: **80** | Domain: `avalimo.net`
3. Deploy 🚀

### 4. Configure n8n

Log in to `n8napp.adamj.fit` → **Import** these 5 workflows:

| Workflow | File | Purpose |
|----------|------|---------|
| **Deploy Notifications** | `deploy-notifications.json` | Telegram + email on deploy |
| **Lead Nurture** | `lead-nurture.json` | Auto-reply, follow-up, DB save |
| **Competitor Tracker** | `competitor-tracker.json` | Daily ranking monitoring |
| **Review Requests** | `review-requests.json` | Google review automation |
| **Email Sequences** | `email-sequences.json` | Welcome, abandoned quote, VIP |

Update Telegram chat ID in all workflows → Copy webhook URL → Save as GitHub secret.

### 5. Replace SEO Placeholders

Edit `index.html`:
- `YOUR_GSC_CODE_HERE` → Google Search Console verification code
- `YOUR_PIXEL_ID_HERE` → Facebook Pixel ID (2 places)

```bash
git add index.html && git commit -m "Add tracking codes" && git push origin main
# → Auto-deploys in ~30 seconds!
```

---

## Marketing Assets

### Google Ads Landing Pages

| Page | Campaign | CTA |
|------|----------|-----|
| `landing-pages/iah-airport.html` | IAH Airport Transfer | Instant quote form |
| `landing-pages/wedding-limo.html` | Wedding Limo Houston | Wedding package quote |

**Features:**
- Conversion tracking code (Google Ads gtag)
- Fixed pricing display
- Vehicle selection
- Mobile-optimized forms
- Noindex (won't compete with main site SEO)

### Blog Content Strategy

**12-month calendar** targeting Houston limo keywords:

| Month | Focus | Target Keywords |
|-------|-------|----------------|
| Month 1 | Airport/Travel | `iah airport transfer`, `hobby airport car service` |
| Month 2 | Corporate/Events | `corporate car service houston` |
| Month 3 | Weddings | `wedding limo houston`, `bachelorette party bus` |
| Month 4 | Tours | `houston wine tour`, `brewery tour` |
| Month 5 | Local SEO | `sugar land limo`, `the woodlands car service` |
| Month 6 | Seasonal | `prom limo houston`, `holiday airport transfer` |

**Sample article included:** `content/blog/iah-airport-transfer-guide.html`

**Template for new articles:** `content/blog/TEMPLATE.html`

### Social Media (TikTok + Instagram)

**Content pillars:**
- Behind the scenes (25%)
- Client moments (25%)
- Houston lifestyle (20%)
- Education (20%)
- Promotions (10%)

**11 TikTok video ideas** with hooks, shots, and CTAs

**30-day launch plan** included

### Email Drip Campaigns

| Sequence | Trigger | Emails |
|----------|---------|--------|
| **Welcome Series** | New lead | Welcome → Social proof → Vehicle guide → 15% off |
| **Abandoned Quote** | No booking after 1h | Check-in → Urgency → 10% off final offer |
| **Review Request** | 24h after ride | Thank you + review link → Reminder → VIP status |
| **Birthday VIP** | Birthday date | Free upgrade code |
| **Anniversary** | 1 year since first ride | 20% off celebration code |

**15+ pre-written email templates** with subject lines, preview text, and copy

---

## Automation (n8n)

| Workflow | Trigger | Action |
|----------|---------|--------|
| **Deploy Alert** | GitHub webhook | Telegram message |
| **Production Email** | Deploy to `main` | Email to adam@avalimo.net |
| **New Lead** | Booking form POST | Telegram + auto-reply + DB + 1hr follow-up |
| **Competitor Tracker** | Daily schedule | Ranking report + alerts |
| **Review Requests** | Daily 10 AM | Email/SMS to past customers |
| **Email Sequences** | Webhook/Schedule | Automated drip campaigns |

---

## File Structure

```
├── index.html                    # Main website
├── Dockerfile                    # Nginx container
├── .env.example                 # Secrets template
├── README.md                    # This file
├── .github/
│   └── workflows/
│       ├── deploy.yml           # CI/CD pipeline
│       └── pr-preview.yml       # PR checks
├── landing-pages/
│   ├── iah-airport.html         # Google Ads: Airport
│   └── wedding-limo.html        # Google Ads: Wedding
├── content/
│   ├── calendar/
│   │   └── content-calendar.md  # 12-month strategy
│   ├── blog/
│   │   ├── TEMPLATE.html        # Blog post template
│   │   └── iah-airport-transfer-guide.html  # Sample article
│   ├── social/
│   │   └── social-media-strategy.md  # TikTok + Instagram plan
│   └── email/
│       └── email-sequences.md   # 5 drip campaigns, 15+ templates
└── n8n-workflows/
    ├── deploy-notifications.json  # Deploy alerts
    ├── lead-nurture.json         # Lead auto-response
    ├── competitor-tracker.json   # SEO monitoring
    ├── review-requests.json      # Google Review automation
    ├── email-sequences.json       # Email drip campaigns
    └── README.md                # n8n setup guide
```

---

## Your New Workflow

```
Edit site     → git push     → Lint → Deploy → Telegram alert
Write blog    → git push     → PR check → Merge → Deploy + alert
New lead      → n8n webhook  → Telegram you + email customer → follow-up
Competitor    → n8n daily    → Ranking report → Alert → Take action
Past customer → n8n daily    → Review request email → Google Review
Email subscriber → n8n sequence → Welcome → Discount → VIP perks
```

---

## Next Steps After Setup

- [ ] **Claim Google Business Profile** — search "AvaLimo Houston"
- [ ] **Set up Google Search Console** — verify, submit sitemap
- [ ] **Install Facebook Pixel** — get Pixel ID, replace placeholder
- [ ] **Set up Google Ads account** — create campaigns, link landing pages
- [ ] **Create TikTok + Instagram accounts** — @avalimo
- [ ] **Connect booking form** to n8n lead webhook
- [ ] **Add Google Place ID** to review request workflow
- [ ] **Set up MailerLite/Brevo** — import email templates
- [ ] **Configure competitor tracker** with real competitor domains
- [ ] **Write 2 blog posts** using template — publish on `/blog/`

---

## Domain Setup

```
A  avalimo.net      → YOUR_COOLIFY_SERVER_IP
A  www.avalimo.net  → YOUR_COOLIFY_SERVER_IP
```

SSL auto-generated by Coolify (Let's Encrypt).

---

## Support

- **GitHub Actions:** https://docs.github.com/en/actions
- **Coolify:** https://coolify.io/docs
- **n8n:** https://docs.n8n.io
- **Google Ads:** https://ads.google.com
- **TikTok Creative Center:** https://ads.tiktok.com/business/creativecenter

---

*Built for AvaLimo Houston by Adam J | adam@avalimo.net | (832) 990-8258*
