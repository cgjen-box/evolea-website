# Skill: Video Display on Mobile (iOS Safari)

## Problem Summary
Hero videos may not play on iPhones due to CSS rules that hide videos when the iOS "Reduce Motion" accessibility setting is enabled. Many iOS users have this setting enabled by default or for battery/motion sickness reasons.

---

## Root Cause

CSS media query `@media (prefers-reduced-motion: reduce)` with `display: none !important` on video elements:

```css
/* THIS BREAKS iPhone VIDEO PLAYBACK */
@media (prefers-reduced-motion: reduce) {
  .hero-video video,
  .hero-video-element {
    display: none !important;
  }
}
```

---

## The Fix

**Remove `display: none` for videos** - Muted autoplay videos are already considered accessible.

### Before (Broken):
```css
@media (prefers-reduced-motion: reduce) {
  .hero-video-element {
    display: none !important;
  }
  .poster-fallback {
    display: block !important;
  }
}
```

### After (Fixed):
```css
/* Reduced motion: disable animations but keep video playing */
/* Note: Video is NOT hidden because muted autoplay is accessible
   and many iOS users have Reduce Motion enabled by default */
@media (prefers-reduced-motion: reduce) {
  /* Removed: display:none for video - was breaking iPhone playback */

  .animate-fade-slide-down,
  .animate-fade-slide-up {
    opacity: 1;
    animation: none;
  }
}
```

---

## Files to Check

When debugging mobile video issues, search these locations:

```bash
# Search for prefers-reduced-motion rules
grep -rn "prefers-reduced-motion" --include="*.css" --include="*.astro" src/

# Search for video-related CSS
grep -rn "hero-video" --include="*.css" --include="*.astro" src/

# Check for display:none on videos
grep -rn "video.*display.*none" src/
```

### Common file locations:
1. `src/styles/global.css` - Global reduced-motion rules
2. `src/components/VideoHero.astro` - Component-level `<style>` blocks
3. `src/components/Hero.astro` - Alternative hero components
4. Any `*video*.css` or `*hero*.css` files

---

## Correct Video Implementation

### HTML (iOS Safari optimized):
```html
<!-- Single video approach (simplest) -->
<video
  class="hero-video"
  autoplay
  muted
  loop
  playsinline
  poster="/images/hero-poster.jpg"
>
  <source src="/videos/hero.mp4" type="video/mp4">
</video>

<!-- OR: Dual video for mobile optimization -->
<video class="hero-video-desktop" autoplay muted loop playsinline>
  <source src="/videos/hero.mp4" type="video/mp4">
</video>
<video class="hero-video-mobile" autoplay muted loop playsinline>
  <source src="/videos/hero-mobile.mp4" type="video/mp4">
</video>
```

### Required attributes for iOS autoplay:
- `autoplay` - Start playing automatically
- `muted` - **REQUIRED for iOS autoplay**
- `loop` - Continuous playback
- `playsinline` - **REQUIRED for iOS** (prevents fullscreen)

### CSS (correct approach):
```css
.hero-video-element {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Mobile-first: show mobile video by default */
.hero-video-desktop { display: none; }
.hero-video-mobile { display: block; }

/* Desktop: swap videos */
@media (min-width: 769px) {
  .hero-video-desktop { display: block; }
  .hero-video-mobile { display: none; }
}

/* Reduced motion: disable animations, but DO NOT hide video */
@media (prefers-reduced-motion: reduce) {
  /* Only disable CSS animations, not the video itself */
  .animate-fade-slide-down,
  .animate-fade-slide-up {
    animation: none;
    opacity: 1;
  }
}
```

---

## Why This Matters

1. **iOS Reduce Motion is common** - Many users have it enabled by default or for accessibility
2. **Muted autoplay is accessible** - No sound means no disruption
3. **`playsinline` is essential** - Without it, iOS tries to go fullscreen
4. **CSS `display: none` overrides everything** - Even if JS tries to play the video

---

## Verification Steps

After fixing:

```bash
# 1. Build the project
npm run build

# 2. Check no video-hiding rules remain
grep -rn "video.*display.*none" dist/

# 3. Deploy and test on actual iPhone
# - Test with Reduce Motion ON (Settings > Accessibility > Motion)
# - Test with Reduce Motion OFF
# - Video should play in both cases
```

---

## Quick Checklist

- [ ] Video has `autoplay muted loop playsinline` attributes
- [ ] No `display: none` on videos in `prefers-reduced-motion` media query
- [ ] Video file is properly encoded (H.264 for best iOS compatibility)
- [ ] Mobile video file is small enough (<2MB recommended for fast loading)
- [ ] Poster image provided as fallback

---

## Reference

- Working example: planted-website (simple single-video approach)
- iOS autoplay policy: https://webkit.org/blog/6784/new-video-policies-for-ios/
