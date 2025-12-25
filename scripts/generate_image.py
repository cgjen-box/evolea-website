#!/usr/bin/env python3
"""
EVOLEA Automated Image Generation Pipeline
===========================================
Generates brand-consistent images using Gemini 3 Pro and auto-selects
the best one using Claude for evaluation.

Usage:
    # Fully automated (generate + select)
    python generate_image.py "prompt" --name output-name --auto-select
    
    # Generate only (manual review)
    python generate_image.py "prompt" --name output-name
    
    # Select from existing images
    python generate_image.py --select-from public/images/generated/programs/ --name hero

Environment Variables Required:
    GEMINI_API_KEY    - Google AI API key for image generation
    ANTHROPIC_API_KEY - Anthropic API key for auto-selection (optional)
"""

import os
import sys
import json
import base64
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple
from dataclasses import dataclass, asdict

# =============================================================================
# DEPENDENCIES CHECK
# =============================================================================

def check_dependencies():
    """Check and install required packages."""
    required = {
        'google.generativeai': 'google-generativeai',
        'PIL': 'pillow',
        'anthropic': 'anthropic',
    }
    
    missing = []
    for module, package in required.items():
        try:
            __import__(module.split('.')[0])
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"Installing missing packages: {', '.join(missing)}")
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', 
            *missing, '--break-system-packages', '-q'
        ])
        print("✅ Dependencies installed\n")

check_dependencies()

import google.generativeai as genai
from PIL import Image
import anthropic

# =============================================================================
# CONFIGURATION
# =============================================================================

@dataclass
class Config:
    """Pipeline configuration."""
    # API Keys
    gemini_key: str = os.environ.get("GEMINI_API_KEY", "")
    anthropic_key: str = os.environ.get("ANTHROPIC_API_KEY", "")
    
    # Paths (relative to script location)
    project_root: Path = Path(__file__).parent.parent
    generated_dir: Path = None  # Set in __post_init__
    final_dir: Path = None
    log_file: Path = None
    
    # Generation settings
    default_count: int = 4
    default_aspect: str = "16:9"
    gemini_model: str = "gemini-2.0-flash-exp"  # Supports image generation
    claude_model: str = "claude-sonnet-4-20250514"
    
    def __post_init__(self):
        self.generated_dir = self.project_root / "public" / "images" / "generated"
        self.final_dir = self.project_root / "public" / "images"
        self.log_file = self.generated_dir / "generation_log.json"


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
) -> List[Path]:
    """Generate images using Gemini's multimodal capabilities."""
    
    if not CONFIG.gemini_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")
    
    genai.configure(api_key=CONFIG.gemini_key)
    model = genai.GenerativeModel(CONFIG.gemini_model)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    enhanced_prompt = enhance_prompt(prompt)
    saved_paths = []
    
    print(f"\n🎨 Generating {count} images with Gemini...")
    print(f"📝 Base prompt: {prompt[:100]}...")
    
    for i in range(count):
        print(f"   Generating variation {i+1}/{count}...", end=" ", flush=True)
        
        try:
            # Use Gemini to generate image
            response = model.generate_content(
                f"""Generate an image based on this description. 
                
{enhanced_prompt}

This is variation {i+1} of {count} - make each variation slightly different while 
maintaining the core concept. Vary the composition, specific poses, or color emphasis.

Aspect ratio: {aspect_ratio}""",
                generation_config=genai.GenerationConfig(
                    response_modalities=["image", "text"]
                )
            )
            
            # Extract and save image
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and 'image' in part.inline_data.mime_type:
                    image_data = base64.b64decode(part.inline_data.data)
                    
                    filename = f"{base_name}_{timestamp}_v{i+1}.png"
                    filepath = output_dir / filename
                    
                    with open(filepath, 'wb') as f:
                        f.write(image_data)
                    
                    saved_paths.append(filepath)
                    print(f"✅ {filename}")
                    break
            else:
                print("⚠️ No image in response")
                
        except Exception as e:
            print(f"❌ Failed: {e}")
    
    if not saved_paths:
        raise RuntimeError("No images were generated successfully")
    
    return saved_paths


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
        print(f"⚠️ Could not create grid: {e}")
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
    
    print(f"\n🤖 Evaluating {len(image_paths)} images with Claude...")
    
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
            print("⚠️ Could not parse evaluation, defaulting to image 1")
            evaluation = {"selected": 1, "reasoning": "Parse error, defaulted to first"}
    
    selected_idx = evaluation.get("selected", 1) - 1  # Convert to 0-indexed
    selected_idx = max(0, min(selected_idx, len(image_paths) - 1))  # Bounds check
    
    selected_path = image_paths[selected_idx]
    
    print(f"✅ Selected: Image {selected_idx + 1} ({selected_path.name})")
    if evaluation.get("reasoning"):
        print(f"📋 Reason: {evaluation['reasoning'][:200]}...")
    
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
    
    print(f"\n📦 Final image: {final_path}")
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
    print("=" * 60)
    print("🚀 EVOLEA IMAGE GENERATION PIPELINE")
    print("=" * 60)
    
    image_paths = generate_images_gemini(
        prompt=prompt,
        output_dir=output_dir,
        base_name=name,
        count=count,
        aspect_ratio=aspect_ratio,
    )
    
    # Step 2: Create comparison grid
    grid_path = create_comparison_grid(image_paths, output_dir)
    if grid_path:
        print(f"\n📊 Comparison grid: {grid_path}")
    
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
        print("\n⚠️ ANTHROPIC_API_KEY not set - skipping auto-selection")
        print("   Set the key or run without --auto-select for manual review")
    
    # Log generation
    log_generation(
        prompt=prompt,
        image_paths=image_paths,
        selected_path=Path(result["selected"]) if result["selected"] else None,
        evaluation=result["evaluation"],
        category=category,
    )
    
    # Summary
    print("\n" + "=" * 60)
    print("✨ GENERATION COMPLETE")
    print("=" * 60)
    print(f"Generated: {len(image_paths)} images")
    if result["final"]:
        print(f"Selected:  {result['final']}")
    else:
        print(f"Review:    {grid_path or image_paths[0]}")
    
    return result


# =============================================================================
# CLI
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="EVOLEA Automated Image Generation Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate and auto-select (fully automated)
  %(prog)s "children creating art in museum" --name mini-museum-hero --auto-select
  
  # Generate only for manual review
  %(prog)s "children in garden" --name mini-garten-hero --category programs
  
  # Different aspect ratio for blog images
  %(prog)s "butterfly transformation" --name blog-header --category blog --aspect 4:3

Environment Variables:
  GEMINI_API_KEY     Required for image generation
  ANTHROPIC_API_KEY  Required for auto-selection (--auto-select)
        """
    )
    
    parser.add_argument("prompt", nargs="?", help="Image generation prompt")
    parser.add_argument("--name", "-n", required=True, help="Output name (no extension)")
    parser.add_argument("--category", "-c", default="programs",
                       help="Category folder (programs, blog, decorative)")
    parser.add_argument("--count", type=int, default=4,
                       help="Number of variations (default: 4)")
    parser.add_argument("--aspect", "-a", default="16:9",
                       help="Aspect ratio (16:9, 4:3, 1:1, 9:16)")
    parser.add_argument("--auto-select", "-s", action="store_true",
                       help="Automatically select best image using Claude")
    parser.add_argument("--output-json", "-j", action="store_true",
                       help="Output result as JSON (for scripting)")
    
    args = parser.parse_args()
    
    if not args.prompt:
        parser.print_help()
        sys.exit(1)
    
    try:
        result = generate_and_select(
            prompt=args.prompt,
            name=args.name,
            category=args.category,
            count=args.count,
            aspect_ratio=args.aspect,
            auto_select=args.auto_select,
        )
        
        if args.output_json:
            print("\n" + json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
