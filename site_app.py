#!/usr/bin/env python3
import os
import sys
import uuid
import json
import smtplib
import threading
from email.mime.text import MIMEText
import datetime as _dt
import time
import re
import pickle
import base64
import urllib.request
from flask import Flask, request, jsonify, render_template_string, redirect

try:
    import requests as _req
except ImportError:
    _req = None

try:
    from square.client import Square, SquareEnvironment
except ImportError:
    Square = None

app = Flask(__name__)

_env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_env_path):
    with open(_env_path) as f:
        for _line in f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                k, _, v = _line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())

SQ_APP_ID = os.environ.get("SQUARE_APPLICATION_ID", "sandbox-sq0idb-fake")
SQ_LOCATION_ID = os.environ.get("SQUARE_LOCATION_ID", "Lfake")
SQ_TOKEN = os.environ.get("SQUARE_ACCESS_TOKEN", "")
SQ_ENV = os.environ.get("SQUARE_ENVIRONMENT", "sandbox")
AV_API_KEY = os.environ.get("AVIATIONSTACK_KEY", "")
GA_ID = os.environ.get("GA_ID", "G-STY7CSKRMX")
SC_ID = os.environ.get("SC_ID", "")
FB_PIXEL_ID = os.environ.get("FB_PIXEL_ID", "")
GOOGLE_SHEETS_URL = os.environ.get("GOOGLE_SHEETS_WEBHOOK_URL", "")

SC_META = f'<meta name="google-site-verification" content="{SC_ID}" />' if SC_ID else ""
FB_PIXEL = f'''<!-- Meta Pixel -->
<script>
!function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','{FB_PIXEL_ID}');fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id={FB_PIXEL_ID}&ev=PageView&noscript=1" /></noscript>''' if FB_PIXEL_ID else ""

_blog_path = os.path.join(os.path.dirname(__file__), "blog_posts.json")
BLOG_POSTS = json.load(open(_blog_path)) if os.path.exists(_blog_path) else []


def send_booking_email(data: dict):
    name = data.get("name", "?")
    phone = data.get("phone", "?")
    pickup = data.get("pickup", "?")
    dropoff = data.get("dropoff", "?")
    time = data.get("time", "?")
    vehicle = data.get("vehicle", "?")
    pax = data.get("pax", "1")
    notes = data.get("notes", "")
    service = data.get("service", "")
    flight = data.get("flight", "")
    email = data.get("email", "")

    lines = [f"New Booking from {name}"]
    lines.append(f"Phone: {phone}")
    if email:
        lines.append(f"Email: {email}")
    lines.append(f"Service: {service or 'Not specified'}")
    lines.append(f"Vehicle: {vehicle}")
    lines.append(f"Passengers: {pax}")
    lines.append(f"Pickup: {pickup}")
    lines.append(f"Dropoff: {dropoff}")
    lines.append(f"Time: {time}")
    if flight:
        lines.append(f"Flight: {flight}")
    if notes:
        lines.append(f"Notes: {notes}")

    body = "\n".join(lines)
    print("\n" + "=" * 50)
    print(body)
    print("=" * 50 + "\n")

    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    os.environ.setdefault(k.strip(), v.strip())

    smtp_user = os.environ.get("SMTP_USERNAME", "")
    smtp_pass = os.environ.get("SMTP_PASSWORD", "")
    email_to = os.environ.get("EMAIL_TO", "adam@avalimo.net")

    if not smtp_user or not smtp_pass:
        print("SMTP not configured — booking logged to stdout only")
        return

    try:
        msg = MIMEText(body)
        msg["From"] = smtp_user
        msg["To"] = email_to
        msg["Subject"] = f"New AvaLimo Booking — {name}"

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"Booking email sent to {email_to}")
    except Exception as e:
        print(f"Failed to send email: {e}")


def send_contact_email(data: dict):
    name = data.get("name", "?")
    email = data.get("email", "?")
    phone = data.get("phone", "?")
    subject = data.get("subject", "General Inquiry")
    message = data.get("message", "")

    body = f"Contact Inquiry from {name}\nEmail: {email}\nPhone: {phone}\nSubject: {subject}\n\nMessage:\n{message}"
    print("\n" + "=" * 50)
    print(body)
    print("=" * 50 + "\n")

    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    os.environ.setdefault(k.strip(), v.strip())

    smtp_user = os.environ.get("SMTP_USERNAME", "")
    smtp_pass = os.environ.get("SMTP_PASSWORD", "")
    email_to = os.environ.get("EMAIL_TO", "adam@avalimo.net")

    if not smtp_user or not smtp_pass:
        print("SMTP not configured — contact inquiry logged to stdout only")
        return

    try:
        msg = MIMEText(body)
        msg["From"] = smtp_user
        msg["To"] = email_to
        msg["Subject"] = f"AvaLimo Contact — {subject} from {name}"
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"Contact email sent to {email_to}")
    except Exception as e:
        print(f"Failed to send contact email: {e}")


def log_to_google_sheets(sheet_name: str, data: dict):
    url = GOOGLE_SHEETS_URL
    if not url:
        return
    try:
        payload = json.dumps({"sheet": sheet_name, "data": data})
        req = urllib.request.Request(
            url,
            data=payload.encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"Google Sheets ({sheet_name}) — status {resp.status}")
    except Exception as e:
        print(f"Google Sheets log failed ({sheet_name}): {e}")


# ── Read old index.html as Jinja2 template ──────────────────────────────
_INDEX_PATH = os.path.join(os.path.dirname(__file__), "index.html")
BASE_HTML = open(_INDEX_PATH, encoding="utf-8").read() if os.path.exists(_INDEX_PATH) else "<h1>Site under construction</h1>"


PAGE_META = {
    "": { "title": "AvaLimo — Houston Premier Limo Service | IAH & Hobby Airport Transfers", "desc": "Houston's most trusted chauffeur service. Airport transfers for IAH &amp; Hobby, corporate travel, weddings, events — 24/7 with zero surge pricing. Book online in 30 seconds.", "og_type": "website", "og_image": "https://avalimo.net/wp-content/uploads/2026/04/chauffeur_service.png" },
    "services": { "title": "Services — AvaLimo | Houston Limo & Chauffeur Service", "desc": "Airport transfers, corporate travel, wedding limo, event transportation & more. Houston's premium chauffeur service — 24/7.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
    "fleet": { "title": "Our Fleet — AvaLimo | Luxury Sedans, SUVs & Sprinter Vans", "desc": "Mercedes S-Class, Cadillac Escalade & Mercedes Sprinter. Houston's finest luxury fleet for any occasion.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
    "book": { "title": "Book a Ride — AvaLimo | Online Reservation", "desc": "Reserve your Houston luxury chauffeur service online in 30 seconds. Airport transfers, corporate & events — 24/7.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
    "blog": { "title": "Blog — AvaLimo | Houston Limo Service Insights & Tips", "desc": "Expert guides on Houston airport transfers, wedding limo tips, corporate travel, and luxury transportation. Daily articles from Houston's premier chauffeur service.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
    "flight-status": { "title": "Flight Status — AvaLimo | Real-Time Flight Tracker", "desc": "Track your flight in real-time. Free flight status tool for IAH, Hobby & all airlines.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
    "contact": { "title": "Contact — AvaLimo | Houston Limo Service", "desc": "Get in touch with AvaLimo. Call (832) 567-8050 or message us online. 24/7 dispatch.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
    "faq": { "title": "FAQ — AvaLimo | Frequently Asked Questions", "desc": "Answers to common questions about booking, pricing, cancellations & more.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
    "policy": { "title": "Policy — AvaLimo | Company Policy", "desc": "AvaLimo company policy: booking, cancellation, refund & privacy terms.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
    "deposit": { "title": "Pay Online — AvaLimo | Secure Payment Portal", "desc": "Pay your deposit or balance online. Secure Square payment portal for AvaLimo reservations.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
}


@app.route("/robots.txt")
def robots_txt():
        return "User-agent: *\nAllow: /\nSitemap: https://avalimo.net/sitemap.xml", 200, {"Content-Type": "text/plain"}

@app.route("/sitemap.xml")
def sitemap_xml():
        _today = _dt.date.today().isoformat()
        pages = ["", "services", "fleet", "book", "blog", "flight-status", "contact", "faq", "policy", "deposit"]
        blog_urls = "\n".join(f'<url><loc>https://avalimo.net/blog/{p["slug"]}</loc><lastmod>{_today}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>' for p in BLOG_POSTS if p.get("slug"))
        urls = "\n".join(f'<url><loc>https://avalimo.net/{p}</loc><lastmod>{_today}</lastmod><changefreq>{"daily" if p == "" else "weekly"}</changefreq><priority>{"1.0" if p == "" else "0.8"}</priority></url>' for p in pages)
        xml = f'''<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    {urls}
    {blog_urls}
    </urlset>'''
        return xml, 200, {"Content-Type": "application/xml"}


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    meta = None
    featured_post = None
    canonical_path = ""
    og_type = "website"
    og_image = "https://avalimo.net/wp-content/uploads/2026/04/chauffeur_service.png"
    content_key = path

    legacy_redirects = {
        "company-policy": "policy",
        "terms-and-conditions": "policy",
        "cancellation-policy": "policy",
        "book-your-ride": "book",
        "booking-confirmed": "book",
        "pay-deposit": "deposit",
        "houston-airport-limo-service": "",
        "houston-airport": "",
        "sugar-land-limo": "",
        "sugar-land": "",
        "the-woodlands-limo": "",
        "the-woodlands": "",
        "katy-limo": "",
        "katy": "",
        "missouri-city-limo": "",
        "missouri-city": "",
        "pearland-limo": "",
        "pearland": "",
        "galveston-limo": "",
        "galveston": "",
        "league-city-limo": "",
        "league-city": "",
        "baytown-limo": "",
        "baytown": "",
        "spring-limo": "",
        "spring": "",
        "cypress-limo": "",
        "cypress": "",
    }
    if path in legacy_redirects:
        target = legacy_redirects[path]
        return redirect(f"/{target}" if target else "/", 301)

    if path.startswith("blog/") and len(path) > 5:
        slug = path[5:]
        for p in BLOG_POSTS:
            if p.get("slug") == slug:
                meta = {"title": p["title"] + " — AvaLimo", "desc": p.get("summary", "")}
                canonical_path = f"/blog/{slug}"
                og_type = "article"
                og_image = f"https://avalimo.net{p.get('image', '/static/chauffeur_service.png')}"
                content_key = "blog"
                featured_post = p
                break
        if meta is None:
            content_key = "404"
    elif path in PAGE_META:
        meta = PAGE_META[path]
        canonical_path = f"/{path}" if path else ""
    else:
        content_key = "404"

    if meta is None:
        meta = {"title": "Page Not Found — AvaLimo", "desc": "Sorry, the page you requested could not be found."}
        canonical_path = ""
        og_type = "website"
        og_image = "https://avalimo.net/wp-content/uploads/2026/04/chauffeur_service.png"

    canonical_url = f"https://avalimo.net{canonical_path}"

    # Build blog posts HTML for injection
    blog_cards = ""
    for i, post in enumerate(BLOG_POSTS):
        delay_style = f' style="transition-delay:{post.get("delay", "0s")}"' if post.get("delay") and post.get("delay") != "0s" else ""
        blog_cards += f"""<div class="blog-card fade-up" data-slug="{post['slug']}"{delay_style}>
        <div class="thumb">{post.get('emoji', '&#128663;')}</div>
        <div class="body">
          <div class="cat">{post.get('cat', '')}</div>
          <h3>{post['title']}</h3>
          <p>{post.get('summary', '')[:150]}...</p>
          <a href="/blog/{post['slug']}" class="btn btn-outline" style="padding:8px 20px;font-size:12px">Read More</a>
          <div class="meta"><span>{post.get('date', '')}</span><span>&#8226; {post.get('read', '')}</span></div>
          <div class="article-content">{post.get('content', '')}</div>
        </div>
      </div>"""

    rendered = render_template_string(
        BASE_HTML,
        title=meta["title"],
        meta_desc=meta["desc"],
        canonical_url=canonical_url,
        og_type=og_type,
        og_image=og_image,
        ga_id=GA_ID,
        sc_meta=SC_META,
        fb_pixel=FB_PIXEL,
        sq_app_id=SQ_APP_ID,
        sq_location_id=SQ_LOCATION_ID,
        blog_posts_html=blog_cards,
        featured_post=featured_post,
    )
    status_code = 404 if content_key == "404" else 200
    resp = app.make_response((rendered, status_code))
    resp.headers["Cache-Control"] = "no-cache, no-store, must-revalidate, max-age=0"
    resp.headers["Pragma"] = "no-cache"
    resp.headers["Expires"] = "0"
    resp.headers["X-Version"] = "v2.0-video-gloss"
    return resp


def _fire_n8n_reminder(data):
    url = os.environ.get("N8N_BOOKING_WEBHOOK", "")
    if not url:
        return
    try:
        payload = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"n8n reminder webhook — status {resp.status}")
    except Exception as e:
        print(f"n8n reminder webhook failed: {e}")


def _fire_n8n_review(data):
    url = os.environ.get("N8N_REVIEW_WEBHOOK", "")
    if not url:
        return
    try:
        payload = json.dumps(data).encode("utf-8")
        req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            print(f"n8n review webhook — status {resp.status}")
    except Exception as e:
        print(f"n8n review webhook failed: {e}")


@app.route("/api/book", methods=["POST"])
def book_ride():
    data = request.get_json() or {}
    send_booking_email(data)
    log_to_google_sheets("Bookings", data)
    threading.Thread(target=_fire_n8n_reminder, args=(data,), daemon=True).start()
    threading.Thread(target=_fire_n8n_review, args=(data,), daemon=True).start()
    return jsonify({"status": "ok", "message": "Booking received! We'll confirm your ride shortly."})


@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json() or {}
    send_contact_email(data)
    log_to_google_sheets("Contacts", data)
    return jsonify({"status": "ok", "message": "Message sent! We'll get back to you shortly."})


@app.route("/api/flight")
def flight_track():
    q = request.args.get("q", "").upper().strip().replace(" ", "")
    if not q:
        return jsonify({"status": "error", "message": "No flight number provided"}), 400

    if AV_API_KEY:
        try:
            import requests as req
            resp = req.get("https://api.aviationstack.com/v1/flights", params={
                "access_key": AV_API_KEY, "flight_iata": q
            }, timeout=10)
            data = resp.json()
            if data.get("data"):
                f = data["data"][0]
                dep = f.get("departure", {})
                arr = f.get("arrival", {})
                status = f.get("flight_status", "unknown")
                gate = arr.get("gate") or dep.get("gate") or "—"
                term = arr.get("terminal") or dep.get("terminal") or "—"
                d_iata = dep.get("iata") or "?"
                a_iata = arr.get("iata") or "?"
                now = dep.get("estimated") or dep.get("scheduled") or ""
                if now and "T" in now:
                    now = now.split("T")[1][:5]
                est = arr.get("estimated") or arr.get("scheduled") or ""
                if est and "T" in est:
                    est = est.split("T")[1][:5]
                sched = dep.get("scheduled") or ""
                if sched and "T" in sched:
                    sched = sched.split("T")[1][:5]
                return jsonify({
                    "flight": q, "airline": f.get("airline", {}).get("name", "?"),
                    "route": f"{d_iata} → {a_iata}",
                    "sched": sched, "est": est,
                    "status": status,
                    "gate": gate, "term": term
                })
            else:
                return jsonify({"status": "error", "message": f"No data for flight {q}"}), 404
        except Exception as e:
            return jsonify({"status": "error", "message": f"API error: {e}"}), 502
    else:
        return jsonify({"status": "error", "message": "Flight tracking API key not configured. Add AVIATIONSTACK_KEY to your .env"}), 503


@app.route("/api/deposit", methods=["POST"])
def process_deposit():
    data = request.get_json() or {}
    amount = data.get("amount", "0")
    email = data.get("email", "")
    name = data.get("name", "")

    print(f"\n{'='*50}")
    print(f"Deposit request: ${amount} from {name} ({email})")
    print(f"{'='*50}\n")

    return jsonify({
        "status": "ok",
        "message": f"Deposit of ${amount} received! Your booking is secured.",
        "amount": amount,
    })


@app.route("/api/square-pay", methods=["POST"])
def square_pay():
    data = request.get_json() or {}
    source_id = data.get("source_id", "")
    amount_cents = data.get("amount", 0)
    name = data.get("name", "")
    email = data.get("email", "")

    if not source_id:
        return jsonify({"status": "error", "message": "Missing payment source."}), 400
    if not amount_cents or amount_cents < 50:
        return jsonify({"status": "error", "message": "Minimum deposit is $0.50."}), 400

    print(f"\n{'='*50}")
    print(f"Square payment request: ${amount_cents/100:.2f} from {name} ({email})")

    if not Square or not SQ_TOKEN:
        print("Square SDK not configured — payment simulated")
        print(f"{'='*50}\n")
        return jsonify({
            "status": "ok",
            "message": "Payment authorized (demo mode). Set SQUARE_ACCESS_TOKEN in .env for live payments.",
            "payment_id": "sim_" + uuid.uuid4().hex[:12],
        })

    try:
        env = SquareEnvironment.SANDBOX if SQ_ENV == "sandbox" else SquareEnvironment.PRODUCTION
        client = Square(token=SQ_TOKEN, environment=env)
        result = client.payments.create(
            source_id=source_id,
            idempotency_key=uuid.uuid4().hex,
            amount_money={"amount": amount_cents, "currency": "USD"},
            buyer_email_address=email or None,
            note=f"AvaLimo deposit from {name}",
            reference_id="deposit",
        )

        if result.is_success():
            pid = result.body["payment"]["id"]
            status = result.body["payment"]["status"]
            print(f"  Payment {pid} — {status}")
            print(f"{'='*50}\n")
            return jsonify({"status": "ok", "message": f"Payment {status}. ID: {pid}", "payment_id": pid})
        else:
            errs = result.errors or []
            detail = errs[0]["detail"] if errs else "Payment declined"
            print(f"  Payment failed: {detail}")
            print(f"{'='*50}\n")
            return jsonify({"status": "error", "message": detail}), 402

    except Exception as e:
        print(f"  Square error: {e}")
        print(f"{'='*50}\n")
        return jsonify({"status": "error", "message": str(e)}), 500


# ── Calendar Reminder Scheduler ────────────────────────────────────────

_NOTIFIED_EVENTS: set = set()


def _ensure_google_files():
    for var, name in [("GOOGLE_CREDENTIALS_B64", "credentials.json"),
                      ("GOOGLE_TOKEN_B64", "token.json")]:
        val = os.environ.get(var)
        if val:
            path = os.path.join(os.path.dirname(__file__), name)
            if not os.path.exists(path):
                with open(path, "wb") as f:
                    f.write(base64.b64decode(val))


def _send_textbelt_sms(phone: str, message: str):
    key = os.environ.get("TEXTBELT_KEY", "textbelt")
    payload = json.dumps({"phone": phone, "message": message, "key": key}).encode()
    try:
        req = urllib.request.Request(
            "https://textbelt.com/text",
            data=payload,
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
        if result.get("success"):
            print(f"SMS sent to {phone} (quota: {result.get('quotaRemaining', '?')})", file=sys.stderr, flush=True)
        else:
            print(f"SMS failed to {phone}: {result.get('error', 'unknown')}", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"SMS error for {phone}: {e}", file=sys.stderr, flush=True)


def _check_calendar_reminders():
    try:
        from google.auth.transport.requests import Request as GAuthReq
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
    except ImportError:
        print("Google API libs not installed — calendar reminders disabled", file=sys.stderr, flush=True)
        return

    creds_file = os.path.join(os.path.dirname(__file__), "credentials.json")
    token_file = os.path.join(os.path.dirname(__file__), "token.json")
    if not os.path.exists(creds_file):
        print("credentials.json not found — calendar reminders disabled", file=sys.stderr, flush=True)
        return

    creds = None
    if os.path.exists(token_file):
        with open(token_file, "rb") as f:
            creds = pickle.load(f)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(GAuthReq())
            except Exception as e:
                print(f"Calendar token refresh failed: {e}", file=sys.stderr, flush=True)
                return
        else:
            print("Calendar not authenticated — run locally to re-auth", file=sys.stderr, flush=True)
            return
        with open(token_file, "wb") as f:
            pickle.dump(creds, f)

    try:
        service = build("calendar", "v3", credentials=creds)
    except Exception as e:
        print(f"Calendar build failed: {e}", file=sys.stderr, flush=True)
        return

    now = _dt.datetime.now(_dt.timezone.utc)
    tomorrow_start = (now + _dt.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_end = tomorrow_start + _dt.timedelta(days=1)

    try:
        events = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=tomorrow_start.isoformat(),
                timeMax=tomorrow_end.isoformat(),
                singleEvents=True,
                orderBy="startTime",
            )
            .execute()
        )
    except Exception as e:
        print(f"Calendar fetch failed: {e}", file=sys.stderr, flush=True)
        return

    for ev in events.get("items", []):
        eid = ev.get("id", "")
        if eid in _NOTIFIED_EVENTS:
            continue
        summary = (ev.get("summary") or "").strip()
        description = (ev.get("description") or "")
        start = ev.get("start", {})

        phone = ""
        phone_match = re.search(r"(?:Phone|phone|PHONE)\s*[:=]\s*([+\d\s\-()]+)", description)
        if phone_match:
            phone = phone_match.group(1).strip()
            phone = "+" + re.sub(r"[^\d]", "", phone[1:]) if phone.startswith("+") else re.sub(r"[^\d]", "", phone)
            if phone and len(phone) < 10:
                phone = ""

        if not phone:
            print(f"Skipping '{summary}' — no phone number in description", file=sys.stderr, flush=True)
            continue

        pickup_str = ""
        if "dateTime" in start:
            dt = _dt.datetime.fromisoformat(start["dateTime"].replace("Z", "+00:00"))
            pickup_str = dt.strftime("%I:%M %p")

        pickup_loc = ""
        loc_match = re.search(r"(?:Pickup|pickup|PICKUP)\s*(?::|=)\s*(.+)", description)
        if loc_match:
            pickup_loc = loc_match.group(1).strip()
        if not pickup_loc:
            pickup_loc = ev.get("location", "")

        msg = (
            f"Hi {summary}, this is AvaLimo confirming your "
            f"{'pickup at ' + pickup_loc + ' ' if pickup_loc else ''}"
            f"tomorrow at {pickup_str}. "
            f"Reply or call (832) 567-8050 for changes."
        )
        _send_textbelt_sms(phone, msg)
        _NOTIFIED_EVENTS.add(eid)
        print(f"Reminder SMS sent for '{summary}' to {phone}", file=sys.stderr, flush=True)


def _reminder_loop():
    while True:
        try:
            _check_calendar_reminders()
        except Exception as e:
            print(f"Reminder check error: {e}", file=sys.stderr, flush=True)
        time.sleep(3600)


_ensure_google_files()
threading.Thread(target=_reminder_loop, daemon=True).start()
print("Calendar reminder scheduler started", file=sys.stderr, flush=True)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5002
    print(f"AvaLimo site running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)