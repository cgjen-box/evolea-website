# EVOLEA Image Generation Training Guide

> **How to train the AI to generate better images through iterative feedback**

## Overview

This guide explains how to use reinforcement learning (RL) to improve AI-generated images. Through repeated A/B comparisons and feedback, the system learns your preferences and generates better results over time.

---

## Quick Start (Claude Desktop or Claude App)

### 1. Start a Training Session

Ask Claude:
> "Let's train image generation for Mini Projekte hero. Generate an A/B comparison."

Or use the tool directly:
```
generate_ab_comparison(
  prompt: "Children aged 5-8 doing art together, soft watercolor style",
  name: "mini-projekte-hero"
)
```

### 2. Review the Options

Claude will show you:
- **Option A** - Base interpretation
- **Option B** - Variation with different composition/style
- **Comparison Grid** - Side-by-side view

### 3. Give Feedback

Be specific! Good feedback examples:

| Instead of... | Say this... |
|---------------|-------------|
| "I don't like it" | "The children look too old, should be 5-8" |
| "It's not right" | "Too photorealistic, needs softer watercolor style" |
| "Try again" | "A is better but needs warmer colors, less blue" |

### 4. Iterate Until Satisfied

Keep refining:
> "B is closer. Keep the composition but make the background simpler"

> "Perfect style now! But add a few butterflies at the edges"

### 5. Save the Winner

When you're happy:
> "This one is great! Publish it so I can see it on my phone"

---

## Effective Feedback Patterns

### What Works (The 5 Dimensions)

1. **Style** - Watercolor vs realistic, soft vs sharp edges
2. **Composition** - Close-up vs wide, centered vs off-center
3. **Colors** - Warmer/cooler, more/less saturated, specific palette
4. **Subjects** - Age of children, number of people, activities
5. **Mood** - Energetic vs calm, playful vs focused

### Feedback Templates

**Choosing between A and B:**
> "A is better because [reason]. Keep [specific element] but change [specific element]."

**Neither works:**
> "Neither works. The main issue is [problem]. Try [specific direction]."

**Getting closer:**
> "B is 80% there. Just need to [small adjustment]."

**Perfect:**
> "A is exactly right. Save this and let's move to the next image."

---

## Training Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  ROUND 1: Initial Generation                                │
│  - Claude generates Option A and Option B                   │
│  - You review and give feedback                             │
│  - Feedback: "B is better but kids look too American"       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ROUND 2: Refined Generation                                │
│  - Claude applies your feedback to new prompts              │
│  - Generates new A/B with adjustments                       │
│  - Feedback: "A has good kids, but too photorealistic"      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ROUND 3: Style Refinement                                  │
│  - Claude focuses on watercolor style                       │
│  - Feedback: "B is almost perfect, add butterflies"         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  ROUND 4: Final Polish                                      │
│  - Claude adds decorative elements                          │
│  - Feedback: "A is perfect! Publish it."                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  SAVE & LEARN                                               │
│  - Image published to GitHub → Cloudflare                   │
│  - Learnings saved for future sessions                      │
│  - Public URL available for mobile                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Sample Training Session

### Session Goal: Mini Projekte Hero Image

**You:** "Let's create a hero image for Mini Projekte. Kids doing art together."

**Claude:** *Generates A/B comparison*
- Option A: `C:\...\mini-projekte_A.png`
- Option B: `C:\...\mini-projekte_B.png`

**You:** "B has better composition but the style is too realistic. Make it more like a watercolor children's book."

**Claude:** *Generates new A/B with watercolor emphasis*

**You:** "A is much better! The watercolor style is good. But the kids look a bit older than 5-8. Also add some of the EVOLEA brand colors - lavender and mint."

**Claude:** *Generates new A/B with younger kids and brand colors*

**You:** "B is almost perfect. Just add a couple of small butterflies floating at the edge and I think we're done."

**Claude:** *Generates final A/B with butterflies*

**You:** "A is exactly what I wanted! Publish it."

**Claude:** *Publishes to GitHub*
> Image published!
> Public URL: https://evolea-website.pages.dev/images/generated/programs/mini-projekte-hero.png

---

## Tips for Faster Training

### Do This:
- Be specific about what you like AND dislike
- Reference previous rounds ("like Round 2 but with...")
- Mention specific elements (colors, ages, composition)
- Give percentage estimates ("80% there, just need...")

### Avoid This:
- Vague feedback ("it's not right")
- Changing too many things at once
- Forgetting what worked in previous rounds
- Not mentioning what you DO like

---

## Building Long-Term Learnings

The system remembers your preferences across sessions. To help it learn faster:

### After Each Session:
1. Summarize what worked: "Soft watercolor, kids 5-8, minimal backgrounds"
2. Note what to avoid: "No photorealistic faces, no heavy clouds"
3. Save successful prompts for reuse

### Reference Successful Images:
> "Generate something like the Mini Projekte hero we made last time, but for Mini Turnen with movement/sports"

---

## EVOLEA-Specific Guidelines

### Always Include:
- Swiss/European children (light skin, varied hair colors)
- EVOLEA brand colors (lavender, mint, coral, magenta, cream)
- Soft, warm, inclusive mood
- Age-appropriate children (3-5 for Mini Garten, 5-8 for others)

### Never Include:
- Puzzle piece symbols
- Religious symbols on children
- Clinical/medical settings
- Dark or muted colors
- Photorealistic style

### Optional Decorative Elements:
- Delicate butterflies (brand motif)
- Soft gradients
- Watercolor textures

---

## Image Categories to Train

| Category | Priority | Key Elements |
|----------|----------|--------------|
| Mini Projekte Hero | High | Kids doing art, collaboration |
| Mini Garten Hero | High | Younger kids (3-5), garden/nature |
| Mini Turnen Hero | High | Movement, sports, energy |
| Mini Museum Hero | Medium | Creative, artistic, gallery |
| Homepage Decorative | Medium | Abstract, brand colors |
| Blog Illustrations | Low | Topic-specific |

---

## Commands Reference

### In Claude Desktop:

**Start training:**
> "Train image generation for [target]"

**Generate comparison:**
> "Generate A/B comparison for [description]"

**Give feedback:**
> "A/B/Neither - [specific feedback]"

**Publish winner:**
> "Publish [A/B/the image] to GitHub"

**Check recent images:**
> "List recent generated images"

**Get brand template:**
> "Show me the brand template for Mini Projekte"

---

## Troubleshooting

### Images look too similar (A ≈ B):
> "Make the variations more distinct. A should be [approach 1], B should be [approach 2]"

### Style isn't matching:
> "Ignore previous style. Fresh start with: [detailed style description]"

### Wrong age/appearance:
> "The children should be specifically 5-8 years old, Swiss/European appearance"

### Too cluttered:
> "Simplify the composition. Focus only on [main subject], minimal background"

---

## Success Metrics

You know training is working when:
- ✅ Each round gets closer to your vision
- ✅ Claude understands your feedback correctly
- ✅ Final images match EVOLEA brand guide
- ✅ You can describe the "winning formula" for future use

---

*Last updated: 2024-12-27*
