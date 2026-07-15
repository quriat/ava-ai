# Refined Luxury 3D Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform avalimo.net into a refined luxury experience with subtle 3D depth, premium typography, and elegant animations.

**Architecture:** Refine existing HTML/CSS with Three.js car model, grain texture, and premium design system. Focus on restrained elegance with purposeful depth.

**Tech Stack:** HTML5, CSS3, JavaScript (ES6+), Three.js r128 (CDN), Google Fonts (Playfair Display, Inter)

## Global Constraints
- All changes must work on mobile (375px+)
- Three.js loaded async with defer, fallback to static image
- CSS animations use transform/opacity only for performance
- Gold color: #C8A861 (primary), #D4BA7A (light), #A68B45 (dark)
- Typography: Playfair Display (headings), Inter (body)
- No external dependencies beyond Three.js CDN

---

## Task 1: Create Design Token System

**Covers:** [S3, S5]
**Files:**
- Create: `static/css/tokens.css`
- Modify: `index.html` (add link to tokens.css)

**Interfaces:**
- Consumes: None (foundation task)
- Produces: CSS variables used by all subsequent tasks

- [ ] **Step 1: Create tokens.css with design variables**

```css
/* static/css/tokens.css */
:root {
  /* Colors */
  --color-bg: #080808;
  --color-bg-elevated: #0d0d0d;
  --color-surface: rgba(255,255,255,0.02);
  --color-border: rgba(255,255,255,0.06);
  --color-text-primary: #ffffff;
  --color-text-secondary: rgba(255,255,255,0.45);
  --color-text-muted: rgba(255,255,255,0.3);
  --color-gold: #C8A861;
  --color-gold-light: #D4BA7A;
  --color-gold-dark: #A68B45;
  
  /* Typography */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-md: 15px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 28px;
  --font-size-hero: 56px;
  
  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.3);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.4);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.5);
  
  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

- [ ] **Step 2: Add tokens.css to index.html**

Add before closing `</head>`:
```html
<link rel="stylesheet" href="/static/css/tokens.css">
```

- [ ] **Step 3: Commit**

```bash
git add static/css/tokens.css index.html
git commit -m "feat: add design token system for refined luxury aesthetic"
```

---

## Task 2: Add Grain Texture Overlay

**Covers:** [S3, S6]
**Files:**
- Create: `static/css/grain.css`
- Modify: `index.html` (add link to grain.css)

**Interfaces:**
- Consumes: Design tokens from Task 1
- Produces: Grain texture overlay used in hero and sections

- [ ] **Step 1: Create grain.css with texture overlay**

```css
/* static/css/grain.css */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

.hero-grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

- [ ] **Step 2: Add grain.css to index.html**

Add before closing `</head>`:
```html
<link rel="stylesheet" href="/static/css/grain.css">
```

- [ ] **Step 3: Add grain overlay to body**

Add right after `<body>`:
```html
<div class="grain-overlay"></div>
```

- [ ] **Step 4: Add hero grain to hero section**

Add inside `.hero` div:
```html
<div class="hero-grain"></div>
```

- [ ] **Step 5: Commit**

```bash
git add static/css/grain.css index.html
git commit -m "feat: add subtle grain texture overlay for depth"
```

---

## Task 3: Implement Three.js Car Model

**Covers:** [S2, S5, S6]
**Files:**
- Create: `static/js/car-3d.js`
- Modify: `index.html` (add script tag and container)

**Interfaces:**
- Consumes: Design tokens from Task 1
- Produces: 3D car model in hero section

- [ ] **Step 1: Create car-3d.js with Three.js car model**

```javascript
// static/js/car-3d.js
class CarShowcase {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.car = null;
    this.isInitialized = false;
    
    this.init();
  }
  
  init() {
    // Check for WebGL support
    if (!this.isWebGLSupported()) {
      this.showFallback();
      return;
    }
    
    this.setupScene();
    this.createCar();
    this.setupLights();
    this.setupControls();
    this.animate();
    this.isInitialized = true;
  }
  
  isWebGLSupported() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }
  
  showFallback() {
    this.container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 120px;">
        🚗
      </div>
    `;
  }
  
  setupScene() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 0, 0);
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    this.container.appendChild(this.renderer.domElement);
  }
  
  createCar() {
    this.car = new THREE.Group();
    
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(4, 1, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    this.car.add(body);
    
    // Car top
    const topGeometry = new THREE.BoxGeometry(2.5, 0.8, 1.8);
    const topMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.set(-0.3, 1.2, 0);
    top.castShadow = true;
    this.car.add(top);
    
    // Windows
    const windowGeometry = new THREE.BoxGeometry(2.2, 0.6, 1.6);
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.8
    });
    const windows = new THREE.Mesh(windowGeometry, windowMaterial);
    windows.position.set(-0.3, 1.2, 0);
    this.car.add(windows);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.3,
      roughness: 0.8
    });
    
    const wheelPositions = [
      [-1.4, 0.4, 1.1],
      [-1.4, 0.4, -1.1],
      [1.4, 0.4, 1.1],
      [1.4, 0.4, -1.1]
    ];
    
    wheelPositions.forEach(position => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(...position);
      wheel.rotation.x = Math.PI / 2;
      wheel.castShadow = true;
      this.car.add(wheel);
    });
    
    // Gold accent line
    const accentGeometry = new THREE.BoxGeometry(4.1, 0.05, 0.1);
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xC8A861,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xC8A861,
      emissiveIntensity: 0.1
    });
    const accent = new THREE.Mesh(accentGeometry, accentMaterial);
    accent.position.set(0, 0.5, 1.05);
    this.car.add(accent);
    
    this.scene.add(this.car);
  }
  
  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);
    
    // Gold accent light
    const goldLight = new THREE.PointLight(0xC8A861, 0.6, 20);
    goldLight.position.set(-3, 3, 3);
    this.scene.add(goldLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0xC8A861, 0.3);
    rimLight.position.set(-5, 5, -5);
    this.scene.add(rimLight);
  }
  
  setupControls() {
    // Mouse rotation
    this.container.addEventListener('mousemove', (e) => {
      if (!this.car) return;
      
      const rect = this.container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      
      this.car.rotation.y = x * 0.3;
      this.car.rotation.x = y * 0.1;
    });
    
    // Reset on mouse leave
    this.container.addEventListener('mouseleave', () => {
      if (this.car) {
        this.car.rotation.y = 0;
        this.car.rotation.x = 0;
      }
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
      if (!this.camera || !this.renderer) return;
      
      this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    });
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Subtle idle rotation
    if (this.car) {
      this.car.rotation.y += 0.002;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('car-3d-container');
  if (container) {
    new CarShowcase(container);
  }
});
```

- [ ] **Step 2: Add Three.js CDN to index.html**

Add before closing `</head>`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer></script>
```

- [ ] **Step 3: Add car-3d.js to index.html**

Add before closing `</body>`:
```html
<script src="/static/js/car-3d.js" defer></script>
```

- [ ] **Step 4: Add car container to hero section**

Replace the existing hero image section with:
```html
<div class="hero-car-showcase" id="car-3d-container">
  <!-- Three.js car model will be rendered here -->
  <div class="car-fallback" style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 120px;">
    🚗
  </div>
</div>
```

- [ ] **Step 5: Add CSS for car showcase**

Add to styles:
```css
.hero-car-showcase {
  position: relative;
  width: 100%;
  height: 400px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.hero-car-showcase canvas {
  width: 100% !important;
  height: 100% !important;
}
```

- [ ] **Step 6: Commit**

```bash
git add static/js/car-3d.js index.html
git commit -m "feat: add Three.js car model with interactive rotation"
```

---

## Task 4: Implement Refined Hero Section

**Covers:** [S2, S6]
**Files:**
- Modify: `index.html` (update hero section HTML)
- Modify: `static/styles.css` (add hero styles)

**Interfaces:**
- Consumes: Design tokens (Task 1), grain texture (Task 2), 3D car (Task 3)
- Produces: Complete refined hero section

- [ ] **Step 1: Update hero section HTML**

Replace existing hero content with:
```html
<section class="hero">
  <div class="hero-grain"></div>
  <div class="hero-aurora"></div>
  <div class="hero-overlay"></div>
  
  <div class="container">
    <div class="hero-content">
      <!-- Eyebrow -->
      <div class="hero-eyebrow">
        <div class="eyebrow-line"></div>
        <span>Est. 2013 · Houston, Texas</span>
      </div>
      
      <!-- Main heading -->
      <h1 class="hero-heading">
        <span class="heading-line">Arrive</span>
        <span class="heading-line heading-italic">in</span>
        <span class="heading-line heading-gold">Luxury</span>
      </h1>
      
      <!-- Subtitle -->
      <p class="hero-subtitle">
        Premium chauffeur service for Houston's most discerning travelers. 
        Airport transfers, corporate travel, and special occasions.
      </p>
      
      <!-- CTA Row -->
      <div class="hero-cta">
        <a href="/book" class="btn-primary">Book Now</a>
        <a href="/fleet" class="btn-secondary">
          <span class="btn-arrow">→</span>
          View Fleet
        </a>
      </div>
      
      <!-- Trust indicators -->
      <div class="hero-trust">
        <div class="trust-item">
          <div class="trust-number">500+</div>
          <div class="trust-label">Clients</div>
        </div>
        <div class="trust-item">
          <div class="trust-number">4.9</div>
          <div class="trust-label">Rating</div>
        </div>
        <div class="trust-item">
          <div class="trust-number">24/7</div>
          <div class="trust-label">Available</div>
        </div>
      </div>
    </div>
    
    <!-- 3D Car Showcase -->
    <div class="hero-car-showcase" id="car-3d-container">
      <div class="car-fallback" style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 120px;">
        🚗
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add hero styles to styles.css**

```css
/* Hero Section */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 120px 0 80px;
}

.hero-aurora {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 40%, rgba(200,168,97,0.04) 0%, transparent 50%);
  pointer-events: none;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, var(--color-bg) 100%);
  pointer-events: none;
}

.hero .container {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  max-width: 500px;
}

/* Eyebrow */
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.eyebrow-line {
  width: 32px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,168,97,0.4));
}

.hero-eyebrow span {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
}

/* Heading */
.hero-heading {
  font-family: var(--font-display);
  font-size: var(--font-size-hero);
  font-weight: 400;
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -0.02em;
}

.heading-line {
  display: block;
  color: var(--color-text-primary);
}

.heading-italic {
  color: var(--color-text-muted);
  font-style: italic;
}

.heading-gold {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 50%, var(--color-gold-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Subtitle */
.hero-subtitle {
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  line-height: 1.8;
  margin-bottom: 40px;
  letter-spacing: 0.01em;
}

/* CTA */
.hero-cta {
  display: flex;
  align-items: center;
  gap: 24px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
  color: var(--color-bg);
  padding: 16px 32px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--font-size-sm);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-decoration: none;
  transition: all var(--transition-base);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(200,168,97,0.3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color var(--transition-base);
}

.btn-secondary:hover {
  color: var(--color-text-primary);
}

.btn-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.btn-secondary:hover .btn-arrow {
  border-color: var(--color-gold);
  color: var(--color-gold);
}

/* Trust indicators */
.hero-trust {
  display: flex;
  gap: 32px;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
}

.trust-item {
  text-align: left;
}

.trust-number {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  color: var(--color-gold);
  margin-bottom: 4px;
}

.trust-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Car showcase */
.hero-car-showcase {
  position: relative;
  width: 100%;
  height: 400px;
  background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.hero-car-showcase canvas {
  width: 100% !important;
  height: 100% !important;
}

/* Responsive */
@media (max-width: 900px) {
  .hero .container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
  
  .hero-content {
    max-width: 100%;
  }
  
  .hero-eyebrow {
    justify-content: center;
  }
  
  .hero-cta {
    justify-content: center;
  }
  
  .hero-trust {
    justify-content: center;
  }
  
  .hero-car-showcase {
    height: 300px;
  }
}

@media (max-width: 600px) {
  .hero {
    padding: 100px 0 60px;
  }
  
  .hero-heading {
    font-size: clamp(36px, 10vw, 48px);
  }
  
  .hero-trust {
    gap: 24px;
  }
  
  .trust-number {
    font-size: 24px;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html static/styles.css
git commit -m "feat: implement refined hero section with 3D car showcase"
```

---

## Task 5: Add Refined Card Styles

**Covers:** [S3, S6]
**Files:**
- Modify: `static/styles.css` (add card styles)

**Interfaces:**
- Consumes: Design tokens from Task 1
- Produces: Refined card styles for fleet, services, testimonials

- [ ] **Step 1: Add card styles to styles.css**

```css
/* Refined Card System */
.fleet-card,
.service-card,
.test-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-slow);
}

.fleet-card:hover,
.service-card:hover,
.service-card:hover {
  border-color: rgba(200,168,97,0.15);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Fleet cards */
.fleet-card .img-wrap {
  height: 380px;
  overflow: hidden;
  background: #000;
  position: relative;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.fleet-card .img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.fleet-card:hover .img-wrap img {
  transform: scale(1.04);
}

.fleet-card .body {
  padding: var(--space-6);
}

.fleet-card .body h3 {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: 500;
  margin-bottom: var(--space-2);
}

.fleet-card .body .capacity {
  font-size: var(--font-size-sm);
  color: var(--color-gold);
  letter-spacing: 0.05em;
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.fleet-card .body .capacity::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: var(--color-gold);
  border-radius: 50%;
  opacity: 0.6;
}

.fleet-card .body p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin-bottom: var(--space-5);
}

/* Service cards */
.service-card {
  padding: var(--space-8);
  text-align: center;
}

.service-card .icon {
  font-size: 36px;
  margin-bottom: var(--space-4);
  line-height: 1;
}

.service-card h3 {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: 500;
  margin-bottom: var(--space-3);
}

.service-card p {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

/* Testimonial cards */
.test-card {
  padding: var(--space-10);
  text-align: center;
}

.test-card .quote-icon {
  font-size: 48px;
  color: rgba(200,168,97,0.15);
  line-height: 1;
  margin-bottom: var(--space-2);
  font-family: var(--font-display);
}

.test-card .stars {
  font-size: 24px;
  color: var(--color-gold);
  margin-bottom: var(--space-4);
  letter-spacing: 3px;
}

.test-card p {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: 1.8;
  max-width: 650px;
  margin: 0 auto var(--space-6);
  font-style: italic;
}

.test-card .author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  justify-content: center;
}

.test-card .author .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-gold);
}

.test-card .author .name {
  font-size: var(--font-size-base);
  font-weight: 600;
}

.test-card .author .title {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Commit**

```bash
git add static/styles.css
git commit -m "feat: add refined card styles with subtle depth effects"
```

---

## Task 6: Add Premium Typography Styles

**Covers:** [S3, S6]
**Files:**
- Modify: `static/styles.css` (add typography styles)

**Interfaces:**
- Consumes: Design tokens from Task 1
- Produces: Premium typography system

- [ ] **Step 1: Add typography styles to styles.css**

```css
/* Premium Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

h1 { font-size: var(--font-size-hero); }
h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); }
h3 { font-size: var(--font-size-xl); }
h4 { font-size: var(--font-size-lg); }

p {
  font-family: var(--font-body);
  font-size: var(--font-size-md);
  line-height: 1.7;
  color: var(--color-text-secondary);
}

/* Section headers */
.section-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--space-12);
}

.section-header .subtitle {
  font-size: var(--font-size-xs);
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-gold);
  margin-bottom: var(--space-4);
}

.section-header h2 {
  margin-bottom: var(--space-4);
}

.section-header p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  line-height: 1.7;
}

/* Gold text utility */
.gold {
  color: var(--color-gold);
}

/* Gradient text utility */
.gradient-text {
  background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-light) 50%, var(--color-gold-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 2: Commit**

```bash
git add static/styles.css
git commit -m "feat: add premium typography system with Playfair Display"
```

---

## Task 7: Add Refined Button Styles

**Covers:** [S3, S6]
**Files:**
- Modify: `static/styles.css` (add button styles)

**Interfaces:**
- Consumes: Design tokens from Task 1
- Produces: Refined button system

- [ ] **Step 1: Add button styles to styles.css**

```css
/* Refined Button System */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.btn-gold {
  background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dark));
  color: var(--color-bg);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-sm);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.btn-gold:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(200,168,97,0.3);
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--color-text-primary);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-sm);
}

.btn-outline:hover {
  border-color: rgba(200,168,97,0.4);
  color: var(--color-gold);
  background: rgba(200,168,97,0.05);
}

.btn-ghost {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.btn-ghost:hover {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.1);
}
```

- [ ] **Step 2: Commit**

```bash
git add static/styles.css
git commit -m "feat: add refined button system with hover effects"
```

---

## Task 8: Add Refined Navigation Styles

**Covers:** [S3, S6]
**Files:**
- Modify: `static/styles.css` (add navigation styles)

**Interfaces:**
- Consumes: Design tokens from Task 1
- Produces: Refined navigation with glassmorphism

- [ ] **Step 1: Add navigation styles to styles.css**

```css
/* Refined Navigation */
nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;
  transition: all var(--transition-base);
  padding: var(--space-4) 0;
}

nav.scrolled {
  background: rgba(8,8,8,0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(200,168,97,0.08);
  box-shadow: 0 4px 30px rgba(0,0,0,0.3);
}

nav .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text-primary);
  text-decoration: none;
}

.nav-logo .logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(200,168,97,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  color: var(--color-gold);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  list-style: none;
}

.nav-links a {
  font-size: var(--font-size-sm);
  color: rgba(255,255,255,0.5);
  transition: color var(--transition-base);
  position: relative;
  letter-spacing: 0.03em;
  text-decoration: none;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--color-text-primary);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--color-gold);
  transition: width var(--transition-base);
}

.nav-links a:hover::after,
.nav-links a.active::after {
  width: 100%;
}

.nav-cta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.nav-cta .phone {
  text-align: right;
}

.nav-cta .phone a {
  color: var(--color-text-primary);
  font-weight: 500;
  font-size: var(--font-size-base);
  text-decoration: none;
}

.nav-cta .phone small {
  display: block;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  letter-spacing: 0.05em;
}

/* Mobile navigation */
@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }
  
  .nav-links.open {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: rgba(8,8,8,0.98);
    backdrop-filter: blur(24px);
    justify-content: center;
    align-items: center;
    gap: var(--space-7);
    z-index: 9998;
  }
  
  .nav-links.open a {
    font-size: var(--font-size-xl);
    font-family: var(--font-display);
    color: rgba(255,255,255,0.7);
  }
  
  .nav-links.open a:hover {
    color: var(--color-gold);
  }
  
  .nav-links.open a::after {
    display: none;
  }
  
  .hamburger {
    display: flex;
  }
  
  .nav-cta .phone {
    display: none;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add static/styles.css
git commit -m "feat: add refined navigation with glassmorphism effect"
```

---

## Task 9: Test and Verify

**Covers:** [S7]
**Files:**
- None (testing only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified implementation

- [ ] **Step 1: Start local development server**

```bash
cd /Users/admin/projects/avalimo-site
python3 -m http.server 8000
```

- [ ] **Step 2: Test in browser**

Open http://localhost:8000 and verify:
- [ ] Hero section displays correctly with 3D car
- [ ] Grain texture overlay is visible but subtle
- [ ] Typography renders with Playfair Display
- [ ] Gold accents are refined and not overdone
- [ ] Cards have subtle hover effects
- [ ] Navigation glassmorphism works on scroll
- [ ] Mobile responsive (test at 375px, 768px, 1024px)

- [ ] **Step 3: Test performance**

- [ ] Three.js loads async (check Network tab)
- [ ] No layout shifts on page load
- [ ] Animations run at 60fps
- [ ] Mobile performance is smooth

- [ ] **Step 4: Test fallbacks**

- [ ] Disable JavaScript - static car image shows
- [ ] Old browser - CSS fallbacks work
- [ ] No WebGL - car model falls back gracefully

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete refined luxury 3D experience for avalimo.net"
```

---

## Summary

This plan implements a refined luxury experience with:
1. Design token system for consistency
2. Subtle grain texture for depth
3. Three.js car model with interactive rotation
4. Refined hero section with premium typography
5. Glassmorphism navigation and cards
6. Purposeful gold accents
7. Mobile-responsive design
8. Performance-optimized animations

Total tasks: 9
Estimated time: 2-3 hours
Dependencies: Three.js CDN (loaded async)