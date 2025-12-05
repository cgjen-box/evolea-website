#!/usr/bin/env python3
"""
EVOLEA ImageAgent - Natural Language Image Generation

A smart agent that takes natural language requests and generates
brand-consistent images for the EVOLEA website.

Usage:
    python scripts/image_agent.py "children playing in a garden"
    python scripts/image_agent.py --interactive
    python scripts/image_agent.py "a hero banner for the homepage" --size 16:9

The agent automatically:
- Applies EVOLEA brand colors and style
- Adds appropriate context for the target audience
- Includes butterfly motifs where appropriate
- Ensures the output fits the EVOLEA aesthetic
"""

import os
import sys
import argparse
import re
from pathlib import Path
from datetime import datetime
from typing import Optional, Tuple, Dict, Any

# Add scripts directory to path
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

from error_handling import (
    OperationResult,
    ErrorInfo,
    ErrorCategory,
    ErrorSeverity,
    ErrorLogger,
    classify_error,
)

# ============================================================================
# EVOLEA BRAND KNOWLEDGE BASE
# ============================================================================

BRAND_IDENTITY = """
## EVOLEA Brand Identity

EVOLEA is a Swiss non-profit organization in Zürich supporting children on the autism spectrum and with ADHD.

### Brand Philosophy
- The visual identity celebrates the SPECTRUM - not just the autism spectrum, but the full spectrum of light, possibility, and human potential
- Colors are SOPHISTICATED, VIBRANT, and ENERGETIC - NOT childish or like a children's book
- Think "someone full of energy on the spectrum who loves big, bold gradient colors"
- The aesthetic should be child-friendly but NOT childish - professional yet warm

### The EVOLEA Butterfly
The butterfly is our symbol of transformation:
- Just as a butterfly emerges in brilliant colors, EVOLEA helps children discover their unique brilliance
- Wings reflect the prism gradient: blue/lavender on left, pink/magenta on right
- Use as decorative elements, icons, or watermarks
- Can appear subtly in scenes (floating in background, on flowers, etc.)
"""

BRAND_COLORS = """
### EVOLEA Color Palette (use exact hex codes)

**Primary - The Magentas:**
- Magenta: #DD48E0 (primary accent, CTAs, highlights)
- Hot Pink: #EF5EDB (secondary accent, hover states)
- Fuchsia Glow: #E97BF1 (gradients, overlays, glows)

**Spectrum Colors:**
- Mint Teal: #7BEDD5 (fresh accents, success, nature)
- Sunshine Yellow: #FFE066 (joy, warmth, highlights)
- Coral: #FF7E5D (warm highlights, energy)
- Soft Coral: #C96861 (muted accents, earthy warmth)
- Gold: #DCD49F (luxury accents, sophistication)
- Lavender: #CD87F8 (soft purple, calm energy)
- Deep Purple: #BA53AD (text on light, deep accents)
- Sky Blue: #5DADE2 (cool accents, trust, clarity)

**Neutrals:**
- Cream: #FFFBF7 (page background)
- Soft Pink: #FFDEDE (light backgrounds, cards)
- Blush: #EF8EAE (soft accents, borders)
- Dark Text: #2D2A32 (primary text)

**Signature Gradients:**
- Prism: mint (#7BEDD5) → yellow (#FFE066) → white → fuchsia (#E97BF1) → lavender (#CD87F8)
- Spectrum Flow: mint → yellow → coral → pink → fuchsia → lavender (loops back)
- Magenta Burst: purple (#BA53AD) → magenta (#DD48E0) → fuchsia (#E97BF1)
- Ocean Dream: mint (#7BEDD5) → sky blue (#5DADE2) → lavender (#CD87F8)
- Sunset Warmth: yellow (#FFE066) → coral (#FF7E5D) → fuchsia (#E97BF1)
"""

BRAND_STYLE = """
### Visual Style Guidelines

**DO:**
- Use bold, vibrant gradient backgrounds
- Use the butterfly as a recurring motif
- Let colors flow like light through a prism
- Embrace the full spectrum - mint, gold, pink, magenta, lavender
- Keep the aesthetic sophisticated, not childish
- Use high contrast for accessibility
- Create warm, joyful, inclusive imagery
- Show diverse children engaged in activities
- Use natural light and warm atmospheres

**DON'T:**
- Use flat, muted, or corporate colors
- Make it look like a children's book
- Use basic primary colors (red, blue, yellow)
- Dim the colors - let them pop!
- Use clinical or institutional imagery
- Show children in deficit-focused contexts

**Image Style:**
- Modern digital illustration or photography
- Warm, watercolor-inspired effects work well
- Soft gradients and glows
- Natural, inclusive representation
- Joyful expressions and body language
"""

PROGRAMS_CONTEXT = """
### EVOLEA Programs (for context)

1. **Mini Garten** - Kindergarten preparation for ages 3-6
   - Focus: Nature, gardening, gentle activities
   - Colors: Mint greens, sunshine yellows, soft pinks

2. **Mini Projekte** - Creative social skills for ages 5-8
   - Focus: Art, crafts, collaboration, creativity
   - Colors: Coral, yellow, pink - creative energy

3. **Mini Turnen** - Sports/gymnastics for ages 5-8
   - Focus: Movement, play, physical activities
   - Colors: Sky blue, mint - dynamic, fresh

4. **B+U Schulberatung** - School consultation
   - Focus: Support, guidance, professional meetings
   - Colors: Purple, magenta - professional warmth
"""

# Combined brand context for image generation
FULL_BRAND_CONTEXT = f"""
{BRAND_IDENTITY}

{BRAND_COLORS}

{BRAND_STYLE}

{PROGRAMS_CONTEXT}
"""

# ============================================================================
# PROMPT INTELLIGENCE
# ============================================================================

# Keywords that suggest specific contexts
CONTEXT_KEYWORDS = {
    "children": ["child", "children", "kids", "kid", "young", "toddler", "kindergarten"],
    "nature": ["garden", "nature", "plant", "flower", "outdoor", "tree", "grass", "butterfly"],
    "activity": ["play", "playing", "sport", "gym", "movement", "jump", "run", "dance"],
    "creative": ["art", "craft", "paint", "draw", "create", "build", "make", "project"],
    "social": ["together", "group", "friend", "team", "collaborate", "share"],
    "hero": ["hero", "banner", "header", "homepage", "landing", "main"],
    "icon": ["icon", "favicon", "small", "symbol", "mark"],
    "pattern": ["pattern", "background", "texture", "seamless", "tile"],
    "abstract": ["abstract", "decorative", "artistic", "flowing"],
}

# Aspect ratio suggestions based on use case
ASPECT_SUGGESTIONS = {
    "hero": "16:9",
    "banner": "16:9",
    "header": "16:9",
    "card": "4:3",
    "square": "1:1",
    "icon": "1:1",
    "profile": "1:1",
    "portrait": "3:4",
    "illustration": "4:3",
}

# Size suggestions
SIZE_SUGGESTIONS = {
    "hero": "4K",
    "banner": "4K",
    "illustration": "2K",
    "card": "2K",
    "icon": "1K",
    "default": "2K",
}


def analyze_request(user_request: str) -> Dict[str, Any]:
    """
    Analyze the user's request to understand context and intent.
    Returns a dict with detected contexts and suggestions.
    """
    request_lower = user_request.lower()

    analysis = {
        "original_request": user_request,
        "detected_contexts": [],
        "suggested_aspect": "1:1",
        "suggested_size": "2K",
        "style_hints": [],
        "color_hints": [],
    }

    # Detect contexts
    for context, keywords in CONTEXT_KEYWORDS.items():
        if any(kw in request_lower for kw in keywords):
            analysis["detected_contexts"].append(context)

    # Suggest aspect ratio based on detected context
    for use_case, aspect in ASPECT_SUGGESTIONS.items():
        if use_case in request_lower:
            analysis["suggested_aspect"] = aspect
            analysis["suggested_size"] = SIZE_SUGGESTIONS.get(use_case, "2K")
            break

    # Add style hints based on context
    if "children" in analysis["detected_contexts"]:
        analysis["style_hints"].append("inclusive representation of children")
        analysis["style_hints"].append("joyful expressions")
        analysis["style_hints"].append("warm, safe atmosphere")

    if "nature" in analysis["detected_contexts"]:
        analysis["style_hints"].append("natural elements with EVOLEA colors")
        analysis["style_hints"].append("butterflies can appear naturally")
        analysis["color_hints"].extend(["mint (#7BEDD5)", "yellow (#FFE066)"])

    if "creative" in analysis["detected_contexts"]:
        analysis["style_hints"].append("creative energy and color")
        analysis["color_hints"].extend(["coral (#FF7E5D)", "pink (#EF8EAE)", "fuchsia (#E97BF1)"])

    if "activity" in analysis["detected_contexts"]:
        analysis["style_hints"].append("dynamic, energetic feeling")
        analysis["color_hints"].extend(["sky blue (#5DADE2)", "mint (#7BEDD5)"])

    if "hero" in analysis["detected_contexts"] or "abstract" in analysis["detected_contexts"]:
        analysis["style_hints"].append("use prism gradient effect")
        analysis["style_hints"].append("leave space for text overlay")

    return analysis


def build_enhanced_prompt(user_request: str, analysis: Dict[str, Any]) -> str:
    """
    Build an enhanced prompt that combines user request with brand context.
    """
    prompt_parts = []

    # Start with brand context
    prompt_parts.append(FULL_BRAND_CONTEXT)

    # Add the user's request
    prompt_parts.append(f"\n## Your Task\nCreate an image for EVOLEA based on this request:\n\"{user_request}\"\n")

    # Add analysis-based guidance
    if analysis["style_hints"]:
        prompt_parts.append("### Style Guidance:")
        for hint in analysis["style_hints"]:
            prompt_parts.append(f"- {hint}")

    if analysis["color_hints"]:
        prompt_parts.append("\n### Suggested Colors for This Image:")
        for color in analysis["color_hints"]:
            prompt_parts.append(f"- {color}")

    # Add output requirements
    prompt_parts.append(f"""
### Output Requirements:
- Style: Modern, warm digital illustration or high-quality render
- Mood: Joyful, inclusive, professional yet approachable
- Colors: Use EVOLEA brand colors prominently
- The EVOLEA butterfly may appear subtly if appropriate
- Suitable for the EVOLEA website serving children on the autism spectrum
- High quality, suitable for web use
""")

    return "\n".join(prompt_parts)


# ============================================================================
# IMAGE GENERATION
# ============================================================================

def load_api_key() -> Optional[str]:
    """Load API key from .env.local or environment."""
    env_file = SCRIPT_DIR.parent / ".env.local"
    if env_file.exists():
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GOOGLE_API_KEY="):
                    key = line.split("=", 1)[1].strip()
                    if key.startswith('"') and key.endswith('"'):
                        key = key[1:-1]
                    elif key.startswith("'") and key.endswith("'"):
                        key = key[1:-1]
                    return key
    return os.environ.get("GOOGLE_API_KEY")


def get_client(api_key: str):
    """Initialize the Google GenAI client."""
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except ImportError:
        print("\nERROR: google-genai package not installed")
        print("Please run: pip install google-genai pillow")
        sys.exit(1)


def generate_evolea_image(
    user_request: str,
    aspect_ratio: Optional[str] = None,
    image_size: Optional[str] = None,
    output_name: Optional[str] = None
) -> OperationResult:
    """
    Main entry point for the ImageAgent.
    Takes a natural language request and generates a brand-consistent image.
    """
    # Import the generate_image function from generate-asset.py
    from importlib import import_module

    # Load API key
    api_key = load_api_key()
    if not api_key:
        return OperationResult.fail(ErrorInfo(
            category=ErrorCategory.AUTH,
            severity=ErrorSeverity.FATAL,
            message="No API key found. Run 'python scripts/generate-asset.py --setup' first.",
            is_retryable=False
        ))

    # Initialize client
    client = get_client(api_key)

    # Analyze the request
    print("\n" + "=" * 60)
    print("EVOLEA ImageAgent")
    print("=" * 60)
    print(f"\nAnalyzing request: \"{user_request}\"")

    analysis = analyze_request(user_request)

    print(f"Detected contexts: {', '.join(analysis['detected_contexts']) or 'general'}")

    # Use suggested or override with provided values
    final_aspect = aspect_ratio or analysis["suggested_aspect"]
    final_size = image_size or analysis["suggested_size"]

    print(f"Aspect ratio: {final_aspect}")
    print(f"Image size: {final_size}")

    # Build enhanced prompt
    enhanced_prompt = build_enhanced_prompt(user_request, analysis)

    # Generate output name from request
    if not output_name:
        # Create a safe filename from the request
        safe_name = re.sub(r'[^\w\s-]', '', user_request.lower())
        safe_name = re.sub(r'[\s]+', '-', safe_name)[:30]
        output_name = f"agent/{safe_name}"

    print(f"\nGenerating image...")
    print("-" * 40)

    # Import and use the generate_image function
    try:
        # We need to import dynamically - use importlib with full path
        import importlib.util
        spec = importlib.util.spec_from_file_location("generate_asset", SCRIPT_DIR / "generate-asset.py")
        ga = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(ga)

        result = ga.generate_image(client, enhanced_prompt, output_name, final_aspect, final_size)
        return result
    except Exception as e:
        error_info = classify_error(e)
        error_info.details["traceback"] = str(e)
        return OperationResult.fail(error_info)


# ============================================================================
# INTERACTIVE MODE
# ============================================================================

def interactive_mode():
    """Run the ImageAgent in interactive mode."""
    print("\n" + "=" * 60)
    print("EVOLEA ImageAgent - Interactive Mode")
    print("=" * 60)
    print("\nI'll help you generate brand-consistent images for EVOLEA.")
    print("Just describe what you want in natural language!")
    print("\nExamples:")
    print('  - "children playing in a garden with butterflies"')
    print('  - "a hero banner showing transformation and growth"')
    print('  - "kids doing art projects together"')
    print('  - "abstract prism gradient for background"')
    print("\nType 'quit' or 'exit' to leave.\n")

    session_results = []

    while True:
        try:
            print("-" * 40)
            request = input("\nWhat image would you like? > ").strip()

            if not request:
                continue

            if request.lower() in ['quit', 'exit', 'q']:
                break

            # Check for aspect ratio override
            aspect = None
            size = None

            # Parse optional flags from request
            if "--size" in request or "--aspect" in request:
                parts = request.split("--")
                request = parts[0].strip()
                for part in parts[1:]:
                    if part.startswith("size"):
                        size = part.replace("size", "").strip()
                    elif part.startswith("aspect"):
                        aspect = part.replace("aspect", "").strip()

            result = generate_evolea_image(request, aspect, size)
            session_results.append((request[:30], result))

            if result.success:
                print(f"\nImage saved to: {result.value}")
            else:
                print(f"\nFailed: {result.error.message if result.error else 'Unknown error'}")

        except KeyboardInterrupt:
            print("\n\nInterrupted.")
            break
        except Exception as e:
            print(f"\nError: {e}")
            continue

    # Show session summary
    if session_results:
        print("\n" + "=" * 60)
        print("SESSION SUMMARY")
        print("=" * 60)
        succeeded = sum(1 for _, r in session_results if r.success)
        print(f"Generated: {succeeded}/{len(session_results)} images")
        for name, result in session_results:
            status = "[OK]" if result.success else "[FAIL]"
            print(f"  {status} {name}...")

    print("\nGoodbye!")


# ============================================================================
# CLI
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="EVOLEA ImageAgent - Natural language image generation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python image_agent.py "children playing in a garden"
  python image_agent.py "hero banner with butterflies" --aspect 16:9
  python image_agent.py --interactive

The agent automatically applies EVOLEA brand colors, style, and context.
        """
    )

    parser.add_argument(
        "request",
        nargs="?",
        help="Natural language description of the image you want"
    )
    parser.add_argument(
        "--interactive", "-i",
        action="store_true",
        help="Run in interactive mode"
    )
    parser.add_argument(
        "--aspect",
        type=str,
        help="Aspect ratio (1:1, 16:9, 4:3)"
    )
    parser.add_argument(
        "--size",
        type=str,
        help="Image size (1K, 2K, 4K)"
    )
    parser.add_argument(
        "--name",
        type=str,
        help="Output filename (without extension)"
    )

    args = parser.parse_args()

    if args.interactive or not args.request:
        interactive_mode()
    else:
        result = generate_evolea_image(
            args.request,
            args.aspect,
            args.size,
            args.name
        )

        if result.success:
            print(f"\nSuccess! Image saved to: {result.value}")
            sys.exit(0)
        else:
            print(f"\nFailed: {result.error.message if result.error else 'Unknown error'}")
            sys.exit(1)


if __name__ == "__main__":
    main()
