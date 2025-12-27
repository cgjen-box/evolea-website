---
name: image
description: ImageAgent - Generate EVOLEA Brand Images with Reinforcement Learning
---

# EVOLEA Image Generation with Reinforcement Learning

> **Invoke with**: `/image` or use automatically when generating images for the website

This skill provides an intelligent image generation system that learns from user feedback to produce increasingly better, brand-consistent images for EVOLEA.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. LOAD LEARNINGS from LEARNINGS.md                         │
│     - Apply positive patterns (+3, +1 boosts)               │
│     - Include negative patterns in exclusions (-1, -3)      │
├─────────────────────────────────────────────────────────────┤
│  2. GENERATE OPTIONS (A and B)                               │
│     - Option A: Base prompt with current learnings          │
│     - Option B: Base + additional style modifiers           │
│     - Save to: public/images/generated/training/            │
├─────────────────────────────────────────────────────────────┤
│  3. CREATE COMPARISON GRID                                   │
│     - Side-by-side A|B image for easy comparison            │
├─────────────────────────────────────────────────────────────┤
│  4. USER SELECTS                                            │
│     - A, B, or Neither with feedback                        │
├─────────────────────────────────────────────────────────────┤
│  5. UPDATE LEARNINGS                                         │
│     - Boost winning patterns                                │
│     - Record negative patterns from feedback                │
│     - Persist to LEARNINGS.md                               │
├─────────────────────────────────────────────────────────────┤
│  6. ITERATE until satisfied                                  │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Generate with Training Loop

```bash
# Start a training session for a specific image
python scripts/generate_image.py "children ages 5-8 creating art" \
  --name mini-projekte-hero \
  --category programs \
  --training
```

### Manual A/B Generation

```bash
# Generate 2 options with comparison grid
python scripts/generate_image.py "your prompt" \
  --name image-name \
  --count 2 \
  --comparison-grid
```

## Key Files

| File | Purpose |
|------|---------|
| `LEARNINGS.md` | Persistent style preferences with scores |
| `training-log.json` | Full history of all training sessions |
| `style-profiles/*.md` | Pre-defined style templates |

## EVOLEA Style Guidelines

### Central European Children (Ages 5-8)
- **Skin tones**: Light/fair with warm undertones
- **Hair colors**: Blonde, light brown, auburn, brown
- **Features**: Soft, rounded, friendly expressions
- **NO**: Religious symbols, American cultural elements

### Whimsical Style (User's Preferred)
- Soft dreamy watercolor textures
- Floating, layered clouds in spectrum colors
- Ethereal, magical atmosphere
- Delicate butterflies or unicorns
- Pastel gradient backgrounds (lavender, mint, coral, cream)

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Magenta | #DD48E0 | Primary accents |
| Mint | #7BEDD5 | Fresh, nature |
| Lavender | #CD87F8 | Calm, creative |
| Coral | #FF7E5D | Energy, warmth |
| Cream | #FFFBF7 | Backgrounds |

### NEVER Include
- Puzzle piece symbols
- Clinical/medical settings
- Religious symbols on children
- American cultural elements (yellow school buses)
- Photorealistic style
- Dark or muted colors

## Teacher Illustrations

Based on EVOLEA team members:

| Name | Description |
|------|-------------|
| Gianna Spiess | Female, professional, warm, M.Sc. BCBA |
| Annemarie Elias | Female, friendly, approachable, M.Sc. BCBA |
| Christoph Jenny | Male, supportive, engaged |
| Alexandra Aleksic | Female, young, energetic, B.Sc. |

## Prompt Templates

### Program Hero
```
Children aged [AGE] [ACTIVITY] in [SETTING].
Swiss/Central European children with light skin and varied natural hair colors.
[SPECIFIC DETAILS].
Mood: [EMOTION]. Dominant colors: [COLORS].
Soft watercolor children's book illustration style with delicate butterflies.
```

### Abstract/Decorative
```
Soft dreamy [SUBJECT] in whimsical watercolor style.
Layered colorful clouds in lavender, mint, coral, and cream.
Ethereal atmosphere with gentle sparkles.
Delicate butterflies floating softly.
Dominant colors: [COLORS]. Mood: magical, warm, inviting.
```

## Training Session Log Format

Each session is recorded in `training-log.json`:

```json
{
  "sessions": [
    {
      "id": "session_20241227_001",
      "target": "mini-projekte-hero",
      "rounds": [
        {
          "round": 1,
          "option_a": {"path": "...", "prompt": "..."},
          "option_b": {"path": "...", "prompt": "..."},
          "winner": "B",
          "feedback": "Better clouds but kids still too American"
        }
      ],
      "final_image": "public/images/programs/mini-projekte-hero.png",
      "learnings_added": ["+ethereal clouds", "-American-looking children"]
    }
  ]
}
```

## Related Files

- `scripts/generate_image.py` - Main generation script
- `.claude/skills/image-generation.md` - Original skill (deprecated, use this one)
- `.claude/skills/Design skills/illustrations.md` - Illustration guidelines
