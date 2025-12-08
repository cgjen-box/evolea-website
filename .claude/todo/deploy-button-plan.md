# Deploy Button in Keystatic Navbar - Implementation Plan

## Goal
Add a deploy button to the Keystatic CMS interface, positioned in the top-left navbar area below the "evolea CMS" branding.

## Analysis

### Previous Attempt Issues
The previous middleware with HTML injection caused Error 1101 (Worker crash) because:
1. Complex password gate logic
2. Response body manipulation issues
3. Too much code running on every request

### New Approach
Use a **minimal, focused script injection** that:
1. Only runs on `/keystatic` pages
2. Uses MutationObserver to wait for React to render
3. Injects button into existing navbar DOM
4. Keeps middleware simple

## Technical Design

### Keystatic UI Structure
Keystatic is a React SPA. The navbar typically contains:
- Brand/logo area (left)
- Navigation links (center/right)
- User actions (right)

### Injection Strategy
```javascript
// Wait for Keystatic's sidebar/header to load
// Find the brand/navigation area
// Insert deploy button after the brand text
```

### Button Design
- Match Keystatic's UI style (clean, minimal)
- Use EVOLEA brand colors (magenta gradient)
- Show loading state during deploy
- Toast notification for success/error

## Implementation Steps

### Step 1: Create injection script
- Small, self-contained JavaScript
- MutationObserver to detect Keystatic UI
- Deploy button with fetch to /api/deploy
- Inline styles (no external CSS needed)

### Step 2: Update middleware
- Keep existing /api/deploy endpoint
- Add minimal HTML injection for /keystatic pages
- Only inject a `<script>` tag (not full HTML)

### Step 3: Test locally (if possible) or deploy
- Verify button appears in correct location
- Test deploy functionality
- Check for any errors

## Risk Mitigation
- Keep injection script minimal (<2KB)
- Fail silently if UI structure changes
- Don't block Keystatic rendering
- Use try/catch everywhere

## Success Criteria
1. Button appears in Keystatic navbar
2. Clicking button triggers deploy
3. Success/error feedback shown
4. No Error 1101 or 500 errors
