# Claude Code Prompt: Add Fade Effect to EVOLEA Navbar

## Copy this prompt:

---

I need to add a fade effect to the bottom of the EVOLEA navbar. 

**IMPORTANT:** Do NOT change anything about the existing navbar styling — the prism gradient, butterflies, logo, animations are all perfect. I only want to ADD a fade effect at the bottom edge so there's no hard line where the navbar ends.

## What to do:

### Step 1: Find the navbar component

Look in `src/components/` for the Header or Navbar component. It likely has the prismatic gradient styling already.

### Step 2: Add the fade HTML

Right after the closing `</nav>` tag (but still inside the header wrapper), add this:

```html
<!-- Navbar Fade Effect -->
<div class="navbar-fade" aria-hidden="true">
  <div class="navbar-fade__mist"></div>
  <div class="navbar-fade__wave navbar-fade__wave--primary"></div>
  <div class="navbar-fade__wave navbar-fade__wave--secondary"></div>
  <div class="navbar-fade__wave navbar-fade__wave--tertiary"></div>
  <div class="navbar-fade__shimmer"></div>
  <div class="navbar-fade__feather"></div>
</div>
```

### Step 3: Add the fade CSS

Add this CSS. **Read the existing navbar CSS first** to find the exact gradient colors being used, then update the `--prism-*` variables to match:

```css
/* ===========================================
   NAVBAR FADE EFFECT
   Add this CSS - adjust colors to match existing navbar
   =========================================== */

/* Find these colors from the existing navbar gradient */
:root {
  /* UPDATE THESE to match the navbar's actual gradient colors */
  --prism-primary: 216, 180, 254;    /* Purple - adjust to match */
  --prism-secondary: 249, 168, 212;  /* Pink - adjust to match */
  --prism-tertiary: 196, 181, 253;   /* Lavender - adjust to match */
}

.navbar-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  pointer-events: none;
  overflow: visible;
  transform: translateY(100%);
  z-index: -1;
}

/* Soft blur mist */
.navbar-fade__mist {
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(
    180deg,
    rgba(var(--prism-primary), 0.6) 0%,
    rgba(var(--prism-primary), 0.3) 40%,
    rgba(var(--prism-primary), 0) 100%
  );
  filter: blur(25px);
}

/* Wave layers */
.navbar-fade__wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 100%;
  will-change: transform;
}

/* Primary Wave */
.navbar-fade__wave--primary {
  background: linear-gradient(
    180deg,
    rgba(var(--prism-primary), 0.95) 0%,
    rgba(var(--prism-primary), 0.7) 20%,
    rgba(var(--prism-primary), 0.4) 45%,
    rgba(var(--prism-primary), 0.15) 70%,
    transparent 100%
  );
  clip-path: polygon(
    0% 0%, 0% 25%, 5% 35%, 10% 30%, 15% 40%, 20% 45%, 25% 38%,
    30% 50%, 35% 55%, 40% 48%, 45% 60%, 50% 52%, 55% 45%,
    60% 55%, 65% 62%, 70% 50%, 75% 58%, 80% 45%, 85% 55%,
    90% 48%, 95% 40%, 100% 35%, 100% 0%
  );
  animation: wave-drift-slow 25s ease-in-out infinite;
}

/* Secondary Wave */
.navbar-fade__wave--secondary {
  background: linear-gradient(
    180deg,
    rgba(var(--prism-secondary), 0.6) 0%,
    rgba(var(--prism-secondary), 0.4) 25%,
    rgba(var(--prism-secondary), 0.2) 50%,
    rgba(var(--prism-secondary), 0.05) 75%,
    transparent 100%
  );
  clip-path: polygon(
    0% 0%, 0% 15%, 8% 22%, 12% 18%, 18% 28%, 25% 20%, 32% 30%,
    38% 25%, 45% 35%, 52% 28%, 58% 38%, 65% 32%, 72% 25%,
    78% 35%, 85% 28%, 92% 22%, 100% 18%, 100% 0%
  );
  animation: wave-drift-medium 18s ease-in-out infinite reverse;
}

/* Tertiary Wave */
.navbar-fade__wave--tertiary {
  background: linear-gradient(
    180deg,
    rgba(var(--prism-tertiary), 0.4) 0%,
    rgba(var(--prism-tertiary), 0.2) 30%,
    rgba(var(--prism-tertiary), 0.05) 60%,
    transparent 100%
  );
  clip-path: polygon(
    0% 0%, 0% 10%, 6% 15%, 12% 12%, 18% 18%, 24% 14%, 30% 20%,
    36% 16%, 42% 22%, 48% 18%, 54% 24%, 60% 20%, 66% 15%,
    72% 22%, 78% 17%, 84% 12%, 90% 18%, 96% 14%, 100% 10%, 100% 0%
  );
  animation: wave-drift-fast 12s ease-in-out infinite;
}

/* Shimmer */
.navbar-fade__shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 80%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 30%,
    rgba(255, 255, 255, 0.25) 50%,
    rgba(255, 255, 255, 0.15) 70%,
    transparent 100%
  );
  animation: shimmer-sweep 10s ease-in-out infinite;
}

/* Bottom feather */
.navbar-fade__feather {
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  height: 40px;
  background: radial-gradient(
    ellipse 80% 100% at 50% 0%,
    rgba(var(--prism-primary), 0.15) 0%,
    transparent 70%
  );
  filter: blur(15px);
}

/* Animations */
@keyframes wave-drift-slow {
  0%, 100% { transform: translateX(0) scaleY(1); }
  25% { transform: translateX(-12%) scaleY(1.05); }
  50% { transform: translateX(-25%) scaleY(0.95); }
  75% { transform: translateX(-12%) scaleY(1.02); }
}

@keyframes wave-drift-medium {
  0%, 100% { transform: translateX(0) scaleY(1); }
  33% { transform: translateX(-16%) scaleY(1.08); }
  66% { transform: translateX(-33%) scaleY(0.92); }
}

@keyframes wave-drift-fast {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
}

@keyframes shimmer-sweep {
  0% { left: -50%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { left: 150%; opacity: 0; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .navbar-fade__wave,
  .navbar-fade__shimmer {
    animation: none;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .navbar-fade {
    height: 80px;
  }
  .navbar-fade__wave--tertiary,
  .navbar-fade__shimmer {
    display: none;
  }
}
```

### Step 4: Ensure proper positioning

The navbar wrapper/header container needs `position: relative` so the fade positions correctly. Check that it has this, or add it:

```css
/* The header/navbar wrapper needs relative positioning */
.header, 
.navbar-wrapper,
header {
  position: relative; /* or fixed/sticky - just not static */
}
```

## Key instructions:

1. **DO NOT** change the prism gradient, butterflies, logo, or any existing navbar styling
2. **ONLY ADD** the fade effect HTML and CSS
3. **MATCH THE COLORS** — look at the existing navbar CSS to find the exact gradient colors and update `--prism-primary`, `--prism-secondary`, `--prism-tertiary` to match
4. The fade should seamlessly extend the existing prism colors downward with animated waves

## Expected result:

- Navbar looks exactly the same as before (prism, butterflies, everything)
- BUT the bottom edge now dissolves into the page with animated waves
- No hard line visible where navbar ends
- The fade colors match the navbar's prism gradient perfectly

---

Please find the navbar component, look at its existing gradient colors, and add this fade effect while preserving everything else exactly as is.
