# Design Spec: Refined Luxury Experience for Avalimo.net

## [S1] Problem
The current avalimo.net website has a modern dark theme with gold accents but lacks depth and interactivity. User wants a "much better" design that's more refined and sophisticated.

## [S2] Solution Overview
Create a refined luxury experience using:
1. **Restrained elegance** - Fewer effects, each executed perfectly
2. **Purposeful depth** - Shadows and glow serve hierarchy, not decoration
3. **Seamless motion** - Animations that feel natural, never distracting
4. **Premium typography** - Playfair Display + Inter with gradient effects
5. **Subtle texture** - Grain overlay for depth without distraction

## [S3] Implementation Approach
### Refined Hero Section
- Generous whitespace for luxurious breathing room
- Clean split layout: elegant typography left, car showcase right
- Subtle grain texture overlay for depth
- Purposeful gold accents used sparingly
- Trust indicators with refined typography

### Typography System
- Playfair Display for headings (serif, elegant)
- Inter for body text (clean, readable)
- Gradient text effects for main headings
- Refined type scale with proper hierarchy
- Generous line-height for readability

### Depth System
- Subtle box-shadows for elevation
- Grain texture overlay for tactile feel
- Purposeful glow effects (not overdone)
- Consistent spacing rhythm throughout
- Refined border treatments

### Motion Design
- Smooth, natural animations (cubic-bezier easing)
- Scroll-triggered reveals with stagger
- Hover effects that feel responsive
- No gratuitous animation - purposeful only

## [S4] Scope
- **All pages** (user confirmed)
- Focus on homepage hero for refined 3D car
- Consistent refined aesthetic across all pages
- Luxury feel throughout

## [S5] Technical Details
### Three.js Car Showcase
- Load Three.js r128 from CDN (defer)
- Car model with clean, elegant geometry
- Subtle rotation on scroll/mouse
- Soft lighting with gold accent
- Fallback to static image

### CSS Refinement System
- **Spacing**: 8px base unit, consistent rhythm
- **Colors**: Limited palette (black, white, gold, grays)
- **Typography**: Strict type scale (11/13/14/15/18/20/28/56px)
- **Shadows**: Subtle, layered (not harsh)
- **Borders**: 1px solid with low opacity

### Grain Texture
- SVG noise filter for subtle grain
- Low opacity (0.03) for tactile feel
- Applied to hero and key sections
- Performance-optimized

### Performance
- Three.js loaded async with defer
- CSS animations use transform/opacity only
- Grain texture via SVG (no image load)
- Mobile: simplified effects, same aesthetic

## [S6] Visual Design
### Hero Section
- Split layout with generous whitespace
- Elegant typography hierarchy
- Car showcase with refined specs
- Trust indicators below
- Subtle grain texture overlay

### Card System
- Clean, minimal card design
- Subtle shadow for elevation
- Refined hover states
- Consistent spacing
- Purposeful use of gold accent

### Button System
- Primary: solid gold, sharp corners (4px)
- Secondary: text link with arrow
- Hover: subtle lift effect
- No gratuitous shadows or glows

### Typography
- Headings: Playfair Display, gradient gold
- Body: Inter, muted white
- Labels: Uppercase, letterspaced, small
- Numbers: Playfair Display for impact

## [S7] Success Criteria
1. Hero feels luxurious with generous whitespace
2. Typography is elegant and refined
3. Gold used sparingly for maximum impact
4. Animations feel natural, not distracting
5. All pages have consistent luxury feel
6. Performance remains fast on mobile
7. Fallback works for older browsers

## [S8] Risks & Mitigations
- **Restraint**: Risk of over-designing - mitigate with "less is more" principle
- **Performance**: Three.js loaded async, CSS-only fallbacks
- **Browser support**: Progressive enhancement, graceful degradation
- **Consistency**: Strict design tokens prevent drift

## [S9] Next Steps
1. Implement refined typography system
2. Create Three.js car showcase
3. Add subtle grain texture
4. Apply consistent spacing rhythm
5. Test and refine across all pages