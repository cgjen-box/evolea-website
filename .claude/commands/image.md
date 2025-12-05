# ImageAgent - Generate EVOLEA Brand Images

Generate brand-consistent images for EVOLEA using natural language.

## Your Task

The user wants to generate an image. Their request is: **$ARGUMENTS**

## Instructions

1. Run the ImageAgent script with the user's request:
   ```bash
   python scripts/image_agent.py "$ARGUMENTS"
   ```

2. If the request mentions specific aspect ratios or sizes, add the appropriate flags:
   - For hero/banner images: `--aspect 16:9 --size 4K`
   - For cards/illustrations: `--aspect 4:3 --size 2K`
   - For icons/square: `--aspect 1:1 --size 1K`

3. Report the result to the user, including:
   - The file path where the image was saved
   - Any warnings or issues encountered
   - Suggestions for viewing the image

## Examples

- `/image children playing in a garden` - generates an illustration
- `/image hero banner with butterflies --aspect 16:9` - generates a hero image
- `/image abstract prism background` - generates a decorative background

The agent automatically applies EVOLEA brand colors, the butterfly motif, and appropriate styling.
