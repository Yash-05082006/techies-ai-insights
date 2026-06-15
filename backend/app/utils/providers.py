"""Provider name normalization for proxy routing."""

_GEMINI_ALIASES = frozenset({"google", "gemini", "google-gemini"})


def normalize_provider(provider: str) -> str:
    """Map user-facing provider names to internal routing keys."""
    key = provider.lower().strip()
    if key in _GEMINI_ALIASES:
        return "google"
    return key


def is_gemini_provider(provider: str) -> bool:
    return normalize_provider(provider) == "google"
