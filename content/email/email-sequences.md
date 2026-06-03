# AvaLimo Email Drip Campaign Sequences

## Email Platform Setup

Recommended: **MailerLite** (free up to 1,000 subscribers) or **Brevo** (free up to 300 emails/day)

Connect to n8n for advanced automation triggers.

---

## Sequence 1: Welcome Series (New Lead)

**Trigger:** Booking form submitted OR email signup
**Goal:** Build trust, showcase value, drive first booking

---

### Email 1: Welcome (Immediate)

**Subject:** Welcome to AvaLimo — Houston's Luxury Transportation

**Preview text:** Your ride just got upgraded.

```
Hi {{ $json.name }},

Welcome to AvaLimo — where every arrival is an occasion.

I'm Adam J, the founder. I started AvaLimo because I believe Houston 
deserves better than surge-priced rideshares and unpredictable taxis.

Here's what makes us different:

✓ Fixed pricing — what you see is what you pay
✓ Flight tracking on every airport transfer
✓ Professionally trained chauffeurs, not just drivers
✓ 24/7 availability, 365 days a year
✓ Immaculately maintained Mercedes S-Class, Escalade, and Sprinter fleet

Need a ride? Reply to this email or call/text me directly:
(832) 990-8258

Best,
Adam J
AvaLimo Houston

P.S. Follow us on Instagram @avalimo for behind-the-scenes of our 
fleet and Houston's most stunning arrivals.
```

---

### Email 2: Social Proof (Day 2)

**Subject:** "Best limo service in Houston" — here's what clients say

**Preview text:** 500+ five-star reviews and counting.

```
Hi {{ $json.name }},

Since you joined us, I wanted to share why 500+ Houston travelers 
choose AvaLimo every month.

⭐⭐⭐⭐⭐ "Service was impeccable. Our chauffeur was professional 
and the car was spotless." — James R., Airport Transfer

⭐⭐⭐⭐⭐ "Best limo service in Houston! On time, very polite, and 
the vehicle was amazingly comfortable." — Sarah M., Corporate Client

⭐⭐⭐⭐⭐ "From easy booking to arrival — everything was perfect. 
Thank you AvaLimo!" — Michael B., Wedding

Our promise: If your experience isn't 5-star, I'll make it right. 
Personally.

See our full fleet: https://avalimo.net/fleet
Read more reviews: https://g.page/avalimo/reviews (link to Google Reviews)

Best,
Adam

P.S. Wedding season is booking fast. If you're planning 2026 nuptials, 
now's the time to reserve your date.
```

---

### Email 3: Vehicle Education (Day 4)

**Subject:** Which AvaLimo vehicle is right for you?

**Preview text:** S-Class vs Escalade vs Sprinter — the breakdown.

```
Hi {{ $json.name }},

Not sure which vehicle fits your needs? Here's the simple breakdown:

🚗 MERCEDES S-CLASS (1-3 passengers)
Perfect for: Airport transfers, executive travel, romantic evenings
Vibe: Understated luxury, whisper-quiet ride
Starting at: $100

🚙 CADILLAC ESCALADE (1-6 passengers)
Perfect for: Family trips, groups, extra luggage space
Vibe: Bold presence, maximum comfort
Starting at: $115

🚐 MERCEDES SPRINTER (1-14 passengers)
Perfect for: Wedding parties, corporate groups, bachelor/bachelorette
Vibe: Party-ready, high ceilings, premium sound
Starting at: $195

Still deciding? Reply with your event details and I'll recommend 
the perfect fit.

View the full fleet with photos: https://avalimo.net/fleet

Best,
Adam
```

---

### Email 4: First Booking Offer (Day 7)

**Subject:** 15% off your first ride — here's your code

**Preview text:** Valid for 7 days. Any service, any vehicle.

```
Hi {{ $json.name }},

I want to make your first AvaLimo experience unforgettable.

Use code WELCOME15 for 15% off your first booking.

✓ Any vehicle
✓ Any service (airport, corporate, wedding, events)
✓ Valid for 7 days

Book now: https://avalimo.net/book
Code: WELCOME15

Questions? Just reply to this email or text me at (832) 990-8258.

Best,
Adam
```

---

## Sequence 2: Abandoned Quote / No-Booking Follow-Up

**Trigger:** Quote requested but no booking after 1 hour
**Goal:** Convert quote request into confirmed booking

---

### Email 1: The Check-In (1 hour after quote)

**Subject:** Quick question about your AvaLimo quote

**Preview text:** Want to adjust any details?

```
Hi {{ $json.name }},

I noticed you requested a quote for {{ $json.vehicle }} from 
{{ $json.pickup }} to {{ $json.dropoff }} on {{ $json.time }}.

Did everything look right? Happy to adjust:
- Different vehicle?
- Change pickup time?
- Add stops?
- Special requests (champagne, child seat, etc.)?

Just reply to this email or call me: (832) 990-8258

Your current quote is held for 24 hours with no obligation.

Best,
Adam
```

---

### Email 2: Social Proof + Urgency (24 hours after quote)

**Subject:** {{ $json.vehicle }} availability this weekend

**Preview text:** Limited availability for your date.

```
Hi {{ $json.name }},

Quick update: Our {{ $json.vehicle }} fleet is at 85% capacity for 
{{ $json.time }}.

I don't want you to miss out. Here's why clients book with us:

"They showed up 10 minutes early, opened every door, and made 
me feel like a CEO." — David K., Corporate Client

Your quote is still valid, but I can't hold the vehicle beyond 
tomorrow without a reservation.

Ready to confirm? Book online (30 seconds): https://avalimo.net/book
Or call me: (832) 990-8258

Best,
Adam
```

---

### Email 3: Last Chance + Discount (48 hours after quote)

**Subject:** Last call: 10% off your {{ $json.vehicle }} booking

**Preview text:** Expires tonight. Code inside.

```
Hi {{ $json.name }},

This is my last email about your {{ $json.vehicle }} quote — I 
promise not to bug you after this.

If you're still considering, here's 10% off to make it easy:

Code: BOOKNOW10
Valid until midnight tonight.

Your ride:
{{ $json.vehicle }} | {{ $json.pickup }} → {{ $json.dropoff }}
{{ $json.time }}

Book in 30 seconds: https://avalimo.net/book
Or text me: (832) 990-8258

No pressure either way. If this trip isn't right for AvaLimo, 
I hope you'll think of us next time.

Best,
Adam
```

---

## Sequence 3: Post-Ride Review Request

**Trigger:** Ride completed (24 hours after)
**Goal:** Get Google reviews + repeat bookings

---

### Email 1: Thank You + Review Request (24 hours after ride)

**Subject:** How was your ride with AvaLimo?

**Preview text:** One minute of your time = huge help to us.

```
Hi {{ $json.name }},

Thank you for choosing AvaLimo for your {{ $json.service }} on 
{{ $json.date }}.

I hope everything met your expectations — from the vehicle 
condition to your chauffeur's professionalism.

If you have 60 seconds, would you leave us a quick review on 
Google? It helps other Houston travelers find us and keeps 
our team motivated.

Leave a review → [GOOGLE REVIEW LINK]

As a thank you, here's 10% off your next ride:
Code: THANKS10
Valid for 90 days.

See you next time!

Adam J
AvaLimo Houston
(832) 990-8258
```

---

### Email 2: No Review? Gentle Reminder (Day 5 after ride)

**Subject:** Quick favor for AvaLimo?

**Preview text:** Still time to share your experience.

```
Hi {{ $json.name }},

Hope you're still glowing from your {{ $json.service }} experience 
with us.

If you haven't had a chance yet, I'd be incredibly grateful for a 
quick Google review. Just 1-2 sentences is perfect.

[LEAVE REVIEW BUTTON]

Your feedback directly helps us improve and grow.

And don't forget: THANKS10 is still valid for 10% off your next ride.

Best,
Adam
```

---

### Email 3: Loyalty Perk (Day 14 after ride)

**Subject:** You're now an AvaLimo VIP — here's what that means

**Preview text:** Exclusive perks unlocked.

```
Hi {{ $json.name }},

You've officially ridden with AvaLimo, which makes you a VIP in my book.

Here's what VIP status gets you:

✓ Priority booking (skip the line during peak times)
✓ 10% off every ride, forever (code: VIP10)
✓ Free upgrade when available (S-Class → Escalade, etc.)
✓ Direct line to me: (832) 990-8258
✓ First access to new vehicles and services

Your next ride: https://avalimo.net/book
Code: VIP10 (always works)

Thanks for being part of the AvaLimo family.

Adam
```

---

## Sequence 4: Birthday / Anniversary VIP

**Trigger:** Birthday or account anniversary (from CRM)
**Goal:** Delight customer, drive repeat booking

---

### Birthday Email

**Subject:** Happy Birthday, {{ $json.name }}! 🎉 Your gift is inside

**Preview text:** One free upgrade on us.

```
Hi {{ $json.name }},

Happy Birthday from all of us at AvaLimo!

To celebrate, here's your birthday gift:

🎁 FREE VEHICLE UPGRADE on your next ride

Book an S-Class, get upgraded to Escalade at no charge.
Book an Escalade, get upgraded to Sprinter.

Valid for 30 days. Because your birthday deserves something extra.

Book now: https://avalimo.net/book
Use code: BDAYUPGRADE

Have an amazing day!

Adam & the AvaLimo Team
```

---

### Anniversary Email (1 year since first ride)

**Subject:** One year ago today, you rode with AvaLimo for the first time

**Preview text:** Here's 20% off to celebrate our anniversary.

```
Hi {{ $json.name }},

One year ago today, you trusted AvaLimo with your transportation.

Since then, we've added new vehicles, expanded to more Houston suburbs, 
and served 500+ more clients — but we never forgot your first ride.

To celebrate our anniversary together:

🎁 20% off your next ride
Code: ANNIVERSARY20
Valid for 60 days.

Book: https://avalimo.net/book

Here's to many more rides together.

Adam J
AvaLimo Houston
```

---

## Sequence 5: Seasonal / Promotional

---

### Holiday Travel (Thanksgiving/Christmas)

**Subject:** Holiday airport transfers: Book before November 15th

```
Hi {{ $json.name }},

Holiday travel is chaos. But your airport transfer doesn't have to be.

AvaLimo holiday bookings are filling up for:
- Thanksgiving week (Nov 23-29)
- Christmas week (Dec 23-Jan 2)

Book by November 15th and save 15%:
Code: HOLIDAY15

Why book early?
✓ Guaranteed availability (we limit holiday rides to ensure quality)
✓ Fixed pricing (no holiday surge — ever)
✓ Flight tracking for delayed winter flights

Book now: https://avalimo.net/book

Adam
```

---

### Wedding Season (Spring)

**Subject:** 2026 Houston wedding season: Reserve your date

```
Hi {{ $json.name }},

Wedding season in Houston kicks off in March. Our 2026 calendar 
is already 40% booked.

If you're planning a wedding, engagement party, or bachelor/bachelorette 
event this spring, now is the time to reserve your transportation.

Popular dates go fast:
✓ March-May weekends
✓ Memorial Day weekend
✓ Mother's Day weekend

Wedding packages start at $450 and include:
- Decorated vehicle (white ribbon, flowers)
- Champagne service
- Red carpet arrival
- Dedicated chauffeur for 4-8 hours

Request wedding quote: https://avalimo.net/book
Or call me directly: (832) 990-8258

Adam
```

---

## Email Design Guidelines

**Subject Line Rules:**
- Keep under 50 characters (mobile optimization)
- Use personalization: {{ $json.name }}
- Include numbers when possible: "15% off", "500+ reviews"
- Create curiosity or urgency

**Preview Text Rules:**
- 40-80 characters
- Should complement subject line, not repeat it
- Include secondary hook

**Body Format:**
- Short paragraphs (2-3 sentences max)
- Use bullet points for features
- One CTA per email
- Signature with photo (builds trust)
- P.S. line (highest-read section after subject)

**Mobile Optimization:**
- 60%+ of emails opened on mobile
- Test with single-column layout
- Large tap targets for buttons (min 44px height)
- Short subject lines critical

---

## A/B Testing Plan

| Element | Version A | Version B | Metric |
|---------|-----------|-----------|--------|
| Subject line | "15% off your first ride" | "Here's your welcome gift" | Open rate |
| CTA button | "Book Now" | "Get My Quote" | Click rate |
| Send time | 9 AM | 6 PM | Open rate |
| Sender name | "Adam from AvaLimo" | "AvaLimo" | Open rate |
| P.S. line | Discount code | Social proof | Click rate |

---

## n8n Email Automation Setup

Connect these sequences to n8n for full automation:

**Trigger nodes:**
1. **Webhook** — Booking form submitted
2. **Schedule** — Time-based (24h after ride, birthday, etc.)
3. **HTTP Request** — CRM/DB query for triggers

**Action nodes:**
1. **Brevo/MailerLite API** — Send email via API
2. **Delay** — Wait between sequence emails
3. **If** — Check if booking was made (stop abandoned quote sequence)
4. **Telegram** — Notify you of high-value leads

**Workflow files:** See `n8n-workflows/email-sequences.json` (import into n8n)
