# ImageAgent - Generate EVOLEA Brand Images

Generate brand-consistent images for EVOLEA using natural language with reinforcement learning.

## Your Task

The user wants to generate an image. Their request is: **$ARGUMENTS**

## Instructions

1. **For A/B training (recommended):**
   ```bash
   python scripts/generate_image.py "$ARGUMENTS" \
     --name [generate-a-name] \
     --training
   ```

2. **For single image generation:**
   ```bash
   python scripts/generate_image.py "$ARGUMENTS" \
     --name [generate-a-name] \
     --auto-select
   ```

3. If the request mentions specific aspect ratios or sizes, add the appropriate flags:
   - For hero/banner images: `--aspect 16:9`
   - For cards/illustrations: `--aspect 4:3`
   - For icons/square: `--aspect 1:1`
   - For stories/mobile: `--aspect 9:16`

4. Category options:
   - `--category programs` (default) - Program hero images
   - `--category blog` - Blog illustrations
   - `--category decorative` - Decorative elements
   - `--category training` - Training/comparison images

5. Report the result to the user, including:
   - The file path where the image was saved
   - Any comparison grid generated
   - Suggestions for viewing or publishing the image

## Examples

- `/image children playing in a garden` - generates an illustration
- `/image hero banner for Mini Projekte --aspect 16:9` - generates a hero image
- `/image abstract prism background --category decorative` - generates a decorative background

## MCP Alternative (Claude Desktop)

If using Claude Desktop with the MCP server configured, you can use the tools directly:
- `generate_image` - Generate a single image
- `generate_ab_comparison` - Generate A/B training comparison
- `publish_image` - Publish to GitHub for mobile access

The agent automatically applies EVOLEA brand colors, the butterfly motif, and learned style preferences.
