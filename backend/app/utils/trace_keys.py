"""Trace key generation for application proxy authentication."""

import secrets


def generate_trace_key() -> str:
    """Create a unique capture key for the x-trace-key header."""
    return f"trace_sk_live_{secrets.token_hex(16)}"
