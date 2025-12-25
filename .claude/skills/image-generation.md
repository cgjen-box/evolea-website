# EVOLEA Image Generation Skill

> **Purpose**: Generate brand-consistent AI images for EVOLEA using Gemini 3 Pro with automatic selection via Claude evaluation.

## Quick Reference

```bash
# Fully automated (generate 4 images + auto-select best)
python scripts/generate_image.py "your prompt" --name image-name --auto-select

# Manual review (generate only)
python scripts/generate_image.py "your prompt" --name image-name
```

---

## When to Use This Skill

Use the image generation pipeline when you need:
- Program hero images (Mini Museum, Mini Garten, etc.)
- Blog post illustrations
- Decorative background elements
- Social media graphics

**DO NOT use for:**
- Team photos (use real photos)
- Event documentation (use real photos)
- Logos or brand marks (use existing assets)

---

## Prompt Engineering for EVOLEA

### Required Elements in Every Prompt

1. **Subject**: What/who is in the image
2. **Age range**: Typically "children aged 3-5" or "aged 5-8"
3. **Activity**: What they're doing
4. **Setting**: Where (garden, museum, kitchen, etc.)
5. **Mood**: Joyful, calm, engaged, creative
6. **Dominant colors**: Which EVOLEA colors to emphasize

### Prompt Template

```
[Subject] aged [age range] [activity] in [setting].
[Additional details about composition or elements].
Mood: [emotional quality].
Dominant colors: [2-3 EVOLEA colors].
[Special requirements like "space for text on right side"].
```

### Example Prompts by Program

**Mini Museum** (lavender dominant):
```
Children aged 5-8 as young artists and curators in a whimsical museum gallery.
Creating colorful artwork, carefully hanging pictures, guiding imaginary visitors.
Warm wood floors, soft natural light, art on walls in background.
Mood: Creative pride, artistic expression, celebration of unique perspectives.
Dominant colors: lavender, magenta, gold accents.
Composition: Leave space on right for text overlay.
```

**Mini Garten** (mint dominant):
```
Young children aged 3-5 exploring a lush garden together.
Watering plants, discovering insects, planting seeds, touching leaves.
Outdoor setting with soft dappled sunlight, raised garden beds.
Mood: Wonder, discovery, connection with nature.
Dominant colors: mint, coral, cream background.
Include: Delicate butterflies as decorative elements.
```

**Mini Turnen** (sky blue dominant):
```
Children aged 5-8 engaged in joyful movement and play.
Jumping, balancing on soft mats, playing with colorful equipment.
Bright gymnasium with natural light, soft flooring.
Mood: Energy, confidence, fun, achievement.
Dominant colors: sky blue, coral, gold highlights.
```

**Mini Restaurant** (coral dominant):
```
Children aged 5-8 running a pretend restaurant kitchen.
Cooking together, setting tables with care, serving food proudly.
Warm kitchen setting with wooden elements, cozy atmosphere.
Mood: Teamwork, pride, nurturing, creativity.
Dominant colors: coral, gold, cream.
```

---

## Command Reference

### Basic Generation (4 images, manual review)

```bash
python scripts/generate_image.py \
  "children creating art in museum" \
  --name mini-museum-hero \
  --category programs
```

### Fully Automated (generate + select + deploy)

```bash
python scripts/generate_image.py \
  "children creating art in museum" \
  --name mini-museum-hero \
  --category programs \
  --auto-select
```

### Options

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--name` | `-n` | required | Output filename (no extension) |
| `--category` | `-c` | programs | Folder: programs, blog, decorative |
| `--count` | | 4 | Number of variations to generate |
| `--aspect` | `-a` | 16:9 | Aspect ratio: 16:9, 4:3, 1:1, 9:16 |
| `--auto-select` | `-s` | false | Auto-select best with Claude |
| `--output-json` | `-j` | false | Output result as JSON |

### Aspect Ratio Guide

| Use Case | Aspect Ratio |
|----------|--------------|
| Hero images | 16:9 |
| Blog cards | 4:3 |
| Social media squares | 1:1 |
| Stories / mobile | 9:16 |

---

## Workflow Integration

### Scenario: Need a new program hero image

1. **Identify the need**: Mini Museum page needs a hero image

2. **Craft the prompt** using the template above

3. **Generate with auto-select**:
   ```bash
   python scripts/generate_image.py \
     "Children aged 5-8 as young artists in whimsical museum. Creating art, hanging pictures. Lavender and magenta colors, butterflies, soft watercolor style. Space for text on right." \
     --name mini-museum-hero \
     --category programs \
     --auto-select
   ```

4. **Script outputs**:
   - 4 generated images in `public/images/generated/programs/`
   - Comparison grid for reference
   - Auto-selected best image
   - Final image at `public/images/programs/mini-museum-hero.png`

5. **Update the page**:
   ```astro
   <img 
     src="/images/programs/mini-museum-hero.png"
     alt="Kinder gestalten Kunst im Mini Museum"
   />
   ```

### Scenario: Manual review needed

If auto-selection isn't appropriate (subjective choice needed):

1. **Generate without auto-select**:
   ```bash
   python scripts/generate_image.py \
     "your prompt" \
     --name image-name
   ```

2. **View the comparison grid**:
   ```bash
   # In Claude Code, use view tool
   view public/images/generated/programs/image-name_GRID.png
   ```

3. **Evaluate against criteria**:
   - Brand colors present?
   - Soft illustration style (not photorealistic)?
   - Children shown positively?
   - No forbidden elements (puzzle pieces, etc.)?
   - Good composition with text space?

4. **Copy selected image to final location**:
   ```bash
   cp public/images/generated/programs/image-name_v2.png \
      public/images/programs/image-name.png
   ```

---

## Output Locations

```
public/
└── images/
    ├── generated/              # All AI-generated images
    │   ├── programs/           # Program-related images
    │   │   ├── mini-museum-hero_20241225_v1.png
    │   │   ├── mini-museum-hero_20241225_v2.png
    │   │   ├── mini-museum-hero_20241225_v3.png
    │   │   ├── mini-museum-hero_20241225_v4.png
    │   │   └── mini-museum-hero_20241225_GRID.png
    │   ├── blog/
    │   ├── decorative/
    │   └── generation_log.json # History of all generations
    │
    └── programs/               # Final selected images
        └── mini-museum-hero.png
```

---

## Brand Guidelines Enforced Automatically

The script automatically adds these guidelines to every prompt:

### Style Anchor
- Modern children's book illustration
- Soft watercolor textures
- Swiss design sensibility (clean, uncluttered)
- Butterfly motifs as brand element

### Color Palette
- Magenta #DD48E0
- Mint #7BEDD5
- Lavender #CD87F8
- Coral #FF7E5D
- Gold #E8B86D
- Sky Blue #5DADE2
- Cream #FFFBF7

### Automatic Exclusions
- Puzzle piece symbols
- Clinical/medical settings
- Religious symbols on children
- American cultural elements
- Photorealistic style
- Adults dominating scenes

---

## Troubleshooting

### "GEMINI_API_KEY not set"
```bash
export GEMINI_API_KEY="your-key-here"
# Or add to .env.local
```

### "ANTHROPIC_API_KEY required for auto-selection"
```bash
export ANTHROPIC_API_KEY="your-key-here"
# Or run without --auto-select for manual review
```

### No images generated
- Check API key has image generation permissions
- Try reducing `--count` to 2
- Check for API quota limits

### Images don't match brand
- Be more explicit about colors in prompt
- Add specific EVOLEA color hex codes
- Mention "soft watercolor illustration style" explicitly

---

## Quick Prompts Library

Copy-paste these for common needs:

```bash
# Mini Museum Hero
python scripts/generate_image.py "Children aged 5-8 as young artists in whimsical museum gallery. Creating art and hanging pictures. Lavender, magenta, gold colors. Soft watercolor style with butterflies." --name mini-museum-hero --auto-select

# Mini Garten Hero  
python scripts/generate_image.py "Young children aged 3-5 exploring garden together. Watering plants, discovering insects. Mint, coral colors, outdoor sunlight. Soft illustration style." --name mini-garten-hero --auto-select

# Mini Turnen Hero
python scripts/generate_image.py "Children aged 5-8 in joyful movement, jumping and balancing. Bright gymnasium. Sky blue, coral colors. Dynamic but safe feeling." --name mini-turnen-hero --auto-select

# Blog: Neurodiversity
python scripts/generate_image.py "Abstract celebration of neurodiversity. Colorful butterflies emerging from cocoon, each unique. Full EVOLEA spectrum colors, uplifting mood." --name blog-neurodiversity --category blog --aspect 4:3 --auto-select

# Decorative: Butterfly Pattern
python scripts/generate_image.py "Seamless pattern of delicate butterflies in various sizes. Blue-lavender to pink-magenta gradient wings. Floating on cream background." --name pattern-butterflies --category decorative --aspect 1:1 --auto-select
```

---

## Related Skills

- `EVOLEA-DESIGN-UX.md` - Overall design system
- `illustrations.md` - Detailed illustration guidelines
- `accessibility.md` - Alt text requirements for images
