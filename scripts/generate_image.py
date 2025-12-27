#!/usr/bin/env python3
"""
EVOLEA Automated Image Generation Pipeline with Reinforcement Learning
======================================================================
Generates brand-consistent images using Gemini (Imagen) and learns from
user feedback to improve future generations.

Usage:
    # Training mode (A/B comparison with feedback loop)
    python generate_image.py "prompt" --name output-name --training

    # Fully automated (generate + auto-select with Claude)
    python generate_image.py "prompt" --name output-name --auto-select

    # Generate only (manual review)
    python generate_image.py "prompt" --name output-name

    # A/B comparison grid
    python generate_image.py "prompt" --name output-name --count 2 --comparison-grid

Environment Variables Required:
    GEMINI_API_KEY    - Google AI API key for image generation
    ANTHROPIC_API_KEY - Anthropic API key for auto-selection (optional)

Reinforcement Learning:
    Learnings are stored in .claude/skills/image-generation-rl/LEARNINGS.md
    and automatically applied to enhance prompts based on user feedback.
"""

import os
import sys
import json
import base64
import argparse
import subprocess
import re
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass, asdict, field

# =============================================================================
# DEPENDENCIES CHECK
# =============================================================================

def check_dependencies():
    """Check and install required packages."""
    required = {
        'google.genai': 'google-genai',
        'PIL': 'pillow',
        'anthropic': 'anthropic',
        'dotenv': 'python-dotenv',
        'requests': 'requests',
    }

    missing = []
    for module, package in required.items():
        try:
            __import__(module.split('.')[0])
        except ImportError:
            missing.append(package)

    if missing:
        print(f"Installing missing packages: {', '.join(missing)}", file=sys.stderr)
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install',
            *missing, '--break-system-packages', '-q'
        ])
        print("[OK] Dependencies installed\n", file=sys.stderr)

check_dependencies()

from google import genai
from google.genai import types
from PIL import Image
import anthropic
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# =============================================================================
# LOGGING (stderr to avoid MCP protocol conflicts)
# =============================================================================

def log(*args, **kwargs):
    """Print to stderr to avoid conflicts with MCP JSON-RPC protocol."""
    kwargs['file'] = sys.stderr
    print(*args, **kwargs)

# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class Config:
    """Pipeline configuration."""
    # API Keys (check multiple env var names)
    gemini_key: str = os.environ.get("GEMINI_API_KEY", "") or os.environ.get("GOOGLE_API_KEY", "")
    anthropic_key: str = os.environ.get("ANTHROPIC_API_KEY", "")
    replicate_key: str = os.environ.get("REPLICATE_API_TOKEN", "")

    # Paths (relative to script location)
    project_root: Path = Path(__file__).parent.parent
    generated_dir: Path = None  # Set in __post_init__
    final_dir: Path = None
    log_file: Path = None

    # RL Skill paths
    rl_skill_dir: Path = None
    learnings_file: Path = None
    training_log_file: Path = None
    style_profiles_dir: Path = None

    # Generation settings
    default_count: int = 4
    default_aspect: str = "16:9"
    gemini_model: str = "gemini-2.5-flash-image"  # Fallback (not used)
    gemini_model_pro: str = "gemini-3-pro-image-preview"  # Default: Gemini 3 Pro
    claude_model: str = "claude-sonnet-4-20250514"

    # Replicate settings (fallback when Gemini is blocked)
    replicate_model: str = "black-forest-labs/flux-schnell"  # Fast, high quality

    def __post_init__(self):
        self.generated_dir = self.project_root / "public" / "images" / "generated"
        self.final_dir = self.project_root / "public" / "images"
        self.log_file = self.generated_dir / "generation_log.json"

        # RL Skill paths
        self.rl_skill_dir = self.project_root / ".claude" / "skills" / "image-generation-rl"
        self.learnings_file = self.rl_skill_dir / "LEARNINGS.md"
        self.training_log_file = self.rl_skill_dir / "training-log.json"
        self.style_profiles_dir = self.rl_skill_dir / "style-profiles"


CONFIG = Config()

# =============================================================================
# EVOLEA BRAND GUIDELINES
# =============================================================================

BRAND_STYLE = """
Modern children's book illustration style with soft watercolor textures.
Warm, inclusive aesthetic with Swiss design sensibility - clean and uncluttered.
Delicate butterflies as recurring decorative motif.
"""

BRAND_COLORS = """
Primary colors:
- Magenta #DD48E0 (brand accent)
- Mint #7BEDD5 (nature, fresh)
- Lavender #CD87F8 (calm, creative)
- Coral #FF7E5D (energy, warmth)
- Gold #E8B86D (highlights, achievement)
- Sky Blue #5DADE2 (trust, movement)
- Cream #FFFBF7 (backgrounds)
"""

BRAND_AVOID = """
NEVER include:
- Puzzle piece symbols (rejected by autism community)
- Clinical/medical settings
- Religious symbols on children
- American cultural elements (yellow school buses)
- Dark, muted, or corporate colors
- Photorealistic style
- Adults dominating scenes
- Isolated or distressed children
"""

EVALUATION_CRITERIA = """
Evaluate each image on these criteria (score 1-10 each):

1. BRAND COLORS (weight: 25%)
   - Uses EVOLEA palette: magenta, mint, lavender, coral, gold, cream
   - Colors feel warm and inviting, not cold or clinical

2. ILLUSTRATION STYLE (weight: 25%)
   - Soft watercolor/children's book aesthetic
   - NOT photorealistic
   - Clean composition, not cluttered

3. CONTENT APPROPRIATENESS (weight: 25%)
   - Children shown positively, engaged, joyful
   - Age-appropriate (typically 3-8 years)
   - No puzzle pieces, religious symbols, or clinical elements
   - Swiss/European context preferred

4. TECHNICAL QUALITY (weight: 15%)
   - Clear focal point
   - Good balance
   - Space for text overlay if hero image

5. EMOTIONAL RESONANCE (weight: 10%)
   - Feels welcoming to parents
   - Celebrates neurodiversity positively
   - Would work for EVOLEA's mission

Return your evaluation as JSON:
{
  "rankings": [
    {"image": 1, "score": 8.5, "strengths": "...", "weaknesses": "..."},
    ...
  ],
  "selected": 1,
  "reasoning": "Image 1 best because..."
}
"""

# =============================================================================
# REINFORCEMENT LEARNING FUNCTIONS
# =============================================================================

@dataclass
class Learnings:
    """Parsed learnings from LEARNINGS.md"""
    strong_positive: List[str] = field(default_factory=list)  # +3
    positive: List[str] = field(default_factory=list)          # +1
    neutral: List[str] = field(default_factory=list)           # 0
    negative: List[str] = field(default_factory=list)          # -1
    strong_negative: List[str] = field(default_factory=list)   # -3


def load_learnings() -> Learnings:
    """Load and parse learnings from LEARNINGS.md file."""
    learnings = Learnings()

    if not CONFIG.learnings_file.exists():
        log("[INFO] No learnings file found, using defaults")
        return learnings

    try:
        content = CONFIG.learnings_file.read_text(encoding='utf-8')

        # Parse sections using regex
        sections = {
            'strong_positive': r'### STRONG POSITIVE \(\+3\).*?(?=###|\Z)',
            'positive': r'### POSITIVE \(\+1\).*?(?=###|\Z)',
            'neutral': r'### NEUTRAL \(0\).*?(?=###|\Z)',
            'negative': r'### NEGATIVE \(-1\).*?(?=###|\Z)',
            'strong_negative': r'### STRONG NEGATIVE \(-3\).*?(?=###|\Z)',
        }

        for key, pattern in sections.items():
            match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
            if match:
                section_text = match.group(0)
                # Extract patterns from table rows (| Pattern | ... |)
                patterns = re.findall(r'\|\s*([^|]+?)\s*\|', section_text)
                # Filter out headers and empty values
                patterns = [p.strip() for p in patterns
                           if p.strip() and not p.strip().startswith('Pattern')
                           and not p.strip().startswith('---')
                           and not p.strip().startswith('Source')
                           and not p.strip().startswith('Date')
                           and not p.strip().startswith('Reason')
                           and not p.strip().startswith('Notes')
                           and len(p.strip()) > 3]
                setattr(learnings, key, patterns)

        log(f"[RL] Loaded learnings: +3:{len(learnings.strong_positive)}, +1:{len(learnings.positive)}, -1:{len(learnings.negative)}, -3:{len(learnings.strong_negative)}")

    except Exception as e:
        log(f"[WARNING] Could not parse learnings: {e}")

    return learnings


def apply_learnings_to_prompt(base_prompt: str, learnings: Learnings) -> Tuple[str, str]:
    """
    Apply learnings to create two prompt variations:
    - Option A: Base prompt enhanced with learnings
    - Option B: Base + additional style modifiers

    Returns (prompt_a, prompt_b)
    """
    # Build enhancement from positive learnings
    enhancements = []
    if learnings.strong_positive:
        enhancements.extend(learnings.strong_positive[:5])  # Top 5
    if learnings.positive:
        enhancements.extend(learnings.positive[:3])  # Top 3

    # Build exclusions from negative learnings
    exclusions = []
    if learnings.strong_negative:
        exclusions.extend([f"NO {p}" for p in learnings.strong_negative])
    if learnings.negative:
        exclusions.extend([f"Avoid {p}" for p in learnings.negative[:3]])

    # Option A: Enhanced base prompt
    prompt_a = f"""{base_prompt}

Style enhancements (from learnings):
{chr(10).join(['- ' + e for e in enhancements[:5]])}

{chr(10).join(exclusions)}
"""

    # Option B: Base + additional modifiers
    style_modifiers = [
        "Extra ethereal with floating sparkles",
        "More prominent cloud layers",
        "Enhanced pastel color saturation",
        "Softer, dreamier lighting",
    ]

    prompt_b = f"""{base_prompt}

Style enhancements (from learnings + modifiers):
{chr(10).join(['- ' + e for e in enhancements[:5]])}
{chr(10).join(['- ' + m for m in style_modifiers[:2]])}

{chr(10).join(exclusions)}
"""

    return prompt_a, prompt_b


def create_ab_comparison_grid(image_a: Path, image_b: Path, output_dir: Path, base_name: str) -> Path:
    """Create a side-by-side A|B comparison grid with labels."""
    try:
        img_a = Image.open(image_a)
        img_b = Image.open(image_b)

        # Standardize sizes
        max_w = max(img_a.width, img_b.width)
        max_h = max(img_a.height, img_b.height)

        # Create grid with labels
        padding = 20
        label_height = 50
        divider_width = 10

        grid_w = 2 * max_w + 3 * padding + divider_width
        grid_h = max_h + label_height + 2 * padding

        grid = Image.new('RGB', (grid_w, grid_h), 'white')

        # Resize images to fit
        img_a_resized = img_a.copy()
        img_a_resized.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

        img_b_resized = img_b.copy()
        img_b_resized.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

        # Paste images
        x_a = padding
        x_b = padding + max_w + divider_width + padding
        y_img = padding + label_height

        # Center images in their cells
        paste_x_a = x_a + (max_w - img_a_resized.width) // 2
        paste_y_a = y_img + (max_h - img_a_resized.height) // 2
        grid.paste(img_a_resized, (paste_x_a, paste_y_a))

        paste_x_b = x_b + (max_w - img_b_resized.width) // 2
        paste_y_b = y_img + (max_h - img_b_resized.height) // 2
        grid.paste(img_b_resized, (paste_x_b, paste_y_b))

        # Add labels (using PIL's basic text if ImageDraw available)
        try:
            from PIL import ImageDraw, ImageFont

            draw = ImageDraw.Draw(grid)

            # Try to get a font, fallback to default
            try:
                font = ImageFont.truetype("arial.ttf", 36)
            except:
                font = ImageFont.load_default()

            # Draw labels
            label_y = padding + 5
            draw.text((x_a + max_w//2 - 50, label_y), "OPTION A", fill='#DD48E0', font=font)
            draw.text((x_b + max_w//2 - 50, label_y), "OPTION B", fill='#7BEDD5', font=font)

            # Draw divider line
            divider_x = padding + max_w + padding // 2
            draw.line([(divider_x, padding), (divider_x, grid_h - padding)], fill='#CCCCCC', width=2)

        except Exception as e:
            log(f"[INFO] Could not add labels: {e}")

        # Save grid
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        grid_path = output_dir / f"{base_name}_AB_GRID_{timestamp}.png"
        grid.save(grid_path)

        return grid_path

    except Exception as e:
        log(f"[ERROR] Could not create comparison grid: {e}")
        return None


def update_learnings(winner: str, feedback: str, prompt_a: str, prompt_b: str, session_id: str) -> None:
    """Update LEARNINGS.md based on user feedback."""
    if not CONFIG.learnings_file.exists():
        log("[WARNING] Learnings file not found, skipping update")
        return

    try:
        content = CONFIG.learnings_file.read_text(encoding='utf-8')
        today = datetime.now().strftime("%Y-%m-%d")

        # Find the Training History table and add entry
        history_pattern = r'(\| Date \| Session ID \| Target \| Rounds \| Winner \| Key Learnings \|.*?\n\|[-\s|]+\n)'
        match = re.search(history_pattern, content, re.DOTALL)

        if match:
            # Add new row after header
            new_row = f"| {today} | {session_id} | - | 1 | {winner} | {feedback[:50]}... |\n"
            insert_pos = match.end()
            content = content[:insert_pos] + new_row + content[insert_pos:]

        # Update last_updated timestamp
        content = re.sub(
            r'> \*\*Last Updated\*\*: \d{4}-\d{2}-\d{2}',
            f'> **Last Updated**: {today}',
            content
        )

        # Write back
        CONFIG.learnings_file.write_text(content, encoding='utf-8')
        log(f"[RL] Updated learnings with session {session_id}")

    except Exception as e:
        log(f"[WARNING] Could not update learnings: {e}")


def log_training_session(
    session_id: str,
    target: str,
    rounds: List[Dict],
    final_image: Optional[Path],
    learnings_added: List[str]
) -> None:
    """Log a training session to training-log.json."""
    if not CONFIG.training_log_file.exists():
        log = {"version": "1.0", "created": datetime.now().isoformat(), "sessions": []}
    else:
        with open(CONFIG.training_log_file) as f:
            log = json.load(f)

    log["sessions"].append({
        "id": session_id,
        "timestamp": datetime.now().isoformat(),
        "target": target,
        "rounds": rounds,
        "final_image": str(final_image) if final_image else None,
        "learnings_added": learnings_added
    })

    log["last_updated"] = datetime.now().isoformat()
    log["total_sessions"] = len(log["sessions"])
    log["total_rounds"] = sum(len(s.get("rounds", [])) for s in log["sessions"])

    with open(CONFIG.training_log_file, 'w') as f:
        json.dump(log, f, indent=2)


# =============================================================================
# IMAGE GENERATION
# =============================================================================

def enhance_prompt(base_prompt: str) -> str:
    """Add EVOLEA brand guidelines to prompt."""
    return f"""{base_prompt}

Style: {BRAND_STYLE}

Color palette: {BRAND_COLORS}

{BRAND_AVOID}
"""


def generate_images_gemini(
    prompt: str,
    output_dir: Path,
    base_name: str,
    count: int = 4,
    aspect_ratio: str = "16:9",
    use_pro: bool = False,
) -> List[Path]:
    """Generate images using Gemini image generation API."""

    if not CONFIG.gemini_key:
        raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable not set")

    # Initialize the new google.genai client
    client = genai.Client(api_key=CONFIG.gemini_key)

    # Select model based on quality preference
    # Always use Gemini 3 Pro for best quality
    model_id = CONFIG.gemini_model_pro
    log(f"[INFO] Using Gemini 3 Pro: {model_id}")

    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    saved_paths = []

    log(f"\n[GEN] Generating {count} images...")
    log(f"[PROMPT] {prompt[:150]}...")

    for i in range(count):
        log(f"   Generating variation {i+1}/{count}...", end=" ", flush=True)

        try:
            # Add variation instruction
            variation_prompt = f"""{prompt}

Variation {i+1}: Create a unique interpretation while maintaining the core concept and style."""

            # Use Gemini's generate_content with image output
            # Using the correct image generation model and config
            response = client.models.generate_content(
                model=model_id,
                contents=variation_prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                )
            )

            # Extract image from response
            image_saved = False
            if response.candidates:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        if 'image' in part.inline_data.mime_type:
                            # Decode and save the image
                            image_data = part.inline_data.data
                            if isinstance(image_data, str):
                                image_data = base64.b64decode(image_data)

                            filename = f"{base_name}_{timestamp}_v{i+1}.png"
                            filepath = output_dir / filename

                            with open(filepath, 'wb') as f:
                                f.write(image_data)

                            saved_paths.append(filepath)
                            log(f"[OK] {filename}")
                            image_saved = True
                            break

            if not image_saved:
                # Try alternative: check for image attribute directly
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'image') and part.image:
                        img = part.image
                        filename = f"{base_name}_{timestamp}_v{i+1}.png"
                        filepath = output_dir / filename

                        if hasattr(img, 'save'):
                            img.save(str(filepath))
                        elif hasattr(img, 'image_bytes'):
                            with open(filepath, 'wb') as f:
                                f.write(img.image_bytes)

                        saved_paths.append(filepath)
                        log(f"[OK] {filename}")
                        image_saved = True
                        break

            if not image_saved:
                log("[WARNING] No image in response")

        except Exception as e:
            log(f"[ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()

    if not saved_paths:
        raise RuntimeError("No images were generated successfully")

    return saved_paths


def generate_images_replicate(
    prompt: str,
    output_dir: Path,
    base_name: str,
    count: int = 4,
    aspect_ratio: str = "16:9",
) -> List[Path]:
    """Generate images using Replicate API (Flux model) - works globally."""
    import requests
    import time

    if not CONFIG.replicate_key:
        raise ValueError("REPLICATE_API_TOKEN environment variable not set")

    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    saved_paths = []

    log(f"\n[GEN] Generating {count} images with Replicate (Flux)...")
    log(f"[PROMPT] {prompt[:150]}...")

    # Convert aspect ratio to Replicate format
    aspect_map = {
        "16:9": "16:9",
        "4:3": "4:3",
        "1:1": "1:1",
        "9:16": "9:16",
        "3:4": "3:4",
    }
    replicate_aspect = aspect_map.get(aspect_ratio, "16:9")

    headers = {
        "Authorization": f"Bearer {CONFIG.replicate_key}",
        "Content-Type": "application/json",
        "Prefer": "wait=60",  # Wait up to 60 seconds for result
    }

    for i in range(count):
        log(f"   Generating variation {i+1}/{count}...", end=" ", flush=True)

        try:
            # Add variation instruction
            variation_prompt = f"""{prompt}

Variation {i+1}: Create a unique interpretation while maintaining the core concept and style."""

            # Request to Replicate API
            response = requests.post(
                f"https://api.replicate.com/v1/models/{CONFIG.replicate_model}/predictions",
                headers=headers,
                json={
                    "input": {
                        "prompt": variation_prompt,
                        "aspect_ratio": replicate_aspect,
                        "output_format": "png",
                        "output_quality": 90,
                    }
                },
                timeout=120,
            )

            if response.status_code != 200 and response.status_code != 201:
                log(f"[ERROR] API error: {response.status_code} - {response.text}")
                continue

            result = response.json()

            # If we got a prediction ID but no output yet, poll for result
            if result.get("status") == "starting" or result.get("status") == "processing":
                prediction_url = result.get("urls", {}).get("get")
                if prediction_url:
                    # Poll for completion
                    for _ in range(30):  # Max 30 attempts (60 seconds)
                        time.sleep(2)
                        poll_response = requests.get(prediction_url, headers=headers)
                        if poll_response.status_code == 200:
                            result = poll_response.json()
                            if result.get("status") == "succeeded":
                                break
                            elif result.get("status") == "failed":
                                log(f"[ERROR] Generation failed: {result.get('error')}")
                                break

            # Check for output
            output = result.get("output")
            if output:
                # Output is usually a URL or list of URLs
                image_urls = output if isinstance(output, list) else [output]

                for idx, image_url in enumerate(image_urls):
                    # Download the image
                    img_response = requests.get(image_url, timeout=30)
                    if img_response.status_code == 200:
                        filename = f"{base_name}_{timestamp}_v{i+1}.png"
                        filepath = output_dir / filename

                        with open(filepath, 'wb') as f:
                            f.write(img_response.content)

                        saved_paths.append(filepath)
                        log(f"[OK] {filename}")
                        break  # Only save first image per variation
            else:
                log(f"[WARNING] No output in response: {result.get('status', 'unknown')}")

        except Exception as e:
            log(f"[ERROR] Failed: {e}")
            import traceback
            traceback.print_exc()

    if not saved_paths:
        raise RuntimeError("No images were generated successfully")

    return saved_paths


def generate_images(
    prompt: str,
    output_dir: Path,
    base_name: str,
    count: int = 4,
    aspect_ratio: str = "16:9",
    backend: str = "auto",
) -> List[Path]:
    """
    Generate images using the best available backend.

    Args:
        backend: "auto" (try Gemini then Replicate), "gemini", or "replicate"
    """
    if backend == "replicate" or (backend == "auto" and CONFIG.replicate_key and not CONFIG.gemini_key):
        return generate_images_replicate(prompt, output_dir, base_name, count, aspect_ratio)

    if backend == "gemini" or backend == "auto":
        try:
            return generate_images_gemini(prompt, output_dir, base_name, count, aspect_ratio)
        except Exception as e:
            error_str = str(e).lower()
            # Check if Gemini is blocked (country restriction or other API error)
            if "not available in your country" in error_str or "failed_precondition" in error_str:
                log("\n[INFO] Gemini blocked in your region, falling back to Replicate...")
                if CONFIG.replicate_key:
                    return generate_images_replicate(prompt, output_dir, base_name, count, aspect_ratio)
                else:
                    raise ValueError(
                        "Gemini is blocked in your country and REPLICATE_API_TOKEN is not set.\n"
                        "Get a Replicate API token at: https://replicate.com/account/api-tokens"
                    )
            raise

    raise ValueError(f"Unknown backend: {backend}")


def create_comparison_grid(image_paths: List[Path], output_dir: Path) -> Optional[Path]:
    """Create a 2x2 comparison grid of all images."""
    if len(image_paths) < 2:
        return None
    
    try:
        images = [Image.open(p) for p in image_paths]
        
        # Standardize sizes
        max_w = max(img.width for img in images)
        max_h = max(img.height for img in images)
        
        # Create grid
        cols, rows = 2, (len(images) + 1) // 2
        padding = 10
        label_height = 30
        
        grid_w = cols * max_w + (cols + 1) * padding
        grid_h = rows * (max_h + label_height) + (rows + 1) * padding
        
        grid = Image.new('RGB', (grid_w, grid_h), 'white')
        
        for idx, img in enumerate(images):
            row, col = idx // cols, idx % cols
            x = padding + col * (max_w + padding)
            y = padding + row * (max_h + label_height + padding)
            
            # Resize to fit
            img_resized = img.copy()
            img_resized.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
            
            # Center in cell
            paste_x = x + (max_w - img_resized.width) // 2
            paste_y = y + (max_h - img_resized.height) // 2
            grid.paste(img_resized, (paste_x, paste_y))
        
        # Save grid
        grid_path = output_dir / f"{image_paths[0].stem.rsplit('_v', 1)[0]}_GRID.png"
        grid.save(grid_path)
        return grid_path
        
    except Exception as e:
        log(f"[WARNING] Could not create grid: {e}")
        return None


# =============================================================================
# AUTO-SELECTION WITH CLAUDE
# =============================================================================

def auto_select_best(
    image_paths: List[Path],
    original_prompt: str,
) -> Tuple[Path, Dict[str, Any]]:
    """Use Claude to evaluate and select the best image."""
    
    if not CONFIG.anthropic_key:
        raise ValueError("ANTHROPIC_API_KEY required for auto-selection")
    
    log(f"\n🤖 Evaluating {len(image_paths)} images with Claude...")
    
    client = anthropic.Anthropic(api_key=CONFIG.anthropic_key)
    
    # Prepare images for Claude
    content = []
    for idx, path in enumerate(image_paths, 1):
        with open(path, 'rb') as f:
            image_data = base64.standard_b64encode(f.read()).decode('utf-8')
        
        content.append({
            "type": "text",
            "text": f"**Image {idx}:** {path.name}"
        })
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": "image/png",
                "data": image_data,
            }
        })
    
    # Add evaluation request
    content.append({
        "type": "text",
        "text": f"""
These images were generated for EVOLEA (Swiss non-profit supporting neurodivergent children).

Original prompt: "{original_prompt}"

{EVALUATION_CRITERIA}

Respond with ONLY the JSON object, no other text.
"""
    })
    
    # Call Claude
    response = client.messages.create(
        model=CONFIG.claude_model,
        max_tokens=1500,
        messages=[{"role": "user", "content": content}]
    )
    
    # Parse response
    response_text = response.content[0].text.strip()
    
    # Clean JSON if wrapped in markdown
    if response_text.startswith("```"):
        response_text = response_text.split("```")[1]
        if response_text.startswith("json"):
            response_text = response_text[4:]
    
    try:
        evaluation = json.loads(response_text)
    except json.JSONDecodeError:
        # Fallback: extract selection number
        import re
        match = re.search(r'"selected":\s*(\d+)', response_text)
        if match:
            evaluation = {"selected": int(match.group(1)), "reasoning": response_text}
        else:
            log("[WARNING] Could not parse evaluation, defaulting to image 1")
            evaluation = {"selected": 1, "reasoning": "Parse error, defaulted to first"}
    
    selected_idx = evaluation.get("selected", 1) - 1  # Convert to 0-indexed
    selected_idx = max(0, min(selected_idx, len(image_paths) - 1))  # Bounds check
    
    selected_path = image_paths[selected_idx]
    
    log(f"[OK] Selected: Image {selected_idx + 1} ({selected_path.name})")
    if evaluation.get("reasoning"):
        log(f"[REASON] {evaluation['reasoning'][:200]}...")
    
    return selected_path, evaluation


# =============================================================================
# FINALIZATION
# =============================================================================

def finalize_image(
    source_path: Path,
    final_name: str,
    category: str = "programs",
) -> Path:
    """Copy selected image to final location."""
    import shutil
    
    final_dir = CONFIG.final_dir / category
    final_dir.mkdir(parents=True, exist_ok=True)
    
    final_path = final_dir / f"{final_name}.png"
    shutil.copy2(source_path, final_path)
    
    log(f"\n📦 Final image: {final_path}")
    return final_path


def log_generation(
    prompt: str,
    image_paths: List[Path],
    selected_path: Optional[Path],
    evaluation: Optional[Dict],
    category: str,
) -> None:
    """Log generation for history and debugging."""
    
    CONFIG.log_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Load existing log
    if CONFIG.log_file.exists():
        with open(CONFIG.log_file) as f:
            log = json.load(f)
    else:
        log = {"generations": []}
    
    # Add entry
    log["generations"].append({
        "timestamp": datetime.now().isoformat(),
        "prompt": prompt,
        "category": category,
        "generated": [str(p) for p in image_paths],
        "selected": str(selected_path) if selected_path else None,
        "evaluation": evaluation,
    })
    
    # Keep last 100 entries
    log["generations"] = log["generations"][-100:]
    
    with open(CONFIG.log_file, 'w') as f:
        json.dump(log, f, indent=2)


# =============================================================================
# MAIN PIPELINE
# =============================================================================

def generate_and_select(
    prompt: str,
    name: str,
    category: str = "programs",
    count: int = 4,
    aspect_ratio: str = "16:9",
    auto_select: bool = True,
) -> Dict[str, Any]:
    """
    Complete pipeline: generate images, optionally auto-select, and finalize.
    
    Returns dict with:
        - generated: List of generated image paths
        - grid: Path to comparison grid
        - selected: Path to selected image (if auto_select)
        - final: Path to final deployed image (if auto_select)
        - evaluation: Claude's evaluation (if auto_select)
    """
    
    output_dir = CONFIG.generated_dir / category
    
    # Step 1: Generate images
    log("=" * 60)
    log("[GENERATING] EVOLEA IMAGE GENERATION PIPELINE")
    log("=" * 60)

    image_paths = generate_images(
        prompt=prompt,
        output_dir=output_dir,
        base_name=name,
        count=count,
        aspect_ratio=aspect_ratio,
        backend="auto",
    )
    
    # Step 2: Create comparison grid
    grid_path = create_comparison_grid(image_paths, output_dir)
    if grid_path:
        log(f"\n[GRID] Comparison grid: {grid_path}")
    
    result = {
        "generated": [str(p) for p in image_paths],
        "grid": str(grid_path) if grid_path else None,
        "selected": None,
        "final": None,
        "evaluation": None,
    }
    
    # Step 3: Auto-select if requested
    if auto_select and CONFIG.anthropic_key:
        selected_path, evaluation = auto_select_best(image_paths, prompt)
        result["selected"] = str(selected_path)
        result["evaluation"] = evaluation
        
        # Step 4: Finalize
        final_path = finalize_image(selected_path, name, category)
        result["final"] = str(final_path)
        
    elif auto_select and not CONFIG.anthropic_key:
        log("\n[WARNING] ANTHROPIC_API_KEY not set - skipping auto-selection")
        log("   Set the key or run without --auto-select for manual review")
    
    # Log generation
    log_generation(
        prompt=prompt,
        image_paths=image_paths,
        selected_path=Path(result["selected"]) if result["selected"] else None,
        evaluation=result["evaluation"],
        category=category,
    )
    
    # Summary
    log("\n" + "=" * 60)
    log("[SUCCESS] GENERATION COMPLETE")
    log("=" * 60)
    log(f"Generated: {len(image_paths)} images")
    if result["final"]:
        log(f"Selected:  {result['final']}")
    else:
        log(f"Review:    {grid_path or image_paths[0]}")
    
    return result


# =============================================================================
# CLI
# =============================================================================

def generate_ab_comparison(
    prompt: str,
    name: str,
    category: str = "programs",
    aspect_ratio: str = "16:9",
    use_learnings: bool = True,
    backend: str = "auto",
) -> Dict[str, Any]:
    """
    Generate A/B comparison with learnings applied.
    Returns paths to both images and comparison grid.
    """
    output_dir = CONFIG.generated_dir / "training" / name
    output_dir.mkdir(parents=True, exist_ok=True)

    log("=" * 60)
    log("[RL] EVOLEA A/B IMAGE GENERATION")
    log("=" * 60)

    # Load learnings
    learnings = load_learnings() if use_learnings else Learnings()

    # Apply learnings to create A/B prompts
    prompt_a, prompt_b = apply_learnings_to_prompt(prompt, learnings)

    log(f"\n[A] Generating Option A...")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Generate Option A
    images_a = generate_images(
        prompt=enhance_prompt(prompt_a),
        output_dir=output_dir,
        base_name=f"{name}_A",
        count=1,
        aspect_ratio=aspect_ratio,
        backend=backend,
    )

    log(f"\n[B] Generating Option B...")

    # Generate Option B
    images_b = generate_images(
        prompt=enhance_prompt(prompt_b),
        output_dir=output_dir,
        base_name=f"{name}_B",
        count=1,
        aspect_ratio=aspect_ratio,
        backend=backend,
    )

    if not images_a or not images_b:
        raise RuntimeError("Failed to generate both options")

    image_a = images_a[0]
    image_b = images_b[0]

    # Create comparison grid
    log(f"\n[GRID] Creating comparison grid...")
    grid_path = create_ab_comparison_grid(image_a, image_b, output_dir, name)

    result = {
        "option_a": str(image_a),
        "option_b": str(image_b),
        "grid": str(grid_path) if grid_path else None,
        "prompt_a": prompt_a,
        "prompt_b": prompt_b,
        "session_id": f"session_{timestamp}",
    }

    log("\n" + "=" * 60)
    log("[SUCCESS] A/B COMPARISON READY")
    log("=" * 60)
    log(f"Option A: {image_a}")
    log(f"Option B: {image_b}")
    if grid_path:
        log(f"Grid:     {grid_path}")

    return result


def main():
    parser = argparse.ArgumentParser(
        description="EVOLEA Automated Image Generation Pipeline with RL",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # A/B comparison with learnings (recommended for training)
  %(prog)s "children creating art" --name mini-projekte-hero --training

  # Generate and auto-select (fully automated)
  %(prog)s "children creating art in museum" --name mini-museum-hero --auto-select

  # Generate only for manual review
  %(prog)s "children in garden" --name mini-garten-hero --category programs

  # Different aspect ratio for blog images
  %(prog)s "butterfly transformation" --name blog-header --category blog --aspect 4:3

Environment Variables:
  GEMINI_API_KEY     Required for image generation
  ANTHROPIC_API_KEY  Required for auto-selection (--auto-select)

Reinforcement Learning:
  Learnings stored in: .claude/skills/image-generation-rl/LEARNINGS.md
        """
    )

    parser.add_argument("prompt", nargs="?", help="Image generation prompt")
    parser.add_argument("--name", "-n", required=True, help="Output name (no extension)")
    parser.add_argument("--category", "-c", default="programs",
                       help="Category folder (programs, blog, decorative, training)")
    parser.add_argument("--count", type=int, default=4,
                       help="Number of variations (default: 4, or 2 for training)")
    parser.add_argument("--aspect", "-a", default="16:9",
                       help="Aspect ratio (16:9, 4:3, 1:1, 9:16)")
    parser.add_argument("--auto-select", "-s", action="store_true",
                       help="Automatically select best image using Claude")
    parser.add_argument("--training", "-t", action="store_true",
                       help="Generate A/B comparison for training with learnings")
    parser.add_argument("--no-learnings", action="store_true",
                       help="Skip applying learnings to prompts")
    parser.add_argument("--output-json", "-j", action="store_true",
                       help="Output result as JSON (for scripting)")
    parser.add_argument("--backend", "-b", default="auto",
                       choices=["auto", "gemini", "replicate"],
                       help="Image generation backend (default: auto)")

    args = parser.parse_args()

    if not args.prompt:
        parser.print_help()
        sys.exit(1)

    try:
        if args.training:
            # A/B comparison mode with learnings
            result = generate_ab_comparison(
                prompt=args.prompt,
                name=args.name,
                category=args.category,
                aspect_ratio=args.aspect,
                use_learnings=not args.no_learnings,
                backend=args.backend,
            )
        else:
            # Standard generation mode
            result = generate_and_select(
                prompt=args.prompt,
                name=args.name,
                category=args.category,
                count=args.count,
                aspect_ratio=args.aspect,
                auto_select=args.auto_select,
            )

        if args.output_json:
            log("\n" + json.dumps(result, indent=2))

    except Exception as e:
        log(f"\n[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
