#!/usr/bin/env python3
"""
EVOLEA Logo Refinement Script using Nano Banana Pro (Gemini 3 Pro Image)

Usage:
    1. Set your API key: export GOOGLE_API_KEY="your-key-here"
    2. Run: python scripts/refine-logo.py

Requirements:
    pip install google-genai pillow
"""

import os
import sys
import io
import json
import time
import traceback
from pathlib import Path
from datetime import datetime
from typing import Tuple, Optional, Any, Dict

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
    is_media_type_error,
)

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Please install the Google GenAI library:")
    print("  pip install google-genai pillow")
    sys.exit(1)

# Configuration
API_KEY = os.environ.get("GOOGLE_API_KEY")
MODEL = "gemini-3-pro-image-preview"  # Nano Banana Pro
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images" / "logo" / "refined"
ERROR_LOG_DIR = Path(__file__).parent / "error_logs"

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 2

# EVOLEA Brand Context for the AI
BRAND_CONTEXT = """
EVOLEA is a Swiss non-profit organization supporting children on the autism spectrum and with ADHD.

CURRENT LOGO DESCRIPTION:
- Text "EVOLEA" in bold sans-serif font
- The text has a spectrum gradient flowing through it (mint/teal → yellow → coral/pink → magenta → purple/lavender)
- A small butterfly sits at the top-right of the letter "A"
- The butterfly has blue/purple left wings and pink/magenta right wings
- The butterfly symbolizes transformation, evolution, and the beauty of neurodiversity

BRAND COLORS:
- Mint/Teal: #7BEDD5
- Yellow: #FFE066
- Coral: #FF7E5D
- Pink: #EF8EAE
- Magenta: #DD48E0
- Purple/Lavender: #CD87F8
- Sky Blue: #5DADE2

DESIGN PRINCIPLES:
- Joyful and welcoming
- Child-friendly but not childish
- Professional yet warm
- The butterfly should feel organic and alive, not geometric
"""

# Different refinement prompts
REFINEMENT_PROMPTS = {
    "polish": f"""
{BRAND_CONTEXT}

Create a polished, refined version of the EVOLEA logo that:
- Keeps the same overall design (text with spectrum gradient + butterfly on the A)
- Makes the butterfly more detailed and beautiful with subtle wing patterns
- Ensures the gradient flows smoothly and naturally through the text
- Has crisp, professional typography
- Maintains the warm, welcoming feel
- The butterfly wings should have a gentle gradient from blue (#5DADE2) to lavender (#CD87F8) on the left, and pink (#EF8EAE) to magenta (#DD48E0) on the right

Output a clean logo on a transparent or white background, suitable for web use.
""",

    "butterfly_focus": f"""
{BRAND_CONTEXT}

Create a standalone butterfly icon/logo mark for EVOLEA that:
- Uses the same wing colors (blue-to-lavender left, pink-to-magenta right)
- Has elegant, slightly stylized but organic wing shapes
- Includes subtle patterns or texture on the wings suggesting the autism spectrum
- Has a simple dark body with delicate antennae
- Works well at small sizes (favicon) and large sizes
- Feels like it belongs with the EVOLEA wordmark

Output on a transparent background.
""",

    "wordmark_only": f"""
{BRAND_CONTEXT}

Create just the EVOLEA wordmark (without butterfly) that:
- Uses a friendly, rounded sans-serif font (similar to Fredoka or Poppins)
- Has the spectrum gradient flowing naturally through the letters
- Gradient order: mint/teal (#7BEDD5) → yellow (#FFE066) → coral (#FF7E5D) → pink (#EF8EAE) → magenta (#DD48E0) → lavender (#CD87F8)
- Is bold and confident but approachable
- Works well for headers and branding

Output on a transparent background.
""",

    "full_lockup": f"""
{BRAND_CONTEXT}

Create a complete EVOLEA logo lockup that:
- Features the wordmark "EVOLEA" with spectrum gradient
- Has a beautiful butterfly integrated with or near the text
- The butterfly can be positioned creatively (on the A, above the text, or as a separate element)
- Includes subtle decorative elements that reinforce the spectrum/rainbow theme
- Feels premium and professional while remaining warm and child-friendly
- Would work well as a hero element on a website

Output on a light cream (#FDF8F3) or white background.
"""
}


def setup_client():
    """Initialize the Google GenAI client."""
    if not API_KEY:
        print("ERROR: GOOGLE_API_KEY environment variable not set")
        print("\nTo set it:")
        print("  Windows: set GOOGLE_API_KEY=your-key-here")
        print("  Mac/Linux: export GOOGLE_API_KEY=your-key-here")
        sys.exit(1)

    return genai.Client(api_key=API_KEY)


def log_error(error_type: str, error_details: dict, prompt_name: str):
    """Log error details to a file for debugging."""
    ERROR_LOG_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = ERROR_LOG_DIR / f"error_{timestamp}_{prompt_name}.json"

    log_data = {
        "timestamp": datetime.now().isoformat(),
        "error_type": error_type,
        "prompt_name": prompt_name,
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

    try:
        if "{" in error_str and "}" in error_str:
            start = error_str.find("{")
            end = error_str.rfind("}") + 1
            json_str = error_str[start:end]
            parsed = json.loads(json_str)
            error_details["parsed_error"] = parsed

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
            if hasattr(part, 'as_image'):
                try:
                    image = part.as_image()
                    if image is not None:
                        return True, "Valid image found"
                except Exception as e:
                    return False, f"Error extracting image from part: {e}"

            if hasattr(part, 'inline_data'):
                inline = part.inline_data
                if hasattr(inline, 'mime_type') and hasattr(inline, 'data'):
                    mime = inline.mime_type
                    data_len = len(inline.data) if inline.data else 0
                    return False, f"Found inline_data with mime_type={mime}, data_length={data_len}"

        return False, "No image parts found in response"
    except Exception as e:
        return False, f"Error validating response: {e}"


def generate_logo(client, prompt_name: str, custom_prompt: str = None) -> OperationResult:
    """
    Generate a refined logo image with FOOLPROOF error handling.

    Returns OperationResult which NEVER raises exceptions.
    Check result.success to see if it worked.
    """
    prompt = custom_prompt or REFINEMENT_PROMPTS.get(prompt_name)
    if not prompt:
        return OperationResult.fail(ErrorInfo(
            category=ErrorCategory.VALIDATION,
            severity=ErrorSeverity.FATAL,
            message=f"Unknown prompt: {prompt_name}. Available: {', '.join(REFINEMENT_PROMPTS.keys())}",
            is_retryable=False
        ))

    # Initialize error logger
    error_logger = ErrorLogger(ERROR_LOG_DIR)

    print(f"\n{'=' * 50}")
    print(f"Generating '{prompt_name}' variation...")
    print(f"Model: {MODEL} (Nano Banana Pro)")
    print("This may take 30-60 seconds...")
    print(f"{'=' * 50}")

    def on_retry(attempt: int, error: ErrorInfo, delay: float):
        """Callback for retry logging."""
        print(f"\n  Retry {attempt}: {error.message}")
        print(f"  Waiting {delay:.1f}s before next attempt...")

    def single_generation_attempt() -> OperationResult:
        """Single attempt at logo generation."""
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=['IMAGE'],
                    image_config=types.ImageConfig(
                        aspect_ratio="1:1",
                        image_size="2K"
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
                        print(f"  Warning: as_image() failed on part {i}: {e}")

                # Method 2: Try inline_data with manual extraction
                if hasattr(part, 'inline_data') and part.inline_data:
                    inline = part.inline_data
                    if hasattr(inline, 'data') and inline.data:
                        mime_type = getattr(inline, 'mime_type', 'image/png')
                        raw_data = inline.data

                        if isinstance(raw_data, str):
                            try:
                                import base64
                                raw_data = base64.b64decode(raw_data)
                            except Exception:
                                raw_data = raw_data.encode('latin-1')

                        validation = validate_image_data(raw_data, expected_mime=mime_type)

                        if validation.success:
                            try:
                                from PIL import Image
                                img = Image.open(io.BytesIO(raw_data))
                                img.load()
                                return OperationResult.ok(
                                    value={"image": img, "source": "inline_data", "part_index": i},
                                    warnings=validation.warnings
                                )
                            except Exception as pil_err:
                                print(f"  Warning: Could not load inline_data as image: {pil_err}")
                        else:
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

                # Method 3: Check for text response
                if hasattr(part, 'text') and part.text:
                    text = str(part.text)
                    if "error" in text.lower() or "cannot" in text.lower():
                        return OperationResult.fail(ErrorInfo(
                            category=ErrorCategory.API_ERROR,
                            severity=ErrorSeverity.RECOVERABLE,
                            message=f"API returned text instead of image: {text[:200]}",
                            details={"text_response": text},
                            is_retryable=True,
                            retry_after=2
                        ))

            # No image found
            return OperationResult.fail(ErrorInfo(
                category=ErrorCategory.API_ERROR,
                severity=ErrorSeverity.RECOVERABLE,
                message="No valid image found in response",
                is_retryable=True,
                retry_after=3
            ))

        except Exception as e:
            error_info = classify_error(e)
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

        try:
            OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"evolea_{prompt_name}_{timestamp}.png"
            filepath = OUTPUT_DIR / filename

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
            error_logger.log(error_info, f"save_logo:{prompt_name}")
            return OperationResult.fail(error_info)
    else:
        if result.error:
            error_logger.log(result.error, f"generate_logo:{prompt_name}")

        print(f"\n  FAILED after all attempts")
        print(f"  Error: {result.error.message if result.error else 'Unknown error'}")
        print(f"  Check error logs in: {ERROR_LOG_DIR}")

        return result


# Backward compatibility wrapper
def generate_logo_simple(client, prompt_name: str, custom_prompt: str = None) -> Optional[Path]:
    """
    Simple wrapper that returns Path or None (for backward compatibility).
    Use generate_logo() for full error information.
    """
    result = generate_logo(client, prompt_name, custom_prompt)
    return result.value if result.success else None


def _print_results_summary(results: list):
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


def main():
    """Main entry point with foolproof error handling."""
    print("=" * 60)
    print("EVOLEA Logo Refinement Tool")
    print("Using Nano Banana Pro (Gemini 3 Pro Image)")
    print("=" * 60)

    try:
        client = setup_client()
    except SystemExit:
        return  # API key not configured

    results = []

    try:
        # Check command line arguments
        if len(sys.argv) > 1:
            prompt_name = sys.argv[1]
            if prompt_name == "all":
                # Generate all variations
                for name in REFINEMENT_PROMPTS.keys():
                    result = generate_logo(client, name)
                    results.append((name, result))
            else:
                result = generate_logo(client, prompt_name)
                results.append((prompt_name, result))
        else:
            # Interactive mode
            print("\nAvailable refinement options:")
            for i, name in enumerate(REFINEMENT_PROMPTS.keys(), 1):
                print(f"  {i}. {name}")
            print(f"  {len(REFINEMENT_PROMPTS) + 1}. all (generate all variations)")
            print(f"  {len(REFINEMENT_PROMPTS) + 2}. custom (enter your own prompt)")

            choice = input("\nSelect option (1-6): ").strip()

            try:
                choice_num = int(choice)
                options = list(REFINEMENT_PROMPTS.keys())

                if 1 <= choice_num <= len(options):
                    name = options[choice_num - 1]
                    result = generate_logo(client, name)
                    results.append((name, result))
                elif choice_num == len(options) + 1:
                    for name in options:
                        result = generate_logo(client, name)
                        results.append((name, result))
                elif choice_num == len(options) + 2:
                    custom = input("\nEnter your custom prompt:\n> ")
                    result = generate_logo(client, "custom", f"{BRAND_CONTEXT}\n\n{custom}")
                    results.append(("custom", result))
                else:
                    print("Invalid choice")
            except ValueError:
                print("Please enter a number")

    except KeyboardInterrupt:
        print("\n\nInterrupted by user.")
    except Exception as e:
        # Catch ANY exception to prevent crashes
        print(f"\n  Unexpected error: {e}")
        error_logger = ErrorLogger(ERROR_LOG_DIR)
        error_logger.log(classify_error(e), "main")

    # Show summary if we have results
    if results:
        _print_results_summary(results)

    print("\n" + "=" * 60)
    print(f"Generated images saved to: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
