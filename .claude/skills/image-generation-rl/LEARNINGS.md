# EVOLEA Image Generation Learnings

> **Last Updated**: 2024-12-27
> **Version**: 1.0
> **Total Training Sessions**: 0

This file stores learned preferences from user feedback. It is automatically updated during training sessions and used to enhance future image generation prompts.

---

## Style Preferences (Ranked by Score)

### STRONG POSITIVE (+3) - Always Include

| Pattern | Source | Date Added |
|---------|--------|------------|
| Soft dreamy watercolor with floating clouds | Initial (liked images) | 2024-12-27 |
| Layered colorful clouds in lavender, mint, coral, cream | Initial (liked images) | 2024-12-27 |
| Whimsical, ethereal atmosphere | Initial (liked images) | 2024-12-27 |
| Delicate butterflies with gradient wings | Initial (liked images) | 2024-12-27 |
| Pastel gradient backgrounds | Initial (liked images) | 2024-12-27 |
| Gentle, diffused lighting | Initial (liked images) | 2024-12-27 |
| Soft children's book illustration style | Initial (liked images) | 2024-12-27 |

### POSITIVE (+1) - Prefer When Relevant

| Pattern | Source | Date Added |
|---------|--------|------------|
| Children aged 5-8 for most programs | Brand guide | 2024-12-27 |
| Children aged 3-5 for Mini Garten | Brand guide | 2024-12-27 |
| Swiss/Central European features | User requirement | 2024-12-27 |
| Round table collaborative settings | Initial (liked images) | 2024-12-27 |
| Natural window light streaming in | Initial (liked images) | 2024-12-27 |
| Warm indoor settings | Initial (liked images) | 2024-12-27 |
| Unicorns as alternative to butterflies | User preference | 2024-12-27 |

### NEUTRAL (0) - Test and Learn

| Pattern | Notes |
|---------|-------|
| Teacher characters in scenes | To be tested |
| Outdoor garden settings | To be tested |
| Activity-focused compositions | To be tested |
| Multiple children interacting | To be tested |

### NEGATIVE (-1) - Avoid Unless Specified

| Pattern | Reason | Date Added |
|---------|--------|------------|
| Photorealistic children's faces | User feedback | 2024-12-27 |
| American cultural elements | Brand guide | 2024-12-27 |
| Generic stock photo look | User feedback | 2024-12-27 |
| Hard edges or sharp contrasts | Style preference | 2024-12-27 |
| Busy, cluttered compositions | Style preference | 2024-12-27 |

### STRONG NEGATIVE (-3) - Never Include

| Pattern | Reason | Date Added |
|---------|--------|------------|
| Puzzle piece symbols | Autism community rejects | 2024-12-27 |
| Clinical/medical settings | Brand guide | 2024-12-27 |
| Religious symbols on children | Brand guide | 2024-12-27 |
| Dark or muted colors | Brand guide | 2024-12-27 |
| Isolated or distressed children | Brand guide | 2024-12-27 |
| Adults dominating scenes | Brand guide | 2024-12-27 |

---

## Element Library

### Children (Central European - Swiss Context)

```yaml
appearance:
  skin_tones:
    - Light/fair with warm undertones
    - Peachy/rosy complexions
    - NO: Very dark skin tones outside European range

  hair_colors:
    - Blonde (light to golden)
    - Light brown
    - Auburn/reddish
    - Brown
    - NO: Very dark black hair (rare in Switzerland)

  features:
    - Soft, rounded faces
    - Friendly, genuine expressions
    - Natural, not overly styled
    - Varied but European-typical

  ages:
    - Mini Garten: 3-5 years
    - Mini Projekte/Turnen/Museum: 5-8 years
    - General: 5-8 years default

  clothing:
    - Casual, colorful
    - Gender-neutral options
    - NO: Religious symbols or head coverings
```

### Magical/Decorative Elements

```yaml
butterflies:
  style: Delicate, semi-transparent
  colors: Gradient wings (lavender to magenta, mint to coral)
  placement: Floating around edges, not central focus
  density: Sparse to moderate (5-15 per image)

unicorns:
  style: Soft, pastel, friendly-looking
  colors: White/cream with rainbow mane/tail
  mood: Gentle, magical, not intimidating
  usage: Alternative to butterflies, not combined

clouds:
  style: Fluffy, layered, colorful
  colors: Lavender, mint, coral, cream, soft pink
  composition: Dreamy, floating, ethereal

sparkles:
  style: Subtle, gentle glints
  density: Light - not overwhelming
  placement: Scattered, not uniform
```

### Teachers (Based on EVOLEA Team)

```yaml
gianna_spiess:
  gender: Female
  role: Co-Founder, Psychologist
  appearance: Professional but warm, approachable
  hair: [Reference team photo]
  style: Confident, nurturing presence

annemarie_elias:
  gender: Female
  role: Co-Founder, Psychologist
  appearance: Friendly, approachable, warm smile
  style: Engaging, supportive demeanor

christoph_jenny:
  gender: Male
  role: Co-Founder
  appearance: Supportive, engaged, friendly
  style: Active participant, not dominating

alexandra_aleksic:
  gender: Female
  role: Co-Founder, Psychology Student
  appearance: Young, energetic, enthusiastic
  style: Relatable, peer-like with children
```

---

## Prompt Enhancement Templates

### Base Enhancement (Apply to All Prompts)

```
ALWAYS ADD:
- "Soft watercolor children's book illustration style"
- "Warm, inclusive atmosphere"
- "EVOLEA brand colors: lavender, mint, coral, magenta, cream"
- "Delicate butterflies as decorative elements" (unless unicorns specified)
- "Swiss design sensibility - clean, uncluttered"

ALWAYS EXCLUDE:
- "NO puzzle pieces"
- "NO clinical or medical settings"
- "NO religious symbols on children"
- "NO dark or muted colors"
- "NO photorealistic style"
- "NO American cultural elements"
```

### Style Modifiers (Option B Enhancements)

```yaml
modifier_pool:
  - "Extra ethereal with floating sparkles"
  - "More prominent cloud layers"
  - "Stronger lavender-mint gradient"
  - "Additional butterfly details"
  - "Softer, dreamier lighting"
  - "More whimsical cloud formations"
  - "Enhanced pastel color saturation"
  - "Gentle golden hour lighting"
```

---

## Training History

| Date | Session ID | Target | Rounds | Winner | Key Learnings |
|------|-----------|--------|--------|--------|---------------|
| (No sessions yet) | | | | | |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-27 | Initial creation with pre-populated preferences from user's liked images |
