"""
digest_generator.py
UPDATED: LLM receives structured signal context only (no raw events).
Produces decision objects with reason_trace, confidence_score, time_horizon.
LLM role: REASONING ONLY. Detection, scoring, suppression done upstream.
"""

import os
import json
import logging
import time

from groq import Groq
from sqlalchemy.orm import Session

from app.models.signal import Signal
from app.models.project_health import ProjectHealth

logger = logging.getLogger("operis.digest_generator")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ── BUILD STRUCTURED LLM CONTEXT ─────────────────────────────────────────────

def _build_llm_context(
    signals: list[Signal],
    health_records: list[ProjectHealth],
    changes: list[dict],
    suppressed_count: int,
) -> dict:
    """
    Assembles structured context for LLM.
    LLM receives signals, health, changes — NOT raw event text.
    """
    return {
        "signals": [
            {
                "project":          s.project,
                "type":             s.signal_type,
                "priority_score":   s.priority_score,
                "impact_area":      s.impact_area or "delivery",
                "urgency_level":    s.urgency_level or "medium",
                "confidence_score": s.confidence_score or 0.6,
                "reason":           s.reason[:200],   # truncate to save tokens
            }
            for s in signals
        ],
        "project_health": [
            {
                "project":       h.project,
                "health_status": h.status,
            }
            for h in health_records
        ],
        "changes_since_last_cycle": changes,
        "suppressed_signal_count":  suppressed_count,
    }


# ── PROMPT ───────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an AI Chief of Staff for a founder running multiple software projects.
You receive pre-processed signal intelligence. Your job is REASONING only — not detection or scoring.
Signals are already filtered. Produce a structured executive digest.

DEFINITIONS:
- Signal = structured observation (already provided to you)
- Decision = actionable insight you derive from combining multiple signals
These are NOT the same thing. Never confuse them.

DECISION TYPES you may use:
client_response_required | delivery_replan | scope_alignment |
risk_mitigation | relationship_recovery | approval_escalation | revenue_protection

IMPACT AREAS: delivery | revenue | relationship | execution

TIME HORIZONS: now | today | this_week | later

URGENCY LEVELS: low | medium | high | critical

OUTPUT FORMAT — respond with valid JSON only, no markdown, no explanation outside JSON:
{
  "summary": "2-3 sentence executive brief. Specific. Actionable. No fluff.",
  "decisions": [
    {
      "project": "string",
      "decision_type": "string",
      "priority_score": 0.0,
      "impact_area": "string",
      "urgency_level": "string",
      "time_horizon": "string",
      "recommended_action": "specific action the founder should take",
      "reason_trace": ["signal 1 observation", "signal 2 observation", "pattern noted"],
      "confidence_score": 0.0,
      "related_signal_types": ["blocker", "client_followup"]
    }
  ],
  "risks": [
    {
      "project": "string",
      "title": "string",
      "description": "string",
      "impact": "string",
      "mitigation": "string"
    }
  ],
  "project_health": [
    {
      "project": "string",
      "status": "Healthy|Watch|At Risk|Critical",
      "reason": "string"
    }
  ],
  "stable_summary": "One sentence about what is running well.",
  "suppressed_note": "string e.g. '14 low-impact signals suppressed this cycle.'"
}

REASONING RULES:
1. Only produce decisions when 2+ signals converge on the same project/pattern.
2. Single low-confidence signals become risks, not decisions.
3. reason_trace must list actual signal observations, not generic statements.
4. confidence_score reflects signal agreement: multiple signals agreeing = higher confidence.
5. time_horizon 'now' = within 2 hours. 'today' = before EOD. 'this_week' = within 5 days. 'later' = no urgency.
6. Do NOT hallucinate signals or events not in the input.
7. Keep summary under 60 words. Specific project names and numbers where available."""


def generate_digest(
    db: Session,
    signals: list[Signal],
    health_records: list[ProjectHealth],
    changes: list[dict],
    suppressed_count: int = 0,
    sample_id: str | None = None,
) -> dict:
    """
    Calls LLM with structured context. Returns parsed digest dict.
    LLM is only called here — never in event/signal pipeline.
    """
    if not signals:
        logger.warning("No signals to digest — returning empty digest")
        return _empty_digest(suppressed_count)

    context = _build_llm_context(signals, health_records, changes, suppressed_count)
    context_str = json.dumps(context, indent=2)

    prompt = f"""Analyze the following operational intelligence and produce the executive digest JSON.

CONTEXT:
{context_str}

Respond with the JSON digest only."""

    logger.info(f"Calling LLM | signals={len(signals)} | suppressed={suppressed_count} | sample={sample_id}")
    start = time.time()

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system",  "content": SYSTEM_PROMPT},
                {"role": "user",    "content": prompt},
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        elapsed = round(time.time() - start, 2)
        raw = response.choices[0].message.content.strip()
        logger.info(f"LLM response in {elapsed}s")

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)

        # Inject suppressed note if LLM didn't include it
        if not parsed.get("suppressed_note") and suppressed_count > 0:
            parsed["suppressed_note"] = f"{suppressed_count} low-impact signals suppressed this cycle."

        return parsed

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error: {e} | raw: {raw[:300]}")
        return _empty_digest(suppressed_count, error=str(e))
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        return _empty_digest(suppressed_count, error=str(e))


def _empty_digest(suppressed_count: int, error: str = "") -> dict:
    return {
        "summary": "No signals detected this cycle. System is monitoring.",
        "decisions": [],
        "risks": [],
        "project_health": [],
        "stable_summary": "All projects appear stable. No immediate actions required.",
        "suppressed_note": f"{suppressed_count} signals suppressed." if suppressed_count else "",
        "error": error,
    }