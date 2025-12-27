#!/usr/bin/env python3
"""
EVOLEA Image Generation MCP Server
===================================
Model Context Protocol server for AI image generation with Gemini.

Usage with Claude Desktop:
Add to claude_desktop_config.json:

{
  "mcpServers": {
    "evolea-images": {
      "command": "python",
      "args": ["C:/Users/christoph/evolea-website/scripts/mcp_image_server.py"],
      "env": {
        "GOOGLE_API_KEY": "your-api-key-here"
      }
    }
  }
}
"""

import os
import sys
import json
import base64
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Check and install MCP SDK if needed
try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import Tool, TextContent, ImageContent
except ImportError:
    import subprocess
    print("Installing MCP SDK...", file=sys.stderr)
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'mcp', '-q'])
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import Tool, TextContent, ImageContent

# Load environment
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

# Import from generate_image.py
from generate_image import (
    CONFIG,
    generate_images,
    enhance_prompt,
    create_comparison_grid,
    load_learnings,
    apply_learnings_to_prompt,
)

# Initialize MCP server
server = Server("evolea-images")


@server.list_tools()
async def list_tools() -> List[Tool]:
    """List available image generation tools."""
    return [
        Tool(
            name="generate_image",
            description="""Generate an image using Gemini AI for EVOLEA website.

Returns the file path to the generated image. Use for:
- Program hero images (Mini Projekte, Mini Garten, etc.)
- Blog illustrations
- Decorative elements

The image will be saved to public/images/generated/
Optionally publish to GitHub to get a public URL accessible on mobile.""",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "Image generation prompt. Be specific about style, colors, subjects."
                    },
                    "name": {
                        "type": "string",
                        "description": "Output filename (without extension), e.g., 'mini-projekte-hero'"
                    },
                    "category": {
                        "type": "string",
                        "description": "Category folder: programs, blog, decorative, training",
                        "default": "programs"
                    },
                    "aspect_ratio": {
                        "type": "string",
                        "description": "Aspect ratio: 16:9, 4:3, 1:1, 9:16",
                        "default": "16:9"
                    },
                    "publish": {
                        "type": "boolean",
                        "description": "If true, commit to GitHub and return public URL",
                        "default": False
                    }
                },
                "required": ["prompt", "name"]
            }
        ),
        Tool(
            name="generate_ab_comparison",
            description="""Generate two image variations (A and B) for comparison.

Use this for training/refining the image style. Returns paths to:
- Option A image
- Option B image
- Comparison grid showing both side-by-side

After viewing, provide feedback on which you prefer (A, B, or neither with details).""",
            inputSchema={
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "Base prompt for image generation"
                    },
                    "name": {
                        "type": "string",
                        "description": "Base name for output files"
                    },
                    "variation_b_modifier": {
                        "type": "string",
                        "description": "Additional modifier for Option B to create variation",
                        "default": ""
                    },
                    "category": {
                        "type": "string",
                        "description": "Category: programs, blog, decorative, training",
                        "default": "training"
                    }
                },
                "required": ["prompt", "name"]
            }
        ),
        Tool(
            name="list_generated_images",
            description="List recently generated images in a category folder.",
            inputSchema={
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Category folder to list: programs, blog, decorative, training",
                        "default": "programs"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of images to list",
                        "default": 10
                    }
                }
            }
        ),
        Tool(
            name="get_brand_prompt_template",
            description="Get the EVOLEA brand prompt template for a specific use case.",
            inputSchema={
                "type": "object",
                "properties": {
                    "template_type": {
                        "type": "string",
                        "description": "Template type: mini-projekte, mini-garten, mini-turnen, mini-museum, blog, decorative",
                        "default": "mini-projekte"
                    }
                }
            }
        ),
        Tool(
            name="publish_image",
            description="""Publish an existing local image to GitHub and get a public URL.

The image will be committed to the repo and available at:
https://evolea-website.pages.dev/images/generated/...

Use this to share images or access them on mobile.""",
            inputSchema={
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "Local file path to the image to publish"
                    },
                    "commit_message": {
                        "type": "string",
                        "description": "Git commit message",
                        "default": "Add generated image"
                    }
                },
                "required": ["file_path"]
            }
        ),
        Tool(
            name="get_training_guide",
            description="""Get the training guide for reinforcement learning image generation.

Shows how to effectively train the AI through iterative A/B feedback:
- How to give effective feedback
- Sample training session
- Tips for faster training
- EVOLEA-specific guidelines""",
            inputSchema={
                "type": "object",
                "properties": {
                    "section": {
                        "type": "string",
                        "description": "Specific section: quick-start, feedback-tips, workflow, sample-session, or all",
                        "default": "quick-start"
                    }
                }
            }
        )
    ]


@server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent | ImageContent]:
    """Handle tool calls."""

    if name == "generate_image":
        return await handle_generate_image(arguments)
    elif name == "generate_ab_comparison":
        return await handle_generate_ab_comparison(arguments)
    elif name == "list_generated_images":
        return await handle_list_images(arguments)
    elif name == "get_brand_prompt_template":
        return await handle_get_template(arguments)
    elif name == "publish_image":
        return await handle_publish_image(arguments)
    elif name == "get_training_guide":
        return await handle_get_training_guide(arguments)
    else:
        return [TextContent(type="text", text=f"Unknown tool: {name}")]


async def handle_get_training_guide(args: Dict[str, Any]) -> List[TextContent]:
    """Get training guide sections."""
    section = args.get("section", "quick-start")

    guides = {
        "quick-start": """## Quick Start Training

**1. Start a session:**
> "Let's train image generation for Mini Projekte hero"

**2. Review A/B options** - Claude shows two variations

**3. Give specific feedback:**
- "A is better but kids look too old"
- "B has better colors, keep those but simpler background"
- "Neither works - too photorealistic, need watercolor style"

**4. Iterate** until you're happy (usually 3-5 rounds)

**5. Publish the winner:**
> "Perfect! Publish this one"

You'll get a public URL to view on mobile.""",

        "feedback-tips": """## Effective Feedback

### The 5 Dimensions:
1. **Style** - "more watercolor", "softer edges", "less realistic"
2. **Composition** - "closer view", "more space on right for text"
3. **Colors** - "warmer tones", "more lavender", "less blue"
4. **Subjects** - "kids should be 5-8", "add one more child"
5. **Mood** - "more joyful", "calmer atmosphere"

### Good Feedback Examples:
- "A is 80% there. Just make the background simpler."
- "B has the right style. Apply that style to A's composition."
- "Neither works. Start fresh with: kids in watercolor style, cream background, butterflies at edges."

### Avoid:
- "I don't like it" (too vague)
- "Try again" (no direction)
- Changing everything at once""",

        "workflow": """## Training Workflow

```
ROUND 1: Initial → Feedback: "B better but too realistic"
    ↓
ROUND 2: Refined → Feedback: "A good kids, wrong colors"
    ↓
ROUND 3: Colors fixed → Feedback: "B almost perfect, add butterflies"
    ↓
ROUND 4: Final → Feedback: "A is perfect! Publish it"
    ↓
DONE: Image published, learnings saved
```

### Tips:
- Each round should fix 1-2 issues max
- Reference what you LIKED from previous rounds
- Be specific about percentages ("80% there")""",

        "sample-session": """## Sample Training Session

**You:** "Train image generation for Mini Projekte"

**Claude:** *Shows A/B comparison*

**You:** "B has better composition but too realistic. Make it watercolor style."

**Claude:** *New A/B with watercolor*

**You:** "A is much better! But kids look 10, should be 5-8. Add lavender and mint colors."

**Claude:** *New A/B with younger kids, brand colors*

**You:** "B is 90% there. Add a few butterflies at the edge."

**Claude:** *New A/B with butterflies*

**You:** "A is perfect! Publish it."

**Claude:** *Publishes*
> Public URL: https://evolea-website.pages.dev/images/generated/programs/mini-projekte-hero.png

**Total: 4 rounds, ~10 minutes**""",

        "all": """## Complete Training Guide

### Quick Start
1. Start: "Train image generation for [target]"
2. Review A/B options
3. Feedback: Be specific about style, composition, colors, subjects, mood
4. Iterate 3-5 rounds
5. Publish winner

### Feedback Dimensions
- Style (watercolor, realistic, soft)
- Composition (close-up, wide, layout)
- Colors (warm, cool, specific palette)
- Subjects (age, count, activities)
- Mood (joyful, calm, energetic)

### EVOLEA Guidelines
**Always:** Swiss children, brand colors (lavender, mint, coral), soft warm mood
**Never:** Puzzle pieces, religious symbols, dark colors, photorealistic

### Workflow
Round 1 → Fix biggest issue → Round 2 → Refine → Round 3 → Polish → Publish

### Commands
- "Generate A/B comparison for..."
- "A/B/Neither - [feedback]"
- "Publish this one"
- "List recent images"
"""
    }

    guide = guides.get(section, guides["quick-start"])
    return [TextContent(type="text", text=guide)]


async def publish_to_github(file_path: Path, commit_message: str = "Add generated image") -> Optional[str]:
    """
    Commit an image to GitHub and return the public URL.

    Returns the Cloudflare Pages URL where the image will be accessible.
    """
    import subprocess

    try:
        # Get relative path from project root
        rel_path = file_path.relative_to(CONFIG.project_root)

        # Git add
        subprocess.run(
            ["git", "add", str(rel_path)],
            cwd=CONFIG.project_root,
            check=True,
            capture_output=True
        )

        # Git commit
        subprocess.run(
            ["git", "commit", "-m", commit_message],
            cwd=CONFIG.project_root,
            check=True,
            capture_output=True
        )

        # Git push
        subprocess.run(
            ["git", "push"],
            cwd=CONFIG.project_root,
            check=True,
            capture_output=True
        )

        # Trigger Cloudflare deploy
        import requests
        requests.post(
            "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/3e0b6230-6965-46cf-a7a2-176969101e48",
            timeout=10
        )

        # Build public URL
        public_url = f"https://evolea-website.pages.dev/{rel_path.as_posix()}"
        return public_url

    except subprocess.CalledProcessError as e:
        return None
    except Exception as e:
        return None


async def handle_publish_image(args: Dict[str, Any]) -> List[TextContent]:
    """Publish an existing image to GitHub."""
    file_path = args.get("file_path", "")
    commit_message = args.get("commit_message", "Add generated image")

    if not file_path:
        return [TextContent(type="text", text="Error: file_path is required")]

    path = Path(file_path)
    if not path.exists():
        return [TextContent(type="text", text=f"Error: File not found: {file_path}")]

    try:
        public_url = await publish_to_github(path, commit_message)

        if public_url:
            result = f"""Image published successfully!

**Local:** `{file_path}`

**Public URL:** {public_url}

The image will be available at this URL after Cloudflare deploys (usually 1-2 minutes)."""
            return [TextContent(type="text", text=result)]
        else:
            return [TextContent(type="text", text="Error: Failed to publish to GitHub. Check git status.")]

    except Exception as e:
        return [TextContent(type="text", text=f"Error publishing: {str(e)}")]


async def handle_generate_image(args: Dict[str, Any]) -> List[TextContent]:
    """Generate a single image."""
    prompt = args.get("prompt", "")
    name = args.get("name", "generated")
    category = args.get("category", "programs")
    aspect_ratio = args.get("aspect_ratio", "16:9")
    publish = args.get("publish", False)

    if not prompt:
        return [TextContent(type="text", text="Error: prompt is required")]

    try:
        output_dir = CONFIG.generated_dir / category

        # Enhance prompt with brand guidelines
        enhanced_prompt = enhance_prompt(prompt)

        # Redirect stdout to stderr during generation (MCP requires clean stdout)
        import io
        import contextlib
        old_stdout = sys.stdout
        sys.stdout = sys.stderr  # Redirect prints to stderr

        try:
            # Generate image
            image_paths = generate_images(
                prompt=enhanced_prompt,
                output_dir=output_dir,
                base_name=name,
                count=1,
                aspect_ratio=aspect_ratio,
                backend="auto"
            )
        finally:
            sys.stdout = old_stdout  # Restore stdout

        if image_paths:
            result = f"""Image generated successfully!

**File:** `{image_paths[0]}`"""

            # Publish to GitHub if requested
            if publish:
                public_url = await publish_to_github(
                    image_paths[0],
                    f"Add generated image: {name}"
                )
                if public_url:
                    result += f"""

**Public URL:** {public_url}

(Available after Cloudflare deploys, ~1-2 min)"""
                else:
                    result += "\n\n*Note: Failed to publish to GitHub*"
            else:
                result += "\n\nUse `publish_image` tool to get a public URL."

            return [TextContent(type="text", text=result)]
        else:
            return [TextContent(type="text", text="Error: No image was generated")]

    except Exception as e:
        return [TextContent(type="text", text=f"Error generating image: {str(e)}")]


async def handle_generate_ab_comparison(args: Dict[str, Any]) -> List[TextContent]:
    """Generate A/B comparison images."""
    prompt = args.get("prompt", "")
    name = args.get("name", "comparison")
    variation_b = args.get("variation_b_modifier", "")
    category = args.get("category", "training")

    if not prompt:
        return [TextContent(type="text", text="Error: prompt is required")]

    try:
        output_dir = CONFIG.generated_dir / category / name
        output_dir.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Redirect stdout to stderr during generation (MCP requires clean stdout)
        old_stdout = sys.stdout
        sys.stdout = sys.stderr

        try:
            # Generate Option A
            prompt_a = enhance_prompt(prompt)
            images_a = generate_images(
                prompt=prompt_a,
                output_dir=output_dir,
                base_name=f"{name}_A",
                count=1,
                aspect_ratio="16:9",
                backend="auto"
            )

            # Generate Option B with variation
            if variation_b:
                prompt_b = enhance_prompt(f"{prompt}\n\nStyle variation: {variation_b}")
            else:
                prompt_b = enhance_prompt(f"{prompt}\n\nCreate a distinct visual interpretation with different composition or color emphasis.")

            images_b = generate_images(
                prompt=prompt_b,
                output_dir=output_dir,
                base_name=f"{name}_B",
                count=1,
                aspect_ratio="16:9",
                backend="auto"
            )
        finally:
            sys.stdout = old_stdout

        if not images_a or not images_b:
            return [TextContent(type="text", text="Error: Failed to generate both options")]

        # Create comparison grid
        from PIL import Image, ImageDraw, ImageFont

        img_a = Image.open(images_a[0])
        img_b = Image.open(images_b[0])

        # Create side-by-side grid
        padding = 20
        label_height = 40
        max_w = max(img_a.width, img_b.width)
        max_h = max(img_a.height, img_b.height)

        grid_w = 2 * max_w + 3 * padding
        grid_h = max_h + label_height + 2 * padding

        grid = Image.new('RGB', (grid_w, grid_h), 'white')

        # Paste images
        grid.paste(img_a, (padding, padding + label_height))
        grid.paste(img_b, (2 * padding + max_w, padding + label_height))

        # Add labels
        try:
            draw = ImageDraw.Draw(grid)
            try:
                font = ImageFont.truetype("arial.ttf", 24)
            except:
                font = ImageFont.load_default()
            draw.text((padding + max_w//2 - 50, padding + 5), "OPTION A", fill='#DD48E0', font=font)
            draw.text((2*padding + max_w + max_w//2 - 50, padding + 5), "OPTION B", fill='#7BEDD5', font=font)
        except:
            pass

        grid_path = output_dir / f"{name}_AB_GRID_{timestamp}.png"
        grid.save(grid_path)

        result = f"""A/B Comparison generated!

**Option A:** `{images_a[0]}`

**Option B:** `{images_b[0]}`

**Comparison Grid:** `{grid_path}`

Review the images and tell me which you prefer:
- **A** - First option
- **B** - Second option
- **Neither** - Describe what to change"""

        return [TextContent(type="text", text=result)]

    except Exception as e:
        import traceback
        return [TextContent(type="text", text=f"Error: {str(e)}\n{traceback.format_exc()}")]


async def handle_list_images(args: Dict[str, Any]) -> List[TextContent]:
    """List generated images in a category."""
    category = args.get("category", "programs")
    limit = args.get("limit", 10)

    image_dir = CONFIG.generated_dir / category

    if not image_dir.exists():
        return [TextContent(type="text", text=f"No images found in category: {category}")]

    # Find all PNG files, sorted by modification time
    images = sorted(image_dir.glob("**/*.png"), key=lambda p: p.stat().st_mtime, reverse=True)[:limit]

    if not images:
        return [TextContent(type="text", text=f"No images found in {category}")]

    result = f"**Recent images in {category}:**\n\n"
    for img in images:
        mtime = datetime.fromtimestamp(img.stat().st_mtime).strftime("%Y-%m-%d %H:%M")
        result += f"- `{img}` ({mtime})\n"

    return [TextContent(type="text", text=result)]


async def handle_get_template(args: Dict[str, Any]) -> List[TextContent]:
    """Get brand prompt template."""
    template_type = args.get("template_type", "mini-projekte")

    templates = {
        "mini-projekte": """Soft watercolor children's book illustration. 3-4 children aged 5-8 collaborating on art project at a round table. Swiss/European children with light skin tones, natural hair colors (blonde, brown, auburn). Bright cozy classroom with window and plants. Pastel colors: lavender, mint, coral, cream. Warm joyful mood. Clean uncluttered Swiss design. Focus on creative collaboration.""",

        "mini-garten": """Gentle watercolor illustration of young children aged 3-5 exploring a garden. Swiss children with fair skin, light hair colors. Outdoor setting with plants, flowers, butterflies. Soft sunlight. Colors: mint green, sunshine yellow, lavender, cream. Mood: wonder, gentle exploration, nurturing.""",

        "mini-turnen": """Dynamic watercolor illustration of children aged 5-8 in playful movement. Swiss children jumping, balancing, playing with soft equipment in a gymnasium. Energetic but safe atmosphere. Colors: sky blue, coral, mint, sunshine yellow. Mood: joy of movement, confidence, playful energy.""",

        "mini-museum": """Creative watercolor illustration of children aged 5-8 as young artists in a whimsical museum setting. Swiss children creating art, displaying their work. Colors: lavender, magenta, gold, cream, mint accents. Mood: creative pride, artistic expression.""",

        "blog": """Abstract watercolor illustration for blog post. Soft organic shapes in EVOLEA colors: magenta, mint, lavender, coral. Can include butterfly motifs. Mood varies by topic. Leave space for text overlay.""",

        "decorative": """Abstract decorative pattern or background. Soft pastel gradients, delicate butterfly motifs, flowing organic shapes. EVOLEA colors: lavender, mint, coral, magenta, cream. Ethereal, dreamy atmosphere."""
    }

    template = templates.get(template_type, templates["mini-projekte"])

    result = f"""**EVOLEA Brand Template: {template_type}**

```
{template}
```

**Brand Colors (always include):**
- Magenta: #DD48E0
- Mint: #7BEDD5
- Lavender: #CD87F8
- Coral: #FF7E5D
- Cream: #FFFBF7

**Always avoid:**
- Puzzle piece symbols
- Clinical/medical settings
- Religious symbols on children
- Dark or muted colors
- Photorealistic style"""

    return [TextContent(type="text", text=result)]


async def main():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
