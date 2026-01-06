#!/usr/bin/env python3
"""
Secret leak detection script.

Scans files for potential API keys, passwords, and other secrets.
Used by pre-commit hooks and can be run manually.

Usage:
    python scripts/check_secrets.py [--staged-only]
    python scripts/check_secrets.py --file path/to/file.py
    python scripts/check_secrets.py --history
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path

# Patterns that indicate potential secrets
# These patterns are designed to catch HARDCODED secrets, not variable references
SECRET_PATTERNS = [
    # Google API keys (AIza...) - ALWAYS a real key, 39 chars
    (r'AIza[A-Za-z0-9_-]{35}', 'Google API Key'),
    # AWS keys - ALWAYS a real key
    (r'AKIA[A-Z0-9]{16}', 'AWS Access Key'),
    # GitHub tokens - ALWAYS a real token
    (r'gh[pousr]_[A-Za-z0-9_]{36,}', 'GitHub Token'),
    # Slack tokens - ALWAYS a real token
    (r'xox[baprs]-[A-Za-z0-9-]{10,}', 'Slack Token'),
    # Private keys - ALWAYS sensitive
    (r'-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----', 'Private Key'),
    # Bearer tokens with actual token value (in quotes)
    (r'(?i)bearer\s+["\'][A-Za-z0-9_-]{20,}["\']', 'Bearer Token'),
    # Hardcoded API keys in quotes (not variable references)
    (r'(?i)(api[_-]?key|apikey)\s*[=:]\s*["\'][A-Za-z0-9_-]{20,}["\']', 'Hardcoded API Key'),
    # Hardcoded passwords in quotes (not variable references like password=settings.password)
    (r'(?i)(password|passwd|pwd)\s*[=:]\s*["\'][^"\']{8,}["\']', 'Hardcoded Password'),
    # Hardcoded secrets in quotes
    (r'(?i)(secret|token)\s*[=:]\s*["\'][A-Za-z0-9_-]{20,}["\']', 'Hardcoded Secret'),
]

# Files/patterns to always skip
SKIP_PATTERNS = [
    r'\.env\.example$',
    r'\.env\.sample$',
    r'\.env\.template$',
    r'check_secrets\.py$',  # This file itself
    r'test_.*\.py$',  # Test files may have fake keys
    r'conftest\.py$',
    r'\.git/',
    r'__pycache__/',
    r'\.pyc$',
    r'node_modules/',
    r'\.min\.js$',
    r'package-lock\.json$',
    r'uv\.lock$',
    r'pnpm-lock\.yaml$',
]

# Known false positives (partial matches to ignore)
FALSE_POSITIVES = [
    'your-google-api-key-here',
    'your-api-key-here',
    'your_api_key_here',
    'your-gemini-api-key',
    'test-key',
    'fake-key',
    'example-key',
    'placeholder',
    'AIzaSy...',  # Truncated example
    'GOOGLE_API_KEY=your',
    'SecurePassword123!',  # Example in docs
    'password="password"',  # Standard placeholder in docs
    "password='password'",  # Standard placeholder in docs
]


def should_skip_file(filepath: str) -> bool:
    """Check if file should be skipped."""
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, filepath):
            return True
    return False


def is_false_positive(match: str, line: str) -> bool:
    """Check if match is a known false positive."""
    line_lower = line.lower()
    match_lower = match.lower()

    for fp in FALSE_POSITIVES:
        if fp.lower() in line_lower or fp.lower() in match_lower:
            return True

    # Check if it's in a comment
    stripped = line.strip()
    if stripped.startswith('#') or stripped.startswith('//') or stripped.startswith('*'):
        # Allow truncated examples in comments
        if '...' in match or 'example' in line_lower or 'placeholder' in line_lower:
            return True

    return False


def redact_secret(match: str) -> str:
    """Redact the actual secret in output for safety."""
    if len(match) > 10:
        return f"{match[:6]}...{match[-4:]}"
    else:
        return f"{match[:3]}..."


def scan_file(filepath: Path) -> list[tuple[int, str, str]]:
    """Scan a file for potential secrets.

    Returns list of (line_number, secret_type, matched_text)
    """
    findings = []

    if should_skip_file(str(filepath)):
        return findings

    try:
        content = filepath.read_text(encoding='utf-8', errors='replace')
    except Exception:
        return findings

    for line_num, line in enumerate(content.split('\n'), 1):
        for pattern, secret_type in SECRET_PATTERNS:
            matches = re.findall(pattern, line)
            for match in matches:
                # Handle tuple matches from groups
                if isinstance(match, tuple):
                    match = match[0] if match else ''

                if match and not is_false_positive(match, line):
                    redacted = redact_secret(match)
                    findings.append((line_num, secret_type, redacted))

    return findings


def get_staged_files() -> list[Path]:
    """Get list of staged files from git."""
    result = subprocess.run(
        ['git', 'diff', '--cached', '--name-only', '--diff-filter=ACM'],
        capture_output=True,
        text=True
    )
    files = []
    for line in result.stdout.strip().split('\n'):
        if line:
            path = Path(line)
            if path.exists() and path.is_file():
                files.append(path)
    return files


def get_all_tracked_files() -> list[Path]:
    """Get list of all tracked files from git."""
    result = subprocess.run(
        ['git', 'ls-files'],
        capture_output=True,
        text=True
    )
    files = []
    for line in result.stdout.strip().split('\n'):
        if line:
            path = Path(line)
            if path.exists() and path.is_file():
                files.append(path)
    return files


def scan_git_history() -> list[tuple[str, str, str, str]]:
    """Scan git history for potential secrets.

    Returns list of (commit_hash, filepath, secret_type, redacted_match)
    """
    findings = []

    # Search strings (literal) and their corresponding regex patterns
    # Format: (search_string, regex_pattern, secret_type)
    history_patterns = [
        ('AIza', r'AIza[A-Za-z0-9_-]{35}', 'Google API Key'),
        ('AKIA', r'AKIA[A-Z0-9]{16}', 'AWS Access Key'),
        ('ghp_', r'gh[pousr]_[A-Za-z0-9_]{36,}', 'GitHub Token'),
        ('gho_', r'gh[pousr]_[A-Za-z0-9_]{36,}', 'GitHub Token'),
        ('ghs_', r'gh[pousr]_[A-Za-z0-9_]{36,}', 'GitHub Token'),
        ('xoxb-', r'xox[baprs]-[A-Za-z0-9-]{10,}', 'Slack Token'),
        ('xoxa-', r'xox[baprs]-[A-Za-z0-9-]{10,}', 'Slack Token'),
    ]

    print("Scanning git history (this may take a moment)...")

    for search_string, pattern, secret_type in history_patterns:
        # Use git log -S to find commits that added/removed the search string
        try:
            result = subprocess.run(
                ['git', 'log', '--all', '-p', '--full-history', '-S', search_string],
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout per pattern
            )
        except subprocess.TimeoutExpired:
            print(f"  Timeout scanning for {secret_type}, skipping...")
            continue

        if result.returncode != 0:
            continue

        # Parse the output to find actual matches
        current_commit = None
        current_file = None

        for line in result.stdout.split('\n'):
            if line.startswith('commit '):
                current_commit = line.split()[1][:8]
            elif line.startswith('diff --git'):
                # Extract filename from "diff --git a/path b/path"
                parts = line.split()
                if len(parts) >= 4:
                    current_file = parts[3][2:]  # Remove 'b/' prefix
            elif line.startswith('+') and not line.startswith('+++'):
                # Check for pattern in added lines
                matches = re.findall(pattern, line)
                for match in matches:
                    if isinstance(match, tuple):
                        match = match[0] if match else ''
                    if match and not is_false_positive(match, line):
                        redacted = redact_secret(match)
                        finding = (current_commit, current_file or 'unknown', secret_type, redacted)
                        if finding not in findings:
                            findings.append(finding)

    return findings


def main():
    parser = argparse.ArgumentParser(description='Scan for potential secret leaks')
    parser.add_argument('--staged-only', action='store_true',
                        help='Only scan staged files (for pre-commit)')
    parser.add_argument('--file', type=str,
                        help='Scan a specific file')
    parser.add_argument('--history', action='store_true',
                        help='Scan git history for past leaks')
    parser.add_argument('--quiet', action='store_true',
                        help='Only output if secrets found')
    args = parser.parse_args()

    # Handle history scanning separately
    if args.history:
        history_findings = scan_git_history()

        if history_findings:
            print("\n" + "=" * 60)
            print("SECRETS FOUND IN GIT HISTORY!")
            print("=" * 60)

            # Group by commit
            by_commit = {}
            for commit, filepath, secret_type, redacted in history_findings:
                if commit not in by_commit:
                    by_commit[commit] = []
                by_commit[commit].append((filepath, secret_type, redacted))

            for commit, items in by_commit.items():
                print(f"\nCommit: {commit}")
                for filepath, secret_type, redacted in items:
                    print(f"  {filepath}")
                    print(f"    Type: {secret_type}")
                    print(f"    Match: {redacted}")

            print("\n" + "=" * 60)
            print("WARNING: These secrets are in your git history!")
            print("Even if removed from current files, they may be exposed.")
            print("Consider rotating these credentials and using BFG or")
            print("git-filter-repo to remove them from history.")
            print("=" * 60)
            return 1
        else:
            if not args.quiet:
                print("No secrets detected in git history.")
            return 0

    # Regular file scanning
    if args.file:
        files = [Path(args.file)]
    elif args.staged_only:
        files = get_staged_files()
    else:
        files = get_all_tracked_files()

    if not args.quiet:
        print(f"Scanning {len(files)} file(s) for secrets...")

    all_findings = []
    for filepath in files:
        findings = scan_file(filepath)
        if findings:
            all_findings.extend([(filepath, *f) for f in findings])

    if all_findings:
        print("\n" + "=" * 60)
        print("POTENTIAL SECRETS DETECTED!")
        print("=" * 60)
        for filepath, line_num, secret_type, redacted in all_findings:
            print(f"\n{filepath}:{line_num}")
            print(f"  Type: {secret_type}")
            print(f"  Match: {redacted}")
        print("\n" + "=" * 60)
        print("COMMIT BLOCKED - Please remove secrets before committing!")
        print("=" * 60)
        print("\nIf this is a false positive, add it to FALSE_POSITIVES in")
        print("scripts/check_secrets.py")
        return 1
    else:
        if not args.quiet:
            print("No secrets detected.")
        return 0


if __name__ == '__main__':
    sys.exit(main())
