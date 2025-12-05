#!/usr/bin/env python3
"""
Robust Error Handling Module for EVOLEA Image Generation Agent

This module provides foolproof error handling for image generation operations,
including validation, retry logic, and graceful degradation.
"""

import base64
import io
import json
import time
import traceback
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum, auto
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, TypeVar, Union

# ============================================================================
# ERROR TYPES
# ============================================================================

class ErrorSeverity(Enum):
    """Severity levels for errors."""
    WARNING = auto()      # Can continue, but something was off
    RECOVERABLE = auto()  # Failed but can retry
    FATAL = auto()        # Cannot recover, must abort this operation
    CRITICAL = auto()     # System-level failure, should stop all operations


class ErrorCategory(Enum):
    """Categories of errors for better handling."""
    NETWORK = "network"              # Connection issues
    RATE_LIMIT = "rate_limit"        # API rate limiting
    VALIDATION = "validation"        # Data validation failures
    API_ERROR = "api_error"          # API returned an error
    IMAGE_CORRUPT = "image_corrupt"  # Image data is corrupt
    MEDIA_TYPE = "media_type"        # Media type mismatch
    TIMEOUT = "timeout"              # Operation timed out
    AUTH = "auth"                    # Authentication issues
    SERVER = "server"                # Server-side errors (5xx)
    UNKNOWN = "unknown"              # Unclassified errors


@dataclass
class ErrorInfo:
    """Structured error information."""
    category: ErrorCategory
    severity: ErrorSeverity
    message: str
    original_error: Optional[Exception] = None
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)
    retry_after: Optional[int] = None  # Seconds to wait before retry
    is_retryable: bool = True

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for logging."""
        return {
            "category": self.category.value,
            "severity": self.severity.name,
            "message": self.message,
            "details": self.details,
            "timestamp": self.timestamp.isoformat(),
            "retry_after": self.retry_after,
            "is_retryable": self.is_retryable,
            "traceback": traceback.format_exception(
                type(self.original_error),
                self.original_error,
                self.original_error.__traceback__
            ) if self.original_error else None
        }


# ============================================================================
# OPERATION RESULT PATTERN
# ============================================================================

T = TypeVar('T')


@dataclass
class OperationResult:
    """
    Result wrapper for operations that can fail.
    Never raises exceptions - always returns a result you can check.
    """
    success: bool
    value: Any = None
    error: Optional[ErrorInfo] = None
    warnings: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @classmethod
    def ok(cls, value: Any = None, warnings: List[str] = None, **metadata) -> 'OperationResult':
        """Create a successful result."""
        return cls(
            success=True,
            value=value,
            warnings=warnings or [],
            metadata=metadata
        )

    @classmethod
    def fail(cls, error: ErrorInfo, warnings: List[str] = None, **metadata) -> 'OperationResult':
        """Create a failed result."""
        return cls(
            success=False,
            error=error,
            warnings=warnings or [],
            metadata=metadata
        )

    @classmethod
    def from_exception(cls, e: Exception, category: ErrorCategory = None) -> 'OperationResult':
        """Create a failed result from an exception."""
        error_info = classify_error(e)
        if category:
            error_info.category = category
        return cls.fail(error_info)

    def __bool__(self) -> bool:
        """Allow using result in boolean context."""
        return self.success

    def unwrap(self) -> Any:
        """Get value or raise if failed. Use sparingly."""
        if self.success:
            return self.value
        raise RuntimeError(f"Operation failed: {self.error.message}")

    def unwrap_or(self, default: Any) -> Any:
        """Get value or return default if failed."""
        return self.value if self.success else default

    def map(self, fn: Callable[[Any], Any]) -> 'OperationResult':
        """Transform the value if successful."""
        if self.success:
            try:
                return OperationResult.ok(fn(self.value), self.warnings, **self.metadata)
            except Exception as e:
                return OperationResult.from_exception(e)
        return self


# ============================================================================
# ERROR CLASSIFICATION
# ============================================================================

def classify_error(error: Union[Exception, str]) -> ErrorInfo:
    """
    Classify an error and return structured error information.
    This is the main entry point for error classification.
    """
    error_str = str(error)
    error_lower = error_str.lower()

    # Extract JSON from error if present
    parsed_json = _extract_json_from_error(error_str)

    # Check for specific error patterns
    if "does not match the provided media type" in error_str:
        return ErrorInfo(
            category=ErrorCategory.MEDIA_TYPE,
            severity=ErrorSeverity.RECOVERABLE,
            message="Image data doesn't match declared media type",
            original_error=error if isinstance(error, Exception) else None,
            details={
                "raw_error": error_str,
                "parsed_json": parsed_json,
                "suggestion": "Image may be corrupt or wrong format. Will try to re-encode."
            },
            is_retryable=True,
            retry_after=1
        )

    if "rate_limit" in error_lower or "429" in error_str or "too many requests" in error_lower:
        retry_after = _extract_retry_after(error_str, parsed_json)
        return ErrorInfo(
            category=ErrorCategory.RATE_LIMIT,
            severity=ErrorSeverity.RECOVERABLE,
            message="Rate limited by API",
            original_error=error if isinstance(error, Exception) else None,
            details={"raw_error": error_str, "parsed_json": parsed_json},
            is_retryable=True,
            retry_after=retry_after or 60
        )

    if "401" in error_str or "unauthorized" in error_lower or "invalid api key" in error_lower:
        return ErrorInfo(
            category=ErrorCategory.AUTH,
            severity=ErrorSeverity.FATAL,
            message="Authentication failed - check API key",
            original_error=error if isinstance(error, Exception) else None,
            details={"raw_error": error_str},
            is_retryable=False
        )

    if "500" in error_str or "502" in error_str or "503" in error_str or "504" in error_str:
        return ErrorInfo(
            category=ErrorCategory.SERVER,
            severity=ErrorSeverity.RECOVERABLE,
            message="Server error - API may be experiencing issues",
            original_error=error if isinstance(error, Exception) else None,
            details={"raw_error": error_str, "parsed_json": parsed_json},
            is_retryable=True,
            retry_after=5
        )

    if "timeout" in error_lower or "timed out" in error_lower:
        return ErrorInfo(
            category=ErrorCategory.TIMEOUT,
            severity=ErrorSeverity.RECOVERABLE,
            message="Operation timed out",
            original_error=error if isinstance(error, Exception) else None,
            details={"raw_error": error_str},
            is_retryable=True,
            retry_after=2
        )

    if "connection" in error_lower or "network" in error_lower or "dns" in error_lower:
        return ErrorInfo(
            category=ErrorCategory.NETWORK,
            severity=ErrorSeverity.RECOVERABLE,
            message="Network connection error",
            original_error=error if isinstance(error, Exception) else None,
            details={"raw_error": error_str},
            is_retryable=True,
            retry_after=3
        )

    if "400" in error_str or "bad request" in error_lower or "invalid_request" in error_lower:
        return ErrorInfo(
            category=ErrorCategory.API_ERROR,
            severity=ErrorSeverity.RECOVERABLE,
            message="Bad request - check input parameters",
            original_error=error if isinstance(error, Exception) else None,
            details={"raw_error": error_str, "parsed_json": parsed_json},
            is_retryable=True,  # May be retryable with modified input
            retry_after=1
        )

    # Default case
    return ErrorInfo(
        category=ErrorCategory.UNKNOWN,
        severity=ErrorSeverity.RECOVERABLE,
        message=f"Unexpected error: {error_str[:200]}",
        original_error=error if isinstance(error, Exception) else None,
        details={"raw_error": error_str, "parsed_json": parsed_json},
        is_retryable=True,
        retry_after=2
    )


def _extract_json_from_error(error_str: str) -> Optional[Dict]:
    """Try to extract JSON from error message."""
    try:
        if "{" in error_str and "}" in error_str:
            start = error_str.find("{")
            end = error_str.rfind("}") + 1
            return json.loads(error_str[start:end])
    except (json.JSONDecodeError, ValueError):
        pass
    return None


def _extract_retry_after(error_str: str, parsed_json: Optional[Dict]) -> Optional[int]:
    """Try to extract retry-after value from error."""
    if parsed_json:
        # Check various common locations for retry-after
        for key in ['retry_after', 'retryAfter', 'retry-after']:
            if key in parsed_json:
                try:
                    return int(parsed_json[key])
                except (ValueError, TypeError):
                    pass
            if 'error' in parsed_json and key in parsed_json.get('error', {}):
                try:
                    return int(parsed_json['error'][key])
                except (ValueError, TypeError):
                    pass
    return None


# ============================================================================
# IMAGE VALIDATION
# ============================================================================

def validate_image_data(
    data: bytes,
    expected_mime: str = None,
    min_size: int = 100,
    max_size: int = 50 * 1024 * 1024  # 50MB max
) -> OperationResult:
    """
    Validate image data before using it.
    Returns OperationResult with validated data or error.
    """
    warnings = []

    if not data:
        return OperationResult.fail(ErrorInfo(
            category=ErrorCategory.IMAGE_CORRUPT,
            severity=ErrorSeverity.FATAL,
            message="Image data is empty",
            is_retryable=False
        ))

    if len(data) < min_size:
        return OperationResult.fail(ErrorInfo(
            category=ErrorCategory.IMAGE_CORRUPT,
            severity=ErrorSeverity.FATAL,
            message=f"Image data too small ({len(data)} bytes)",
            details={"size": len(data), "min_size": min_size},
            is_retryable=False
        ))

    if len(data) > max_size:
        return OperationResult.fail(ErrorInfo(
            category=ErrorCategory.VALIDATION,
            severity=ErrorSeverity.FATAL,
            message=f"Image data too large ({len(data)} bytes)",
            details={"size": len(data), "max_size": max_size},
            is_retryable=False
        ))

    # Detect actual image format from magic bytes
    detected_format = detect_image_format(data)

    if not detected_format:
        return OperationResult.fail(ErrorInfo(
            category=ErrorCategory.IMAGE_CORRUPT,
            severity=ErrorSeverity.FATAL,
            message="Could not detect image format - data may be corrupt",
            details={"first_bytes": data[:20].hex()},
            is_retryable=False
        ))

    # Check if detected format matches expected
    if expected_mime:
        expected_format = mime_to_format(expected_mime)
        if expected_format and detected_format != expected_format:
            warnings.append(
                f"Format mismatch: expected {expected_format}, detected {detected_format}"
            )

    return OperationResult.ok(
        value={
            "data": data,
            "format": detected_format,
            "mime_type": format_to_mime(detected_format),
            "size": len(data)
        },
        warnings=warnings,
        detected_format=detected_format
    )


def detect_image_format(data: bytes) -> Optional[str]:
    """Detect image format from magic bytes."""
    if len(data) < 8:
        return None

    # PNG: 89 50 4E 47 0D 0A 1A 0A
    if data[:8] == b'\x89PNG\r\n\x1a\n':
        return "png"

    # JPEG: FF D8 FF
    if data[:3] == b'\xff\xd8\xff':
        return "jpeg"

    # GIF: GIF87a or GIF89a
    if data[:6] in (b'GIF87a', b'GIF89a'):
        return "gif"

    # WebP: RIFF....WEBP
    if data[:4] == b'RIFF' and data[8:12] == b'WEBP':
        return "webp"

    # BMP: BM
    if data[:2] == b'BM':
        return "bmp"

    return None


def format_to_mime(fmt: str) -> str:
    """Convert format string to MIME type."""
    mapping = {
        "png": "image/png",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "gif": "image/gif",
        "webp": "image/webp",
        "bmp": "image/bmp"
    }
    return mapping.get(fmt.lower(), "application/octet-stream")


def mime_to_format(mime: str) -> Optional[str]:
    """Convert MIME type to format string."""
    mapping = {
        "image/png": "png",
        "image/jpeg": "jpeg",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/bmp": "bmp"
    }
    return mapping.get(mime.lower())


def fix_image_data(data: bytes, target_format: str = "png") -> OperationResult:
    """
    Attempt to fix/re-encode image data.
    This can help when there's a format mismatch.
    """
    try:
        from PIL import Image

        # Try to load the image
        try:
            img = Image.open(io.BytesIO(data))
            img.load()  # Force load to catch corrupt images
        except Exception as e:
            return OperationResult.fail(ErrorInfo(
                category=ErrorCategory.IMAGE_CORRUPT,
                severity=ErrorSeverity.FATAL,
                message=f"Could not load image: {e}",
                original_error=e,
                is_retryable=False
            ))

        # Convert to target format
        output = io.BytesIO()

        # Handle RGBA for formats that don't support it
        if target_format.lower() == "jpeg" and img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        save_kwargs = {}
        if target_format.lower() == "png":
            save_kwargs["optimize"] = True
        elif target_format.lower() == "jpeg":
            save_kwargs["quality"] = 95

        img.save(output, format=target_format.upper(), **save_kwargs)
        fixed_data = output.getvalue()

        return OperationResult.ok(
            value={
                "data": fixed_data,
                "format": target_format,
                "mime_type": format_to_mime(target_format),
                "size": len(fixed_data),
                "original_size": len(data),
                "was_converted": True
            },
            original_format=detect_image_format(data)
        )

    except ImportError:
        return OperationResult.fail(ErrorInfo(
            category=ErrorCategory.UNKNOWN,
            severity=ErrorSeverity.FATAL,
            message="PIL/Pillow not installed - cannot fix image",
            is_retryable=False
        ))
    except Exception as e:
        return OperationResult.fail(ErrorInfo(
            category=ErrorCategory.IMAGE_CORRUPT,
            severity=ErrorSeverity.FATAL,
            message=f"Failed to fix image: {e}",
            original_error=e,
            is_retryable=False
        ))


def encode_image_for_api(
    image_path_or_data: Union[str, Path, bytes],
    target_format: str = "png",
    max_size_bytes: int = 20 * 1024 * 1024,
    auto_fix: bool = True
) -> OperationResult:
    """
    Prepare an image for API submission.
    Validates, optionally fixes, and base64 encodes the image.
    """
    # Load data if path provided
    if isinstance(image_path_or_data, (str, Path)):
        path = Path(image_path_or_data)
        if not path.exists():
            return OperationResult.fail(ErrorInfo(
                category=ErrorCategory.VALIDATION,
                severity=ErrorSeverity.FATAL,
                message=f"Image file not found: {path}",
                is_retryable=False
            ))
        try:
            data = path.read_bytes()
        except Exception as e:
            return OperationResult.fail(ErrorInfo(
                category=ErrorCategory.VALIDATION,
                severity=ErrorSeverity.FATAL,
                message=f"Could not read image file: {e}",
                original_error=e,
                is_retryable=False
            ))
    else:
        data = image_path_or_data

    # Validate the image
    validation = validate_image_data(data, max_size=max_size_bytes)
    if not validation:
        if auto_fix:
            # Try to fix the image
            fix_result = fix_image_data(data, target_format)
            if fix_result:
                data = fix_result.value["data"]
                validation = validate_image_data(data)
            else:
                return fix_result
        else:
            return validation

    detected_format = validation.metadata.get("detected_format")
    actual_mime = format_to_mime(detected_format or target_format)

    # Re-encode if format doesn't match target
    if auto_fix and detected_format and detected_format != target_format:
        fix_result = fix_image_data(data, target_format)
        if fix_result:
            data = fix_result.value["data"]
            actual_mime = format_to_mime(target_format)

    # Base64 encode
    try:
        b64_data = base64.standard_b64encode(data).decode("utf-8")
    except Exception as e:
        return OperationResult.fail(ErrorInfo(
            category=ErrorCategory.VALIDATION,
            severity=ErrorSeverity.FATAL,
            message=f"Failed to base64 encode image: {e}",
            original_error=e,
            is_retryable=False
        ))

    return OperationResult.ok(
        value={
            "base64": b64_data,
            "mime_type": actual_mime,
            "size": len(data),
            "format": target_format
        },
        warnings=validation.warnings
    )


# ============================================================================
# RETRY LOGIC
# ============================================================================

def retry_with_backoff(
    fn: Callable[[], OperationResult],
    max_retries: int = 3,
    initial_delay: float = 1.0,
    max_delay: float = 60.0,
    backoff_factor: float = 2.0,
    on_retry: Callable[[int, ErrorInfo, float], None] = None
) -> OperationResult:
    """
    Execute a function with exponential backoff retry logic.

    Args:
        fn: Function that returns OperationResult
        max_retries: Maximum number of retry attempts
        initial_delay: Initial delay in seconds
        max_delay: Maximum delay between retries
        backoff_factor: Multiplier for delay after each retry
        on_retry: Optional callback called before each retry (attempt, error, delay)
    """
    last_result = None
    delay = initial_delay

    for attempt in range(max_retries + 1):
        try:
            result = fn()

            if result.success:
                return result

            # Failed - check if retryable
            if not result.error or not result.error.is_retryable:
                return result

            last_result = result

            if attempt < max_retries:
                # Use retry_after from error if provided, otherwise use backoff
                actual_delay = result.error.retry_after or delay
                actual_delay = min(actual_delay, max_delay)

                if on_retry:
                    on_retry(attempt + 1, result.error, actual_delay)

                time.sleep(actual_delay)
                delay = min(delay * backoff_factor, max_delay)

        except Exception as e:
            error_info = classify_error(e)
            last_result = OperationResult.fail(error_info)

            if not error_info.is_retryable:
                return last_result

            if attempt < max_retries:
                actual_delay = error_info.retry_after or delay
                actual_delay = min(actual_delay, max_delay)

                if on_retry:
                    on_retry(attempt + 1, error_info, actual_delay)

                time.sleep(actual_delay)
                delay = min(delay * backoff_factor, max_delay)

    # All retries exhausted
    if last_result:
        last_result.metadata["retries_exhausted"] = True
        last_result.metadata["total_attempts"] = max_retries + 1
    return last_result or OperationResult.fail(ErrorInfo(
        category=ErrorCategory.UNKNOWN,
        severity=ErrorSeverity.FATAL,
        message="All retries exhausted with no result",
        is_retryable=False
    ))


# ============================================================================
# ERROR LOGGING
# ============================================================================

class ErrorLogger:
    """Centralized error logging."""

    def __init__(self, log_dir: Union[str, Path]):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.error_count = 0

    def log(self, error: ErrorInfo, context: str = "") -> Path:
        """Log an error and return the log file path."""
        self.error_count += 1
        filename = f"error_{self.session_id}_{self.error_count:04d}.json"
        filepath = self.log_dir / filename

        log_data = {
            "context": context,
            "error": error.to_dict(),
            "session_id": self.session_id,
            "error_number": self.error_count
        }

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(log_data, f, indent=2, default=str)
        except Exception as e:
            print(f"WARNING: Could not write error log: {e}")

        return filepath

    def log_result(self, result: OperationResult, context: str = "") -> Optional[Path]:
        """Log a failed OperationResult."""
        if result.success or not result.error:
            return None
        return self.log(result.error, context)


# ============================================================================
# SAFE EXECUTION WRAPPER
# ============================================================================

def safe_execute(
    fn: Callable,
    *args,
    error_category: ErrorCategory = ErrorCategory.UNKNOWN,
    **kwargs
) -> OperationResult:
    """
    Safely execute any function, catching all exceptions.
    Returns OperationResult instead of raising.
    """
    try:
        result = fn(*args, **kwargs)
        return OperationResult.ok(result)
    except Exception as e:
        error_info = classify_error(e)
        error_info.category = error_category
        return OperationResult.fail(error_info)


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def is_media_type_error(error: Union[Exception, str, ErrorInfo]) -> bool:
    """Check if an error is a media type mismatch."""
    if isinstance(error, ErrorInfo):
        return error.category == ErrorCategory.MEDIA_TYPE

    error_str = str(error)
    return "does not match the provided media type" in error_str


def is_rate_limit_error(error: Union[Exception, str, ErrorInfo]) -> bool:
    """Check if an error is a rate limit error."""
    if isinstance(error, ErrorInfo):
        return error.category == ErrorCategory.RATE_LIMIT

    error_str = str(error).lower()
    return "429" in error_str or "rate_limit" in error_str or "too many requests" in error_str


def is_retryable(error: Union[Exception, str, ErrorInfo]) -> bool:
    """Check if an error is retryable."""
    if isinstance(error, ErrorInfo):
        return error.is_retryable
    return classify_error(error).is_retryable
