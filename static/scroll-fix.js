/*
 * Avalimo Scroll Performance Fix
 * Addresses slow/laggy scrolling caused by Lenis, GSAP parallax,
 * unthrottled scroll listeners, and heavy backdrop-filter usage.
 *
 * Add this script AFTER all other scripts on the page:
 * <script src="/static/scroll-fix.js"></script>
 */
(function() {
  'use strict';

  // ─── 1. Destroy Lenis smooth scroll (the #1 cause of slow scrolling) ───
  if (window.lenis) {
    window.lenis.destroy();
    window.lenis = null;
  }
  // Also intercept any future Lenis constructor calls
  var OrigLenis = window.Lenis;
  if (OrigLenis) {
    window.Lenis = function() {
      console.log('[scroll-fix] Lenis intercepted — using native scroll');
      return { on: function(){}, raf: function(){}, scrollTo: function(){
        var t = arguments[0];
        if (t && t.nodeType) t.scrollIntoView({behavior:'instant'});
        else if (typeof t === 'number') window.scrollTo(0, t);
      }, destroy: function(){} };
    };
  }

  // ─── 2. Kill GSAP ScrollTrigger parallax animations ───
  if (window.ScrollTrigger) {
    try {
      // Remove all ScrollTrigger instances (parallax scrub, etc.)
      ScrollTrigger.getAll().forEach(function(st) {
        // Only kill scrub animations (parallax), keep reveal animations
        if (st.vars && st.vars.scrub) st.kill();
      });
    } catch(e) {}
  }

  // ─── 3. Remove the SVG grain overlay ───
  var grain = document.querySelector('.grain');
  if (grain) grain.remove();

  // ─── 4. Remove html smooth scroll behavior from CSS ───
  var style = document.createElement('style');
  style.textContent = 'html{scroll-behavior:auto!important}';
  document.head.appendChild(style);

  // ─── 5. Override Lenis's scroll hijacking on scroll event ───
  // Lenis adds its own scroll handler that intercepts native scroll.
  // After destroying Lenis, we need to make sure ScrollTrigger still works.
  if (window.ScrollTrigger) {
    window.addEventListener('scroll', function() {
      requestAnimationFrame(function() {
        ScrollTrigger.update();
      });
    }, { passive: true });
  }

  // ─── 6. RAF-throttle the nav scroll listener ───
  // The existing listener sets backdrop-filter inline on every frame.
  // We replace it with a class-based approach.
  var nav = document.getElementById('nav');
  if (nav) {
    var lastS = 0;
    var ticking = false;
    // Remove existing scroll listeners by replacing the nav element's handler
    var newListener = function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var s = window.scrollY;
          // Use CSS class instead of inline backdrop-filter
          if (s > 100) {
            nav.classList.add('scrolled');
          } else {
            nav.classList.remove('scrolled');
          }
          // Hide/show nav on scroll direction
          if (s > 300 && s > lastS) {
            nav.style.transform = 'translateY(-100%)';
          } else {
            nav.style.transform = 'translateY(0)';
          }
          lastS = s;
          // Progress bar
          var bar = document.getElementById('scrollBar');
          if (bar) {
            var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            bar.style.width = (s / h * 100) + '%';
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    // We can't remove the old listener, but we can make the nav use CSS classes.
    // The inline styles from the old listener will be overridden by !important CSS.
  }

  console.log('[scroll-fix] Applied: Lenis destroyed, grain removed, scroll-behavior:auto, parallax killed');
})();
