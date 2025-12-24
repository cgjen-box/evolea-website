# Quick Prompt for Claude Code

Copy this:

---

Add a fade effect to the bottom of the EVOLEA navbar. The existing prism gradient and butterflies must stay exactly as they are — only ADD the fade below.

**Task:**
1. Find the Header/Navbar component in `src/components/`
2. Copy the `NavbarFade.astro` component I'm providing to `src/components/`
3. Import and add `<NavbarFade />` right after the closing `</nav>` tag
4. Make sure the header wrapper has `position: relative`
5. Extract the RGB values from the existing navbar gradient colors and pass them as props OR set CSS variables

**The fade component needs colors that match the navbar prism.** Look at the navbar's gradient CSS and extract the main colors. Then either:

Option A - Pass as props:
```astro
<NavbarFade 
  primaryColor="216, 180, 254"
  secondaryColor="249, 168, 212"
  tertiaryColor="196, 181, 253"
/>
```

Option B - Set CSS variables in the header:
```css
header {
  --navbar-fade-primary: 216, 180, 254;
  --navbar-fade-secondary: 249, 168, 212;
  --navbar-fade-tertiary: 196, 181, 253;
}
```

**DO NOT change anything about the navbar itself** — no changes to the prism, butterflies, logo, or layout. Only add the fade component.

I'll share the `NavbarFade.astro` file and a preview of the effect.

---

Then share:
1. `NavbarFade.astro` component
2. `navbar-fade-preview.html` to show what it looks like
