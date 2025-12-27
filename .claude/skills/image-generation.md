# EVOLEA Image Generation Skill

> **DEPRECATED**: This skill has been superseded by the RL-based image generation system.
> **See**: `.claude/skills/image-generation-rl/SKILL.md`

---

## New System Features

The new image generation system includes:

1. **MCP Server** for Claude Desktop/App integration
2. **Reinforcement Learning** from user feedback
3. **A/B Comparison Training** workflow
4. **Persistent Learnings** stored in LEARNINGS.md
5. **GitHub Publishing** for mobile access

## Quick Start

### In Claude Desktop (Recommended)
```
"Generate an image of children doing art together"
"Create an A/B comparison for Mini Projekte hero"
```

### Command Line
```bash
# A/B comparison training
python scripts/generate_image.py "children ages 5-8 creating art" \
  --name mini-projekte-hero \
  --training

# Auto-select with Claude
python scripts/generate_image.py "children ages 5-8 creating art" \
  --name mini-projekte-hero \
  --auto-select
```

## Documentation

| Document | Location |
|----------|----------|
| Main Skill | `.claude/skills/image-generation-rl/SKILL.md` |
| Training Guide | `.claude/skills/image-generation-rl/TRAINING-GUIDE.md` |
| Learned Preferences | `.claude/skills/image-generation-rl/LEARNINGS.md` |
| Style Profiles | `.claude/skills/image-generation-rl/style-profiles/` |

## MCP Server Setup

See `scripts/claude_desktop_mcp_config.json` for configuration.

---

*Last updated: 2025-12-27*
