#!/usr/bin/env python3
"""
EVOLEA Asset Generation Tool
Using Nano Banana Pro (Gemini 3 Pro Image)

This script generates brand-aligned visual assets for EVOLEA.

Usage:
    python scripts/generate-asset.py --type logo --variant polish
    python scripts/generate-asset.py --type illustration --program mini-garten
    python scripts/generate-asset.py --prompt "Your custom prompt"
    python scripts/generate-asset.py --interactive

First-time setup:
    python scripts/generate-asset.py --setup
"""

import os
import sys
import argparse
import getpass
import json
import time
import traceback
from pathlib import Path
from datetime import datetime
from typing import Optional, Tuple, Any, Dict

# Add scripts directory to path for local imports
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

from error_handling import (
    OperationResult,
    ErrorInfo,
    ErrorCategory,
    ErrorSeverity,
    ErrorLogger,
    classify_error,
    retry_with_backoff,
    validate_image_data,
    fix_image_data,
    encode_image_for_api,
    is_media_type_error,
    is_rate_limit_error,
    safe_execute,
)

# Project paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ENV_FILE = PROJECT_ROOT / ".env.local"
OUTPUT_BASE = PROJECT_ROOT / "public" / "images" / "generated"
ERROR_LOG_DIR = PROJECT_ROOT / "scripts" / "error_logs"

# Nano Banana Pro model
MODEL = "gemini-3-pro-image-preview"

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 2  # Will use exponential backoff

# ============================================================================
# EVOLEA BRAND CONTEXT
# ============================================================================

BRAND_CONTEXT = """
## EVOLEA Brand Identity

EVOLEA is a Swiss non-profit organization in Zürich supporting children on the autism spectrum and with ADHD. The brand is joyful, warm, professional, and celebrates neurodiversity.

### Core Colors (use exact hex codes)
- Magenta: #DD48E0 (primary accent)
- Hot Pink: #EF5EDB (secondary)
- Fuchsia Glow: #E97BF1 (gradients)
- Purple: #BA53AD (text accents)
- Lavender: #CD87F8 (soft accents)
- Mint Teal: #7BEDD5 (fresh, nature)
- Sunshine Yellow: #FFE066 (joy, warmth)
- Coral: #FF7E5D (energy, creativity)
- Sky Blue: #5DADE2 (calm, clarity)
- Soft Pink: #EF8EAE (warmth)
- Cream background: #FDF8F3

### The EVOLEA Butterfly
The butterfly is central to the brand identity, symbolizing transformation and the beauty of neurodiversity.
- Left wings: Gradient from sky blue (#5DADE2) to lavender (#CD87F8)
- Right wings: Gradient from soft pink (#EF8EAE) to magenta (#DD48E0)
- Body: Dark (#2D2A32)
- Style: Organic, elegant, slightly stylized but not geometric

### Spectrum Gradient
The signature gradient flows: mint (#7BEDD5) → yellow (#FFE066) → coral (#FF7E5D) → pink (#EF8EAE) → magenta (#DD48E0) → lavender (#CD87F8)

### Design Principles
- Joyful and welcoming, never cold or clinical
- Child-friendly but sophisticated, not childish
- Celebrates differences as strengths
- Warm, inclusive, and professional
"""

# ============================================================================
# ASSET TEMPLATES
# ============================================================================

LOGO_PROMPTS = {
    "polish": f"""
{BRAND_CONTEXT}

Create a polished, refined version of the EVOLEA logo:
- Bold, friendly sans-serif text "EVOLEA"
- The spectrum gradient flows naturally through the letters
- A beautiful butterfly perches at the top-right of the letter "A"
- The butterfly has detailed but elegant wings with the brand gradients
- Clean, crisp edges suitable for web and print
- Professional quality, would work for a premium brand

Output on transparent background, high resolution.
""",

    "butterfly": f"""
{BRAND_CONTEXT}

Create a standalone EVOLEA butterfly logo mark:
- Elegant, organic wing shapes (not geometric)
- Left wings: gradient from sky blue (#5DADE2) to lavender (#CD87F8)
- Right wings: gradient from soft pink (#EF8EAE) to magenta (#DD48E0)
- Subtle wing patterns suggesting diversity/spectrum
- Delicate antennae with small decorative tips
- Works perfectly as a favicon and app icon
- Also works at larger sizes

Output on transparent background, centered, 1:1 aspect ratio.
""",

    "wordmark": f"""
{BRAND_CONTEXT}

Create the EVOLEA wordmark (text only, no butterfly):
- Bold, rounded sans-serif font (friendly like Fredoka)
- The spectrum gradient flows through: mint → yellow → coral → pink → magenta → lavender
- Each letter smoothly transitions to the next color
- Confident and approachable
- Professional typography quality

Output on transparent background.
""",

    "full": f"""
{BRAND_CONTEXT}

Create a complete EVOLEA logo lockup:
- The wordmark "EVOLEA" with spectrum gradient
- The butterfly integrated beautifully (on the A or floating nearby)
- Optional: subtle decorative spectrum elements
- Premium, polished appearance
- Would work as a website header or hero element

Output on cream (#FDF8F3) or white background.
""",

    "dark": f"""
{BRAND_CONTEXT}

Create an EVOLEA logo for dark backgrounds:
- White or light-colored wordmark "EVOLEA"
- The butterfly retains its colorful gradients
- Ensures good contrast and visibility
- Elegant and professional on dark purple (#4A3460) background

Show the logo on a dark purple background.
""",
}

ILLUSTRATION_PROMPTS = {
    "mini-garten": f"""
{BRAND_CONTEXT}

Create an illustration for "Mini Garten" (kindergarten preparation program):
- Young children (ages 3-6) engaged in nature/garden activities
- Warm, joyful atmosphere with natural light
- Include elements: plants, gardening tools, butterflies, flowers
- Use the brand colors naturally (mint greens, sunshine yellows, soft pinks)
- Inclusive representation of children
- Whimsical but not cartoonish
- A small EVOLEA butterfly could appear subtly in the scene

Style: Warm, watercolor-inspired digital illustration
Aspect ratio: 4:3, suitable for a card or section image
""",

    "mini-projekte": f"""
{BRAND_CONTEXT}

Create an illustration for "Mini Projekte" (creative social skills program):
- Children (ages 5-8) working on art/craft projects together
- Collaborative, creative atmosphere
- Include: art supplies, colorful creations, happy expressions
- Use coral (#FF7E5D), yellow (#FFE066), and pink (#EF8EAE) prominently
- Show connection and teamwork between children
- Creative energy and joy
- A butterfly motif could appear in the artwork they're creating

Style: Vibrant, playful digital illustration
Aspect ratio: 4:3
""",

    "mini-turnen": f"""
{BRAND_CONTEXT}

Create an illustration for "Mini Turnen" (sports/gymnastics program):
- Children (ages 5-8) doing fun physical activities
- Gymnasium or outdoor sports setting
- Include: balls, movement, jumping, playing
- Use sky blue (#5DADE2) and mint (#7BEDD5) prominently
- Dynamic, energetic but safe feeling
- Children having fun with movement
- Could include a butterfly as a playful element

Style: Dynamic, friendly digital illustration
Aspect ratio: 4:3
""",

    "schulberatung": f"""
{BRAND_CONTEXT}

Create an illustration for "Schulberatung" (school consultation):
- A warm, supportive meeting scene
- Could show: parents, educator, and/or child in consultation
- Professional but warm atmosphere
- Include elements suggesting school (books, classroom elements)
- Use purple (#BA53AD) and magenta (#DD48E0) as accents
- Feeling of support, understanding, and guidance
- A butterfly could appear as a decorative element

Style: Warm, professional digital illustration
Aspect ratio: 4:3
""",

    "hero": f"""
{BRAND_CONTEXT}

Create a hero image for the EVOLEA website homepage:
- Abstract or semi-abstract representation of joy, growth, and diversity
- Flowing spectrum colors creating a sense of movement and life
- Could include subtle butterfly silhouettes
- Light, airy feeling with the cream (#FDF8F3) as base
- Gradient elements with all the spectrum colors
- Modern, premium feel
- Space for text overlay (keep center relatively simple)

Style: Modern abstract/semi-abstract digital art
Aspect ratio: 16:9, hero banner format
Image size: 4K for quality
""",

    "about": f"""
{BRAND_CONTEXT}

Create an illustration for the About/Mission page:
- Represents EVOLEA's mission of supporting neurodivergent children
- Could show: diverse group of children, supportive adults, growth imagery
- Warm, inclusive, hopeful atmosphere
- Butterflies as symbols of transformation
- Community and support feeling
- Professional but heartfelt

Style: Warm, inclusive digital illustration
Aspect ratio: 16:9
""",
}

ICON_PROMPTS = {
    "safety": f"""
{BRAND_CONTEXT}

Create an icon representing "Safety" for EVOLEA:
- Shield or protective symbol
- Incorporate butterfly or spectrum colors
- Warm, not cold or clinical
- Simple enough to work at small sizes
- Use magenta (#DD48E0) as primary color

Style: Clean icon design, 1:1 aspect ratio
""",

    "empower": f"""
{BRAND_CONTEXT}

Create an icon representing "Empowerment" for EVOLEA:
- Rising, growing, or strength symbolism
- Could incorporate butterfly wings or spectrum
- Positive, uplifting feeling
- Use coral (#FF7E5D) as primary color

Style: Clean icon design, 1:1 aspect ratio
""",

    "potential": f"""
{BRAND_CONTEXT}

Create an icon representing "Potential" for EVOLEA:
- Star, spark, or blooming symbolism
- Spectrum colors or butterfly elements
- Hopeful, bright feeling
- Use mint (#7BEDD5) and yellow (#FFE066)

Style: Clean icon design, 1:1 aspect ratio
""",
}

PATTERN_PROMPTS = {
    "butterflies": f"""
{BRAND_CONTEXT}

Create a seamless repeating pattern of EVOLEA butterflies:
- Multiple butterflies in various sizes
- Use all the spectrum colors
- Subtle, suitable for backgrounds
- Light and airy, not overwhelming
- On cream (#FDF8F3) or transparent background

Style: Seamless pattern, tileable
""",

    "spectrum": f"""
{BRAND_CONTEXT}

Create a subtle spectrum gradient pattern:
- Flowing, organic shapes with spectrum colors
- Soft, watercolor-like effect
- Suitable as a subtle background
- Not distracting, gentle

Style: Seamless background pattern
""",
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def load_api_key() -> Optional[str]:
    """Load API key from .env.local file."""
    if ENV_FILE.exists():
        with open(ENV_FILE, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("GOOGLE_API_KEY="):
                    key = line.split("=", 1)[1].strip()
                    # Remove quotes if present
                    if key.startswith('"') and key.endswith('"'):
                        key = key[1:-1]
                    elif key.startswith("'") and key.endswith("'"):
                        key = key[1:-1]
                    return key
    return os.environ.get("GOOGLE_API_KEY")


def save_api_key(api_key: str):
    """Save API key to .env.local file."""
    lines = []
    key_found = False

    if ENV_FILE.exists():
        with open(ENV_FILE, "r") as f:
            for line in f:
                if line.strip().startswith("GOOGLE_API_KEY="):
                    lines.append(f'GOOGLE_API_KEY="{api_key}"\n')
                    key_found = True
                else:
                    lines.append(line)

    if not key_found:
        lines.append(f'GOOGLE_API_KEY="{api_key}"\n')

    with open(ENV_FILE, "w") as f:
        f.writelines(lines)

    # Add to .gitignore if not present
    gitignore = PROJECT_ROOT / ".gitignore"
    if gitignore.exists():
        content = gitignore.read_text()
        if ".env.local" not in content:
            with open(gitignore, "a") as f:
                f.write("\n# Local environment variables (API keys)\n.env.local\n")

    print(f"API key saved to {ENV_FILE}")
    print("(This file is gitignored for security)")


def setup_api_key():
    """Interactive setup for API key."""
    print("\n" + "=" * 60)
    print("EVOLEA Asset Generator - API Key Setup")
    print("=" * 60)

    existing = load_api_key()
    if existing:
        print(f"\nExisting API key found: {existing[:10]}...{existing[-4:]}")
        choice = input("Replace it? (y/N): ").strip().lower()
        if choice != 'y':
            print("Keeping existing key.")
            return existing

    print("\nPlease enter your Google API key.")
    print("(Get one at: https://aistudio.google.com/apikey)")
    print()

    api_key = getpass.getpass("API Key: ").strip()

    if not api_key:
        print("No key entered. Exiting.")
        sys.exit(1)

    save_api_key(api_key)
    return api_key


def get_client(api_key: str):
    """Initialize the Google GenAI client."""
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except ImportError:
        print("\nERROR: google-genai package not installed")
        print("Please run: pip install google-genai pillow")
        sys.exit(1)


def log_error(error_type: str, error_details: dict, output_name: str):
    """Log error details to a file for debugging."""
    ERROR_LOG_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = ERROR_LOG_DIR / f"error_{timestamp}_{output_name.replace('/', '_')}.json"

    log_data = {
        "timestamp": datetime.now().isoformat(),
        "error_type": error_type,
        "output_name": output_name,
        "details": error_details
    }

    try:
        with open(log_file, "w", encoding="utf-8") as f:
            json.dump(log_data, f, indent=2, default=str)
        print(f"  Error log saved: {log_file}")
    except Exception as e:
        print(f"  Could not save error log: {e}")

    return log_file


def parse_api_error(error) -> Tuple[str, dict]:
    """Parse API error to extract useful information."""
    error_str = str(error)
    error_details = {
        "raw_error": error_str,
        "error_type": type(error).__name__,
    }

    # Try to extract JSON error details if present
    try:
        # Look for JSON in the error message
        if "{" in error_str and "}" in error_str:
            start = error_str.find("{")
            end = error_str.rfind("}") + 1
            json_str = error_str[start:end]
            parsed = json.loads(json_str)
            error_details["parsed_error"] = parsed

            # Extract specific error info
            if "error" in parsed:
                error_details["error_message"] = parsed["error"].get("message", "")
                error_details["error_code"] = parsed["error"].get("type", "")
    except (json.JSONDecodeError, KeyError):
        pass

    return error_str, error_details


def validate_image_response(response) -> Tuple[bool, str]:
    """Validate that the response contains a valid image."""
    try:
        if not hasattr(response, 'parts') or not response.parts:
            return False, "Response has no parts"

        for part in response.parts:
            # Check if part has image data
            if hasattr(part, 'as_image'):
                try:
                    image = part.as_image()
                    if image is not None:
                        return True, "Valid image found"
                except Exception as e:
                    return False, f"Error extracting image from part: {e}"

            # Check for inline_data which might have wrong media type
            if hasattr(part, 'inline_data'):
                inline = part.inline_data
                if hasattr(inline, 'mime_type') and hasattr(inline, 'data'):
                    # Log the mime type for debugging
                    mime = inline.mime_type
                    data_len = len(inline.data) if inline.data else 0
                    return False, f"Found inline_data with mime_type={mime}, data_length={data_len}"

        return False, "No image parts found in response"
    except Exception as e:
        return False, f"Error validating response: {e}"


def generate_image(client, prompt: str, output_name: str, aspect_ratio: str = "1:1", image_size: str = "2K") -> OperationResult:
    """
    Generate an image using Nano Banana Pro with FOOLPROOF error handling.

    Returns OperationResult which NEVER raises exceptions.
    Check result.success to see if it worked.
    """
    from google.genai import types
    import io

    # Initialize error logger
    error_logger = ErrorLogger(ERROR_LOG_DIR)

    print(f"\n{'=' * 50}")
    print(f"Generating: {output_name}")
    print(f"Model: {MODEL} (Nano Banana Pro)")
    print(f"Size: {image_size}, Aspect: {aspect_ratio}")
    print("This may take 30-60 seconds...")
    print(f"{'=' * 50}")

    def on_retry(attempt: int, error: ErrorInfo, delay: float):
        """Callback for retry logging."""
        print(f"\n  Retry {attempt}: {error.message}")
        print(f"  Waiting {delay:.1f}s before next attempt...")

    def single_generation_attempt() -> OperationResult:
        """Single attempt at image generation."""
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=['IMAGE'],
                    image_config=types.ImageConfig(
                        aspect_ratio=aspect_ratio,
                        image_size=image_size
                    ),
                )
            )

            # Validate response structure
            if not hasattr(response, 'parts') or not response.parts:
                return OperationResult.fail(ErrorInfo(
                    category=ErrorCategory.API_ERROR,
                    severity=ErrorSeverity.RECOVERABLE,
                    message="Response has no parts",
                    details={"response_type": type(response).__name__},
                    is_retryable=True,
                    retry_after=2
                ))

            # Try to extract image from each part
            for i, part in enumerate(response.parts):
                # Method 1: Try as_image() method
                if hasattr(part, 'as_image'):
                    try:
                        image = part.as_image()
                        if image is not None:
                            return OperationResult.ok(
                                value={"image": image, "source": "as_image", "part_index": i}
                            )
                    except Exception as e:
                        # Log but continue trying other methods
                        print(f"  Warning: as_image() failed on part {i}: {e}")

                # Method 2: Try inline_data with manual extraction
                if hasattr(part, 'inline_data') and part.inline_data:
                    inline = part.inline_data
                    if hasattr(inline, 'data') and inline.data:
                        # Validate and potentially fix the image data
                        mime_type = getattr(inline, 'mime_type', 'image/png')

                        # Get raw bytes
                        raw_data = inline.data
                        if isinstance(raw_data, str):
                            # It might be base64 encoded
                            try:
                                import base64
                                raw_data = base64.b64decode(raw_data)
                            except Exception:
                                raw_data = raw_data.encode('latin-1')

                        # Validate the image data
                        validation = validate_image_data(raw_data, expected_mime=mime_type)

                        if validation.success:
                            # Try to create PIL Image
                            try:
                                from PIL import Image
                                img = Image.open(io.BytesIO(raw_data))
                                img.load()  # Force load
                                return OperationResult.ok(
                                    value={"image": img, "source": "inline_data", "part_index": i},
                                    warnings=validation.warnings
                                )
                            except Exception as pil_err:
                                print(f"  Warning: Could not load inline_data as image: {pil_err}")
                        else:
                            # Try to fix the image
                            print(f"  Image validation failed, attempting to fix...")
                            fix_result = fix_image_data(raw_data, "png")
                            if fix_result.success:
                                try:
                                    from PIL import Image
                                    img = Image.open(io.BytesIO(fix_result.value["data"]))
                                    img.load()
                                    return OperationResult.ok(
                                        value={"image": img, "source": "fixed_inline_data", "part_index": i},
                                        warnings=["Image was auto-fixed from corrupt data"]
                                    )
                                except Exception as fix_pil_err:
                                    print(f"  Warning: Fixed image still failed to load: {fix_pil_err}")

                # Method 3: Check for text response (might contain error message)
                if hasattr(part, 'text') and part.text:
                    text = str(part.text)
                    if "error" in text.lower() or "cannot" in text.lower() or "unable" in text.lower():
                        return OperationResult.fail(ErrorInfo(
                            category=ErrorCategory.API_ERROR,
                            severity=ErrorSeverity.RECOVERABLE,
                            message=f"API returned text instead of image: {text[:200]}",
                            details={"text_response": text},
                            is_retryable=True,
                            retry_after=2
                        ))

            # No image found in any part
            parts_info = []
            for i, part in enumerate(response.parts):
                info = {"index": i, "type": type(part).__name__}
                if hasattr(part, 'text'):
                    info["has_text"] = bool(part.text)
                if hasattr(part, 'inline_data'):
                    info["has_inline_data"] = bool(part.inline_data)
                parts_info.append(info)

            return OperationResult.fail(ErrorInfo(
                category=ErrorCategory.API_ERROR,
                severity=ErrorSeverity.RECOVERABLE,
                message="No valid image found in response",
                details={"parts_info": parts_info},
                is_retryable=True,
                retry_after=3
            ))

        except Exception as e:
            error_info = classify_error(e)

            # Special handling for media type mismatch - try with modified settings
            if is_media_type_error(e):
                error_info.details["suggestion"] = "Try different aspect ratio or size"
                error_info.is_retryable = True
                error_info.retry_after = 2

            return OperationResult.fail(error_info)

    # Execute with retry logic
    print(f"\n  Starting generation (up to {MAX_RETRIES} attempts)...")

    result = retry_with_backoff(
        single_generation_attempt,
        max_retries=MAX_RETRIES,
        initial_delay=RETRY_DELAY_SECONDS,
        max_delay=60.0,
        backoff_factor=2.0,
        on_retry=on_retry
    )

    # Handle final result
    if result.success:
        image = result.value["image"]
        source = result.value.get("source", "unknown")

        # Save the image
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{output_name}_{timestamp}.png"
            filepath = OUTPUT_BASE / filename
            filepath.parent.mkdir(parents=True, exist_ok=True)

            image.save(str(filepath))
            print(f"\n  SUCCESS! Saved: {filepath}")

            if result.warnings:
                print(f"  Warnings: {', '.join(result.warnings)}")

            return OperationResult.ok(
                value=filepath,
                warnings=result.warnings,
                source=source
            )
        except Exception as save_err:
            error_info = ErrorInfo(
                category=ErrorCategory.VALIDATION,
                severity=ErrorSeverity.FATAL,
                message=f"Failed to save image: {save_err}",
                original_error=save_err,
                is_retryable=False
            )
            error_logger.log(error_info, f"save_image:{output_name}")
            return OperationResult.fail(error_info)
    else:
        # Log the final error
        if result.error:
            error_logger.log(result.error, f"generate:{output_name}")

        print(f"\n  FAILED after all attempts")
        print(f"  Error: {result.error.message if result.error else 'Unknown error'}")
        print(f"  Check error logs in: {ERROR_LOG_DIR}")

        return result


# Backward compatibility wrapper
def generate_image_simple(client, prompt: str, output_name: str, aspect_ratio: str = "1:1", image_size: str = "2K") -> Optional[Path]:
    """
    Simple wrapper that returns Path or None (for backward compatibility).
    Use generate_image() for full error information.
    """
    result = generate_image(client, prompt, output_name, aspect_ratio, image_size)
    return result.value if result.success else None


def _print_generation_summary(results: list):
    """Print a summary of generation results."""
    print("\n" + "=" * 60)
    print("GENERATION SUMMARY")
    print("=" * 60)

    succeeded = []
    failed = []

    for name, result in results:
        if result.success:
            succeeded.append((name, result.value))
        else:
            error_msg = result.error.message if result.error else "Unknown error"
            failed.append((name, error_msg))

    if succeeded:
        print(f"\nSucceeded ({len(succeeded)}):")
        for name, path in succeeded:
            print(f"  [OK] {name}: {path}")

    if failed:
        print(f"\nFailed ({len(failed)}):")
        for name, error in failed:
            print(f"  [FAIL] {name}: {error}")

    print(f"\nTotal: {len(succeeded)}/{len(results)} succeeded")

    if failed:
        print(f"\nCheck error logs in: {ERROR_LOG_DIR}")

    print("=" * 60)


# ============================================================================
# MAIN COMMANDS
# ============================================================================

def cmd_setup(args):
    """Setup API key."""
    setup_api_key()
    print("\nSetup complete! You can now generate assets.")


def cmd_logo(args):
    """Generate logo variations."""
    api_key = load_api_key()
    if not api_key:
        print("No API key found. Run with --setup first.")
        sys.exit(1)

    client = get_client(api_key)
    variant = args.variant or "polish"

    results = []
    if variant == "all":
        for name, prompt in LOGO_PROMPTS.items():
            result = generate_image(client, prompt, f"logo/{name}", "1:1", "2K")
            results.append((name, result))
    elif variant in LOGO_PROMPTS:
        result = generate_image(client, LOGO_PROMPTS[variant], f"logo/{variant}", "1:1", "2K")
        results.append((variant, result))
    else:
        print(f"Unknown variant: {variant}")
        print(f"Available: {', '.join(LOGO_PROMPTS.keys())}, all")
        return

    # Summary
    _print_generation_summary(results)


def cmd_illustration(args):
    """Generate program illustrations."""
    api_key = load_api_key()
    if not api_key:
        print("No API key found. Run with --setup first.")
        sys.exit(1)

    client = get_client(api_key)
    program = args.program or "hero"

    # Determine aspect ratio and size
    if program == "hero":
        aspect = "16:9"
        size = "4K"
    elif program == "about":
        aspect = "16:9"
        size = "2K"
    else:
        aspect = "4:3"
        size = "2K"

    results = []
    if program == "all":
        for name, prompt in ILLUSTRATION_PROMPTS.items():
            asp = "16:9" if name in ["hero", "about"] else "4:3"
            sz = "4K" if name == "hero" else "2K"
            result = generate_image(client, prompt, f"illustrations/{name}", asp, sz)
            results.append((name, result))
    elif program in ILLUSTRATION_PROMPTS:
        result = generate_image(client, ILLUSTRATION_PROMPTS[program], f"illustrations/{program}", aspect, size)
        results.append((program, result))
    else:
        print(f"Unknown program: {program}")
        print(f"Available: {', '.join(ILLUSTRATION_PROMPTS.keys())}, all")
        return

    _print_generation_summary(results)


def cmd_icon(args):
    """Generate icons."""
    api_key = load_api_key()
    if not api_key:
        print("No API key found. Run with --setup first.")
        sys.exit(1)

    client = get_client(api_key)
    name = args.name or "all"

    results = []
    if name == "all":
        for icon_name, prompt in ICON_PROMPTS.items():
            result = generate_image(client, prompt, f"icons/{icon_name}", "1:1", "1K")
            results.append((icon_name, result))
    elif name in ICON_PROMPTS:
        result = generate_image(client, ICON_PROMPTS[name], f"icons/{name}", "1:1", "1K")
        results.append((name, result))
    else:
        print(f"Unknown icon: {name}")
        print(f"Available: {', '.join(ICON_PROMPTS.keys())}, all")
        return

    _print_generation_summary(results)


def cmd_pattern(args):
    """Generate patterns."""
    api_key = load_api_key()
    if not api_key:
        print("No API key found. Run with --setup first.")
        sys.exit(1)

    client = get_client(api_key)
    name = args.name or "butterflies"

    results = []
    if name == "all":
        for pattern_name, prompt in PATTERN_PROMPTS.items():
            result = generate_image(client, prompt, f"patterns/{pattern_name}", "1:1", "2K")
            results.append((pattern_name, result))
    elif name in PATTERN_PROMPTS:
        result = generate_image(client, PATTERN_PROMPTS[name], f"patterns/{name}", "1:1", "2K")
        results.append((name, result))
    else:
        print(f"Unknown pattern: {name}")
        print(f"Available: {', '.join(PATTERN_PROMPTS.keys())}, all")
        return

    _print_generation_summary(results)


def cmd_custom(args):
    """Generate with custom prompt."""
    api_key = load_api_key()
    if not api_key:
        print("No API key found. Run with --setup first.")
        sys.exit(1)

    client = get_client(api_key)

    # Add brand context to custom prompt
    full_prompt = f"{BRAND_CONTEXT}\n\n{args.prompt}"

    aspect = args.aspect or "1:1"
    size = args.size or "2K"
    name = args.name or "custom"

    result = generate_image(client, full_prompt, f"custom/{name}", aspect, size)
    _print_generation_summary([(name, result)])


def cmd_interactive(args):
    """Interactive mode with foolproof error handling."""
    api_key = load_api_key()
    if not api_key:
        api_key = setup_api_key()

    client = get_client(api_key)

    print("\n" + "=" * 60)
    print("EVOLEA Asset Generator - Interactive Mode")
    print("=" * 60)

    session_results = []  # Track all results in session

    while True:
        try:
            print("\nWhat would you like to generate?")
            print("1. Logo variations")
            print("2. Program illustrations")
            print("3. Icons")
            print("4. Patterns")
            print("5. Custom prompt")
            print("6. Session summary")
            print("7. Exit")

            choice = input("\nChoice (1-7): ").strip()
            results = []

            if choice == "1":
                print(f"\nLogo variants: {', '.join(LOGO_PROMPTS.keys())}, all")
                variant = input("Variant: ").strip() or "polish"
                if variant == "all":
                    for name, prompt in LOGO_PROMPTS.items():
                        result = generate_image(client, prompt, f"logo/{name}", "1:1", "2K")
                        results.append((f"logo/{name}", result))
                elif variant in LOGO_PROMPTS:
                    result = generate_image(client, LOGO_PROMPTS[variant], f"logo/{variant}", "1:1", "2K")
                    results.append((f"logo/{variant}", result))
                else:
                    print(f"Unknown variant: {variant}")

            elif choice == "2":
                print(f"\nPrograms: {', '.join(ILLUSTRATION_PROMPTS.keys())}, all")
                program = input("Program: ").strip() or "hero"
                if program == "all":
                    for name, prompt in ILLUSTRATION_PROMPTS.items():
                        asp = "16:9" if name in ["hero", "about"] else "4:3"
                        sz = "4K" if name == "hero" else "2K"
                        result = generate_image(client, prompt, f"illustrations/{name}", asp, sz)
                        results.append((f"illustrations/{name}", result))
                elif program in ILLUSTRATION_PROMPTS:
                    asp = "16:9" if program in ["hero", "about"] else "4:3"
                    sz = "4K" if program == "hero" else "2K"
                    result = generate_image(client, ILLUSTRATION_PROMPTS[program], f"illustrations/{program}", asp, sz)
                    results.append((f"illustrations/{program}", result))
                else:
                    print(f"Unknown program: {program}")

            elif choice == "3":
                print(f"\nIcons: {', '.join(ICON_PROMPTS.keys())}, all")
                name = input("Icon: ").strip() or "all"
                if name == "all":
                    for icon_name, prompt in ICON_PROMPTS.items():
                        result = generate_image(client, prompt, f"icons/{icon_name}", "1:1", "1K")
                        results.append((f"icons/{icon_name}", result))
                elif name in ICON_PROMPTS:
                    result = generate_image(client, ICON_PROMPTS[name], f"icons/{name}", "1:1", "1K")
                    results.append((f"icons/{name}", result))
                else:
                    print(f"Unknown icon: {name}")

            elif choice == "4":
                print(f"\nPatterns: {', '.join(PATTERN_PROMPTS.keys())}, all")
                name = input("Pattern: ").strip() or "butterflies"
                if name == "all":
                    for pattern_name, prompt in PATTERN_PROMPTS.items():
                        result = generate_image(client, prompt, f"patterns/{pattern_name}", "1:1", "2K")
                        results.append((f"patterns/{pattern_name}", result))
                elif name in PATTERN_PROMPTS:
                    result = generate_image(client, PATTERN_PROMPTS[name], f"patterns/{name}", "1:1", "2K")
                    results.append((f"patterns/{name}", result))
                else:
                    print(f"Unknown pattern: {name}")

            elif choice == "5":
                print("\nEnter your custom prompt (brand context will be added automatically):")
                prompt = input("> ").strip()
                if prompt:
                    aspect = input("Aspect ratio (1:1/16:9/4:3) [1:1]: ").strip() or "1:1"
                    size = input("Size (1K/2K/4K) [2K]: ").strip() or "2K"
                    name = input("Output name [custom]: ").strip() or "custom"
                    full_prompt = f"{BRAND_CONTEXT}\n\n{prompt}"
                    result = generate_image(client, full_prompt, f"custom/{name}", aspect, size)
                    results.append((f"custom/{name}", result))

            elif choice == "6":
                # Show session summary
                if session_results:
                    _print_generation_summary(session_results)
                else:
                    print("\nNo generations in this session yet.")
                continue

            elif choice == "7":
                if session_results:
                    print("\n" + "=" * 60)
                    print("FINAL SESSION SUMMARY")
                    _print_generation_summary(session_results)
                print("\nGoodbye!")
                break

            else:
                print("Invalid choice")
                continue

            # Add results to session tracking and show summary
            if results:
                session_results.extend(results)
                _print_generation_summary(results)

        except KeyboardInterrupt:
            print("\n\nInterrupted by user.")
            if session_results:
                print("\nSession summary before exit:")
                _print_generation_summary(session_results)
            break
        except Exception as e:
            # Catch ANY exception to prevent crashes
            print(f"\n  Unexpected error: {e}")
            print("  The session will continue. You can try again.")
            error_logger = ErrorLogger(ERROR_LOG_DIR)
            error_logger.log(classify_error(e), "interactive_mode")


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="EVOLEA Asset Generator using Nano Banana Pro",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate-asset.py --setup                    # First-time setup
  python generate-asset.py --interactive              # Interactive mode
  python generate-asset.py --logo --variant butterfly # Generate butterfly logo
  python generate-asset.py --illustration --program mini-garten
  python generate-asset.py --custom "A joyful scene" --aspect 16:9
        """
    )

    parser.add_argument("--setup", action="store_true", help="Setup API key")
    parser.add_argument("--interactive", "-i", action="store_true", help="Interactive mode")

    parser.add_argument("--logo", action="store_true", help="Generate logo")
    parser.add_argument("--variant", type=str, help="Logo variant (polish/butterfly/wordmark/full/dark/all)")

    parser.add_argument("--illustration", action="store_true", help="Generate illustration")
    parser.add_argument("--program", type=str, help="Program name (mini-garten/mini-projekte/mini-turnen/schulberatung/hero/about/all)")

    parser.add_argument("--icon", action="store_true", help="Generate icon")
    parser.add_argument("--pattern", action="store_true", help="Generate pattern")
    parser.add_argument("--name", type=str, help="Icon/pattern name")

    parser.add_argument("--custom", action="store_true", help="Custom prompt mode")
    parser.add_argument("--prompt", type=str, help="Custom prompt text")
    parser.add_argument("--aspect", type=str, default="1:1", help="Aspect ratio")
    parser.add_argument("--size", type=str, default="2K", help="Image size (1K/2K/4K)")

    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("EVOLEA Asset Generator")
    print("Powered by Nano Banana Pro (Gemini 3 Pro Image)")
    print("=" * 60)

    if args.setup:
        cmd_setup(args)
    elif args.interactive:
        cmd_interactive(args)
    elif args.logo:
        cmd_logo(args)
    elif args.illustration:
        cmd_illustration(args)
    elif args.icon:
        cmd_icon(args)
    elif args.pattern:
        cmd_pattern(args)
    elif args.custom or args.prompt:
        if not args.prompt:
            args.prompt = input("Enter your prompt: ").strip()
        cmd_custom(args)
    else:
        # Default to interactive
        cmd_interactive(args)


if __name__ == "__main__":
    main()
