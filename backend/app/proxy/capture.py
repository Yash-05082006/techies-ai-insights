"""Parse provider responses and build telemetry records."""

from app.utils.providers import normalize_provider
import json
from dataclasses import dataclass
from typing import Any


@dataclass
class CapturedTelemetry:
    """Normalized telemetry extracted from a proxied LLM call."""

    model: str
    provider: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    status: int
    latency_ms: int
    prompt_preview: str | None = None
    completion_preview: str | None = None


def _truncate(text: str | None, limit: int = 500) -> str | None:
    if not text:
        return None
    return text if len(text) <= limit else text[:limit] + "…"


def estimate_tokens(text: str) -> int:
    """Approximate token count from text length (~4 chars per token)."""
    if not text:
        return 0
    return max(1, len(text) // 4)


def _openai_messages_text(messages: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for message in messages:
        content = message.get("content", "")
        if isinstance(content, str):
            parts.append(content)
        else:
            parts.append(json.dumps(content))
    return "\n".join(parts)


def _extract_openai_prompt_preview(request_body: bytes) -> str | None:
    try:
        payload = json.loads(request_body)
        messages = payload.get("messages", [])
        if messages:
            content = messages[-1].get("content", "")
            if isinstance(content, str):
                return _truncate(content)
        return _truncate(json.dumps(payload)[:500])
    except (json.JSONDecodeError, TypeError, AttributeError):
        return None


def _extract_openai_completion_preview(response_body: bytes) -> str | None:
    try:
        payload = json.loads(response_body)
        choices = payload.get("choices", [])
        if choices:
            message = choices[0].get("message", {})
            content = message.get("content", "")
            if isinstance(content, str):
                return _truncate(content)
        return None
    except (json.JSONDecodeError, TypeError, AttributeError):
        return None


def _extract_gemini_completion_text(response_payload: dict[str, Any]) -> str:
    candidates = response_payload.get("candidates", [])
    if not candidates:
        return ""
    parts = candidates[0].get("content", {}).get("parts", [])
    texts = [part.get("text", "") for part in parts if isinstance(part.get("text"), str)]
    return "\n".join(texts)


def _extract_gemini_completion_preview(response_body: bytes) -> str | None:
    try:
        payload = json.loads(response_body)
        return _truncate(_extract_gemini_completion_text(payload))
    except (json.JSONDecodeError, TypeError, AttributeError):
        return None


def extract_openai_telemetry(
    *,
    provider: str,
    request_body: bytes,
    response_body: bytes,
    status_code: int,
    latency_ms: int,
) -> CapturedTelemetry:
    """Extract usage metrics from an OpenAI chat/completions exchange."""
    model = "unknown"
    prompt_tokens = 0
    completion_tokens = 0
    total_tokens = 0

    try:
        request_payload = json.loads(request_body)
        model = request_payload.get("model", model)
    except (json.JSONDecodeError, TypeError):
        pass

    try:
        response_payload = json.loads(response_body)
        model = response_payload.get("model", model)
        usage = response_payload.get("usage") or {}
        prompt_tokens = int(usage.get("prompt_tokens", 0))
        completion_tokens = int(usage.get("completion_tokens", 0))
        total_tokens = int(usage.get("total_tokens", prompt_tokens + completion_tokens))
    except (json.JSONDecodeError, TypeError, ValueError):
        pass

    return CapturedTelemetry(
        model=model,
        provider=provider,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        status=status_code,
        latency_ms=latency_ms,
        prompt_preview=_extract_openai_prompt_preview(request_body),
        completion_preview=_extract_openai_completion_preview(response_body),
    )


def extract_gemini_telemetry(
    *,
    provider: str,
    request_body: bytes,
    response_body: bytes,
    status_code: int,
    latency_ms: int,
) -> CapturedTelemetry:
    """Extract usage from Gemini usageMetadata, with text-length fallback."""
    model = "unknown"
    prompt_tokens = 0
    completion_tokens = 0
    total_tokens = 0
    prompt_text = ""
    completion_text = ""

    try:
        request_payload = json.loads(request_body)
        model = request_payload.get("model", model)
        if model.startswith("models/"):
            model = model[len("models/") :]
        prompt_text = _openai_messages_text(request_payload.get("messages", []))
    except (json.JSONDecodeError, TypeError):
        pass

    try:
        response_payload = json.loads(response_body)
        usage = response_payload.get("usageMetadata") or {}
        prompt_tokens = int(usage.get("promptTokenCount", 0))
        completion_tokens = int(usage.get("candidatesTokenCount", 0))
        total_tokens = int(usage.get("totalTokenCount", 0))
        completion_text = _extract_gemini_completion_text(response_payload)
    except (json.JSONDecodeError, TypeError, ValueError):
        pass

    # Estimate when Gemini omits usage metadata.
    if prompt_tokens == 0 and prompt_text:
        prompt_tokens = estimate_tokens(prompt_text)
    if completion_tokens == 0 and completion_text:
        completion_tokens = estimate_tokens(completion_text)
    if total_tokens == 0:
        total_tokens = prompt_tokens + completion_tokens

    return CapturedTelemetry(
        model=model,
        provider=provider,
        prompt_tokens=prompt_tokens,
        completion_tokens=completion_tokens,
        total_tokens=total_tokens,
        status=status_code,
        latency_ms=latency_ms,
        prompt_preview=_truncate(prompt_text) if prompt_text else _extract_openai_prompt_preview(request_body),
        completion_preview=_extract_gemini_completion_preview(response_body),
    )


def extract_telemetry(
    *,
    provider: str,
    request_body: bytes,
    response_body: bytes,
    status_code: int,
    latency_ms: int,
) -> CapturedTelemetry:
    """Dispatch telemetry extraction based on application provider."""
    if normalize_provider(provider) == "google":
        return extract_gemini_telemetry(
            provider="google",
            request_body=request_body,
            response_body=response_body,
            status_code=status_code,
            latency_ms=latency_ms,
        )
    return extract_openai_telemetry(
        provider=normalize_provider(provider),
        request_body=request_body,
        response_body=response_body,
        status_code=status_code,
        latency_ms=latency_ms,
    )
