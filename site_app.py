#!/usr/bin/env python3
import os
import sys
import uuid
import json
import smtplib
from email.mime.text import MIMEText
from flask import Flask, request, jsonify, render_template_string, redirect

try:
    from square.client import Square, SquareEnvironment
except ImportError:
    Square = None

app = Flask(__name__)

# load .env for all configs
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

SC_META = f'<meta name="google-site-verification" content="{SC_ID}" />' if SC_ID else ""
FB_PIXEL = f'''<!-- Meta Pixel -->
<script>
!function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','{FB_PIXEL_ID}');fbq('track','PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id={FB_PIXEL_ID}&ev=PageView&noscript=1" /></noscript>''' if FB_PIXEL_ID else ""


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

    # load .env for SMTP creds
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


_blog_path = os.path.join(os.path.dirname(__file__), "blog_posts.json")
def _get_blog_posts():
    if os.path.exists(_blog_path):
        try:
            with open(_blog_path) as f:
                return json.load(f)
        except Exception:
            return []
    return []
BLOG_POSTS = _get_blog_posts()

HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ title }}</title>
<meta name="description" content="{{ meta_desc }}">

<meta name="robots" content="index, follow">
<meta name="geo.region" content="US-TX">
<meta name="geo.placename" content="Houston">
<meta name="theme-color" content="#0a0a0a">
<link rel="canonical" href="{{ canonical_url }}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="{{ title }}">
<meta property="og:description" content="{{ meta_desc }}">
<meta property="og:url" content="{{ canonical_url }}">
<meta property="og:type" content="{{ og_type }}">
<meta property="og:image" content="{{ og_image }}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{ title }}">
<meta name="twitter:description" content="{{ meta_desc }}">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "AvaLimo",
  "image": "https://avalimo.net/wp-content/uploads/2026/04/chauffeur_service.png",
  "url": "https://avalimo.net",
  "telephone": "+18325678050",
  "email": "adam@avalimo.net",
  "description": "Houston premier limo service offering airport transfers, corporate travel, weddings, and event transportation.",
  "areaServed": ["Houston","IAH","Hobby Airport","Sugar Land","The Woodlands","Katy","Pearland"],
  "openingHours": "Mo-Su 00:00-24:00",
  "priceRange": "$$$",
  "address": { "@type": "PostalAddress", "addressLocality": "Houston", "addressRegion": "TX", "addressCountry": "US" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "500", "bestRating": "5" },
  "sameAs": ["https://www.linkedin.com/in/adam-aljahdhami-550586218/"]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AvaLimo",
  "url": "https://avalimo.net",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://avalimo.net/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
<script src="https://web.squarecdn.com/v1/square.js" defer></script>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0b;
  --bg2:#141416;
  --bg3:#1a1a1d;
  --card:#1a1a1d;
  --gold:#c9a463;
  --gold-light:#e6c88a;
  --gold-dark:#8c744a;
  --text:#f2f1ec;
  --text2:#9a9a9f;
  --text3:#6c6c72;
  --radius:6px;
  --radius-sm:2px;
  --shadow:0 4px 30px rgba(0,0,0,0.5);
  --maxw:1180px;
  --hairline:rgba(255,255,255,0.08);
  --hairline-strong:rgba(255,255,255,0.14);
}
/* Square card theming */
#square-card iframe{color-scheme:dark}
#square-card{--sq-color-input:#f0f0f0;--sq-color-placeholder:#666;--sq-color-focused:#c9a463;--sq-color-error:#ff6b6b}
html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
a{color:var(--gold);text-decoration:none;transition:color .3s}
a:hover{color:var(--gold-light)}
img{max-width:100%;height:auto}
.container{max-width:var(--maxw);margin:0 auto;padding:0 24px}
.gold{color:var(--gold)}

/* ─── Nav ─── */
nav{position:fixed;top:0;left:0;right:0;z-index:1000;display:flex;align-items:center;justify-content:space-between;padding:26px 32px;max-width:var(--maxw);margin:0 auto;transition:all .4s}
.nav-logo{font-family:'Fraunces',serif;font-weight:500;font-size:22px;letter-spacing:.5px;color:var(--text);text-decoration:none}
.nav-logo span{color:var(--gold)}
.nav-links{display:flex;gap:36px;list-style:none}
.nav-links a{color:var(--text2);text-decoration:none;font-size:13.5px;letter-spacing:.3px;transition:color .25s;padding:4px 0}
.nav-links a:hover,.nav-links a.active{color:var(--text)}
.nav-cta{display:flex;align-items:center;gap:22px}
.nav-cta .phone{color:var(--text2);font-size:13.5px}
.nav-cta .phone b{color:var(--text);font-weight:500}
.btn{display:inline-flex;align-items:center;gap:8px;padding:11px 22px;border-radius:2px;font-weight:600;font-size:13px;border:none;cursor:pointer;transition:all .3s;font-family:inherit;letter-spacing:.3px;text-decoration:none}
.btn-gold{background:linear-gradient(180deg,var(--gold-light),var(--gold) 60%,var(--gold-dark));color:#1a1408;box-shadow:0 1px 0 rgba(255,255,255,.4) inset,0 8px 20px -8px rgba(201,164,99,.5)}
.btn-gold:hover{transform:translateY(-2px)}
.btn-outline{border:1px solid var(--hairline-strong);color:var(--text);background:rgba(255,255,255,.02);border-radius:2px;padding:15px 28px;font-size:13.5px}
.btn-outline:hover{border-color:var(--gold);background:rgba(201,164,99,.06)}

.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:5px;background:none;border:none}
.hamburger span{width:24px;height:2px;background:var(--text);border-radius:2px;transition:all .3s}

/* ─── Hero ─── */
.hero{position:relative;overflow:hidden;padding:64px 32px 110px;background:radial-gradient(ellipse 900px 500px at 82% -10%,rgba(201,164,99,.10) 0%,transparent 60%),radial-gradient(ellipse 700px 400px at 10% 110%,rgba(255,255,255,.05) 0%,transparent 60%),linear-gradient(180deg,#0d0d0f 0%,#0a0a0b 55%,#08080a 100%)}
.hero::before{content:'';position:absolute;inset:0;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.035) 48%,transparent 56%);pointer-events:none}
.hero-inner{position:relative;max-width:var(--maxw);margin:0 auto;padding-top:40px}
.eyebrow{display:inline-flex;align-items:center;gap:10px;color:var(--gold);font-size:12px;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:26px}
.eyebrow::before{content:'';width:28px;height:1px;background:var(--gold-dark)}
.hero h1{font-family:'Fraunces',serif;font-weight:500;font-size:clamp(42px,6vw,74px);line-height:1.02;letter-spacing:-.5px;max-width:780px;color:var(--text)}
.hero h1 em{font-style:italic;font-weight:400;color:var(--gold-light)}
.hero-sub{max-width:520px;margin-top:26px;color:var(--text2);font-size:16.5px;line-height:1.65}
.hero-actions{display:flex;gap:16px;margin-top:42px}
.btn-primary{background:linear-gradient(180deg,var(--gold-light),var(--gold) 55%,var(--gold-dark));color:#1a1408;font-weight:600;padding:15px 28px;border-radius:2px;text-decoration:none;font-size:13.5px;letter-spacing:.3px;box-shadow:0 10px 30px -10px rgba(201,164,99,.55);display:inline-flex;align-items:center;gap:8px;transition:all .3s}
.btn-primary:hover{transform:translateY(-2px)}

/* ─── Stats Strip ─── */
.stat-strip{display:grid;grid-template-columns:repeat(4,1fr);margin-top:88px;border-top:1px solid var(--hairline)}
.stat{padding:26px 0 0;border-right:1px solid var(--hairline)}
.stat:last-child{border-right:none}
.stat-num{font-family:'Fraunces',serif;font-size:34px;color:var(--gold-light);font-weight:500}
.stat-label{color:var(--text3);font-size:12px;letter-spacing:.5px;text-transform:uppercase;margin-top:6px}

/* ─── Sections ─── */
.section{padding:100px 0}
.section-header{max-width:640px;margin-bottom:64px;text-align:center;margin-left:auto;margin-right:auto}
.section-eyebrow{color:var(--gold);font-size:12px;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:16px}
.section-header .subtitle{color:var(--gold);font-size:12px;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:16px}
.section-header h2{font-family:'Fraunces',serif;font-weight:500;font-size:clamp(30px,3.6vw,42px);color:var(--text);letter-spacing:-.3px}
.section-header p{color:var(--text2);margin-top:16px;font-size:15.5px;line-height:1.6;max-width:520px;margin-left:auto;margin-right:auto}

/* ─── Fleet ─── */
.fleet-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.car-card{position:relative;background:linear-gradient(165deg,var(--bg3) 0%,var(--card) 45%,#101012 100%);border:1px solid var(--hairline);border-radius:6px;overflow:hidden;transition:border-color .35s,transform .35s}
.car-card:hover{border-color:var(--hairline-strong);transform:translateY(-4px)}
.car-media{position:relative;height:230px;background:radial-gradient(ellipse 140% 90% at 50% 100%,rgba(0,0,0,.65),transparent 60%),#0d0d0e;display:flex;align-items:center;justify-content:center;overflow:hidden}
.car-media img{width:100%;height:100%;object-fit:cover;object-position:center;filter:contrast(1.08) saturate(1.05) brightness(0.96);transition:transform .6s ease}
.car-card:hover .car-media img{transform:scale(1.06)}
.gloss-sweep{position:absolute;inset:0;pointer-events:none;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.16) 46%,rgba(255,255,255,.02) 52%,transparent 66%);transform:translateX(-120%);transition:transform .9s cubic-bezier(.2,.7,.2,1)}
.car-card:hover .gloss-sweep{transform:translateX(20%)}
.car-badge{position:absolute;top:16px;left:16px;z-index:2;background:rgba(10,10,11,.72);backdrop-filter:blur(6px);border:1px solid var(--hairline-strong);color:var(--gold-light);font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:6px 12px;border-radius:2px}
.car-body{padding:26px}
.car-body h3{font-family:'Fraunces',serif;font-size:22px;font-weight:500;color:var(--text)}
.car-meta{color:var(--gold);font-size:12.5px;letter-spacing:.3px;margin-top:6px}
.car-desc{color:var(--text2);font-size:14px;line-height:1.6;margin-top:14px}
.car-foot{display:flex;align-items:center;justify-content:space-between;margin-top:22px;padding-top:20px;border-top:1px solid var(--hairline)}
.car-link{color:var(--gold-light);font-size:13px;text-decoration:none;letter-spacing:.3px}
.car-link:after{content:' →'}

/* ─── Services ─── */
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.service-card{background:linear-gradient(165deg,var(--bg3) 0%,var(--card) 45%,#101012 100%);border-radius:6px;padding:36px 28px;border:1px solid var(--hairline);transition:all .35s;text-align:center}
.service-card:hover{transform:translateY(-4px);border-color:var(--hairline-strong)}
.service-card .icon{width:64px;height:64px;border-radius:2px;background:rgba(201,164,99,.1);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px;border:1px solid var(--hairline)}
.service-card h3{font-family:'Fraunces',serif;font-size:20px;font-weight:500;margin-bottom:10px;color:var(--text)}
.service-card p{color:var(--text2);font-size:14px;line-height:1.7}

/* ─── Testimonials ─── */
.test-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.test-card{background:linear-gradient(165deg,var(--bg3) 0%,var(--card) 45%,#101012 100%);border-radius:6px;padding:32px;border:1px solid var(--hairline);transition:border-color .35s}
.test-card:hover{border-color:var(--hairline-strong)}
.test-card .stars{color:var(--gold);font-size:16px;margin-bottom:16px;letter-spacing:2px}
.test-card p{color:var(--text2);font-size:15px;line-height:1.7;margin-bottom:20px;font-style:italic}
.test-card .author{display:flex;align-items:center;gap:12px}
.test-card .author .avatar{width:44px;height:44px;border-radius:2px;background:linear-gradient(180deg,var(--gold-light),var(--gold) 55%,var(--gold-dark));display:flex;align-items:center;justify-content:center;font-weight:600;font-size:16px;color:#1a1408}
.test-card .author .name{font-weight:500;font-size:14px;color:var(--text)}
.test-card .author .title{color:var(--text3);font-size:12px}

/* ─── Booking ─── */
.booking-section{background:var(--bg2);position:relative;overflow:hidden;border-top:1px solid var(--hairline);border-bottom:1px solid var(--hairline)}
.booking-section::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(201,164,99,.06) 0%,transparent 60%)}
.booking-wrap{max-width:700px;margin:0 auto;position:relative;z-index:1}
.booking-form{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.booking-form .full{grid-column:1/-1}
.booking-form label{display:block;font-size:13px;font-weight:500;color:var(--text2);margin-bottom:6px;letter-spacing:.3px}
.booking-form input,.booking-form select,.booking-form textarea{width:100%;padding:14px 18px;border-radius:2px;border:1px solid var(--hairline);background:rgba(255,255,255,.03);color:var(--text);font-size:14px;font-family:inherit;transition:all .3s;outline:none}
.booking-form input:focus,.booking-form select:focus,.booking-form textarea:focus{border-color:var(--gold)}
.booking-form textarea{resize:vertical;min-height:80px}
.booking-form select option{background:var(--bg);color:var(--text)}

/* ─── Contact ─── */
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
.contact-info h3{font-size:28px;font-weight:500;font-family:'Fraunces',serif;margin-bottom:16px}
.contact-info p{color:var(--text2);margin-bottom:32px;max-width:400px}
.contact-item{display:flex;align-items:center;gap:16px;margin-bottom:20px}
.contact-item .ci-icon{width:48px;height:48px;border-radius:2px;background:rgba(201,164,99,.1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid var(--hairline)}
.contact-item .ci-text{font-weight:500;color:var(--text)}
.contact-item .ci-sub{color:var(--text2);font-size:13px}


/* ─── FAQ ─── */
.faq-list{max-width:800px;margin:0 auto}
.faq-item{border-bottom:1px solid rgba(255,255,255,.06);padding:0}
.faq-q{padding:24px 0;display:flex;justify-content:space-between;align-items:center;cursor:pointer;font-weight:500;font-size:16px;transition:color .3s;gap:24px;color:var(--text)}
.faq-q:hover{color:var(--gold)}
.faq-q .arrow{font-size:12px;transition:transform .3s;flex-shrink:0}
.faq-item.open .faq-q .arrow{transform:rotate(180deg)}
.faq-a{padding:0 0 24px;color:var(--text2);font-size:15px;line-height:1.8;display:none}
.faq-item.open .faq-a{display:block}

/* ─── Footer ─── */
footer{background:var(--bg2);border-top:1px solid var(--hairline);padding:60px 0 30px}
.footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px}
footer h4{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text);margin-bottom:20px}
footer p{color:var(--text2);font-size:14px;line-height:1.8}
footer ul{list-style:none}
footer ul li{margin-bottom:10px}
footer ul li a{color:var(--text2);font-size:14px;transition:color .3s}
footer ul li a:hover{color:var(--gold)}
.footer-bottom{padding-top:24px;border-top:1px solid var(--hairline);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
.footer-bottom p{color:var(--text3);font-size:13px}
.footer-bottom .areas{color:var(--text3);font-size:12px;text-align:right;max-width:400px}

/* ─── Page Header ─── */
.page-header{padding:140px 0 50px;text-align:center;position:relative;background:radial-gradient(ellipse 900px 300px at 50% 0%,rgba(201,164,99,.06) 0%,transparent 60%)}
.page-header h1,.page-header h2{font-family:'Fraunces',serif;font-size:clamp(32px,3.6vw,44px);font-weight:500;letter-spacing:-.5px;position:relative;z-index:1;color:var(--text)}
.page-header p{color:var(--text2);max-width:500px;margin:12px auto 0;position:relative;z-index:1;font-size:15px}

/* ─── Animations ─── */
.fade-up{opacity:0;transform:translateY(30px);transition:all .7s cubic-bezier(.22,1,.36,1)}
.fade-up.visible{opacity:1;transform:translateY(0)}
.fade-in{opacity:0;transition:opacity .8s}
.fade-in.visible{opacity:1}

/* ─── Blog ─── */
.blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.blog-card{background:var(--card);border-radius:var(--radius);overflow:hidden;border:1px solid rgba(255,255,255,.04);transition:all .4s}
.blog-card:hover{transform:translateY(-6px);border-color:rgba(212,175,55,.15);box-shadow:0 20px 60px rgba(0,0,0,.3)}
.blog-card .thumb{height:200px;background:linear-gradient(135deg,rgba(212,175,55,.08),rgba(212,175,55,.02));display:flex;align-items:center;justify-content:center;font-size:42px}
.blog-card .body{padding:24px}
.blog-card .body .cat{color:var(--gold);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
.blog-card .body h3{font-size:18px;font-weight:700;margin-bottom:8px;line-height:1.4}
.blog-card .body p{color:var(--text2);font-size:13px;line-height:1.7;margin-bottom:16px}
.blog-card .body .meta{color:var(--text3);font-size:12px;display:flex;gap:16px}
.blog-card .body .article-content{display:none;padding-top:16px;border-top:1px solid rgba(255,255,255,.06);margin-top:16px}
.blog-card .body .article-content.open{display:block}
.blog-card .body .article-content p{color:var(--text);font-size:14px;line-height:1.8;margin-bottom:16px}
.blog-card .body .article-content ul{color:var(--text2);font-size:14px;line-height:1.8;padding-left:20px;margin-bottom:16px}
.blog-card .body .article-content li{margin-bottom:8px}

/* ─── Flight Status ─── */
.flight-card{background:var(--card);border-radius:var(--radius);border:1px solid rgba(255,255,255,.04);padding:40px;max-width:600px;margin:0 auto}
.flight-card .input-group{display:flex;gap:12px;margin-bottom:24px}
.flight-card .input-group input{flex:1;padding:16px 20px;border-radius:var(--radius-sm);border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:var(--text);font-size:16px;font-family:inherit;outline:none;transition:border-color .3s}
.flight-card .input-group input:focus{border-color:var(--gold)}
.flight-card .input-group input::placeholder{color:var(--text3)}
.flight-result{display:none}
.flight-result.visible{display:block}
.flight-result .fr-row{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.04)}
.flight-result .fr-row:last-child{border:none}
.flight-result .fr-label{color:var(--text2);font-size:14px}
.flight-result .fr-value{font-weight:600;font-size:14px;text-align:right}
.flight-result .status-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 14px;border-radius:50px;font-size:12px;font-weight:600}
.status-badge.on-time{background:rgba(76,175,80,.15);color:#4CAF50}
.status-badge.delayed{background:rgba(255,152,0,.15);color:#FF9800}
.status-badge.landed{background:rgba(33,150,243,.15);color:#2196F3}
.flight-result .fr-map{height:200px;border-radius:var(--radius-sm);margin-top:20px;background:linear-gradient(135deg,rgba(212,175,55,.05),rgba(212,175,55,.01));display:flex;align-items:center;justify-content:center;color:var(--text3);font-size:14px;overflow:hidden;position:relative}
.flight-result .fr-map svg{width:100%;height:100%}

/* ─── Deposit ─── */
.deposit-wrap{max-width:520px;margin:0 auto}
.deposit-card{background:var(--card);border-radius:var(--radius);border:1px solid rgba(255,255,255,.04);padding:40px}
.deposit-card .amount-display{text-align:center;padding:32px;margin-bottom:24px;background:rgba(212,175,55,.05);border-radius:var(--radius-sm);border:1px solid rgba(212,175,55,.1)}
.deposit-card .amount-display .currency{font-size:14px;color:var(--text2);font-weight:500}
.deposit-card .amount-display .number{font-size:48px;font-weight:900;color:var(--gold);letter-spacing:-2px}
.deposit-card .amount-display .number input{font-size:48px;font-weight:900;color:var(--gold);background:transparent;border:none;outline:none;width:180px;text-align:center;font-family:inherit}
.deposit-card .amount-presets{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
.deposit-card .amount-presets button{padding:12px;border-radius:var(--radius-sm);border:1px solid rgba(255,255,255,.08);background:transparent;color:var(--text);font-size:14px;font-weight:600;cursor:pointer;transition:all .3s;font-family:inherit}
.deposit-card .amount-presets button:hover,.deposit-card .amount-presets button.active{background:rgba(212,175,55,.1);border-color:var(--gold);color:var(--gold)}
.deposit-card .pay-fields label{display:block;font-size:13px;font-weight:600;color:var(--text2);margin-bottom:6px;letter-spacing:.3px}
.deposit-card .pay-fields input{width:100%;padding:14px 18px;border-radius:var(--radius-sm);border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:var(--text);font-size:14px;font-family:inherit;outline:none;transition:all .3s;margin-bottom:16px}
.deposit-card .pay-fields input:focus{border-color:var(--gold)}
.deposit-card .pay-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* ─── Chat Widget ─── */
.chat-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));border:none;cursor:pointer;z-index:9999;box-shadow:0 4px 24px rgba(212,175,55,.4);display:flex;align-items:center;justify-content:center;font-size:26px;transition:all .3s}
.chat-btn:hover{transform:scale(1.1);box-shadow:0 8px 36px rgba(212,175,55,.5)}
.chat-btn .pulse{position:absolute;inset:0;border-radius:50%;border:2px solid var(--gold);animation:chatPulse 2s infinite}
@keyframes chatPulse{0%{transform:scale(1);opacity:1}100%{transform:scale(1.5);opacity:0}}
.chat-widget{position:fixed;bottom:100px;right:24px;width:360px;max-height:520px;background:var(--card);border-radius:var(--radius);border:1px solid rgba(212,175,55,.15);box-shadow:0 20px 60px rgba(0,0,0,.6);z-index:9998;display:none;flex-direction:column;overflow:hidden;backdrop-filter:blur(20px)}
.chat-widget.open{display:flex}
.chat-header{padding:18px 20px;background:linear-gradient(135deg,rgba(212,175,55,.08),rgba(212,175,55,.02));border-bottom:1px solid rgba(255,255,255,.04);display:flex;align-items:center;gap:12px}
.chat-header .avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;font-size:16px}
.chat-header .info{flex:1}
.chat-header .info .name{font-weight:600;font-size:14px}
.chat-header .info .status{color:#4CAF50;font-size:11px;display:flex;align-items:center;gap:4px}
.chat-header .info .status::before{content:'';width:6px;height:6px;border-radius:50%;background:#4CAF50}
.chat-header .close-btn{background:none;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:4px}
.chat-messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:10px;min-height:280px;max-height:320px}
.chat-msg{max-width:85%;padding:12px 16px;border-radius:14px;font-size:14px;line-height:1.5;animation:msgIn .3s ease}
@keyframes msgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.chat-msg.bot{align-self:flex-start;background:rgba(255,255,255,.06);border-bottom-left-radius:4px}
.chat-msg.user{align-self:flex-end;background:linear-gradient(135deg,var(--gold),var(--gold-dark));color:#111;font-weight:500;border-bottom-right-radius:4px}
.chat-input-wrap{display:flex;gap:8px;padding:12px 16px;border-top:1px solid rgba(255,255,255,.04)}
.chat-input-wrap input{flex:1;padding:10px 16px;border-radius:50px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:var(--text);font-size:14px;font-family:inherit;outline:none}
.chat-input-wrap input:focus{border-color:var(--gold)}
.chat-input-wrap button{width:40px;height:40px;border-radius:50%;background:var(--gold);border:none;color:#111;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s;flex-shrink:0}
.chat-input-wrap button:hover{transform:scale(1.1)}

/* Mobile responsive */
@media(max-width:900px){
  .nav-links{display:none;position:fixed;top:0;right:0;bottom:0;width:280px;background:rgba(10,10,11,.98);flex-direction:column;padding:80px 40px;gap:24px;z-index:999;box-shadow:-10px 0 40px rgba(0,0,0,.5)}
  .nav-links.open{display:flex}
  .nav-links a{font-size:18px;color:var(--text)}
  .hamburger{display:flex;z-index:1000}
  .hamburger.active span:nth-child(1){transform:translateY(7px) rotate(45deg)}
  .hamburger.active span:nth-child(2){opacity:0}
  .hamburger.active span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
  .nav-cta .phone{display:none}
  .stat-strip{grid-template-columns:repeat(2,1fr)}
  .stat:nth-child(2){border-right:none}
  .fleet-grid,.services-grid,.test-grid{grid-template-columns:1fr}
  .contact-grid{grid-template-columns:1fr;gap:40px}
  .footer-grid{grid-template-columns:1fr 1fr;gap:32px}
  .booking-form{grid-template-columns:1fr}
  .blog-grid{grid-template-columns:1fr}
  .deposit-card .amount-presets{grid-template-columns:repeat(2,1fr)}
  .deposit-card .pay-row{grid-template-columns:1fr}
  .chat-widget{width:calc(100vw - 32px);right:16px;bottom:90px;max-height:70vh}
  .flight-card .input-group{flex-direction:column}
}
@media(max-width:600px){
  .hero{padding:40px 24px 80px}
  .hero h1{font-size:clamp(28px,10vw,36px)}
  .hero-sub{font-size:15px}
  .hero-actions{gap:12px}
  .hero-actions .btn-primary,.hero-actions .btn-outline{padding:12px 22px;font-size:12.5px}
  .section{padding:60px 0}
  .section-header h2{font-size:clamp(24px,7vw,28px)}
  .section-header p{font-size:14px}
  .stat-strip{margin-top:48px}
  .stat-num{font-size:26px}
  .stat-label{font-size:11px}
  .footer-grid{grid-template-columns:1fr;gap:24px}
  .page-header{padding:100px 0 30px}
  .page-header h1,.page-header h2{font-size:clamp(22px,7vw,28px)}
  .page-header p{font-size:14px}
  .booking-form{padding:0}
  .car-media{height:180px}
  .blog-card .thumb{height:160px}
  .btn,.btn-primary,.btn-outline{padding:12px 22px;font-size:12.5px}
  .nav-links{width:100%;padding:80px 32px}
}
@media(max-width:400px){
  .btn,.btn-primary,.btn-outline{padding:10px 18px;font-size:12px}
  .hero-actions{gap:10px;flex-direction:column;align-items:stretch}
  .container{padding:0 16px}
  .section{padding:40px 0}
  .page-header{padding:80px 0 24px}
  .nav-links{padding:80px 24px}
  .nav-links a{font-size:16px}
}
</style>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={{ ga_id }}"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','{{ ga_id }}');
</script>
{{ sc_meta }}
{{ fb_pixel }}
</head>
<body>

<!-- ─── Nav ─── -->
<nav id="nav">
  <a href="/" class="nav-logo">Ava<span>Limo</span></a>
  <ul class="nav-links" id="navLinks">
    <li><a href="/">Home</a></li>
    <li><a href="/services">Services</a></li>
    <li><a href="/fleet">Fleet</a></li>
    <li><a href="/flight-status">Flight Status</a></li>
    <li><a href="/contact">Contact</a></li>
    <li><a href="/faq">FAQ</a></li>
  </ul>
  <div class="nav-cta">
    <span class="phone">24/7 Dispatch · <b>(832) 567-8050</b></span>
    <a href="/book" class="btn btn-gold">Book Now</a>
  </div>
  <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
</nav>

<!-- ─── PAGE: HOME ─── -->
<div class="page" id="page-home">

<section class="hero">
  <div class="hero-inner">
    <div class="eyebrow">Houston's premier chauffeur service</div>
    <h1>Arrive in<br><em>absolute</em> luxury.</h1>
    <p class="hero-sub">Airport transfers, corporate travel, weddings and events — chauffeured 24/7 across Greater Houston, with zero surge pricing.</p>
    <div class="hero-actions">
      <a href="/book" class="btn-primary">Book your ride</a>
      <a href="/fleet" class="btn-outline">View the fleet</a>
    </div>

    <div class="stat-strip">
      <div class="stat fade-up"><div class="stat-num"><span class="counter" data-target="500">0</span>+</div><div class="stat-label">Happy clients</div></div>
      <div class="stat fade-up"><div class="stat-num"><span class="counter" data-target="50">0</span>★</div><div class="stat-label">Average rating</div></div>
      <div class="stat fade-up"><div class="stat-num">24/7</div><div class="stat-label">Availability</div></div>
      <div class="stat fade-up"><div class="stat-num">$0</div><div class="stat-label">Surge fees</div></div>
    </div>
  </div>
</section>

<!-- Fleet Preview -->
<section class="section">
  <div class="container">
    <div class="section-header fade-up">
      <div class="subtitle">Our Fleet</div>
      <h2>Choose Your <span class="gold">Vehicle</span></h2>
      <p>Select from our meticulously maintained fleet of luxury vehicles. Every ride is immaculately cleaned and prepared for your arrival.</p>
    </div>
    <div class="fleet-grid">
      <div class="car-card fade-up">
        <div class="car-media">
          <span class="car-badge">Executive</span>
          <img src="/static/mercedes_sclass.png" alt="Mercedes S-Class luxury sedan" loading="lazy">
          <div class="gloss-sweep"></div>
        </div>
        <div class="car-body">
          <h3>Mercedes S-Class</h3>
          <div class="car-meta">● Up to 3 passengers</div>
          <p class="car-desc">The pinnacle of executive comfort — whisper-quiet cabin, ideal for airport transfers and corporate travel.</p>
          <div class="car-foot">
            <a href="/book" class="car-link">Book now</a>
          </div>
        </div>
      </div>
      <div class="car-card fade-up" style="transition-delay:.15s">
        <div class="car-media">
          <span class="car-badge">Most popular</span>
          <img src="/static/cadillac_escalade.png" alt="Cadillac Escalade luxury SUV" loading="lazy">
          <div class="gloss-sweep"></div>
        </div>
        <div class="car-body">
          <h3>Cadillac Escalade</h3>
          <div class="car-meta">● Up to 6 passengers</div>
          <p class="car-desc">Spacious, powerful, and built for groups — the fleet's go-to choice for families and VIP transfers.</p>
          <div class="car-foot">
            <a href="/book" class="car-link">Book now</a>
          </div>
        </div>
      </div>
      <div class="car-card fade-up" style="transition-delay:.3s">
        <div class="car-media">
          <span class="car-badge">Groups</span>
          <img src="/static/mercedes_sprinter.png" alt="Mercedes Sprinter passenger van" loading="lazy">
          <div class="gloss-sweep"></div>
        </div>
        <div class="car-body">
          <h3>Mercedes Sprinter</h3>
          <div class="car-meta">● Up to 14 passengers</div>
          <p class="car-desc">High ceilings, reclining seats, and a cabin that feels more like a private lounge than a van.</p>
          <div class="car-foot">
            <a href="/book" class="car-link">Book now</a>
          </div>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:40px"><a href="/fleet" class="btn btn-outline">View Full Fleet &rarr;</a></div>
  </div>
</section>

<!-- Services Preview -->
<section class="section" style="background:var(--bg2)">
  <div class="container">
    <div class="section-header fade-up">
      <div class="subtitle">Services</div>
      <h2>Every Occasion, <span class="gold">Covered</span></h2>
      <p>From airport pickups to weddings, we provide premium transportation for every occasion across Houston.</p>
    </div>
    <div class="services-grid">
      <div class="service-card fade-up"><div class="icon">&#9992;</div><h3>Airport Transfers</h3><p>IAH &amp; Hobby Airport. Flight tracking included, meet &amp; greet available.</p></div>
      <div class="service-card fade-up" style="transition-delay:.1s"><div class="icon">&#128188;</div><h3>Corporate Travel</h3><p>Impress clients with punctual, professional chauffeur service across Houston.</p></div>
      <div class="service-card fade-up" style="transition-delay:.2s"><div class="icon">&#128141;</div><h3>Wedding Limo</h3><p>Make your biggest day unforgettable with a grand, elegant arrival.</p></div>
      <div class="service-card fade-up" style="transition-delay:.3s"><div class="icon">&#127916;</div><h3>Events &amp; Nights Out</h3><p>Concerts, sports, prom, galas — all your special event transportation needs.</p></div>
      <div class="service-card fade-up" style="transition-delay:.4s"><div class="icon">&#127925;</div><h3>Bachelorette &amp; Parties</h3><p>BYOB party buses and Sprinter vans for the bride tribe and group nights out.</p></div>
      <div class="service-card fade-up" style="transition-delay:.5s"><div class="icon">&#127963;</div><h3>Wine &amp; Brewery Tours</h3><p>Texas Hill Country wineries and Houston craft breweries — safe and stylish.</p></div>
    </div>
  </div>
</section>

<!-- Testimonials -->
<section class="section">
  <div class="container">
    <div class="section-header fade-up">
      <div class="subtitle">Testimonials</div>
      <h2>What Our Clients <span class="gold">Say</span></h2>
    </div>
    <div class="test-grid">
      <div class="test-card fade-up">
        <div class="stars">★★★★★</div>
        <p>"Service was impeccable. Our chauffeur was professional and the car was spotless."</p>
        <div class="author"><div class="avatar">JR</div><div><div class="name">James R.</div><div class="title">Airport Transfer</div></div></div>
      </div>
      <div class="test-card fade-up" style="transition-delay:.15s">
        <div class="stars">★★★★★</div>
        <p>"Best limo service in Houston! On time, very polite, and the vehicle was amazingly comfortable."</p>
        <div class="author"><div class="avatar">SM</div><div><div class="name">Sarah M.</div><div class="title">Corporate Client</div></div></div>
      </div>
      <div class="test-card fade-up" style="transition-delay:.3s">
        <div class="stars">★★★★★</div>
        <p>"From easy booking to arrival — everything was perfect. Thank you AvaLimo!"</p>
        <div class="author"><div class="avatar">MB</div><div><div class="name">Michael B.</div><div class="title">Wedding</div></div></div>
      </div>
    </div>
  </div>
</section>

<!-- Booking CTA -->
<section class="section booking-section">
  <div class="container">
    <div class="section-header fade-up">
      <div class="subtitle">Book Now</div>
      <h2>Ready to <span class="gold">Ride?</span></h2>
      <p>Book online in 30 seconds — or call (832) 567-8050</p>
    </div>
    <div class="booking-wrap fade-up">
      <form class="booking-form" id="bookingForm">
        <div class="full"><label>Name</label><input type="text" id="b-name" required></div>
        <div><label>Phone</label><input type="tel" id="b-phone" required></div>
        <div><label>Email</label><input type="email" id="b-email"></div>
        <div><label>Pickup Location</label><input type="text" id="b-pickup" required></div>
        <div><label>Dropoff Location</label><input type="text" id="b-dropoff" required></div>
        <div><label>Date &amp; Time</label><input type="datetime-local" id="b-time" required></div>
        <div><label>Vehicle</label><select id="b-vehicle"><option value="Sedan">Sedan (1-3 pax)</option><option value="SUV">SUV (1-6 pax)</option><option value="Sprinter">Sprinter (1-14 pax)</option></select></div>
        <div><label>Passengers</label><input type="number" id="b-pax" min="1" max="14" value="1"></div>
        <div class="full"><label>Special Requests</label><textarea id="b-notes" rows="3"></textarea></div>
        <div class="full" style="text-align:center;margin-top:8px"><button type="submit" class="btn btn-gold" style="font-size:16px;padding:16px 48px">Get a Quote</button></div>
      </form>
    </div>
  </div>
</section>

<!-- Footer -->
<footer>
  <div class="container">
    <div class="footer-grid">
      <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas. Arrive in style and comfort — every time.</p></div>
      <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li><li><a href="/contact">Contact</a></li></ul></div>
      <div><h4>Services</h4><ul><li><a href="/services">Airport Transfers</a></li><li><a href="/services">Corporate Travel</a></li><li><a href="/services">Weddings</a></li><li><a href="/services">Events</a></li></ul></div>
      <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></li><li><a href="/contact">Houston, TX</a></li></ul></div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 AvaLimo. All rights reserved.</p>
      <div class="areas">Serving Houston, IAH, Hobby Airport, Sugar Land, The Woodlands, Katy &amp; Pearland.</div>
    </div>
  </div>
</footer>

</div>

<!-- ─── PAGE: SERVICES ─── -->
<div class="page" id="page-services" style="display:none">
<div class="page-header"><div class="container"><h2>Our <span class="gold">Services</span></h2><p>Premium transportation for every occasion across Greater Houston.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="services-grid" style="max-width:900px;margin:0 auto">
      <div class="service-card fade-up"><div class="icon">&#9992;</div><h3>Airport Transfers</h3><p>Professional IAH &amp; Hobby transfers with real-time flight tracking, meet &amp; greet, and luggage assistance. We monitor your flight so we're always on time.</p></div>
      <div class="service-card fade-up" style="transition-delay:.1s"><div class="icon">&#128188;</div><h3>Corporate Travel</h3><p>Executive transportation for business meetings, client entertainment, and team travel. Impress with punctuality and professionalism.</p></div>
      <div class="service-card fade-up" style="transition-delay:.2s"><div class="icon">&#128141;</div><h3>Wedding Transportation</h3><p>Make your entrance and exit unforgettable. White glove service for the wedding party, family, and guests. Photo-worthy arrivals.</p></div>
      <div class="service-card fade-up" style="transition-delay:.3s"><div class="icon">&#127916;</div><h3>Concerts &amp; Events</h3><p>Toyota Center, Shell Energy Stadium, 713 Music Hall, NRG — arrive in style and skip the parking hassle. We'll be waiting when the show ends.</p></div>
      <div class="service-card fade-up" style="transition-delay:.4s"><div class="icon">&#127954;</div><h3>Sporting Events</h3><p>Astros, Rockets, Texans, Dynamo, Dash — tailgate in luxury and leave the driving to us. Door-to-door service for game day.</p></div>
      <div class="service-card fade-up" style="transition-delay:.5s"><div class="icon">&#127874;</div><h3>Prom &amp; Quinceañera</h3><p>Safe, stylish transportation for life's milestone celebrations. Stretch limos, SUVs, and Sprinter vans available.</p></div>
      <div class="service-card fade-up" style="transition-delay:.6s"><div class="icon">&#127925;</div><h3>Bachelorette &amp; Parties</h3><p>BYOB-friendly Sprinter vans and party buses for the bride tribe, birthday bashes, and group nights out in Houston.</p></div>
      <div class="service-card fade-up" style="transition-delay:.7s"><div class="icon">&#127863;</div><h3>Wine &amp; Brewery Tours</h3><p>Texas Hill Country wine tours and Houston brewery crawls. Safe, social, and completely customized to your group.</p></div>
      <div class="service-card fade-up" style="transition-delay:.8s"><div class="icon">&#128652;</div><h3>Group Transportation</h3><p>Corporate offsites, conventions, weddings, and large parties. Mercedes Sprinter vans seat up to 14 in full luxury comfort.</p></div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)">
<div class="container">
  <div class="footer-grid">
    <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas. Arrive in style and comfort — every time.</p></div>
    <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li><li><a href="/contact">Contact</a></li></ul></div>
    <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></li></ul></div>
    <div><h4>Policy</h4><ul><li><a href="/policy">Company Policy</a></li><li><a href="/faq">FAQ</a></li></ul></div>
  </div>
  <div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy &amp; Pearland.</div></div>
</div>
</footer>
</div>

<!-- ─── PAGE: FLEET ─── -->
<div class="page" id="page-fleet" style="display:none">
<div class="page-header"><div class="container"><h2>Our <span class="gold">Fleet</span></h2><p>Every vehicle meticulously maintained for your comfort and safety.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="fleet-grid">
      <div class="car-card fade-up">
        <div class="car-media">
          <span class="car-badge">Executive</span>
          <img src="/static/mercedes_sclass.png" alt="Mercedes S-Class luxury sedan" loading="lazy">
          <div class="gloss-sweep"></div>
        </div>
        <div class="car-body">
          <h3>Mercedes S-Class</h3>
          <div class="car-meta">● Up to 3 passengers</div>
          <p class="car-desc">The pinnacle of executive comfort — leather seating, ambient lighting, whisper-quiet cabin. Perfect for airport transfers and corporate travel.</p>
          <div class="car-foot">
            <a href="/book" class="car-link">Book now</a>
          </div>
        </div>
      </div>
      <div class="car-card fade-up" style="transition-delay:.15s">
        <div class="car-media">
          <span class="car-badge">Most popular</span>
          <img src="/static/cadillac_escalade.png" alt="Cadillac Escalade luxury SUV" loading="lazy">
          <div class="gloss-sweep"></div>
        </div>
        <div class="car-body">
          <h3>Cadillac Escalade</h3>
          <div class="car-meta">● Up to 6 passengers</div>
          <p class="car-desc">Spacious, powerful, and packed with premium amenities. The go-to choice for families, groups, and VIP airport transfers.</p>
          <div class="car-foot">
            <a href="/book" class="car-link">Book now</a>
          </div>
        </div>
      </div>
      <div class="car-card fade-up" style="transition-delay:.3s">
        <div class="car-media">
          <span class="car-badge">Groups</span>
          <img src="/static/mercedes_sprinter.png" alt="Mercedes Sprinter passenger van" loading="lazy">
          <div class="gloss-sweep"></div>
        </div>
        <div class="car-body">
          <h3>Mercedes Sprinter</h3>
          <div class="car-meta">● Up to 14 passengers</div>
          <p class="car-desc">High ceilings, reclining seats, ambient lighting, and premium sound. The ultimate group vehicle for weddings, tours, and events.</p>
          <div class="car-foot">
            <a href="/book" class="car-link">Book now</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)">
<div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas. Arrive in style and comfort — every time.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li><li><a href="/contact">Contact</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></li></ul></div>
  <div><h4>Policy</h4><ul><li><a href="/policy">Company Policy</a></li><li><a href="/faq">FAQ</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy &amp; Pearland.</div></div></div>
</footer>
</div>

<!-- ─── PAGE: CONTACT ─── -->
<div class="page" id="page-contact" style="display:none">
<div class="page-header"><div class="container"><h2>Get in <span class="gold">Touch</span></h2><p>We're here 24/7 to help with your transportation needs.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid">
      <div class="contact-info fade-up">
        <h3>Let's Talk <span class="gold">Luxury</span></h3>
        <p>Whether you need an airport pickup at 3 AM or a wedding procession for 50 guests, we've got you covered. Call, email, or stop by — we're always ready.</p>
        <div class="contact-item"><div class="ci-icon">&#128222;</div><div><div class="ci-text"><a href="tel:+18325678050">(832) 567-8050</a></div><div class="ci-sub">24/7 Dispatch &bull; Always answered</div></div></div>
        <div class="contact-item"><div class="ci-icon">&#9993;</div><div><div class="ci-text"><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></div><div class="ci-sub">We reply within 1 hour</div></div></div>
        <div class="contact-item"><div class="ci-icon">&#128205;</div><div><div class="ci-text">Houston, Texas</div><div class="ci-sub">Serving the entire Greater Houston area</div></div></div>

      </div>
      <div class="fade-up" style="transition-delay:.2s">
        <form class="booking-form" id="contactForm">
          <div class="full"><label>Your Name</label><input type="text" id="c-name" required></div>
          <div><label>Email</label><input type="email" id="c-email" required></div>
          <div><label>Phone</label><input type="tel" id="c-phone"></div>
          <div class="full"><label>Subject</label><select id="c-subject"><option>General Inquiry</option><option>Book a Ride</option><option>Corporate Account</option><option>Event Quote</option><option>Partnership</option></select></div>
          <div class="full"><label>Message</label><textarea id="c-message" rows="5" required></textarea></div>
          <div class="full"><button type="submit" class="btn btn-gold">Send Message</button></div>
        </form>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas. Arrive in style and comfort — every time.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li><li><a href="/contact">Contact</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></li></ul></div>
  <div><h4>Policy</h4><ul><li><a href="/policy">Company Policy</a></li><li><a href="/faq">FAQ</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy &amp; Pearland.</div></div></div></footer>
</div>

<!-- ─── PAGE: FAQ ─── -->
<div class="page" id="page-faq" style="display:none">
<div class="page-header"><div class="container"><h2>Frequently Asked <span class="gold">Questions</span></h2></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="faq-list">
      <div class="faq-item fade-up"><div class="faq-q"><span>How do I book a ride?</span><span class="arrow">&#9660;</span></div><div class="faq-a">You can book online using our booking form, call us at (832) 567-8050, or email adam@avalimo.net. Online booking is fastest — just fill in your details and we'll confirm within minutes.</div></div>
      <div class="faq-item fade-up" style="transition-delay:.1s"><div class="faq-q"><span>Do you service both IAH and Hobby airports?</span><span class="arrow">&#9660;</span></div><div class="faq-a">Yes! We cover both George Bush Intercontinental (IAH) and William P. Hobby (HOU) airports. We also serve all surrounding areas including Sugar Land, The Woodlands, Katy, and Pearland.</div></div>
      <div class="faq-item fade-up" style="transition-delay:.2s"><div class="faq-q"><span>Do you track flights for airport pickups?</span><span class="arrow">&#9660;</span></div><div class="faq-a">Absolutely. We monitor your flight in real-time so we're always there when you land — even if your flight is early or delayed. No extra charge.</div></div>
      <div class="faq-item fade-up" style="transition-delay:.3s"><div class="faq-q"><span>What vehicles do you offer?</span><span class="arrow">&#9660;</span></div><div class="faq-a">Our fleet includes the Mercedes S-Class (up to 3 passengers), Cadillac Escalade SUV (up to 6 passengers), and Mercedes Sprinter (up to 14 passengers). All vehicles are immaculately maintained.</div></div>
      <div class="faq-item fade-up" style="transition-delay:.4s"><div class="faq-q"><span>How much does it cost?</span><span class="arrow">&#9660;</span></div><div class="faq-a">Pricing depends on vehicle type, distance, and duration. We offer transparent flat-rate pricing with zero surge fees. Contact us for a quote — we typically respond within minutes.</div></div>
      <div class="faq-item fade-up" style="transition-delay:.5s"><div class="faq-q"><span>Do you require a deposit?</span><span class="arrow">&#9660;</span></div><div class="faq-a">Yes, a booking deposit is required to secure your reservation. The deposit is fully refundable with 24-hour cancellation notice. See our Company Policy for details.</div></div>
      <div class="faq-item fade-up" style="transition-delay:.6s"><div class="faq-q"><span>Can I cancel or modify my booking?</span><span class="arrow">&#9660;</span></div><div class="faq-a">Yes. You can cancel or modify your booking up to 24 hours before the scheduled pickup time for a full refund. Late cancellations may incur a fee.</div></div>
      <div class="faq-item fade-up" style="transition-delay:.7s"><div class="faq-q"><span>Are your drivers licensed and insured?</span><span class="arrow">&#9660;</span></div><div class="faq-a">Yes. Every AvaLimo chauffeur is fully licensed, insured, and professionally trained. We conduct thorough background checks and regular vehicle inspections.</div></div>
      <div class="faq-item fade-up" style="transition-delay:.8s"><div class="faq-q"><span>Do you provide car seats for children?</span><span class="arrow">&#9660;</span></div><div class="faq-a">Yes, we can provide car seats upon request. Please let us know at the time of booking so we can ensure proper installation.</div></div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas. Arrive in style and comfort — every time.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li><li><a href="/contact">Contact</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></li></ul></div>
  <div><h4>Policy</h4><ul><li><a href="/policy">Company Policy</a></li><li><a href="/faq">FAQ</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy &amp; Pearland.</div></div></div></footer>
</div>

<!-- ─── PAGE: POLICY ─── -->
<div class="page" id="page-policy" style="display:none">
<div class="page-header"><div class="container"><h2>Company <span class="gold">Policy</span></h2></div></div>
<section class="section" style="padding-top:0"><div class="container" style="max-width:800px">
<div class="fade-up" style="color:var(--text2);font-size:15px;line-height:1.9">
<h3 style="color:var(--text);margin:32px 0 12px;font-size:20px">Booking &amp; Reservations</h3>
<p>All reservations require a valid credit card to secure the booking. A deposit may be required for certain services or peak periods. By booking with AvaLimo, you agree to these terms.</p>
<h3 style="color:var(--text);margin:32px 0 12px;font-size:20px">Cancellation Policy</h3>
<p>Cancellations made 24 hours or more before the scheduled pickup time receive a full refund. Cancellations within 24 hours may incur a charge of up to 50% of the fare. No-shows are charged in full.</p>
<h3 style="color:var(--text);margin:32px 0 12px;font-size:20px">Waiting Time</h3>
<p>Airport pickups include 60 minutes of complimentary waiting time from the moment your flight lands. For all other pickups, a 15-minute grace period is included. Additional waiting time is billed at $1 per minute.</p>
<h3 style="color:var(--text);margin:32px 0 12px;font-size:20px">Smoking &amp; Cleanliness</h3>
<p>All AvaLimo vehicles are strictly non-smoking (including vaping). A cleaning fee of $250 will be charged for any violations. Please treat our vehicles with respect.</p>
<h3 style="color:var(--text);margin:32px 0 12px;font-size:20px">Liability</h3>
<p>AvaLimo is fully insured and licensed. We are not responsible for items left in vehicles. Clients are responsible for any damage caused to vehicles during the rental period.</p>
<h3 style="color:var(--text);margin:32px 0 12px;font-size:20px">Privacy</h3>
<p>We respect your privacy. Personal information collected during booking is used solely for providing our services and will never be shared with third parties without your consent.</p>
</div></div></section>
<footer style="background:var(--bg2);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas. Arrive in style and comfort — every time.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li><li><a href="/contact">Contact</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></li></ul></div>
  <div><h4>Policy</h4><ul><li><a href="/policy">Company Policy</a></li><li><a href="/faq">FAQ</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy &amp; Pearland.</div></div></div></footer>
</div>

<!-- ─── PAGE: BOOK ─── -->
<div class="page" id="page-book" style="display:none">
<div class="page-header"><div class="container"><h2>Book Your <span class="gold">Ride</span></h2><p>Fill out the form and we'll confirm your ride within minutes.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="booking-wrap fade-up" style="max-width:700px">
      <form class="booking-form" id="bookForm">
        <div class="full"><label>Full Name</label><input type="text" id="bk-name" required></div>
        <div><label>Phone</label><input type="tel" id="bk-phone" required></div>
        <div><label>Email</label><input type="email" id="bk-email"></div>
        <div class="full"><label>Pickup Location</label><input type="text" id="bk-pickup" placeholder="Address, airport, hotel, etc." required></div>
        <div class="full"><label>Dropoff Location</label><input type="text" id="bk-dropoff" placeholder="Address, airport, venue, etc." required></div>
        <div><label>Date &amp; Time</label><input type="datetime-local" id="bk-time" required></div>
        <div><label>Vehicle Type</label><select id="bk-vehicle"><option value="Sedan">Sedan (1-3 pax) — Mercedes S-Class</option><option value="SUV">SUV (1-6 pax) — Cadillac Escalade</option><option value="Sprinter">Sprinter (1-14 pax) — Mercedes Sprinter</option><option value="Unsure">Not sure — Recommend me</option></select></div>
        <div><label>Passengers</label><input type="number" id="bk-pax" min="1" max="14" value="1"></div>
        <div><label>Service Type</label><select id="bk-service"><option>Airport Transfer</option><option>Corporate Travel</option><option>Wedding</option><option>Event / Concert</option><option>Night Out</option><option>Wine Tour</option><option>Other</option></select></div>
        <div><label>Flight # (if airport)</label><input type="text" id="bk-flight" placeholder="e.g. UA1234"></div>
        <div class="full"><label>Special Requests</label><textarea id="bk-notes" rows="3" placeholder="Car seats, luggage details, extra stops, etc."></textarea></div>
        <div class="full" style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;margin-top:8px">
          <button type="submit" class="btn btn-gold" style="font-size:16px;padding:16px 40px">Submit Booking</button>
          <a href="tel:+18325678050" class="btn btn-outline" style="font-size:16px;padding:16px 40px">Call (832) 567-8050</a>
        </div>
      </form>
      <div id="bk-thanks" style="display:none;text-align:center;padding:60px 20px">
        <div style="font-size:64px;margin-bottom:20px">&#10003;</div>
        <h2 style="font-size:28px;margin-bottom:12px">Booking <span class="gold">Submitted</span></h2>
        <p style="color:var(--text2);max-width:450px;margin:0 auto">We've received your request. Our team will confirm your ride within minutes. You can also call us anytime at (832) 567-8050.</p>
      </div>
    </div>
  </div>
</section>
</div>

<!-- ─── PAGE: BLOG ─── -->
<div class="page" id="page-blog" style="{% if featured_post %}display:block{% else %}display:none{% endif %}">
{% if featured_post %}
<div id="blog-featured" data-slug="{{ featured_post.slug }}">
<div class="container" style="padding-top:100px">
  <a href="/blog" class="btn btn-outline" style="margin-bottom:20px">← Back to Blog</a>
  <div class="blog-article-full">
    <div class="cat" style="color:var(--gold);font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">{{ featured_post.cat }}</div>
    <h1 style="font-size:2rem;margin:0 0 10px;line-height:1.3">{{ featured_post.title|safe }}</h1>
    <div class="meta" style="color:var(--text3);font-size:13px;margin-bottom:24px">{{ featured_post.date }} • {{ featured_post.read }}</div>
    <div class="article-body" style="font-size:15px;line-height:1.8;color:var(--text2)">{{ featured_post.content|safe }}</div>
  </div>
</div>
</div>
{% endif %}
<div class="page-header"{% if featured_post %} style="padding-top:40px"{% endif %}><div class="container"><h2>Our <span class="gold">Blog</span></h2><p>{% if featured_post %}More articles from our blog{% else %}Insights, guides, and news from Houston's premier limo service.{% endif %}</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="blog-grid">
      {% for post in blog_posts %}
      <div class="blog-card fade-up" data-slug="{{ post.slug }}"{% if post.delay is defined and post.delay and post.delay != "0s" %} style="transition-delay:{{ post.delay }}"{% endif %}>
        <div class="thumb">{{ post.emoji|safe }}</div>
        <div class="body">
          <div class="cat">{{ post.cat }}</div>
          <h3>{{ post.title|safe }}</h3>
          <p>{{ post.summary|safe }}</p>
          <a href="/blog/{{ post.slug }}" class="btn btn-outline" style="padding:8px 20px;font-size:12px">Read More</a>
          <div class="meta"><span>{{ post.date }}</span><span>&#8226; {{ post.read }}</span></div>
          <div class="article-content">{{ post.content|safe }}</div>
        </div>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": "{{ post.title|safe }}",
          "description": "{{ post.summary|safe }}",
          "url": "https://avalimo.net/blog/{{ post.slug }}",
          "datePublished": "{{ post.date }}",
          "dateModified": "{{ post.date }}",
          "author": { "@type": "Person", "name": "{{ post.author }}" },
          "publisher": { "@type": "LocalBusiness", "name": "AvaLimo", "url": "https://avalimo.net", "logo": "https://avalimo.net/static/chauffeur_service.webp" },
          "image": "https://avalimo.net{{ post.image }}",
          "articleBody": {{ post.content|safe|tojson }},
          "mainEntityOfPage": { "@type": "WebPage", "@id": "https://avalimo.net/blog/{{ post.slug }}" }
        }
        </script>
      </div>
      {% endfor %}
    </div>
    <div style="text-align:center;margin-top:40px"><p style="color:var(--text3);font-size:13px">New articles published weekly. <a href="/contact" style="color:var(--gold)">Suggest a topic</a>.</p></div>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas. Arrive in style and comfort — every time.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li><li><a href="/blog">Blog</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></li></ul></div>
  <div><h4>Info</h4><ul><li><a href="/faq">FAQ</a></li><li><a href="/policy">Policy</a></li><li><a href="/flight-status">Flight Status</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy &amp; Pearland.</div></div></div></footer>
</div>
</div>

<!-- ─── PAGE: FLIGHT STATUS ─── -->
<div class="page" id="page-flight" style="display:none">
<div class="page-header"><div class="container"><h2>Flight <span class="gold">Status</span></h2><p>Track your flight in real-time. We monitor every flight for our airport transfer clients.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="flight-card fade-up">
      <h3 style="margin-bottom:8px;font-size:20px">Track a Flight</h3>
      <p style="color:var(--text2);font-size:14px;margin-bottom:20px">Enter the airline and flight number to see real-time status.</p>
      <div class="input-group">
        <input type="text" id="flight-input" placeholder="e.g. UA1234, AA5678, WN901" style="text-transform:uppercase">
        <button class="btn btn-gold" onclick="trackFlight()">Track</button>
      </div>
      <div class="flight-result" id="flight-result">
        <div class="fr-row"><span class="fr-label">Flight</span><span class="fr-value" id="fr-number">UA 1234</span></div>
        <div class="fr-row"><span class="fr-label">Airline</span><span class="fr-value" id="fr-airline">United Airlines</span></div>
        <div class="fr-row"><span class="fr-label">Route</span><span class="fr-value" id="fr-route">ORD &rarr; IAH</span></div>
        <div class="fr-row"><span class="fr-label">Scheduled</span><span class="fr-value" id="fr-sched">2:30 PM</span></div>
        <div class="fr-row"><span class="fr-label">Estimated</span><span class="fr-value" id="fr-est">2:28 PM</span></div>
        <div class="fr-row"><span class="fr-label">Status</span><span class="fr-value"><span class="status-badge on-time" id="fr-status">&#9679; On Time</span></span></div>
        <div class="fr-row"><span class="fr-label">Gate</span><span class="fr-value" id="fr-gate">C12</span></div>
        <div class="fr-row"><span class="fr-label">Terminal</span><span class="fr-value" id="fr-term">C</span></div>
        <div class="fr-map" id="fr-map">
          <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#c9a463" stop-opacity=".1"/><stop offset="50%" stop-color="#c9a463" stop-opacity=".4"/><stop offset="100%" stop-color="#c9a463" stop-opacity=".1"/></linearGradient></defs>
            <rect width="400" height="160" fill="rgba(201,164,99,.03)" rx="6"/>
            <path d="M30 130 Q80 80 130 90 Q180 100 220 70 Q260 40 310 50 Q350 55 370 40" fill="none" stroke="url(#routeGrad)" stroke-width="2" stroke-dasharray="6 4"/>
            <circle cx="30" cy="130" r="6" fill="#c9a463" opacity=".8"/>
            <text x="30" y="150" fill="#999" font-size="10" text-anchor="middle">Origin</text>
            <circle cx="370" cy="40" r="6" fill="#c9a463"/>
            <text x="370" y="30" fill="#c9a463" font-size="10" text-anchor="middle">IAH</text>
            <circle cx="220" cy="70" r="4" fill="#c9a463" opacity=".5"/>
            <text x="220" y="64" fill="#666" font-size="9" text-anchor="middle">&#9992; in flight</text>
          </svg>
        </div>
      </div>
      <div style="margin-top:20px;padding:16px;background:rgba(212,175,55,.05);border-radius:var(--radius-sm);border:1px solid rgba(212,175,55,.1)">
        <p style="color:var(--text2);font-size:13px">&#9432; Flight data powered by <a href="https://aviationstack.com" target="_blank" rel="noopener" style="color:var(--gold)">AviationStack</a>. Enter any airline flight number to track live status.</p>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas. Arrive in style and comfort — every time.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li><li><a href="/contact">Contact</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></li></ul></div>
  <div><h4>Info</h4><ul><li><a href="/faq">FAQ</a></li><li><a href="/policy">Policy</a></li><li><a href="/flight-status">Flight Status</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy &amp; Pearland.</div></div></div></footer>
</div>

<!-- ─── PAGE: DEPOSIT ─── -->
<div class="page" id="page-deposit" style="display:none"
     data-sq-app-id="{{ sq_app_id }}"
     data-sq-loc-id="{{ sq_location_id }}">
<div class="page-header"><div class="container"><h2>Pay <span class="gold">Deposit</span></h2><p>Secure your reservation with a booking deposit.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="deposit-wrap fade-up">
      <div class="deposit-card">
        <div class="amount-display">
          <div class="currency">Deposit Amount</div>
          <div class="number">$<input type="text" id="dep-amount" value="100" oninput="updateDepositPresets(this.value)"></div>
          <div style="color:var(--text3);font-size:13px;margin-top:4px">Refundable with 24h cancellation</div>
        </div>
        <div class="amount-presets">
          <button onclick="setDeposit(50)" id="dep-50">$50</button>
          <button onclick="setDeposit(100)" id="dep-100" class="active">$100</button>
          <button onclick="setDeposit(250)" id="dep-250">$250</button>
          <button onclick="setDeposit(500)" id="dep-500">$500</button>
          <button onclick="setDeposit(1000)" id="dep-1000">$1,000</button>
          <button onclick="setDeposit(0)" id="dep-custom">Custom</button>
        </div>
        <div class="pay-fields">
          <label>Cardholder Name</label>
          <input type="text" id="dep-name" placeholder="John Doe">
          <label>Email for Receipt</label>
          <input type="email" id="dep-email" placeholder="you@example.com">
          <label>Card Details</label>
          <div id="square-card" style="padding:14px 18px;border-radius:var(--radius-sm);border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);margin-bottom:16px;min-height:56px"></div>
          <div id="sq-errors" style="color:#ff6b6b;font-size:13px;margin-bottom:12px;display:none"></div>
          <button class="btn btn-gold" style="width:100%;justify-content:center;padding:16px;font-size:16px;margin-top:8px" id="dep-pay-btn" onclick="processSquarePayment()">Pay Deposit</button>
          <p style="color:var(--text3);font-size:12px;text-align:center;margin-top:16px">&#128274; Secured by Square. Your card info never touches our server.</p>
        </div>
        <div id="dep-processing" style="display:none;text-align:center;padding:40px 20px">
          <div style="font-size:32px;margin-bottom:16px;animation:spin 1s linear infinite">&#8635;</div>
          <p style="color:var(--text2)">Processing your payment...</p>
        </div>
        <div id="dep-thanks" style="display:none;text-align:center;padding:20px">
          <div style="font-size:48px;margin-bottom:12px">&#10003;</div>
          <h3 style="margin-bottom:8px">Deposit <span class="gold">Received</span></h3>
          <p style="color:var(--text2);font-size:14px" id="dep-thanks-msg">Your booking is secured. You'll receive a confirmation email shortly.</p>
        </div>
      </div>
    </div>
  </div>
</section>
</div>

<div class="page" id="page-airport" style="display:none">
<div class="page-header"><div class="container"><h1>Houston Airport <span class="gold">Limo Service</span></h1><p>Premium airport transfers to IAH &amp; Hobby Airport — 24/7 Availability</p></div></div>

<section class="section" style="padding-top:0;background:var(--bg2)">
<div class="container">
<h2 style="text-align:center;margin-bottom:48px">Why Choose AvaLimo for Houston Airport Transportation?</h2>
<div class="services-grid">
<div class="service-card"><div class="icon">💰</div><h3>Flat-Rate Pricing</h3><p>No surge fees, ever. Know your exact cost upfront with no hidden charges.</p></div>
<div class="service-card"><div class="icon">✈️</div><h3>Flight Tracking</h3><p>We monitor your flight in real-time and adjust pickup automatically.</p></div>
<div class="service-card"><div class="icon">👋</div><h3>Meet &amp; Greet</h3><p>Your chauffeur meets you at baggage claim with a personalized sign.</p></div>
<div class="service-card"><div class="icon">🕐</div><h3>24/7 Availability</h3><p>Early morning or late night arrivals — we're always on standby.</p></div>
<div class="service-card"><div class="icon">🚗</div><h3>Professional Chauffeurs</h3><p>Licensed, insured, background-checked drivers who know Houston's airports.</p></div>
<div class="service-card"><div class="icon">🛡️</div><h3>On-Time Guarantee</h3><p>We arrive 10 minutes early, every time. Your time is valuable.</p></div>
</div>
</div>
</section>

<section class="section">
<div class="container">
<h2 style="text-align:center;margin-bottom:48px">IAH &amp; Hobby Airport Transfers</h2>
<div class="fleet-grid" style="grid-template-columns:1fr 1fr;gap:32px">
<div class="fleet-card">
<div class="body" style="padding:32px">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
<span style="font-size:32px">🛫</span>
<h3 style="font-size:20px">George Bush Intercontinental (IAH)</h3>
</div>
<p style="color:var(--text2);margin-bottom:20px">Houston's largest airport, 23 miles north of downtown. Seamless transfers to Downtown, The Woodlands, Katy, Sugar Land, and beyond.</p>
<div style="background:var(--bg3);padding:20px;border-radius:12px;margin-bottom:16px">
<p style="font-weight:600;margin-bottom:12px;color:var(--gold)">Popular Routes:</p>
<ul style="list-style:none;display:grid;gap:8px;color:var(--text2);font-size:14px">
<li>✓ IAH to Downtown Houston — ~45 minutes</li>
<li>✓ IAH to The Woodlands — ~30 minutes</li>
<li>✓ IAH to Sugar Land — ~55 minutes</li>
<li>✓ IAH to Katy — ~50 minutes</li>
<li>✓ IAH to Galleria — ~40 minutes</li>
</ul>
</div>
<a href="/book" class="btn btn-gold" style="width:100%;justify-content:center">Book IAH Transfer</a>
</div>
</div>
<div class="fleet-card">
<div class="body" style="padding:32px">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
<span style="font-size:32px">🛬</span>
<h3 style="font-size:20px">William P. Hobby Airport (HOU)</h3>
</div>
<p style="color:var(--text2);margin-bottom:20px">Houston's second airport, 11 miles southeast of downtown. Perfect for Southwest Airlines and domestic travelers.</p>
<div style="background:var(--bg3);padding:20px;border-radius:12px;margin-bottom:16px">
<p style="font-weight:600;margin-bottom:12px;color:var(--gold)">Popular Routes:</p>
<ul style="list-style:none;display:grid;gap:8px;color:var(--text2);font-size:14px">
<li>✓ Hobby to Downtown Houston — ~25 minutes</li>
<li>✓ Hobby to Galleria — ~30 minutes</li>
<li>✓ Hobby to Medical Center — ~35 minutes</li>
<li>✓ Hobby to Pearland — ~20 minutes</li>
<li>✓ Hobby to Clear Lake — ~25 minutes</li>
</ul>
</div>
<a href="/book" class="btn btn-gold" style="width:100%;justify-content:center">Book Hobby Transfer</a>
</div>
</div>
</div>
</div>
</section>

<section class="section" style="background:var(--bg2)">
<div class="container">
<h2 style="text-align:center;margin-bottom:48px">Your Airport Transfer in 4 Simple Steps</h2>
<div style="max-width:700px;margin:0 auto;display:grid;gap:24px">
<div style="display:flex;gap:20px;align-items:flex-start"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;font-weight:800;color:#111;flex-shrink:0">1</div><div><h3 style="font-size:17px;margin-bottom:6px">Book Online or Call</h3><p style="color:var(--text2);font-size:14px">Reserve at avalimo.net or call (832) 567-8050. Get instant confirmation.</p></div></div>
<div style="display:flex;gap:20px;align-items:flex-start"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;font-weight:800;color:#111;flex-shrink:0">2</div><div><h3 style="font-size:17px;margin-bottom:6px">Flight Tracking</h3><p style="color:var(--text2);font-size:14px">We monitor your flight in real-time. Adjustments made automatically at no charge.</p></div></div>
<div style="display:flex;gap:20px;align-items:flex-start"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;font-weight:800;color:#111;flex-shrink:0">3</div><div><h3 style="font-size:17px;margin-bottom:6px">Meet &amp; Greet</h3><p style="color:var(--text2);font-size:14px">Your chauffeur meets you at baggage claim with a personalized sign.</p></div></div>
<div style="display:flex;gap:20px;align-items:flex-start"><div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-dark));display:flex;align-items:center;justify-content:center;font-weight:800;color:#111;flex-shrink:0">4</div><div><h3 style="font-size:17px;margin-bottom:6px">Relax &amp; Ride</h3><p style="color:var(--text2);font-size:14px">Sit back in luxury. We handle traffic and get you there in comfort.</p></div></div>
</div>
</div>
</section>

<section class="section">
<div class="container">
<h2 style="text-align:center;margin-bottom:48px">Frequently Asked Questions</h2>
<div style="max-width:800px;margin:0 auto;display:grid;gap:20px">
<div style="background:var(--card);padding:24px;border-radius:var(--radius);border:1px solid rgba(255,255,255,.06)">
<h3 style="font-size:15px;margin-bottom:8px;color:var(--gold)">How early should I book my airport limo?</h3>
<p style="color:var(--text2);font-size:14px">We recommend 24 hours in advance. Call (832) 567-8050 for same-day availability.</p>
</div>
<div style="background:var(--card);padding:24px;border-radius:var(--radius);border:1px solid rgba(255,255,255,.06)">
<h3 style="font-size:15px;margin-bottom:8px;color:var(--gold)">What if my flight is delayed?</h3>
<p style="color:var(--text2);font-size:14px">We track flights in real-time. Your chauffeur adjusts automatically — no extra charge.</p>
</div>
<div style="background:var(--card);padding:24px;border-radius:var(--radius);border:1px solid rgba(255,255,255,.06)">
<h3 style="font-size:15px;margin-bottom:8px;color:var(--gold)">Where will my chauffeur meet me at IAH?</h3>
<p style="color:var(--text2);font-size:14px">Domestic: baggage claim. International: customs exit. Sign with your name provided.</p>
</div>
<div style="background:var(--card);padding:24px;border-radius:var(--radius);border:1px solid rgba(255,255,255,.06)">
<h3 style="font-size:15px;margin-bottom:8px;color:var(--gold)">Do you charge extra for luggage?</h3>
<p style="color:var(--text2);font-size:14px">Standard luggage included: 2 checked bags + 1 carry-on per passenger.</p>
</div>
<div style="background:var(--card);padding:24px;border-radius:var(--radius);border:1px solid rgba(255,255,255,.06)">
<h3 style="font-size:15px;margin-bottom:8px;color:var(--gold)">Can I book a round-trip transfer?</h3>
<p style="color:var(--text2);font-size:14px">Absolutely! Round-trip bookings get preferred scheduling and simplified checkout.</p>
</div>
<div style="background:var(--card);padding:24px;border-radius:var(--radius);border:1px solid rgba(255,255,255,.06)">
<h3 style="font-size:15px;margin-bottom:8px;color:var(--gold)">What's your cancellation policy?</h3>
<p style="color:var(--text2);font-size:14px">Free cancellation up to 2 hours before pickup. Full refunds with 24-hour notice.</p>
</div>
</div>
</div>
</section>

<section class="section" style="background:var(--bg2);text-align:center">
<div class="container">
<div style="max-width:650px;margin:0 auto">
<h2 style="font-size:clamp(26px,4vw,36px);margin-bottom:16px">Ready for Stress-Free Airport Transportation?</h2>
<p style="color:var(--text2);font-size:17px;margin-bottom:32px">Join 500+ satisfied clients who trust AvaLimo for Houston airport transfers.</p>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
<a href="tel:8325678050" class="btn btn-gold" style="font-size:15px;padding:14px 28px">📞 Call (832) 567-8050</a>
<a href="/book" class="btn btn-outline" style="font-size:15px;padding:14px 28px">Book Online Now</a>
</div>
</div>
</div>
</section>
</div>


<!-- ─── Chat Widget ─── -->
<button class="chat-btn" id="chatBtn" onclick="toggleChat()">
  <div class="pulse"></div>
  &#128172;
</button>
<div class="chat-widget" id="chatWidget">
  <div class="chat-header">
    <div class="avatar">&#128663;</div>
    <div class="info"><div class="name">AvaLimo Assistant</div><div class="status">Online</div></div>
    <button class="close-btn" onclick="toggleChat()">&times;</button>
  </div>
  <div class="chat-messages" id="chatMessages">
    <div class="chat-msg bot">Hi! I'm the AvaLimo Assistant. How can I help you today? &#128522;</div>
    <div class="chat-msg bot">You can ask me about:<br>&#8226; Booking a ride<br>&#8226; Our fleet &amp; prices<br>&#8226; Airport transfers<br>&#8226; Cancellation policy</div>
  </div>
  <div class="chat-input-wrap">
    <input type="text" id="chatInput" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendChat()">
    <button onclick="sendChat()">&#10148;</button>
  </div>
</div>

<script>
// ─── Router ───
var pages = document.querySelectorAll('.page');
var pageMeta = {
  '/': { title:'AvaLimo — Houston Premier Limo Service | IAH & Hobby Airport Transfers', desc:'Houston\'s most trusted chauffeur service. Airport transfers for IAH & Hobby, corporate travel, weddings, events — 24/7 with zero surge pricing.' },
  '/services': { title:'Services — AvaLimo | Houston Limo & Chauffeur Service', desc:'Airport transfers, corporate travel, wedding limo, event transportation & more. Houston\'s premium chauffeur service — 24/7.' },
  '/fleet': { title:'Our Fleet — AvaLimo | Luxury Sedans, SUVs & Sprinter Vans', desc:'Mercedes S-Class, Cadillac Escalade & Mercedes Sprinter. Houston\'s finest luxury fleet for any occasion.' },
  '/book': { title:'Book a Ride — AvaLimo | Online Reservation', desc:'Reserve your Houston luxury chauffeur service online in 30 seconds. Airport transfers, corporate & events — 24/7.' },
  '/blog': { title:'Blog — AvaLimo | Houston Limo Service Insights & Tips', desc:'Travel tips, airport guides, wedding advice & more from Houston\'s premier chauffeur service.' },
  '/flight-status': { title:'Flight Status — AvaLimo | Real-Time Flight Tracker', desc:'Track your flight in real-time. Free flight status tool for IAH, Hobby & all airlines.' },
  '/contact': { title:'Contact — AvaLimo | Houston Limo Service', desc:'Get in touch with AvaLimo. Call (832) 567-8050 or message us online. 24/7 dispatch.' },
  '/faq': { title:'FAQ — AvaLimo | Frequently Asked Questions', desc:'Answers to common questions about booking, pricing, cancellations & more.' },
  '/policy': { title:'Policy — AvaLimo | Company Policy', desc:'AvaLimo company policy: booking, cancellation, refund & privacy terms.' },
  '/deposit': { title:'Pay Deposit — AvaLimo | Secure Your Reservation', desc:'Secure your AvaLimo reservation with a booking deposit. Fast & secure online payment.' },
'/houston-airport-limo-service': { title:'Houston Airport Limo Service | IAH & Hobby Airport Transfers', desc:'Premium airport limo service in Houston. Flat-rate transfers to IAH & Hobby Airport. Flight tracking, meet & greet, 24/7 availability. Book online or call (832) 567-8050.' },
};
var blogSlug=null;
function openArticleBySlug(slug){
  var featured=document.getElementById('blog-featured');
  if(featured&&featured.getAttribute('data-slug')===slug){
    window.scrollTo(0,featured.offsetTop-80);
    return;
  }
  var cards=document.querySelectorAll('.blog-card[data-slug]');
  for(var i=0;i<cards.length;i++){
    var card=cards[i];
    var content=card.querySelector('.article-content');
    var btn=card.querySelector('.btn');
    if(card.getAttribute('data-slug')===slug){
      if(content&&!content.classList.contains('open')){
        content.classList.add('open');
        if(btn) btn.textContent='Hide Article';
      }
    } else {
      if(content) content.classList.remove('open');
      if(btn) btn.textContent='Read More';
    }
  }
}
function showPage(path){
  var id = 'page-home';
  blogSlug=null;
  if(path==='/services') id='page-services';
  else if(path==='/fleet') id='page-fleet';
  else if(path==='/blog') id='page-blog';
  else if(path.indexOf('/blog/')===0&&path.length>6){id='page-blog';blogSlug=path.substring(6);}
  else if(path==='/flight-status') id='page-flight';
  else if(path==='/contact') id='page-contact';
  else if(path==='/faq') id='page-faq';
  else if(path==='/policy') id='page-policy';
  else if(path==='/book') id='page-book';
  else if(path==='/deposit') id='page-deposit';
  else if(path==='/houston-airport-limo-service') id='page-airport';
  var featured=document.getElementById('blog-featured');
  if(featured) featured.style.display=path==='/blog'?'block':(blogSlug&&featured.getAttribute('data-slug')===blogSlug?'block':'none');
  for(var i=0;i<pages.length;i++) pages[i].style.display='none';
  document.getElementById(id).style.display='block';
  window.scrollTo(0,0);
  if(blogSlug) openArticleBySlug(blogSlug);
  // active nav link
  var links=document.querySelectorAll('.nav-links a');
  for(var i=0;i<links.length;i++){
    links[i].classList.toggle('active',links[i].getAttribute('href')===path);
  }
  // page meta
  var meta=pageMeta[path]||pageMeta['/'];
  document.title=meta.title;
  var descEl=document.querySelector('meta[name="description"]');
  if(descEl) descEl.setAttribute('content',meta.desc);
  var ogTitle=document.querySelector('meta[property="og:title"]');
  if(ogTitle) ogTitle.setAttribute('content',meta.title);
  var ogDesc=document.querySelector('meta[property="og:description"]');
  if(ogDesc) ogDesc.setAttribute('content',meta.desc);
  // init Square card on deposit page
  if(path==='/deposit') setTimeout(initSquareCard,300);
}

// ─── Nav scroll ───
var nav=document.getElementById('nav');
window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>60)});

// ─── Hamburger ───
var hamburger=document.getElementById('hamburger');
var navLinks=document.getElementById('navLinks');
hamburger.addEventListener('click',function(){hamburger.classList.toggle('active');navLinks.classList.toggle('open')});
navLinks.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){hamburger.classList.remove('active');navLinks.classList.remove('open')})});

// ─── Client-side routing ───
function navigate(path){
  history.pushState(null,'',path);
  showPage(path);
  // Animate fade-ups on new page
  setTimeout(function(){
    document.querySelectorAll('#page-'+path.replace('/','')+' .fade-up').forEach(function(el,i){
      setTimeout(function(){el.classList.add('visible')},i*100);
    });
  },50);
}

document.addEventListener('click',function(e){
  var a=e.target.closest('a');
  if(!a) return;
  var href=a.getAttribute('href');
  if(href && href.startsWith('/') && !href.startsWith('//')){
    e.preventDefault();
    navigate(href);
  }
});

window.addEventListener('popstate',function(){showPage(location.pathname)});

// ─── Initial load ───
showPage(location.pathname);
setTimeout(function(){
  document.querySelectorAll('.fade-up').forEach(function(el,i){
    setTimeout(function(){el.classList.add('visible')},i*100);
  });
},100);

// ─── Scroll animations ───
var observer=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.15});
document.querySelectorAll('.fade-up').forEach(function(el){observer.observe(el)});

// ─── Animated stat counters ───
var counterObserver=new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      var el=entry.target;
      var target=parseInt(el.getAttribute('data-target'));
      if(!target) return;
      var current=0;
      var step=Math.ceil(target/60);
      var timer=setInterval(function(){
        current+=step;
        if(current>=target){current=target;clearInterval(timer)}
        el.textContent=target>99?(current/10).toFixed(1):current;
      },20);
      counterObserver.unobserve(el);
    }
  });
},{threshold:.5});
document.querySelectorAll('.counter').forEach(function(el){counterObserver.observe(el)});

// ─── FAQ accordion ───
document.addEventListener('click',function(e){
  var q=e.target.closest('.faq-q');
  if(q){
    var item=q.parentElement;
    item.classList.toggle('open');
  }
});

// ─── Booking form ───
document.getElementById('bookingForm')&&document.getElementById('bookingForm').addEventListener('submit',function(e){
  e.preventDefault();
  var name=document.getElementById('b-name').value;
  var phone=document.getElementById('b-phone').value;
  var body={name:name,phone:phone,email:val('b-email'),pickup:val('b-pickup'),dropoff:val('b-dropoff'),time:val('b-time'),vehicle:val('b-vehicle'),pax:val('b-pax'),notes:val('b-notes')};
  fetch('/api/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  .then(function(r){return r.json()})
  .then(function(d){alert(d.message||'Booking submitted!');this.reset()}.bind(this))
  .catch(function(err){alert('Error submitting booking. Please call (832) 567-8050.')});
});

// ─── Book page form ───
document.getElementById('bookForm')&&document.getElementById('bookForm').addEventListener('submit',function(e){
  e.preventDefault();
  var body={name:val('bk-name'),phone:val('bk-phone'),email:val('bk-email'),pickup:val('bk-pickup'),dropoff:val('bk-dropoff'),time:val('bk-time'),vehicle:val('bk-vehicle'),pax:val('bk-pax'),service:val('bk-service'),flight:val('bk-flight'),notes:val('bk-notes')};
  fetch('/api/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  .then(function(r){return r.json()})
  .then(function(d){
    document.getElementById('bookForm').style.display='none';
    document.getElementById('bk-thanks').style.display='block';
  })
  .catch(function(err){alert('Error submitting. Please call (832) 567-8050.')});
});

// ─── Contact form ───
document.getElementById('contactForm')&&document.getElementById('contactForm').addEventListener('submit',function(e){
  e.preventDefault();
  var btn=this.querySelector('button[type="submit"]');
  btn.textContent='Sending...';btn.disabled=true;
  fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:val('c-name'),email:val('c-email'),phone:val('c-phone'),subject:document.getElementById('c-subject').value,message:val('c-message')})})
  .then(function(r){return r.json()})
  .then(function(d){alert(d.message);document.getElementById('contactForm').reset();})
  .catch(function(){alert('Failed to send. Please call (832) 567-8050.');})
  .finally(function(){btn.textContent='Send Message';btn.disabled=false});
});

function val(id){return document.getElementById(id).value;}

// ─── Chat ───
function toggleChat(){
  var w=document.getElementById('chatWidget');
  w.classList.toggle('open');
  if(w.classList.contains('open')) document.getElementById('chatInput').focus();
}

function sendChat(){
  var input=document.getElementById('chatInput');
  var msg=input.value.trim();
  if(!msg) return;
  input.value='';
  var msgs=document.getElementById('chatMessages');
  var d=document.createElement('div');
  d.className='chat-msg user';
  d.textContent=msg;
  msgs.appendChild(d);
  msgs.scrollTop=msgs.scrollHeight;
  setTimeout(function(){botReply(msg)},600);
}

function botReply(msg){
  var m=msg.toLowerCase();
  function w(word){return new RegExp('\\b'+word+'\\b').test(m);}
  function p(phrase){return m.includes(phrase);}
  var reply='';
  if(p('car seat')||p('child seat')||p('baby seat')||p('booster')) reply='Yes, we offer car seats and booster seats upon request. Just let us know when you book and we\'ll have one installed and ready for you.';
  else if(w('book')||w('ride')||w('reservation')) reply='You can book online at <a href="/book" style="color:#D4AF37">our booking page</a> or call (832) 567-8050. We confirm within minutes!';
  else if(w('price')||w('cost')||w('rate')||w('fare')) reply='Our rates start at $100 for sedans and SUVs. Pricing depends on vehicle and distance. <a href="/book" style="color:#D4AF37">Get a free quote</a> or call (832) 567-8050.';
  else if(w('airport')||w('iah')||w('hobby')||w('flight')) reply='We serve both IAH and Hobby airports with flight tracking included. We monitor your flight so we\'re always on time. Book at <a href="/book" style="color:#D4AF37">avalimo.net/book</a>';
  else if(w('fleet')||w('vehicle')||w('car')||w('s-class')||w('escalade')||w('sprinter')) reply='Our fleet: Mercedes S-Class (3 pax), Cadillac Escalade (6 pax), and Mercedes Sprinter (14 pax). <a href="/fleet" style="color:#D4AF37">View the full fleet</a>';
  else if(w('cancel')||w('refund')||w('deposit')) reply='You can cancel up to 24 hours before for a full refund. See our <a href="/policy" style="color:#D4AF37">Policy page</a> for details.';
  else if(w('hello')||w('hi')||w('hey')) reply='Hello! How can I help you today? You can ask about booking, pricing, our fleet, airport transfers, or anything else!';
  else reply='Thanks for your message! For quick help, call us at (832) 567-8050 or <a href="/book" style="color:#D4AF37">book online here</a>. How else can I assist?';

  var msgs=document.getElementById('chatMessages');
  var d=document.createElement('div');
  d.className='chat-msg bot';
  d.innerHTML=reply;
  msgs.appendChild(d);
  msgs.scrollTop=msgs.scrollHeight;
}

// ─── Blog article toggle ───
function toggleArticle(btn){
  var content=btn.parentElement.querySelector('.article-content');
  content.classList.toggle('open');
  btn.textContent=content.classList.contains('open')?'Hide Article':'Read More';
}

// ─── Flight Tracking ───
function trackFlight(){
  var input=document.getElementById('flight-input').value.trim().replace(/\s+/g,'').toUpperCase();
  if(!input){alert('Enter a flight number (e.g. UA1234)');return;}
  var result=document.getElementById('flight-result');
  var badge=document.getElementById('fr-status');
  badge.innerHTML='&#8987; Searching...';
  result.classList.add('visible');
  fetch('/api/flight?q='+encodeURIComponent(input))
  .then(function(r){return r.json()})
  .then(function(d){
    if(d.status==='error'){alert(d.message);result.classList.remove('visible');return;}
    document.getElementById('fr-number').textContent=d.flight;
    document.getElementById('fr-airline').textContent=d.airline||'—';
    document.getElementById('fr-route').textContent=d.route||'—';
    document.getElementById('fr-sched').textContent=d.sched||'—';
    document.getElementById('fr-est').textContent=d.est||'—';
    if(d.status==='on-time'){badge.className='status-badge on-time';badge.innerHTML='● On Time';}
    else if(d.status==='delayed'){badge.className='status-badge delayed';badge.innerHTML='● Delayed';}
    else if(d.status==='landed'){badge.className='status-badge landed';badge.innerHTML='● Landed';}
    else{badge.className='status-badge on-time';badge.innerHTML='● '+d.status;}
    document.getElementById('fr-gate').textContent=d.gate||'—';
    document.getElementById('fr-term').textContent=d.term||'—';
  })
  .catch(function(){alert('Could not fetch flight data. Try again later.');result.classList.remove('visible');});
}

// ─── Deposit ───
var sqCard=null;
function initSquareCard(){
  var page=document.getElementById('page-deposit');
  var appId=page.getAttribute('data-sq-app-id');
  var locId=page.getAttribute('data-sq-loc-id');
  if(!appId||appId==='') return;
  if(!window.Square){setTimeout(initSquareCard,500);return;}
  if(sqCard) return;
  var payments=window.Square.payments(appId,locId);
  payments.card().then(function(c){
    sqCard=c;
    sqCard.attach('#square-card');
  }).catch(function(e){console.error('Square card init error:',e)});
}

function setDeposit(amount){
  document.querySelectorAll('.amount-presets button').forEach(function(b){b.classList.remove('active')});
  if(amount===0){document.getElementById('dep-custom').classList.add('active');return;}
  document.getElementById('dep-amount').value=amount;
  document.getElementById('dep-'+amount).classList.add('active');
}

function updateDepositPresets(val){
  document.querySelectorAll('.amount-presets button').forEach(function(b){b.classList.remove('active')});
  var presets=[50,100,250,500,1000];
  if(presets.indexOf(parseInt(val))>=0) document.getElementById('dep-'+parseInt(val)).classList.add('active');
  else document.getElementById('dep-custom').classList.add('active');
}

function processSquarePayment(){
  var btn=document.getElementById('dep-pay-btn');
  var amount=document.getElementById('dep-amount').value;
  if(!amount||parseFloat(amount)<=0){alert('Enter a valid deposit amount.');return;}
  var name=document.getElementById('dep-name').value.trim();
  if(!name){alert('Enter the cardholder name.');return;}
  if(!sqCard){alert('Square is loading. Please wait.');return;}
  btn.disabled=true;btn.textContent='Processing...';
  document.getElementById('sq-errors').style.display='none';
  document.getElementById('dep-processing').style.display='block';

  sqCard.tokenize().then(function(res){
    if(res.status==='OK'){
      var cents=Math.round(parseFloat(amount)*100);
      fetch('/api/square-pay',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          source_id:res.token,
          amount:cents,
          name:name,
          email:document.getElementById('dep-email').value
        })
      }).then(function(r){return r.json()}).then(function(d){
        document.getElementById('dep-processing').style.display='none';
        if(d.status==='ok'){
          document.querySelector('.pay-fields').style.display='none';
          document.getElementById('dep-thanks-msg').textContent='Payment of $'+amount+' received. '+d.message;
          document.getElementById('dep-thanks').style.display='block';
        } else {
          btn.disabled=false;btn.textContent='Pay Deposit';
          var errEl=document.getElementById('sq-errors');
          errEl.textContent=d.message||'Payment failed. Try again.';
          errEl.style.display='block';
        }
      }).catch(function(){
        btn.disabled=false;btn.textContent='Pay Deposit';
        document.getElementById('dep-processing').style.display='none';
        alert('Network error. Please try again.');
      });
    } else {
      btn.disabled=false;btn.textContent='Pay Deposit';
      document.getElementById('dep-processing').style.display='none';
      var errEl=document.getElementById('sq-errors');
      errEl.textContent=res.errors&&res.errors[0]?res.errors[0].detail:'Card information is invalid.';
      errEl.style.display='block';
    }
  }).catch(function(e){
    btn.disabled=false;btn.textContent='Pay Deposit';
    document.getElementById('dep-processing').style.display='none';
    console.error('Tokenize error:',e);
  });
}
</script>
</body>
</html>"""

@app.route("/index.html")
@app.route("/index.htm")
@app.route("/home")
@app.route("/index")
def redirect_home():
    return redirect("/", code=301)

@app.route("/robots.txt")
def robots_txt():
    return "User-agent: *\nAllow: /\nSitemap: https://avalimo.net/sitemap.xml", 200, {"Content-Type": "text/plain"}

@app.route("/sitemap.xml")
def sitemap_xml():
    today = "2026-06-08"
    pages = [
        ("", today),
        ("services", today),
        ("fleet", today),
        ("book", today),
        ("blog", today),
        ("flight-status", today),
        ("contact", today),
        ("faq", today),
        ("policy", today),
        ("deposit", today),
        ("houston-airport-limo-service", today),
    ]
    # Add blog posts to sitemap
    for post in BLOG_POSTS:
        pages.append((f"blog/{post['slug']}", post['date']))
    
    urls = "\n".join(f'<url><loc>https://avalimo.net/{p[0]}</loc><lastmod>{p[1]}</lastmod></url>' for p in pages)
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
</urlset>'''
    return xml, 200, {"Content-Type": "application/xml"}

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    page_meta = {
        "": { "title": "AvaLimo — Houston Premier Limo Service | IAH & Hobby Airport Transfers", "desc": "Houston's most trusted chauffeur service. Airport transfers for IAH & Hobby, corporate travel, weddings, events — 24/7 with zero surge pricing. Book online in 30 seconds.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "services": { "title": "Services — AvaLimo | Houston Limo & Chauffeur Service", "desc": "Airport transfers, corporate travel, wedding limo, event transportation & more. Houston's premium chauffeur service — 24/7.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "fleet": { "title": "Our Fleet — AvaLimo | Luxury Sedans, SUVs & Sprinter Vans", "desc": "Mercedes S-Class, Cadillac Escalade & Mercedes Sprinter. Houston's finest luxury fleet for any occasion.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "book": { "title": "Book a Ride — AvaLimo | Online Reservation", "desc": "Reserve your Houston luxury chauffeur service online in 30 seconds. Airport transfers, corporate & events — 24/7.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "blog": { "title": "Blog — AvaLimo | Houston Limo Service Guides & Travel Tips", "desc": "Expert guides on Houston airport transfers, wedding limo tips, corporate travel, and luxury transportation. Daily articles from Houston's premier chauffeur service.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "flight-status": { "title": "Flight Status — AvaLimo | Real-Time Flight Tracker", "desc": "Track your flight in real-time. Free flight status tool for IAH, Hobby & all airlines.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "contact": { "title": "Contact — AvaLimo | Houston Limo Service", "desc": "Get in touch with AvaLimo. Call (832) 567-8050 or message us online. 24/7 dispatch.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "faq": { "title": "FAQ — AvaLimo | Frequently Asked Questions", "desc": "Answers to common questions about booking, pricing, cancellations & more.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "policy": { "title": "Policy — AvaLimo | Company Policy", "desc": "AvaLimo company policy: booking, cancellation, refund & privacy terms.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "deposit": { "title": "Pay Deposit — AvaLimo | Secure Your Reservation", "desc": "Secure your AvaLimo reservation with a booking deposit. Fast & secure online payment.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "houston-airport-limo-service": { "title": "Houston Airport Limo Service | IAH & Hobby Airport Transfers | AvaLimo", "desc": "Premium airport limo service in Houston. Flat-rate transfers to IAH & Hobby Airport. Flight tracking, meet & greet, 24/7 availability. Book online in 60 seconds. Call (832) 567-8050.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "company-policy": { "title": "Company Policy — AvaLimo | Houston Limo Service", "desc": "AvaLimo company policy: booking terms, cancellation rules, refund policy, and privacy practices for Houston limo service.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "terms-and-conditions": { "title": "Terms and Conditions — AvaLimo | Houston Limo Service", "desc": "Read AvaLimo terms and conditions. By booking our Houston limo service, you agree to these policies.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "cancellation-policy": { "title": "Cancellation Policy — AvaLimo | Houston Transportation", "desc": "AvaLimo cancellation policy for Houston limo reservations. Learn about refunds, notice periods, and no-show fees.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "book-your-ride": { "title": "Book Your Ride — AvaLimo | Online Limo Reservation", "desc": "Book your Houston luxury limo ride online in 30 seconds. Airport transfers, corporate travel, weddings, and special events.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "booking-confirmed": { "title": "Booking Confirmed — AvaLimo | Houston Limo Service", "desc": "Your AvaLimo reservation has been received. A confirmation email has been sent with your trip details.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
        "pay-deposit": { "title": "Pay Deposit — AvaLimo | Secure Online Payment", "desc": "Pay your AvaLimo reservation deposit securely online. We accept all major credit cards.", "og_type": "website", "og_image": "https://avalimo.net/static/chauffeur_service.png" },
    }
    meta = page_meta.get(path, page_meta[""])
    canonical = f"https://avalimo.net/{path}" if path else "https://avalimo.net"
    posts = _get_blog_posts()
    featured_post = None
    og_type = meta.get("og_type", "website")
    og_image = meta.get("og_image", "https://avalimo.net/static/chauffeur_service.png")
    if path.startswith("blog/") and len(path) > 5:
        slug = path[5:]
        for p in posts:
            if p.get("slug") == slug:
                meta = {"title": p["title"] + " — AvaLimo", "desc": p.get("summary", "")}
                canonical = f"https://avalimo.net/blog/{slug}"
                og_type = "article"
                og_image = f"https://avalimo.net{p.get('image', '/static/chauffeur_service.png')}"
                featured_post = p
                break
    html = HTML.replace("{{ sq_app_id }}", SQ_APP_ID).replace("{{ sq_location_id }}", SQ_LOCATION_ID).replace("{{ ga_id }}", GA_ID).replace("{{ sc_meta }}", SC_META).replace("{{ fb_pixel }}", FB_PIXEL)
    html = html.replace("{{ title }}", meta["title"]).replace("{{ meta_desc }}", meta["desc"]).replace("{{ canonical_url }}", canonical).replace("{{ og_type }}", og_type).replace("{{ og_image }}", og_image)
    return render_template_string(html, blog_posts=posts, featured_post=featured_post)


@app.route("/api/book", methods=["POST"])
def book_ride():
    data = request.get_json() or {}
    send_booking_email(data)
    return jsonify({"status": "ok", "message": "Booking received! We'll confirm your ride shortly."})


@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json() or {}
    send_contact_email(data)
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


# Trip Management API (for Telegram bot integration)
TRIPS_FILE = os.path.join(os.path.dirname(__file__), "trips.json")

def load_trips():
    """Load all trips from JSON file"""
    if os.path.exists(TRIPS_FILE):
        with open(TRIPS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_trips(trips):
    """Save all trips to JSON file"""
    with open(TRIPS_FILE, 'w') as f:
        json.dump(trips, f, indent=2)

@app.route("/api/trips", methods=["POST"])
def create_trip():
    """Create a new trip from Telegram bot"""
    data = request.get_json() or {}
    
    # Validate required fields
    required = ['customer_name', 'pickup_location', 'dropoff_location']
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({
            "status": "error",
            "message": f"Missing required fields: {', '.join(missing)}"
        }), 400
    
    # Create trip record
    trip = {
        "id": str(uuid.uuid4()),
        "customer_name": data.get("customer_name", ""),
        "pickup_location": data.get("pickup_location", ""),
        "dropoff_location": data.get("dropoff_location", ""),
        "pickup_time": data.get("pickup_time", ""),
        "vehicle_type": data.get("vehicle_type", "Standard"),
        "driver": data.get("driver", "Unassigned"),
        "status": "pending",
        "created_at": str(uuid.uuid4().node),  # Simple timestamp
        "source": "telegram_bot"
    }
    
    # Save to file
    trips = load_trips()
    trips.append(trip)
    save_trips(trips)
    
    print(f"\n{'='*50}")
    print(f"New Trip Created via Telegram Bot")
    print(f"Customer: {trip['customer_name']}")
    print(f"Route: {trip['pickup_location']} → {trip['dropoff_location']}")
    print(f"Time: {trip['pickup_time']}")
    print(f"Vehicle: {trip['vehicle_type']}")
    print(f"Driver: {trip['driver']}")
    print(f"{'='*50}\n")
    
    return jsonify({
        "status": "success",
        "message": "Trip created successfully",
        "trip_id": trip["id"]
    }), 201

@app.route("/api/trips", methods=["GET"])
def get_trips():
    """Get all trips (for admin dashboard)"""
    trips = load_trips()
    # Sort by created_at descending
    trips.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return jsonify({
        "status": "success",
        "trips": trips,
        "count": len(trips)
    })

@app.route("/api/trips/<trip_id>", methods=["PUT"])
def update_trip(trip_id):
    """Update a trip (change status, driver, etc.)"""
    data = request.get_json() or {}
    trips = load_trips()
    
    # Find and update trip
    for trip in trips:
        if trip["id"] == trip_id:
            # Update allowed fields
            if "status" in data:
                trip["status"] = data["status"]
            if "driver" in data:
                trip["driver"] = data["driver"]
            if "notes" in data:
                trip["notes"] = data["notes"]
            
            save_trips(trips)
            return jsonify({
                "status": "success",
                "message": "Trip updated successfully",
                "trip": trip
            })
    
    return jsonify({
        "status": "error",
        "message": "Trip not found"
    }), 404

@app.route("/admin/trips")
def admin_trips_page():
    """Admin page to view and manage trips"""
    trips = load_trips()
    trips.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    html = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Trip Management | AvaLimo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; }
        .header { background: #1a1a2e; color: white; padding: 20px; }
        .header h1 { font-size: 24px; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
        .stat-card .number { font-size: 32px; font-weight: bold; color: #1a1a2e; }
        .trip-table { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 15px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; color: #333; }
        tr:hover { background: #f8f9fa; }
        .status { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-confirmed { background: #d4edda; color: #155724; }
        .status-completed { background: #d1ecf1; color: #0c5460; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        .btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; }
        .btn-confirm { background: #28a745; color: white; }
        .btn-complete { background: #17a2b8; color: white; }
        .btn-cancel { background: #dc3545; color: white; }
        .btn:hover { opacity: 0.9; }
        .actions { display: flex; gap: 8px; }
        .empty { text-align: center; padding: 60px; color: #666; }
        .refresh-btn { background: #1a1a2e; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px; }
        @media (max-width: 768px) {
            .stats { grid-template-columns: 1fr 1fr; }
            table { font-size: 12px; }
            th, td { padding: 10px 8px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚗 AvaLimo Trip Management</h1>
    </div>
    <div class="container">
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Trips</h3>
                <div class="number">''' + str(len(trips)) + '''</div>
            </div>
            <div class="stat-card">
                <h3>Pending</h3>
                <div class="number">''' + str(sum(1 for t in trips if t.get('status') == 'pending')) + '''</div>
            </div>
            <div class="stat-card">
                <h3>Confirmed</h3>
                <div class="number">''' + str(sum(1 for t in trips if t.get('status') == 'confirmed')) + '''</div>
            </div>
            <div class="stat-card">
                <h3>Completed</h3>
                <div class="number">''' + str(sum(1 for t in trips if t.get('status') == 'completed')) + '''</div>
            </div>
        </div>
        
        <div class="trip-table">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Route</th>
                        <th>Time</th>
                        <th>Vehicle</th>
                        <th>Driver</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
'''
    
    for trip in trips:
        status_class = f"status-{trip.get('status', 'pending')}"
        html += f'''
                    <tr>
                        <td><code>{trip['id'][:8]}</code></td>
                        <td><strong>{trip.get('customer_name', 'N/A')}</strong></td>
                        <td>{trip.get('pickup_location', 'N/A')} → {trip.get('dropoff_location', 'N/A')}</td>
                        <td>{trip.get('pickup_time', 'N/A')}</td>
                        <td>{trip.get('vehicle_type', 'Standard')}</td>
                        <td>{trip.get('driver', 'Unassigned')}</td>
                        <td><span class="status {status_class}">{trip.get('status', 'pending').upper()}</span></td>
                        <td class="actions">
                            <button class="btn btn-confirm" onclick="updateTrip('{trip['id']}', 'confirmed')">✓</button>
                            <button class="btn btn-complete" onclick="updateTrip('{trip['id']}', 'completed')">✓✓</button>
                            <button class="btn btn-cancel" onclick="updateTrip('{trip['id']}', 'cancelled')">✗</button>
                        </td>
                    </tr>
        '''
    
    if not trips:
        html += '''
                    <tr>
                        <td colspan="8" class="empty">
                            <h3>No trips yet</h3>
                            <p>Trips from Telegram will appear here</p>
                        </td>
                    </tr>
        '''
    
    html += '''
                </tbody>
            </table>
        </div>
    </div>
    
    <script>
        async function updateTrip(tripId, newStatus) {
            try {
                const response = await fetch('/api/trips/' + tripId, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({status: newStatus})
                });
                const result = await response.json();
                if (result.status === 'success') {
                    location.reload();
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (e) {
                alert('Error updating trip');
            }
        }
    </script>
</body>
</html>
'''
    
    return render_template_string(html)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5002
    print(f"AvaLimo site running on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
