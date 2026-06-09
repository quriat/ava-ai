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
BLOG_POSTS = json.load(open(_blog_path)) if os.path.exists(_blog_path) else []

HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ title }}</title>
<meta name="description" content="{{ meta_desc }}">
<meta name="keywords" content="Houston limo, IAH airport transfer, Hobby airport car service, luxury chauffeur Houston, corporate car service Houston, wedding limo Houston, AvaLimo">
<meta name="robots" content="index, follow">
<meta name="geo.region" content="US-TX">
<meta name="geo.placename" content="Houston">
<meta name="theme-color" content="#0a0a0a">
<link rel="canonical" href="{{ canonical_url }}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="{{ title }}">
<meta property="og:description" content="{{ meta_desc }}">
<meta property="og:url" content="{{ canonical_url }}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://avalimo.net/static/chauffeur_service.webp">
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
  "image": "https://avalimo.net/static/chauffeur_service.webp",
  "url": "https://avalimo.net",
  "telephone": "+18325678050",
  "email": "adam@avalimo.net",
  "description": "Houston premier limo service offering airport transfers, corporate travel, weddings, and event transportation.",
  "areaServed": ["Houston","IAH","Hobby Airport","Sugar Land","The Woodlands","Katy","Pearland","Missouri City","Galveston","League City","Baytown","Spring","Cypress"],
  "openingHours": "Mo-Su 00:00-24:00",
  "priceRange": "$$$",
  "address": { "@type": "PostalAddress", "addressLocality": "Houston", "addressRegion": "TX", "addressCountry": "US" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "500", "bestRating": "5" },
  "sameAs": [],
  "geo": { "@type": "GeoCoordinates", "latitude": 29.7604, "longitude": -95.3698 },
  "hasMap": "https://maps.google.com/?q=Houston+TX",
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card"]
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
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://avalimo.net/" },
    { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://avalimo.net/services" },
    { "@type": "ListItem", "position": 3, "name": "Fleet", "item": "https://avalimo.net/fleet" },
    { "@type": "ListItem", "position": 4, "name": "Book", "item": "https://avalimo.net/book" },
    { "@type": "ListItem", "position": 5, "name": "Blog", "item": "https://avalimo.net/blog" },
    { "@type": "ListItem", "position": 6, "name": "Contact", "item": "https://avalimo.net/contact" },
    { "@type": "ListItem", "position": 7, "name": "FAQ", "item": "https://avalimo.net/faq" }
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How do I book a ride?", "acceptedAnswer": { "@type": "Answer", "text": "You can book online using our booking form, call us at (832) 567-8050, or email adam@avalimo.net. Online booking is fastest — just fill in your details and we'll confirm within minutes." } },
    { "@type": "Question", "name": "Do you service both IAH and Hobby airports?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! We cover both George Bush Intercontinental (IAH) and William P. Hobby (HOU) airports. We also serve all surrounding areas including Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring, and Cypress." } },
    { "@type": "Question", "name": "Do you track flights for airport pickups?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. We monitor your flight in real-time so we're always there when you land — even if your flight is early or delayed. No extra charge." } },
    { "@type": "Question", "name": "What vehicles do you offer?", "acceptedAnswer": { "@type": "Answer", "text": "Our fleet includes the Mercedes S-Class (up to 3 passengers), Cadillac Escalade SUV (up to 6 passengers), and Mercedes Sprinter (up to 14 passengers). All vehicles are immaculately maintained." } },
    { "@type": "Question", "name": "How much does it cost?", "acceptedAnswer": { "@type": "Answer", "text": "Pricing depends on vehicle type, distance, and duration. We offer transparent flat-rate pricing with zero surge fees. Contact us for a quote — we typically respond within minutes." } },
    { "@type": "Question", "name": "Do you require a deposit?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, a booking deposit is required to secure your reservation. The deposit is fully refundable with 24-hour cancellation notice. See our Company Policy for details." } },
    { "@type": "Question", "name": "Can I cancel or modify my booking?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can cancel or modify your booking up to 24 hours before the scheduled pickup time for a full refund. Late cancellations may incur a fee." } },
    { "@type": "Question", "name": "Are your drivers licensed and insured?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Every AvaLimo chauffeur is fully licensed, insured, and professionally trained. We conduct thorough background checks and regular vehicle inspections." } },
    { "@type": "Question", "name": "Do you provide car seats for children?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, we can provide car seats upon request. Please let us know at the time of booking so we can ensure proper installation." } }
  ]
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    { "@type": "Review", "position": 1, "itemReviewed": { "@type": "LocalBusiness", "name": "AvaLimo" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "author": { "@type": "Person", "name": "James R." }, "reviewBody": "Service was impeccable. Our chauffeur was professional and the car was spotless." },
    { "@type": "Review", "position": 2, "itemReviewed": { "@type": "LocalBusiness", "name": "AvaLimo" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "author": { "@type": "Person", "name": "Sarah M." }, "reviewBody": "Best limo service in Houston! On time, very polite, and the vehicle was amazingly comfortable." },
    { "@type": "Review", "position": 3, "itemReviewed": { "@type": "LocalBusiness", "name": "AvaLimo" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" }, "author": { "@type": "Person", "name": "Michael B." }, "reviewBody": "From easy booking to arrival — everything was perfect. Thank you AvaLimo!" }
  ]
}
</script>
<script src="https://web.squarecdn.com/v1/square.js" defer></script>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap">
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
<link rel="stylesheet" href="/static/styles.css">
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
<div id="scrollBar"></div>

<!-- ─── Nav ─── -->
<nav id="nav">
<div class="container">
  <a href="/" class="nav-logo">Ava<span>Limo</span></a>
  <ul class="nav-links" id="navLinks">
    <li><a href="/">Home</a></li>
    <li><a href="/services">Services</a></li>
    <li><a href="/fleet">Fleet</a></li>
    <li><a href="/blog">Blog</a></li>
    <li><a href="/flight-status">Flight Status</a></li>
    <li><a href="/contact">Contact</a></li>
    <li><a href="/faq">FAQ</a></li>
    <li><a href="/deposit">Pay Deposit</a></li>
  </ul>
  <div class="nav-cta">
    <div class="phone"><a href="tel:+18325678050">(832) 567-8050</a> <small>24/7 Dispatch</small></div>
    <a href="/book" class="btn btn-gold">Book Now</a>
  </div>
  <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
</div>
</nav>

<!-- ─── PAGE: HOME ─── -->
<div class="page" id="page-home">

<section class="hero">
  <div class="hero-bg"><div class="hero-grid"></div></div>
  <div class="hero-moving"><span></span><span></span><span></span></div>
  <div class="container">
    <div class="hero-text">
      <div class="badge"><span class="dot"></span> Houston's Premier Chauffeur Service</div>
      <h1><span class="line">Arrive in</span> <span class="line">Absolute Luxury</span></h1>
      <p>Houston's most trusted chauffeur service. Airport transfers, corporate travel, weddings and events — 24/7 with zero surge pricing.</p>
      <div class="hero-btns">
        <a href="/book" class="btn btn-gold">Book Your Ride</a>
        <a href="/fleet" class="btn btn-outline">View Fleet</a>
      </div>
    </div>
    <div class="hero-image">
      <div class="glow"></div>
      <img src="/static/chauffeur_service.webp" alt="AvaLimo black luxury sedan parked elegantly" width="550" height="550">
    </div>
  </div>
</section>

<!-- Stats -->
<section class="stats-bar">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-item fade-up"><div class="stat-number">500+</div><div class="stat-label">Happy Clients</div></div>
      <div class="stat-item fade-up"><div class="stat-number">4.9★</div><div class="stat-label">Avg Rating</div></div>
      <div class="stat-item fade-up"><div class="stat-number">24/7</div><div class="stat-label">Available</div></div>
      <div class="stat-item fade-up"><div class="stat-number">$0</div><div class="stat-label">Surge Fees</div></div>
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
      <div class="fleet-card fade-up">
        <div class="img-wrap"><span class="tag">Executive</span><img src="/static/mercedes_sclass.webp" alt="Mercedes S-Class luxury sedan" loading="lazy" width="640" height="640"></div>
        <div class="body">
          <h3>Executive</h3>
          <div class="capacity">&#9679; Mercedes S-Class &middot; Up to 3 passengers</div>
          <p>The pinnacle of executive comfort. Perfect for corporate travel and airport transfers.</p>
          <a href="/book" class="btn btn-gold">Book Now</a>
        </div>
      </div>
      <div class="fleet-card fade-up" style="transition-delay:.15s">
        <div class="img-wrap"><span class="tag">Popular</span><img src="/static/cadillac_escalade.webp" alt="Cadillac Escalade luxury SUV" loading="lazy" width="640" height="640"></div>
        <div class="body">
          <h3>SUV</h3>
          <div class="capacity">&#9679; Cadillac Escalade &middot; Up to 6 passengers</div>
          <p>Spacious luxury SUV ideal for groups, families, or when you need extra comfort.</p>
          <a href="/book" class="btn btn-gold">Book Now</a>
        </div>
      </div>
      <div class="fleet-card fade-up" style="transition-delay:.3s">
        <div class="img-wrap"><span class="tag">Groups</span><img src="/static/mercedes_sprinter.webp" alt="Mercedes Sprinter passenger van" loading="lazy" width="640" height="640"></div>
        <div class="body">
          <h3>Sprinter</h3>
          <div class="capacity">&#9679; Mercedes Sprinter &middot; Up to 14 passengers</div>
          <p>The ultimate group vehicle. High ceilings, plush seating, full luxury amenities.</p>
          <a href="/book" class="btn btn-gold">Book Now</a>
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
    <div class="test-carousel fade-up">
      <div class="test-track" id="testTrack">
        <div class="test-card">
          <div class="stars">★★★★★</div>
          <p>"Service was impeccable. Our chauffeur was professional and the car was spotless."</p>
          <div class="author"><div class="avatar">JR</div><div><div class="name">James R.</div><div class="title">Airport Transfer</div></div></div>
        </div>
        <div class="test-card">
          <div class="stars">★★★★★</div>
          <p>"Best limo service in Houston! On time, very polite, and the vehicle was amazingly comfortable."</p>
          <div class="author"><div class="avatar">SM</div><div><div class="name">Sarah M.</div><div class="title">Corporate Client</div></div></div>
        </div>
        <div class="test-card">
          <div class="stars">★★★★★</div>
          <p>"From easy booking to arrival — everything was perfect. Thank you AvaLimo!"</p>
          <div class="author"><div class="avatar">MB</div><div><div class="name">Michael B.</div><div class="title">Wedding</div></div></div>
        </div>
      </div>
      <div class="test-dots" id="testDots"></div>
    </div>
  </div>
</section>

<!-- Google Reviews -->
<section class="section reviews-section">
  <div class="container">
    <div class="section-header fade-up">
      <div class="subtitle">Reviews</div>
      <h2>What Google <span class="gold">Says</span></h2>
      <p>Our clients consistently rate us 5 stars for quality, punctuality, and service.</p>
    </div>
    <div class="reviews-summary fade-up">
      <div class="avg-rating">5.0 <span>/ 5</span></div>
      <div class="big-stars">★★★★★</div>
      <div class="total-reviews">Based on Google reviews</div>
    </div>
    <div class="reviews-grid fade-up">
      <div class="rev-card">
        <div class="rev-stars">★★★★★</div>
        <p>"Incredible service from start to finish. The vehicle was immaculate and our driver was professional and courteous. Will definitely use again!"</p>
        <div class="rev-author">— David M.</div>
        <div class="rev-date">2 weeks ago</div>
      </div>
      <div class="rev-card">
        <div class="rev-stars">★★★★★</div>
        <p>"Best airport transfer experience I've ever had. Flight was delayed and they were still waiting when I arrived. So glad I found AvaLimo."</p>
        <div class="rev-author">— Jennifer K.</div>
        <div class="rev-date">1 month ago</div>
      </div>
      <div class="rev-card">
        <div class="rev-stars">★★★★★</div>
        <p>"Used them for my wedding — absolutely perfect. The S-Class was stunning and the chauffeur helped with everything. Couldn't recommend more."</p>
        <div class="rev-author">— Michael &amp; Sarah T.</div>
        <div class="rev-date">3 weeks ago</div>
      </div>
    </div>
    <div class="rev-cta fade-up">
      <p>Love AvaLimo? Help others discover us by leaving a review on Google.</p>
      <a href="https://g.page/r/CVgUaFV7t4-8EBM/review" target="_blank" rel="noopener" class="btn btn-gold google-icon">&#9733; Write a Review on Google</a>
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
      <!-- Quick Booking Form -->
      <div class="quote-card" id="hpQuoteCard">
        <h3>&#128270; Quick Booking</h3>
        <div class="booking-form" style="margin-bottom:16px">
          <div class="full"><label>Pickup Location</label><input type="text" id="hp-pickup" placeholder="Address, airport, hotel..." required></div>
          <div class="full"><label>Dropoff Location</label><input type="text" id="hp-dropoff" placeholder="Address, airport, venue..." required></div>
          <div><label>Date &amp; Time</label><input type="datetime-local" id="hp-time" required></div>
          <div><label>Vehicle</label><select id="hp-vehicle"><option value="Sedan">Sedan (1-3) — Mercedes S-Class</option><option value="SUV">SUV (1-6) — Cadillac Escalade</option><option value="Sprinter">Sprinter (1-14) — Mercedes Sprinter</option></select></div>
        </div>
        <button class="btn btn-primary" onclick="hpExpandForm()" style="width:100%;font-size:16px;padding:16px">Continue &darr;</button>
      </div>
      <!-- Full Form -->
      <form class="booking-form quote-form-expand" id="hpFormExpand">
        <div class="full"><label>Your Name</label><input type="text" id="hp-name" required></div>
        <div><label>Phone</label><input type="tel" id="hp-phone" required></div>
        <div><label>Email</label><input type="email" id="hp-email"></div>
        <div><label>Passengers</label><input type="number" id="hp-pax" min="1" max="14" value="1"></div>
        <div class="full"><label>Special Requests</label><textarea id="hp-notes" rows="3" placeholder="Car seats, luggage details, extra stops, etc."></textarea></div>
        <div class="full" style="text-align:center;margin-top:8px">
          <button type="submit" class="btn btn-gold" style="font-size:16px;padding:16px 48px">Submit Booking Request</button>
        </div>
      </form>
      <div id="hp-thanks" style="display:none;text-align:center;padding:40px 20px">
        <div style="font-size:48px;margin-bottom:16px">&#10003;</div>
        <h3 style="margin-bottom:8px">Booking <span class="gold">Submitted</span></h3>
        <p style="color:var(--text2);font-size:14px">We'll confirm your ride shortly. Call <a href="tel:+18325678050" style="color:var(--gold)">(832) 567-8050</a> for immediate assistance.</p>
      </div>
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
      <div class="areas">Serving Houston, IAH, Hobby Airport, Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring &amp; Cypress.</div>
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
  <div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring &amp; Cypress.</div></div>
</div>
</footer>
</div>

<!-- ─── PAGE: FLEET ─── -->
<div class="page" id="page-fleet" style="display:none">
<div class="page-header"><div class="container"><h2>Our <span class="gold">Fleet</span></h2><p>Every vehicle meticulously maintained for your comfort and safety.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="fleet-grid">
      <div class="fleet-card fade-up">
        <div class="img-wrap"><span class="tag">Executive</span><img src="/static/mercedes_sclass.webp" alt="Mercedes S-Class luxury sedan" loading="lazy" width="640" height="640"></div>
        <div class="body">
          <h3>Mercedes S-Class</h3>
          <div class="capacity">&#9679; Up to 3 passengers</div>
          <p>The pinnacle of executive comfort. Features leather seating, ambient lighting, and a quiet cabin — perfect for airport transfers and corporate travel.</p>
          <a href="/book" class="btn btn-gold">Book Now</a>
        </div>
      </div>
      <div class="fleet-card fade-up" style="transition-delay:.15s">
        <div class="img-wrap"><span class="tag">Popular</span><img src="/static/cadillac_escalade.webp" alt="Cadillac Escalade luxury SUV" loading="lazy" width="640" height="640"></div>
        <div class="body">
          <h3>Cadillac Escalade</h3>
          <div class="capacity">&#9679; Up to 6 passengers</div>
          <p>Our most popular choice. Spacious, powerful, and packed with premium amenities. Ideal for groups, families, and VIP airport transfers.</p>
          <a href="/book" class="btn btn-gold">Book Now</a>
        </div>
      </div>
      <div class="fleet-card fade-up" style="transition-delay:.3s">
        <div class="img-wrap"><span class="tag">Groups</span><img src="/static/mercedes_sprinter.webp" alt="Mercedes Sprinter passenger van" loading="lazy" width="640" height="640"></div>
        <div class="body">
          <h3>Mercedes Sprinter</h3>
          <div class="capacity">&#9679; Up to 14 passengers</div>
          <p>The ultimate group vehicle. High ceilings, plush reclining seats, ambient lighting, and premium sound system. Perfect for weddings, tours, and groups.</p>
          <a href="/book" class="btn btn-gold">Book Now</a>
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
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring &amp; Cypress.</div></div></div>
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
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring &amp; Cypress.</div></div></div></footer>
</div>

<!-- ─── PAGE: FAQ ─── -->
<div class="page" id="page-faq" style="display:none">
<div class="page-header"><div class="container"><h2>Frequently Asked <span class="gold">Questions</span></h2></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="faq-list">
      <div class="faq-item fade-up"><div class="faq-q"><span>How do I book a ride?</span><span class="arrow">&#9660;</span></div><div class="faq-a">You can book online using our booking form, call us at (832) 567-8050, or email adam@avalimo.net. Online booking is fastest — just fill in your details and we'll confirm within minutes.</div></div>
      <div class="faq-item fade-up" style="transition-delay:.1s"><div class="faq-q"><span>Do you service both IAH and Hobby airports?</span><span class="arrow">&#9660;</span></div><div class="faq-a">Yes! We cover both George Bush Intercontinental (IAH) and William P. Hobby (HOU) airports. We also serve all surrounding areas including Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring, and Cypress.</div></div>
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
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring &amp; Cypress.</div></div></div></footer>
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
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring &amp; Cypress.</div></div></div></footer>
</div>

<!-- ─── PAGE: BOOK ─── -->
<div class="page" id="page-book" style="display:none">
<div class="page-header"><div class="container"><h2>Book Your <span class="gold">Ride</span></h2><p>Get a price in seconds — then complete your booking.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="booking-wrap fade-up" style="max-width:700px">

      <!-- Quick Booking Form -->
      <div class="quote-card" id="quoteCard">
        <h3>&#128270; Quick Booking</h3>
        <div class="quote-presets">
          <button type="button" onclick="setPickup('IAH - George Bush Intercontinental')">&#9992; IAH Airport</button>
          <button type="button" onclick="setPickup('HOU - William P. Hobby')">&#9992; Hobby Airport</button>
          <button type="button" onclick="setPickup('Downtown Houston')">&#127963; Downtown</button>
          <button type="button" onclick="setPickup('The Galleria')">&#128092; Galleria</button>
          <button type="button" onclick="setPickup('Texas Medical Center')">&#127973; Med Center</button>
        </div>
        <div class="booking-form" style="margin-bottom:16px">
          <div class="full"><label>Pickup Location</label><input type="text" id="q-pickup" placeholder="Address, airport, hotel..." required></div>
          <div class="full"><label>Dropoff Location</label><input type="text" id="q-dropoff" placeholder="Address, airport, venue..." required></div>
          <div><label>Date &amp; Time</label><input type="datetime-local" id="q-time" required></div>
          <div><label>Vehicle</label><select id="q-vehicle"><option value="Sedan">Sedan (1-3) — Mercedes S-Class</option><option value="SUV">SUV (1-6) — Cadillac Escalade</option><option value="Sprinter">Sprinter (1-14) — Mercedes Sprinter</option></select></div>
        </div>
        <button class="btn btn-primary" onclick="expandForm()" id="getQuoteBtn" style="width:100%;font-size:16px;padding:16px">Continue &darr;</button>
      </div>

      <!-- Full Form -->
      <div class="quote-form-expand" id="quoteFormExpand">
        <form class="booking-form" id="bookForm">
          <div class="full"><label>Full Name</label><input type="text" id="bk-name" required></div>
          <div><label>Phone</label><input type="tel" id="bk-phone" required></div>
          <div><label>Email</label><input type="email" id="bk-email"></div>
          <div><label>Service Type</label><select id="bk-service"><option>Airport Transfer</option><option>Corporate Travel</option><option>Wedding</option><option>Event / Concert</option><option>Night Out</option><option>Wine Tour</option><option>Other</option></select></div>
          <div><label>Passengers</label><input type="number" id="bk-pax" min="1" max="14" value="1"></div>
          <div><label>Flight # (if airport)</label><input type="text" id="bk-flight" placeholder="e.g. UA1234"></div>
          <div class="full"><label>Special Requests</label><textarea id="bk-notes" rows="3" placeholder="Car seats, luggage details, extra stops, etc."></textarea></div>
          <div class="full" style="margin-top:8px">
            <button type="submit" class="btn btn-gold" style="width:100%;font-size:16px;padding:16px">Submit Booking Request</button>
          </div>
        </form>
        <div class="trust-row">
          <span>&#9989; No surge pricing</span>
          <span>&#128340; Confirm in minutes</span>
          <span>&#9992; Flight tracking included</span>
          <span>&#128222; <a href="tel:+18325678050" style="color:var(--text3);text-decoration:underline">(832) 567-8050</a></span>
        </div>
      </div>

      <!-- Thank you -->
      <div id="bk-thanks" style="display:none;text-align:center;padding:60px 20px">
        <div style="font-size:64px;margin-bottom:20px">&#10003;</div>
        <h2 style="font-size:28px;margin-bottom:12px">Booking <span class="gold">Submitted</span></h2>
        <p style="color:var(--text2);max-width:450px;margin:0 auto">We've received your request. Our team will confirm your ride within minutes. You can also call us anytime at <a href="tel:+18325678050" style="color:var(--gold)">(832) 567-8050</a>.</p>
      </div>

    </div>
  </div>
</section>
</div>

<!-- ─── PAGE: BLOG ─── -->
<div class="page" id="page-blog" style="display:none">
<div class="page-header"><div class="container"><h2>Our <span class="gold">Blog</span></h2><p>Insights, guides, and news from Houston's premier limo service.</p></div></div>
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
      </div>
      {% endfor %}
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": [
          {% for post in blog_posts %}
          {
            "@type": "Article",
            "position": {{ loop.index }},
            "headline": {{ post.title|tojson }},
            "description": {{ post.summary|tojson }},
            "datePublished": {{ post.date|tojson }},
            "author": { "@type": "Organization", "name": "AvaLimo" },
            "publisher": { "@type": "Organization", "name": "AvaLimo" },
            "url": "https://avalimo.net/blog/{{ post.slug }}"
          }{% if not loop.last %},{% endif %}
          {% endfor %}
        ]
      }
      </script>
    </div>
    <div style="text-align:center;margin-top:40px"><p style="color:var(--text3);font-size:13px">New articles published weekly. <a href="/contact" style="color:var(--gold)">Suggest a topic</a>.</p></div>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas. Arrive in style and comfort — every time.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li><li><a href="/blog">Blog</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">adam@avalimo.net</a></li></ul></div>
  <div><h4>Info</h4><ul><li><a href="/faq">FAQ</a></li><li><a href="/policy">Policy</a></li><li><a href="/flight-status">Flight Status</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring &amp; Cypress.</div></div></div></footer>
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
            <defs><linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#D4AF37" stop-opacity=".1"/><stop offset="50%" stop-color="#D4AF37" stop-opacity=".4"/><stop offset="100%" stop-color="#D4AF37" stop-opacity=".1"/></linearGradient></defs>
            <rect width="400" height="160" fill="rgba(212,175,55,.03)" rx="12"/>
            <path d="M30 130 Q80 80 130 90 Q180 100 220 70 Q260 40 310 50 Q350 55 370 40" fill="none" stroke="url(#routeGrad)" stroke-width="2" stroke-dasharray="6 4"/>
            <circle cx="30" cy="130" r="6" fill="#D4AF37" opacity=".8"/>
            <text x="30" y="150" fill="#999" font-size="10" text-anchor="middle">Origin</text>
            <circle cx="370" cy="40" r="6" fill="#D4AF37"/>
            <text x="370" y="30" fill="#D4AF37" font-size="10" text-anchor="middle">IAH</text>
            <circle cx="220" cy="70" r="4" fill="#D4AF37" opacity=".5"/>
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
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo. All rights reserved.</p><div class="areas">Houston, IAH, Hobby, Sugar Land, The Woodlands, Katy, Missouri City, Pearland, Galveston, League City, Baytown, Spring &amp; Cypress.</div></div></div></footer>
</div>

<!-- ─── PAGE: DEPOSIT ─── -->
<div class="page" id="page-deposit" style="display:none"
     data-sq-app-id="{{ sq_app_id }}"
     data-sq-loc-id="{{ sq_location_id }}">
<div class="page-header"><div class="container"><h2>Pay <span class="gold">Online</span></h2><p>Secure your reservation with a deposit or pay your balance.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="deposit-flow fade-up">
      <div class="deposit-info">
        <h3>&#128179; Payment Details</h3>
        <ul>
          <li><span class="d-icon">&#9989;</span> Deposits are fully refundable with 24h cancellation</li>
          <li><span class="d-icon">&#128274;</span> Secured by Square — your card never touches our server</li>
          <li><span class="d-icon">&#128231;</span> Receipt emailed to you instantly</li>
          <li><span class="d-icon">&#128176;</span> No processing fees — what you see is what you pay</li>
        </ul>
        <p style="color:var(--text3);font-size:13px;margin-top:20px">Have a question? Call <a href="tel:+18325678050" style="color:var(--gold)">(832) 567-8050</a></p>
      </div>
      <div class="deposit-card">
        <div class="amount-display">
          <div class="currency">Payment Amount</div>
          <div class="number">$<input type="text" id="dep-amount" value="100" oninput="updateDepositPresets(this.value)"></div>
          <div style="color:var(--text3);font-size:13px;margin-top:4px">Deposit — refundable with 24h notice</div>
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
          <label>Booking Reference (optional)</label>
          <input type="text" id="dep-ref" placeholder="e.g. Booking #1234">
          <label>Cardholder Name</label>
          <input type="text" id="dep-name" placeholder="John Doe" required>
          <label>Email for Receipt</label>
          <input type="email" id="dep-email" placeholder="you@example.com" required>
          <label>Card Details</label>
          <div id="square-card" style="padding:14px 18px;border-radius:var(--radius-sm);border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);margin-bottom:16px;min-height:56px"></div>
          <div id="sq-errors" style="color:#ff6b6b;font-size:13px;margin-bottom:12px;display:none"></div>
          <button class="btn btn-gold" style="width:100%;justify-content:center;padding:16px;font-size:16px;margin-top:8px" id="dep-pay-btn" onclick="processSquarePayment()">Pay Now</button>
          <p style="color:var(--text3);font-size:12px;text-align:center;margin-top:16px">&#128274; Secured by Square &bull; No card data stored</p>
        </div>
        <div id="dep-processing" style="display:none;text-align:center;padding:40px 20px">
          <div style="font-size:32px;margin-bottom:16px;animation:spin 1s linear infinite">&#8635;</div>
          <p style="color:var(--text2)">Processing your payment...</p>
        </div>
        <div id="dep-thanks" style="display:none;text-align:center;padding:20px">
          <div style="font-size:48px;margin-bottom:12px">&#10003;</div>
          <h3 style="margin-bottom:8px">Payment <span class="gold">Received</span></h3>
          <p style="color:var(--text2);font-size:14px" id="dep-thanks-msg">Your payment is confirmed. You'll receive a receipt via email shortly.</p>
        </div>
      </div>
    </div>
  </div>
</section>
</div>

<!-- ─── PAGE: SUGAR LAND ─── -->
<div class="page" id="page-sugar-land" style="display:none">
<div class="page-header"><div class="container"><h2>Sugar Land <span class="gold">Limo Service</span></h2><p>Premium chauffeur service serving Sugar Land and the surrounding Fort Bend area.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">Sugar Land</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">Sugar Land residents and visitors deserve world-class transportation. AvaLimo provides professional chauffeur service for airport transfers, corporate travel, weddings, and events throughout Sugar Land and Fort Bend County.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~45 min / 48 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~35 min / 30 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your Sugar Land Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9992;</div><div><h3 style="font-size:15px;margin-bottom:4px">Airport Transfers</h3><p style="font-size:13px;margin:0">IAH & Hobby with flight tracking</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128188;</div><div><h3 style="font-size:15px;margin-bottom:4px">Corporate Travel</h3><p style="font-size:13px;margin:0">Executive transport for local business</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128141;</div><div><h3 style="font-size:15px;margin-bottom:4px">Wedding Limo</h3><p style="font-size:13px;margin:0">Elegant arrivals for your big day</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving Sugar Land, TX</div></div></div></footer>
</div>

<!-- ─── PAGE: WOODLANDS ─── -->
<div class="page" id="page-woodlands" style="display:none">
<div class="page-header"><div class="container"><h2>The Woodlands <span class="gold">Limo Service</span></h2><p>Premium chauffeur service for The Woodlands, Spring, Conroe, and North Houston.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">The Woodlands</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">The Woodlands is one of Houston's premier communities, and you deserve premier transportation. AvaLimo provides professional chauffeur service for airport transfers, corporate meetings at ExxonMobil Campus, concerts at Cynthia Woods Mitchell Pavilion, and more.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~25 min / 22 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~45 min / 42 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your Woodlands Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9992;</div><div><h3 style="font-size:15px;margin-bottom:4px">IAH Airport Transfers</h3><p style="font-size:13px;margin:0">Flight tracking + meet & greet</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#127916;</div><div><h3 style="font-size:15px;margin-bottom:4px">Concert Transportation</h3><p style="font-size:13px;margin:0">Cynthia Woods Mitchell Pavilion</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128652;</div><div><h3 style="font-size:15px;margin-bottom:4px">Group Transport</h3><p style="font-size:13px;margin:0">Sprinter vans for groups up to 14</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving The Woodlands, Spring & Conroe, TX</div></div></div></footer>
</div>

<!-- ─── PAGE: KATY ─── -->
<div class="page" id="page-katy" style="display:none">
<div class="page-header"><div class="container"><h2>Katy <span class="gold">Limo Service</span></h2><p>Premium chauffeur service for Katy, Cinco Ranch, and West Houston.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">Katy</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">Katy is one of Houston's fastest-growing communities. AvaLimo provides reliable, professional chauffeur service for Katy residents needing airport transfers to IAH or Hobby, corporate travel, and special events across West Houston and the Energy Corridor.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~40 min / 42 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~40 min / 35 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your Katy Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9992;</div><div><h3 style="font-size:15px;margin-bottom:4px">Airport Transfers</h3><p style="font-size:13px;margin:0">IAH & Hobby, flight tracked</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128188;</div><div><h3 style="font-size:15px;margin-bottom:4px">Energy Corridor</h3><p style="font-size:13px;margin:0">Corporate travel for West Houston</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128141;</div><div><h3 style="font-size:15px;margin-bottom:4px">Weddings & Events</h3><p style="font-size:13px;margin:0">Elegant transportation for any occasion</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving Katy, Cinco Ranch & West Houston, TX</div></div></div></footer>
</div>

<!-- ─── PAGE: MISSOURI CITY ─── -->
<div class="page" id="page-missouri-city" style="display:none">
<div class="page-header"><div class="container"><h2>Missouri City <span class="gold">Limo Service</span></h2><p>Premium chauffeur service for Missouri City, Sienna Plantation, and Southwest Houston.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">Missouri City</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">Missouri City and Sienna Plantation residents deserve premium transportation. AvaLimo provides professional chauffeur service for airport transfers to both IAH and Hobby, corporate travel to the Texas Medical Center and downtown, weddings, and special events.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~40 min / 40 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~25 min / 18 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your Missouri City Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9992;</div><div><h3 style="font-size:15px;margin-bottom:4px">Hobby Airport</h3><p style="font-size:13px;margin:0">Only 25 min from Missouri City</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#127973;</div><div><h3 style="font-size:15px;margin-bottom:4px">Medical Center</h3><p style="font-size:13px;margin:0">Reliable TMC transportation</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128141;</div><div><h3 style="font-size:15px;margin-bottom:4px">Special Events</h3><p style="font-size:13px;margin:0">Weddings, parties & more</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving Missouri City, Sienna Plantation & Southwest Houston, TX</div></div></div></footer>
</div>

<!-- ─── PAGE: PEARLAND ─── -->
<div class="page" id="page-pearland" style="display:none">
<div class="page-header"><div class="container"><h2>Pearland <span class="gold">Limo Service</span></h2><p>Premium chauffeur service for Pearland, Friendswood, and South Houston.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">Pearland</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">Pearland is one of Houston's fastest-growing suburbs, and AvaLimo keeps it connected. Minutes from Hobby Airport, we provide seamless airport transfers, corporate travel to the Texas Medical Center, and elegant transportation for weddings and special events throughout Brazoria County.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~15 min / 10 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~40 min / 35 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your Pearland Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9992;</div><div><h3 style="font-size:15px;margin-bottom:4px">Hobby Airport</h3><p style="font-size:13px;margin:0">Just 15 min from Pearland</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#127973;</div><div><h3 style="font-size:15px;margin-bottom:4px">Medical Center</h3><p style="font-size:13px;margin:0">Reliable TMC commutes</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128141;</div><div><h3 style="font-size:15px;margin-bottom:4px">Weddings & Events</h3><p style="font-size:13px;margin:0">Elegant arrivals for any occasion</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving Pearland, Friendswood & South Houston, TX</div></div></div></footer>
</div>

<!-- ─── PAGE: GALVESTON ─── -->
<div class="page" id="page-galveston" style="display:none">
<div class="page-header"><div class="container"><h2>Galveston <span class="gold">Limo Service</span></h2><p>Premium chauffeur service for Galveston Island and the Texas Gulf Coast.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">Galveston</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">Galveston Island is a premier destination for cruising, conferences, and coastal celebrations. AvaLimo provides luxury transportation from IAH and Hobby to the Galveston cruise terminal, plus chauffeur service for island weddings, corporate events at Moody Gardens, and nights out on The Strand.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~45 min / 40 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~1 hr 15 min / 70 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your Galveston Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9973;</div><div><h3 style="font-size:15px;margin-bottom:4px">Cruise Transfers</h3><p style="font-size:13px;margin:0">Port of Galveston drop-off & pickup</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#127796;</div><div><h3 style="font-size:15px;margin-bottom:4px">Beach Events</h3><p style="font-size:13px;margin:0">Weddings & parties on the island</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128188;</div><div><h3 style="font-size:15px;margin-bottom:4px">Corporate Travel</h3><p style="font-size:13px;margin:0">Moody Gardens & island conferences</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving Galveston Island & the Texas Gulf Coast</div></div></div></footer>
</div>

<!-- ─── PAGE: LEAGUE CITY ─── -->
<div class="page" id="page-league-city" style="display:none">
<div class="page-header"><div class="container"><h2>League City <span class="gold">Limo Service</span></h2><p>Premium chauffeur service for League City, Clear Lake, and the NASA area.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">League City</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">League City and the Clear Lake area are home to NASA's Johnson Space Center and countless aerospace and tech companies. AvaLimo provides executive transportation for corporate clients, airport transfers to Hobby and IAH, and luxury service for weddings and events throughout Bay Area Houston.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~25 min / 20 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~50 min / 50 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your League City Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128640;</div><div><h3 style="font-size:15px;margin-bottom:4px">NASA Area</h3><p style="font-size:13px;margin:0">Corporate transport for Space Center</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9992;</div><div><h3 style="font-size:15px;margin-bottom:4px">Airport Transfers</h3><p style="font-size:13px;margin:0">Hobby & IAH, flight tracked</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9973;</div><div><h3 style="font-size:15px;margin-bottom:4px">Cruise & Beach</h3><p style="font-size:13px;margin:0">Galveston cruise & beach trips</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving League City, Clear Lake & Bay Area Houston, TX</div></div></div></footer>
</div>

<!-- ─── PAGE: BAYTOWN ─── -->
<div class="page" id="page-baytown" style="display:none">
<div class="page-header"><div class="container"><h2>Baytown <span class="gold">Limo Service</span></h2><p>Premium chauffeur service for Baytown, La Porte, and East Houston.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">Baytown</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">Baytown is a vital hub for Houston's petrochemical and industrial sectors. AvaLimo provides executive transportation for energy professionals, reliable airport transfers to IAH (just 30 minutes away), and elegant service for weddings, galas, and special events throughout East Harris County.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~30 min / 28 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~35 min / 30 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your Baytown Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9992;</div><div><h3 style="font-size:15px;margin-bottom:4px">IAH Transfers</h3><p style="font-size:13px;margin:0">Only 30 min from Baytown</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128188;</div><div><h3 style="font-size:15px;margin-bottom:4px">Energy Sector</h3><p style="font-size:13px;margin:0">Corporate travel for industrial clients</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128141;</div><div><h3 style="font-size:15px;margin-bottom:4px">Special Events</h3><p style="font-size:13px;margin:0">Weddings, galas & celebrations</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving Baytown, La Porte & East Houston, TX</div></div></div></footer>
</div>

<!-- ─── PAGE: SPRING ─── -->
<div class="page" id="page-spring" style="display:none">
<div class="page-header"><div class="container"><h2>Spring <span class="gold">Limo Service</span></h2><p>Premium chauffeur service for Spring, Klein, and North Houston.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">Spring</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">Spring is ideally located just minutes from George Bush Intercontinental Airport, making it a prime location for airport transfer services. AvaLimo serves Spring residents with prompt IAH transfers, corporate travel to The Woodlands and downtown Houston, and luxury transportation for concerts at nearby Cynthia Woods Mitchell Pavilion.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~15 min / 10 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~40 min / 35 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your Spring Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9992;</div><div><h3 style="font-size:15px;margin-bottom:4px">IAH Airport</h3><p style="font-size:13px;margin:0">Just 15 min from Spring</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#127916;</div><div><h3 style="font-size:15px;margin-bottom:4px">Concert Transport</h3><p style="font-size:13px;margin:0">Cynthia Woods Mitchell Pavilion</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128188;</div><div><h3 style="font-size:15px;margin-bottom:4px">Corporate</h3><p style="font-size:13px;margin:0">Executive travel to The Woodlands</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving Spring, Klein & North Houston, TX</div></div></div></footer>
</div>

<!-- ─── PAGE: CYPRESS ─── -->
<div class="page" id="page-cypress" style="display:none">
<div class="page-header"><div class="container"><h2>Cypress <span class="gold">Limo Service</span></h2><p>Premium chauffeur service for Cypress, Bridgeland, and Northwest Houston.</p></div></div>
<section class="section" style="padding-top:0">
  <div class="container">
    <div class="contact-grid" style="grid-template-columns:1fr 1fr;align-items:start">
      <div class="fade-up">
        <h3 style="font-size:24px;margin-bottom:16px">Luxury Transportation in <span class="gold">Cypress</span></h3>
        <p style="color:var(--text2);line-height:1.8;margin-bottom:20px">Cypress is one of Houston's most desirable suburbs, and AvaLimo brings premier transportation to this growing community. We serve Cypress residents with airport transfers to both IAH and Hobby, corporate travel to the Energy Corridor and downtown, and elegant wedding and event transportation throughout Northwest Houston.</p>
        <div style="background:var(--card);border-radius:var(--radius);padding:24px;border:1px solid rgba(255,255,255,.04);margin-bottom:24px">
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To IAH Airport</span><span style="font-weight:600">~35 min / 35 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)"><span style="color:var(--text2)">To Hobby Airport</span><span style="font-weight:600">~45 min / 40 mi</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0"><span style="color:var(--text2)">24/7 Availability</span><span style="font-weight:600;color:var(--gold)">Always</span></div>
        </div>
        <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 36px">Book Your Cypress Ride</a>
      </div>
      <div class="fade-up" style="transition-delay:.15s">
        <div class="services-grid" style="grid-template-columns:1fr;gap:12px">
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#9992;</div><div><h3 style="font-size:15px;margin-bottom:4px">Airport Transfers</h3><p style="font-size:13px;margin:0">IAH & Hobby, flight tracked</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128188;</div><div><h3 style="font-size:15px;margin-bottom:4px">Energy Corridor</h3><p style="font-size:13px;margin:0">Corporate travel for West Houston</p></div></div>
          <div class="service-card" style="padding:20px;text-align:left;display:flex;align-items:center;gap:16px"><div class="icon" style="margin:0;width:48px;height:48px;font-size:20px;flex-shrink:0">&#128141;</div><div><h3 style="font-size:15px;margin-bottom:4px">Weddings & Events</h3><p style="font-size:13px;margin:0">Elegant transportation for any occasion</p></div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<footer style="background:var(--bg);border-top:1px solid rgba(255,255,255,.04)"><div class="container"><div class="footer-grid">
  <div><h4>AvaLimo</h4><p>Premium luxury transportation in Houston, Texas.</p></div>
  <div><h4>Quick Links</h4><ul><li><a href="/services">Services</a></li><li><a href="/fleet">Fleet</a></li><li><a href="/book">Book Now</a></li></ul></div>
  <div><h4>Contact</h4><ul><li><a href="tel:+18325678050">(832) 567-8050</a></li><li><a href="mailto:adam@avalimo.net">Email</a></li></ul></div>
  <div><h4>Service Areas</h4><ul><li><a href="/sugar-land-limo">Sugar Land</a></li><li><a href="/the-woodlands-limo">The Woodlands</a></li><li><a href="/katy-limo">Katy</a></li><li><a href="/missouri-city-limo">Missouri City</a></li><li><a href="/pearland-limo">Pearland</a></li><li><a href="/galveston-limo">Galveston</a></li><li><a href="/league-city-limo">League City</a></li><li><a href="/baytown-limo">Baytown</a></li><li><a href="/spring-limo">Spring</a></li><li><a href="/cypress-limo">Cypress</a></li></ul></div>
</div><div class="footer-bottom"><p>&copy; 2026 AvaLimo</p><div class="areas">Serving Cypress, Bridgeland & Northwest Houston, TX</div></div></div></footer>
</div>

<!-- ─── Mobile Sticky CTA ─── -->
<div class="mobile-cta">
  <a href="tel:+18325678050" class="mcta-call">&#128222; Call Now</a>
  <a href="/book" class="mcta-book">Book Your Ride</a>
</div>

<!-- ─── Exit-Intent Popup ─── -->
<div class="exit-popup" id="exitPopup">
  <div class="exit-popup-inner">
    <button class="exit-popup-close" onclick="closeExitPopup()">&times;</button>
    <div style="font-size:48px;margin-bottom:12px">&#128663;</div>
    <h3 style="font-size:22px;margin-bottom:8px">Ready to Ride in <span class="gold">Luxury</span>?</h3>
    <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:20px">Book now and get a <strong style="color:var(--gold)">free upgrade</strong> on your first ride. Mention code <strong style="color:var(--gold)">AVALIMO10</strong> when booking.</p>
    <a href="/book" class="btn btn-gold" style="font-size:15px;padding:14px 40px;width:100%;justify-content:center" onclick="closeExitPopup()">Book Your Free Upgrade</a>
    <p style="color:var(--text3);font-size:12px;margin-top:12px">Or call <a href="tel:+18325678050" style="color:var(--gold)">(832) 567-8050</a></p>
  </div>
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
  '/deposit': { title:'Pay Online — AvaLimo | Secure Payment Portal', desc:'Pay your deposit or balance online. Secure Square payment portal for AvaLimo reservations.' },
  '/sugar-land-limo': { title:'Sugar Land Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in Sugar Land, TX. Airport transfers to IAH & Hobby, corporate travel, weddings — 24/7. Book online.' },
  '/the-woodlands-limo': { title:'The Woodlands Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in The Woodlands, TX. IAH airport transfers, concert transportation, corporate travel — 24/7.' },
  '/katy-limo': { title:'Katy Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in Katy, TX. Airport transfers, Energy Corridor corporate travel, weddings & events — 24/7.' },
  '/missouri-city-limo': { title:'Missouri City Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in Missouri City, TX. Hobby & IAH airport transfers, Medical Center transportation — 24/7.' },
  '/pearland-limo': { title:'Pearland Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in Pearland, TX. Minutes from Hobby Airport, corporate travel to Med Center, weddings & events — 24/7.' },
  '/galveston-limo': { title:'Galveston Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in Galveston, TX. Cruise terminal transfers, beach event transportation, IAH & Hobby airport service — 24/7.' },
  '/league-city-limo': { title:'League City Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in League City, TX. NASA/Clear Lake area corporate travel, Hobby & IAH airport transfers — 24/7.' },
  '/baytown-limo': { title:'Baytown Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in Baytown, TX. IAH airport transfers, corporate travel for petrochemical industry, weddings & events — 24/7.' },
  '/spring-limo': { title:'Spring Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in Spring, TX. IAH airport transfers (just 15 min), corporate travel, concert transportation — 24/7.' },
  '/cypress-limo': { title:'Cypress Limo Service — AvaLimo | Premier Chauffeur', desc:'Premium limo service in Cypress, TX. IAH & Hobby airport transfers, corporate travel to Energy Corridor, weddings — 24/7.' },
};
var blogSlug = null;
function openArticleBySlug(slug){
  var cards=document.querySelectorAll('.blog-card[data-slug]');
  for(var i=0;i<cards.length;i++){
    var card=cards[i];
    var content=card.querySelector('.article-content');
    var btn=card.querySelector('.btn');
    if(card.getAttribute('data-slug')===slug){
      content.classList.add('open');
      if(btn) btn.textContent='Hide Article';
    } else {
      content.classList.remove('open');
      if(btn) btn.textContent='Read More';
    }
  }
}
var pageTimer=null;
function showPage(path,noFade){
  var id = 'page-home';
  blogSlug=null;
  var prevPages=[];
  for(var i=0;i<pages.length;i++){if(pages[i].style.display!='none') prevPages.push(pages[i]);}
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
  // City page aliases (with and without -limo)
  else if(path==='/sugar-land'||path==='/sugar-land-limo') id='page-sugar-land';
  else if(path==='/the-woodlands'||path==='/the-woodlands-limo') id='page-woodlands';
  else if(path==='/katy'||path==='/katy-limo') id='page-katy';
  else if(path==='/missouri-city'||path==='/missouri-city-limo') id='page-missouri-city';
  else if(path==='/pearland'||path==='/pearland-limo') id='page-pearland';
  else if(path==='/galveston'||path==='/galveston-limo') id='page-galveston';
  else if(path==='/league-city'||path==='/league-city-limo') id='page-league-city';
  else if(path==='/baytown'||path==='/baytown-limo') id='page-baytown';
  else if(path==='/spring'||path==='/spring-limo') id='page-spring';
  else if(path==='/cypress'||path==='/cypress-limo') id='page-cypress';
  var nextPage=document.getElementById(id);
  if(noFade){
    for(var i=0;i<pages.length;i++) pages[i].style.display='none';
    nextPage.style.display='block';
    nextPage.classList.remove('fade-out');
  } else {
    // fade out previous pages
    prevPages.forEach(function(p){p.classList.add('fade-out');});
    clearTimeout(pageTimer);
    pageTimer=setTimeout(function(){
      for(var i=0;i<pages.length;i++) pages[i].style.display='none';
      nextPage.style.display='block';
      nextPage.classList.remove('fade-out');
      setTimeout(function(){window.scrollTo(0,0);},20);
    },280);
  }
  if(blogSlug) openArticleBySlug(blogSlug);
  // active nav link
  var links=document.querySelectorAll('.nav-links a');
  for(var i=0;i<links.length;i++){
    var lh=links[i].getAttribute('href');
    links[i].classList.toggle('active',lh===path||(path.startsWith('/blog')&&lh==='/blog')||(path.indexOf('-limo')>0&&lh==='/'));
  }
  // page meta
  var meta=pageMeta[path]||pageMeta['/'];
  if(path.startsWith('/blog/')) meta=pageMeta['/blog'];
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

// ─── Nav scroll + progress bar ───
var nav=document.getElementById('nav');
window.addEventListener('scroll',function(){
  nav.classList.toggle('scrolled',window.scrollY>60);
  var bar=document.getElementById('scrollBar');
  if(bar){
    var h=document.documentElement.scrollHeight-document.documentElement.clientHeight;
    bar.style.width=(window.scrollY/h*100)+'%';
  }
});

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

window.addEventListener('popstate',function(){showPage(location.pathname,true)});

// ─── Initial load ───
showPage(location.pathname,true);
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

// ─── Testimonial carousel ───
(function(){
  var track=document.getElementById('testTrack');
  var dots=document.getElementById('testDots');
  if(!track||!dots) return;
  var slides=track.children,len=slides.length,idx=0;
  for(var i=0;i<len;i++){
    var d=document.createElement('button');
    d.className='test-dot'+(i===0?' active':'');
    d.setAttribute('data-index',i);
    d.addEventListener('click',function(){go(parseInt(this.getAttribute('data-index')));clearInterval(timer);timer=setInterval(auto,5000);});
    dots.appendChild(d);
  }
  function go(i){
    idx=(i+len)%len;
    track.style.transform='translateX(-'+(idx*100)+'%)';
    dots.querySelectorAll('.test-dot').forEach(function(d,i){d.classList.toggle('active',i===idx)});
  }
  var timer=setInterval(auto,5000);
  function auto(){go(idx+1);}
})();

// ─── Stat Counter ───
(function(){
  var counted=false;
  var statObserver=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting&&!counted){
        counted=true;
        document.querySelectorAll('.stat-number').forEach(function(el){
          var txt=el.textContent.trim();
          var num=parseFloat(txt.replace(/[^0-9.]/g,''));
          if(!num) return;
          var suffix=txt.replace(/[0-9.]/g,'');
          var step=Math.max(1,Math.floor(num/40));
          var cur=0;
          var timer=setInterval(function(){
            cur+=step;
            if(cur>=num){cur=num;clearInterval(timer);}
            el.innerHTML='<span class="count">'+Math.floor(cur)+'</span>'+suffix;
          },30);
        });
        statObserver.disconnect();
      }
    });
  },{threshold:.5});
  document.querySelectorAll('.stats-bar').forEach(function(el){statObserver.observe(el)});
})();

// ─── FAQ accordion ───
document.addEventListener('click',function(e){
  var q=e.target.closest('.faq-q');
  if(q){
    var item=q.parentElement;
    item.classList.toggle('open');
  }
});

// ─── Booking form ───
document.getElementById('hpFormExpand')&&document.getElementById('hpFormExpand').addEventListener('submit',function(e){
  e.preventDefault();
  this.querySelector('button[type="submit"]').disabled=true;
  var body={
    name:val('hp-name'),phone:val('hp-phone'),email:val('hp-email'),
    pickup:val('hp-pickup'),dropoff:val('hp-dropoff'),time:val('hp-time'),
    vehicle:val('hp-vehicle'),pax:val('hp-pax'),notes:val('hp-notes')
  };
  fetch('/api/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  .then(function(r){return r.json()})
  .then(function(d){
    document.getElementById('hpQuoteCard').style.display='none';
    document.getElementById('hpFormExpand').style.display='none';
    document.getElementById('hp-thanks').style.display='block';
  })
  .catch(function(err){
    this.querySelector('button[type="submit"]').disabled=false;
    alert('Error submitting. Please call (832) 567-8050.');
  }.bind(this));
});

// ─── Quick Booking ───
function setPickup(loc){
  document.getElementById('q-pickup').value=loc;
  document.getElementById('q-pickup').focus();
}
function expandForm(){
  document.getElementById('quoteFormExpand').classList.add('show');
  document.getElementById('quoteFormExpand').scrollIntoView({behavior:'smooth',block:'start'});
}
function hpExpandForm(){
  document.getElementById('hpFormExpand').classList.add('show');
  document.getElementById('hpFormExpand').scrollIntoView({behavior:'smooth',block:'start'});
}
// ─── Book page form ───
document.getElementById('bookForm')&&document.getElementById('bookForm').addEventListener('submit',function(e){
  e.preventDefault();
  this.querySelector('button[type="submit"]').disabled=true;
  var body={
    name:val('bk-name'),phone:val('bk-phone'),email:val('bk-email'),
    pickup:val('q-pickup'),dropoff:val('q-dropoff'),time:val('q-time'),
    vehicle:val('q-vehicle'),pax:val('bk-pax'),service:val('bk-service'),
    flight:val('bk-flight'),notes:val('bk-notes')
  };
  fetch('/api/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  .then(function(r){return r.json()})
  .then(function(d){
    document.getElementById('quoteCard').style.display='none';
    document.getElementById('quoteFormExpand').style.display='none';
    document.getElementById('bk-thanks').style.display='block';
  })
  .catch(function(err){
    this.querySelector('button[type="submit"]').disabled=false;
    alert('Error submitting. Please call (832) 567-8050.');
  }.bind(this));
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
  function w(word){return new RegExp('\\b'+word+'\\b','i').test(m);}
  function p(phrase){return m.includes(phrase);}
  function a(words){return words.some(function(x){return p(x)||w(x);});}
  var reply='';
  // ─── Booking ───
  if(p('car seat')||p('child seat')||p('baby seat')||p('booster'))
    reply='Yes, we provide car seats and booster seats free of charge. Just mention it when you book and we\'ll have one installed and ready.';
  else if(p('how do i book')||p('how to book')||p('how can i book')||p('book a ride')||p('make a reservation'))
    reply='Booking is easy! Head to <a href="/book" style="color:#D4AF37">avalimo.net/book</a>, fill in your trip details, and we\'ll confirm within minutes. Or call (832) 567-8050 for instant help.';
  else if(a(['book','ride','reservation','booking'])&&!a(['cancel','refund','deposit']))
    reply='You can book online at <a href="/book" style="color:#D4AF37">our booking page</a> or call (832) 567-8050. We typically confirm within 5-10 minutes during business hours!';
  // ─── Pricing ───
  else if(p('how much')||p('how much does it cost')||p('what is the price'))
    reply='Pricing depends on the vehicle and distance. Sedans start around $85, SUVs from $110, Sprinters from $160. We offer flat rates — no surge pricing ever. <a href="/book" style="color:#D4AF37">Get a custom quote</a> or call (832) 567-8050.';
  else if(w('price')||w('cost')||w('rate')||w('fare')||w('cheap')||w('expensive'))
    reply='We offer transparent flat-rate pricing — no surge fees, no hidden charges. Sedans start at $85, SUVs at $110, Sprinters at $160. <a href="/book" style="color:#D4AF37">Get your quote</a> or call (832) 567-8050.';
  // ─── Airport ───
  else if(p('how early')||p('what time should i')&&(p('airport')||p('iah')||p('hobby')))
    reply='For domestic flights, arrive at IAH 2 hours early; for international, 3 hours. Hobby is smaller — 90 minutes is usually plenty. We track your flight and adjust pickup if delays occur.';
  else if(a(['airport','iah','hobby','flight','layover','connecting']))
    reply='We cover both IAH and Hobby airports with complimentary flight tracking. Your chauffeur monitors your flight in real-time and adjusts for delays. Book at <a href="/book" style="color:#D4AF37">avalimo.net/book</a>';
  // ─── Fleet ───
  else if(p('s class vs escalade')||p('which vehicle')||p('what should i choose')||p('recommend'))
    reply='For 1-3 passengers we recommend the Mercedes S-Class (executive luxury). For 4-6 the Cadillac Escalade (spacious SUV). For groups of 7-14 the Mercedes Sprinter. <a href="/fleet" style="color:#D4AF37">View our fleet</a>';
  else if(w('s-class')||w('sclass')||w('mercedes')||p('sedan'))
    reply='The Mercedes S-Class seats up to 3 passengers. It\'s our executive sedan — quiet, refined, perfect for airport transfers and corporate travel. <a href="/fleet" style="color:#D4AF37">View details</a>';
  else if(w('escalade')||w('suv')||w('cadillac'))
    reply='The Cadillac Escalade seats up to 6 passengers. Spacious luxury SUV with a panoramic sunroof — great for groups, families, and nights out. <a href="/fleet" style="color:#D4AF37">View details</a>';
  else if(w('sprinter')||w('van')||w('bus')||w('group')&&w('vehicle'))
    reply='The Mercedes Sprinter seats up to 14 passengers with high ceilings and reclining seats. Perfect for weddings, corporate groups, and wine tours. <a href="/fleet" style="color:#D4AF37">View details</a>';
  else if(a(['fleet','vehicle','car','suv','sedan']))
    reply='Our fleet: Mercedes S-Class (3 pax), Cadillac Escalade (6 pax), and Mercedes Sprinter (14 pax). All impeccably maintained. <a href="/fleet" style="color:#D4AF37">View the full fleet</a>';
  // ─── Cancellation / Policy ───
  else if(w('cancel')||w('refund')||w('deposit')||p('change my')||p('modify'))
    reply='You can cancel or modify up to 24 hours before pickup for a full refund. Late cancellations may incur a fee. See our <a href="/policy" style="color:#D4AF37">Policy page</a> for full details.';
  // ─── Weddings ───
  else if(a(['wedding','bride','groom','bridal','wedding party']))
    reply='Congratulations! We offer Mercedes S-Class for the couple and Sprinters/Escalades for the wedding party. Book at least 2-3 months ahead for peak season. <a href="/book" style="color:#D4AF37">Inquire now</a>';
  // ─── Corporate ───
  else if(a(['corporate','business','meeting','executive','office','client']))
    reply='We offer corporate accounts with consolidated monthly billing. Perfect for client transportation, executive travel, and team off-sites. <a href="/book" style="color:#D4AF37">Set up corporate account</a>';
  // ─── Events ───
  else if(a(['concert','event','game','sports','astros','rockets','texans','concert']))
    reply='We service all Houston venues: NRG Stadium, Toyota Center, Minute Maid Park, Cynthia Woods Pavilion, Smart Financial Centre, and more. No surge pricing for event nights!';
  // ─── Wine tours / Groups ───
  else if(a(['wine','brewery','tour','hill country','winery']))
    reply='Our Sprinter vans are perfect for wine tours and brewery crawls. Safe, social, and customized to your group. BYOB-friendly! <a href="/book" style="color:#D4AF37">Plan your tour</a>';
  else if(a(['group','party','bachelorette','bachelor','birthday','prom','quince']))
    reply='We handle groups of all sizes! Our Sprinter (up to 14 pax) is perfect for bachelorettes, proms, birthday parties, and group nights out. BYOB-friendly and fully reclining seats.';
  // ─── Hours / Contact ───
  else if(a(['hour','available','24','late','early','midnight','open']))
    reply='We operate 24/7 — 365 days a year. Late night flight? Early morning pickup? We\'re always available. Book anytime at <a href="/book" style="color:#D4AF37">avalimo.net/book</a>';
  else if(p('phone')||p('call')||p('contact')||p('reach')||p('number')||p('email'))
    reply='Call or text: <strong>(832) 567-8050</strong>. Email: adam@avalimo.net. We\'re available 24/7 and respond fast!';
  // ─── Payment ───
  else if(a(['pay','payment','credit','card','cash','tip','deposit']))
    reply='We accept all major credit cards. A booking deposit secures your reservation. Payment is handled securely online. Tipping is appreciated but never required.';
  // ─── Service area ───
  else if(a(['sugar land','katy','woodlands','missouri city','pearland','cypress','heights','downtown','area','houston']))
    reply='We serve all of Greater Houston including IAH, Hobby, Downtown, The Galleria, Medical Center, Sugar Land, Katy, The Woodlands, Missouri City, Pearland, and more. Where do you need a ride?';
  else if(a(['austin','san antonio','dallas','galveston','college station','beaumont','corpus']))
    reply='We primarily operate in the Houston area. For long-distance trips to Austin, San Antonio, Dallas, or elsewhere, we can provide a quote — just <a href="/book" style="color:#D4AF37">submit a booking request</a> or call (832) 567-8050 and we\'ll check availability for you.';
  // ─── Drivers ───
  else if(a(['driver','chauffeur','licensed','insured','background','safety','covid']))
    reply='Every AvaLimo chauffeur is fully licensed, insured, background-checked, and professionally trained. All vehicles are sanitized before every ride.';
  // ─── Compare / why us ───
  else if(a(['uber','lyft','taxi','rideshare','vs','compare','difference','better']))
    reply='Unlike rideshares, we offer: flight tracking, no surge pricing, professional chauffeurs, guaranteed vehicle quality, meet & greet service, and consistent luxury — every time.';
  // ─── Greetings ───
  else if(w('hello')||w('hi')||w('hey')||w('good morning')||w('good evening')||w('yo')||w('sup'))
    reply='Hey there! I\'m the AvaLimo assistant. Ask me anything about booking, pricing, our fleet, airport transfers, corporate travel, or weddings. How can I help?';
  // ─── Help ───
  else if(a(['help','what can you','what do you','option','service','offer']))
    reply='I can help with: booking a ride, pricing & quotes, fleet info, airport transfers (IAH/Hobby), corporate accounts, weddings & events, group transportation, wine tours, and our cancellation policy. Just ask!';
  // ─── Fallback with suggestion ───
  else {
    var suggestions=[
      'booking a ride',
      'pricing',
      'airport transfers',
      'our fleet',
      'weddings',
      'corporate travel'
    ];
    var s=suggestions[Math.floor(Math.random()*suggestions.length)];
    reply='I\'m not sure I understood that. Try asking about <strong>'+s+'</strong>! Or call us at (832) 567-8050 for immediate help.';
  }

  // Append phone CTA unless reply already has the number
  if(reply.indexOf('567-8050')===-1)
    reply+='<br><br>&#128222; <a href="tel:+18325678050" style="color:#D4AF37;text-decoration:underline">Call (832) 567-8050</a> for immediate help.';

  var msgs=document.getElementById('chatMessages');
  var d=document.createElement('div');
  d.className='chat-msg bot';
  d.innerHTML=reply;
  msgs.appendChild(d);
  msgs.scrollTop=msgs.scrollHeight;
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
  if(!amount||parseFloat(amount)<=0){alert('Enter a valid amount.');return;}
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
          email:document.getElementById('dep-email').value,
          ref:document.getElementById('dep-ref').value
        })
      }).then(function(r){return r.json()}).then(function(d){
        document.getElementById('dep-processing').style.display='none';
        if(d.status==='ok'){
          document.querySelector('.pay-fields').style.display='none';
          document.getElementById('dep-thanks-msg').textContent='$'+amount+' received. '+d.message;
          document.getElementById('dep-thanks').style.display='block';
        } else {
          btn.disabled=false;btn.textContent='Try Again';
          var errEl=document.getElementById('sq-errors');
          errEl.textContent=d.message||'Payment failed. Try again.';
          errEl.style.display='block';
        }
      }).catch(function(){
        btn.disabled=false;btn.textContent='Try Again';
        document.getElementById('dep-processing').style.display='none';
        alert('Network error. Please try again.');
      });
    } else {
      btn.disabled=false;btn.textContent='Try Again';
      document.getElementById('dep-processing').style.display='none';
      var errEl=document.getElementById('sq-errors');
      errEl.textContent=res.errors&&res.errors[0]?res.errors[0].detail:'Card information is invalid.';
      errEl.style.display='block';
    }
  }).catch(function(e){
    btn.disabled=false;btn.textContent='Try Again';
    document.getElementById('dep-processing').style.display='none';
    console.error('Tokenize error:',e);
  });
}

// ─── Exit-Intent Popup ───
var exitShown=false;
function showExitPopup(){
  if(exitShown) return;
  exitShown=true;
  document.getElementById('exitPopup').classList.add('show');
}
function closeExitPopup(){
  document.getElementById('exitPopup').classList.remove('show');
}
document.addEventListener('mouseleave',function(e){
  if(e.clientY<=0&&!exitShown) showExitPopup();
});
</script>

<!-- Mobile Sticky CTA -->
<div class="mobile-cta">
  <a href="tel:+18325678050" class="mcta-call">&#128222; Call Now</a>
  <a href="/book" class="mcta-book">&#128197; Book Now</a>
</div>

<!-- Exit-Intent Popup -->
<div class="exit-popup" id="exitPopup">
  <div class="exit-popup-inner">
    <button class="exit-popup-close" onclick="closeExitPopup()">&times;</button>
    <div style="font-size:48px;margin-bottom:16px">&#127873;</div>
    <h3 style="margin-bottom:8px">Wait! Free Upgrade?</h3>
    <p style="color:var(--text2);font-size:14px;line-height:1.7;margin-bottom:24px">Book any airport transfer today and we'll upgrade you to our premium vehicle at no extra cost. Limited time offer.</p>
    <a href="/book" class="btn btn-primary" onclick="closeExitPopup()" style="width:100%;padding:14px">Claim My Upgrade</a>
    <p style="margin-top:12px;font-size:11px;color:var(--text3)">No thanks, <a href="#" onclick="closeExitPopup();return false" style="color:var(--text3);text-decoration:underline">I'll pass</a></p>
  </div>
</div>
</body>
</html>"""

@app.route("/robots.txt")
def robots_txt():
    return "User-agent: *\nAllow: /\nSitemap: https://avalimo.net/sitemap.xml", 200, {"Content-Type": "text/plain"}

@app.route("/sitemap.xml")
def sitemap_xml():
    pages = ["", "services", "fleet", "book", "blog", "flight-status", "contact", "faq", "policy", "deposit", "sugar-land-limo", "the-woodlands-limo", "katy-limo", "missouri-city-limo", "pearland-limo", "galveston-limo", "league-city-limo", "baytown-limo", "spring-limo", "cypress-limo"]
    blog_urls = "\n".join(f'<url><loc>https://avalimo.net/blog/{p["slug"]}</loc></url>' for p in BLOG_POSTS if p.get("slug"))
    urls = "\n".join(f'<url><loc>https://avalimo.net/{p}</loc></url>' for p in pages)
    xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{urls}
{blog_urls}
</urlset>'''
    return xml, 200, {"Content-Type": "application/xml"}

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    page_meta = {
        "": { "title": "AvaLimo — Houston Premier Limo Service | IAH & Hobby Airport Transfers", "desc": "Houston's most trusted chauffeur service. Airport transfers for IAH & Hobby, corporate travel, weddings, events — 24/7 with zero surge pricing. Book online in 30 seconds." },
        "services": { "title": "Services — AvaLimo | Houston Limo & Chauffeur Service", "desc": "Airport transfers, corporate travel, wedding limo, event transportation & more. Houston's premium chauffeur service — 24/7." },
        "fleet": { "title": "Our Fleet — AvaLimo | Luxury Sedans, SUVs & Sprinter Vans", "desc": "Mercedes S-Class, Cadillac Escalade & Mercedes Sprinter. Houston's finest luxury fleet for any occasion." },
        "book": { "title": "Book a Ride — AvaLimo | Online Reservation", "desc": "Reserve your Houston luxury chauffeur service online in 30 seconds. Airport transfers, corporate & events — 24/7." },
        "blog": { "title": "Blog — AvaLimo | Houston Limo Service Insights & Tips", "desc": "Travel tips, airport guides, wedding advice & more from Houston's premier chauffeur service." },
        "flight-status": { "title": "Flight Status — AvaLimo | Real-Time Flight Tracker", "desc": "Track your flight in real-time. Free flight status tool for IAH, Hobby & all airlines." },
        "contact": { "title": "Contact — AvaLimo | Houston Limo Service", "desc": "Get in touch with AvaLimo. Call (832) 567-8050 or message us online. 24/7 dispatch." },
        "faq": { "title": "FAQ — AvaLimo | Frequently Asked Questions", "desc": "Answers to common questions about booking, pricing, cancellations & more." },
        "policy": { "title": "Policy — AvaLimo | Company Policy", "desc": "AvaLimo company policy: booking, cancellation, refund & privacy terms." },
        "deposit": { "title": "Pay Online — AvaLimo | Secure Payment Portal", "desc": "Pay your deposit or balance online. Secure Square payment portal for AvaLimo reservations." },
        "sugar-land-limo": { "title": "Sugar Land Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in Sugar Land, TX. Airport transfers to IAH & Hobby, corporate travel, weddings — 24/7. Book online." },
        "the-woodlands-limo": { "title": "The Woodlands Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in The Woodlands, TX. IAH airport transfers, concert transportation, corporate travel — 24/7." },
        "katy-limo": { "title": "Katy Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in Katy, TX. Airport transfers, Energy Corridor corporate travel, weddings & events — 24/7." },
        "missouri-city-limo": { "title": "Missouri City Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in Missouri City, TX. Hobby & IAH airport transfers, Medical Center transportation — 24/7." },
        "pearland-limo": { "title": "Pearland Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in Pearland, TX. Minutes from Hobby Airport, corporate travel to Med Center, weddings & events — 24/7." },
        "galveston-limo": { "title": "Galveston Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in Galveston, TX. Cruise terminal transfers, beach event transportation, IAH & Hobby airport service — 24/7." },
        "league-city-limo": { "title": "League City Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in League City, TX. NASA/Clear Lake area corporate travel, Hobby & IAH airport transfers — 24/7." },
        "baytown-limo": { "title": "Baytown Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in Baytown, TX. IAH airport transfers, corporate travel for petrochemical industry, weddings & events — 24/7." },
        "spring-limo": { "title": "Spring Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in Spring, TX. IAH airport transfers (just 15 min), corporate travel, concert transportation — 24/7." },
        "cypress-limo": { "title": "Cypress Limo Service — AvaLimo | Premier Chauffeur", "desc": "Premium limo service in Cypress, TX. IAH & Hobby airport transfers, corporate travel to Energy Corridor, weddings — 24/7." },
    }
    city_aliases = {
        "sugar-land": "sugar-land-limo",
        "the-woodlands": "the-woodlands-limo",
        "katy": "katy-limo",
        "missouri-city": "missouri-city-limo",
        "pearland": "pearland-limo",
        "galveston": "galveston-limo",
        "league-city": "league-city-limo",
        "baytown": "baytown-limo",
        "spring": "spring-limo",
        "cypress": "cypress-limo",
    }
    if path in city_aliases:
        return redirect(f"/{city_aliases[path]}", 301)
    meta = page_meta.get(path, page_meta[""])
    canonical_path = f"/{path}" if path else ""
    if path.startswith("blog/") and len(path) > 5:
        slug = path[5:]
        for p in BLOG_POSTS:
            if p.get("slug") == slug:
                meta = {"title": p["title"] + " — AvaLimo", "desc": p.get("summary", "")}
                canonical_path = f"/blog/{slug}"
                break
    canonical_url = f"https://avalimo.net{canonical_path}"
    html = HTML.replace("{{ sq_app_id }}", SQ_APP_ID).replace("{{ sq_location_id }}", SQ_LOCATION_ID).replace("{{ ga_id }}", GA_ID).replace("{{ sc_meta }}", SC_META).replace("{{ fb_pixel }}", FB_PIXEL)
    html = html.replace("{{ title }}", meta["title"]).replace("{{ meta_desc }}", meta["desc"]).replace("{{ canonical_url }}", canonical_url)
    return render_template_string(html, blog_posts=BLOG_POSTS)


N8N_BASE = "https://n8napp.adamj.fit/webhook"


def _fire_n8n_reminder(data: dict):
    """Call n8n 24h reminder webhook in background thread."""
    if _req is None:
        return
    try:
        pickup = data.get("time", "")
        pickup_date = data.get("date", "")
        pickup_time = pickup_date + "T" + pickup if pickup_date and pickup else pickup or pickup_date
        payload = {
            "name": data.get("name", ""),
            "phone": data.get("phone", ""),
            "email": data.get("email", ""),
            "service": data.get("service", ""),
            "pickup_time": pickup_time,
            "pickup_location": data.get("pickup", ""),
            "dropoff_location": data.get("dropoff", ""),
        }
        _req.post(f"{N8N_BASE}/avalimo-reminder", json=payload, timeout=10)
    except Exception:
        pass


def _fire_n8n_review(data: dict):
    """Call n8n review request webhook in background thread."""
    if _req is None:
        return
    try:
        payload = {
            "first_name": data.get("name", ""),
            "email": data.get("email", ""),
            "phone": data.get("phone", ""),
            "service": data.get("service", ""),
            "booking_date": data.get("date", "") or data.get("time", ""),
            "order_id": str(uuid.uuid4())[:8],
        }
        _req.post(f"{N8N_BASE}/avalimo-review-request", json=payload, timeout=10)
    except Exception:
        pass


@app.route("/api/book", methods=["POST"])
def book_ride():
    data = request.get_json() or {}
    send_booking_email(data)
    threading.Thread(target=_fire_n8n_reminder, args=(data,), daemon=True).start()
    threading.Thread(target=_fire_n8n_review, args=(data,), daemon=True).start()
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
        phone_match = re.search(r"(?:Phone|phone|PHONE)\s*[:=]\s*([+\d\s\-().]+)", description)
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
