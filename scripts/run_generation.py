#!/usr/bin/env python3
"""Simple wrapper to run image generation with environment setup.

Requires GEMINI_API_KEY to be set in .env file at project root.
"""
import os
import sys
import subprocess

# Ensure proper encoding for Windows
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Get arguments
if len(sys.argv) < 2:
    print("Usage: python run_generation.py <prompt> --name <name> --category <category> --count <count>")
    sys.exit(1)

# Run the generate script
cmd = [sys.executable, 'scripts/generate_image.py'] + sys.argv[1:]
result = subprocess.run(cmd, cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.exit(result.returncode)
