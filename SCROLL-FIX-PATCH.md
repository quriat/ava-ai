# Avalimo.net Scroll Fix — Server-Side Patch

The live site runs a different codebase than the git repo.
Apply these changes directly on the Coolify server.

## How to apply
1. Go to Coolify Dashboard → your avalimo-site application
2. Open the Terminal (or use SSH into the container)
3. Edit `/app/site_app.py`

## Change 1: Remove Lenis CDN script tag
Find this line in the `<head>` section:
```html
<script src="https://unpkg.com/@studio-freight/lenis@1.0.33/dist/lenis.min.js"></script>
```
DELETE it entirely.

## Change 2: Remove GSAP ScrollTrigger CDN (if not needed for anything else)
Find this line:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```
DELETE it entirely.

## Change 3: Remove Lenis initialization block
Find and DELETE this entire block:
```javascript
// ============ LENIS SMOOTH SCROLL ============
var lenis = new Lenis({ duration: 1.2, easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.5 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="/"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var href = a.getAttribute('href');
    if (href && href.length > 1 && href.indexOf('#') === 0) {
      e.preventDefault();
      var t = document.querySelector(href);
      if (t) lenis.scrollTo(t, { offset: -100 });
    }
  });
});
```

## Change 4: Remove GSAP parallax block
Find and DELETE this entire block:
```javascript
// ─── Parallax gold glows ───
document.querySelectorAll('.gold-glow').forEach(function(g) {
  gsap.to(g, {
    scrollTrigger: { trigger: g.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 },
    y: -60, ease: 'none'
  });
});
```

## Change 5: RAF-throttle the scroll listener
Find this:
```javascript
// ─── Nav scroll + progress bar ───
var nav=document.getElementById('nav');
var lastScroll=0;
window.addEventListener('scroll',function(){
  var s=window.scrollY;
  if(s>100){
    nav.style.background='rgba(10,10,10,0.85)';
    nav.style.backdropFilter='blur(20px)';
    nav.style.borderBottom='1px solid rgba(255,255,255,0.04)';
  } else {
    nav.style.background='transparent';
    nav.style.backdropFilter='none';
    nav.style.borderBottom='none';
  }
  nav.style.transform=s>lastScroll&&s>300?'translateY(-100%)':'translateY(0)';
  lastScroll=s;
  var bar=document.getElementById('scrollBar');
  if(bar){
    var h=document.documentElement.scrollHeight-document.documentElement.clientHeight;
    bar.style.width=(window.scrollY/h*100)+'%';
  }
});
```

Replace with:
```javascript
// ─── Nav scroll + progress bar (RAF-throttled) ───
var nav=document.getElementById('nav');
var lastScroll=0;
var _scrollTicking=false;
window.addEventListener('scroll',function(){
  if(!_scrollTicking){
    requestAnimationFrame(function(){
      var s=window.scrollY;
      if(s>100){
        nav.style.background='rgba(10,10,10,0.85)';
        nav.style.backdropFilter='blur(20px)';
        nav.style.borderBottom='1px solid rgba(255,255,255,0.04)';
      } else {
        nav.style.background='transparent';
        nav.style.backdropFilter='none';
        nav.style.borderBottom='none';
      }
      nav.style.transform=s>lastScroll&&s>300?'translateY(-100%)':'translateY(0)';
      lastScroll=s;
      var bar=document.getElementById('scrollBar');
      if(bar){
        var h=document.documentElement.scrollHeight-document.documentElement.clientHeight;
        bar.style.width=(s/h*100)+'%';
      }
      _scrollTicking=false;
    });
    _scrollTicking=true;
  }
},{passive:true});
```

## Change 6: Fix CSS — Remove smooth scroll
In `/app/static/styles.css`, find:
```css
html { scroll-behavior: smooth; }
```
Change to:
```css
html { scroll-behavior: auto; }
```

## Change 7: Remove the grain overlay div
In the HTML body, find and DELETE:
```html
<!-- Grain -->
<div class="grain"></div>
```

## Change 8: Remove GSAP fade-up overrides (keep CSS-only)
Find and DELETE:
```javascript
// ─── GSAP Scroll Reveals ───
gsap.registerPlugin(ScrollTrigger);
document.querySelectorAll('.fade-up').forEach(function(el) {
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', overwrite: 'auto'
  });
});
```

The CSS `.fade-up` + IntersectionObserver already handles reveal animations efficiently.

## Change 9: Remove loader GSAP animation (optional — reduces initial JS)
Find and DELETE:
```javascript
// ============ LOADER ============
var loader = document.getElementById('loader');
var loaderBar = document.getElementById('loaderBar');
var loadProgress = 0;
var loadInt = setInterval(function() {
  ...
}, 60);
```
And delete the loader HTML div too:
```html
<!-- Loader -->
<div class="loader-screen" id="loader">...</div>
```

## After making changes
```bash
# If running gunicorn, restart:
pkill -f gunicorn && gunicorn --bind 0.0.0.0:5002 --timeout 120 --workers 2 site_app:app &
```

## Summary of impact
| Change | Scroll Impact |
|--------|--------------|
| Remove Lenis | **HUGE** — eliminates 1.2s JS scroll inertia |
| Remove GSAP parallax | Removes per-frame JS computation |
| RAF-throttle scroll | Reduces layout thrashing by ~90% |
| Remove grain overlay | Eliminates fixed full-screen compositing layer |
| Remove scroll-behavior:smooth | Prevents conflicts with native scroll |
| Remove GSAP fade-up | Eliminates dual animation system conflict |
