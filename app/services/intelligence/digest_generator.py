import json
import logging
import os
from groq import Groq
from dotenv import load_dotenv

from app.db.session import SessionLocal
from app.models.signal import Signal
from app.models.project_health import ProjectHealth

load_dotenv()

logger = logging.getLogger("operis.digest")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_recent_signals(limit: int = 40):
    db = SessionLocal()
    try:
        rows = (
            db.query(Signal)
            .order_by(Signal.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "project":     r.project_name or r.project or "Unknown",
                "type":        r.signal_type or "unknown",
                "description": r.reason or "",
                "priority":    r.priority_score or 0,
                "time":        str(r.created_at)
            }
            for r in rows
        ]
    finally:
        db.close()


def get_recent_health():
    db = SessionLocal()
    try:
        rows = (
            db.query(ProjectHealth)
            .order_by(ProjectHealth.created_at.desc())
            .all()
        )
        return [
            {
                "project": r.project,
                "status":  r.status,
                "summary": r.reason or r.status
            }
            for r in rows
        ]
    finally:
        db.close()


def build_prompt(signals: list, health: list) -> str:
    signals_text = "\n".join([
        f"- [{s['type'].upper()}] {s['project']}: {s['description']} (priority={s['priority']})"
        for s in signals
    ]) or "No signals yet."

    health_text = "\n".join([
        f"- {h['project']}: {h['status']} — {h['summary']}"
        for h in health
    ]) or "No health data yet."

    return f"""
You are the AI chief of staff for a portfolio of high-stakes software projects.
Your audience is founders and CEOs of fast-moving companies — some technical, some not.
They scan, not read. They need the right call in under 60 seconds.

Your job: transform raw project signals into a tight, prioritized, decision-ready executive briefing.

CURRENT PROJECT HEALTH:
{health_text}

RAW SIGNALS (last 30 minutes):
{signals_text}

STRICT OUTPUT RULES:

1. DECISIONS — sort by priority: CRITICAL first, then HIGH, then MEDIUM.
   Assign each a priority level:
   - CRITICAL: client trust at risk, active blocker, deadline in under 24 hours, scope change after freeze
   - HIGH: sprint blocked, sign-off pending, delivery estimate unconfirmed, approval required
   - MEDIUM: prep work pending, internal review, upcoming milestone prep
   If same project has 2+ decisions of same type → merge into ONE with combined description.
   Fields:
   - priority: CRITICAL, HIGH, or MEDIUM — always include this
   - title: project + specific situation anchor
     GOOD: "Project Nova — delivery date unconfirmed after 3 follow-ups"
     BAD:  "Project Nova — action required"
   - description: one sentence. Active voice. Who, what, when.
     GOOD: "Client followed up three times today with no confirmed delivery date sent."
   - impact: consequence of inaction. Include time magnitude where possible.
     GOOD: "Client trust eroding — delivery may slip 3–5 days without confirmation."
     GOOD: "Sprint start delayed — team of 3 blocked until client approves feature list."
     GOOD: "Release blocked — legal review outstanding for 3 days, deadline tomorrow."
     BAD:  "May impact timelines." ← no magnitude, too vague
     BAD:  "Vendor contract stalled." ← restates problem, not consequence
     RULE: always try to include a time estimate or team size affected if inferable from signals.
   - action: exact tradeoff. Name BOTH options explicitly.
     GOOD: "Send confirmed date today or formally push milestone to next sprint."
     GOOD: "Approve 3 additional endpoints now or reject and hold current scope."
     BAD:  "Review and decide."
     RULE: action must NEVER repeat the impact line.
     RULE: impact must be specific to THIS project's situation.
     Never reuse impact phrasing from another project's decision in the same digest.

2. RISKS — active blockers only. Sort by severity.
   - title: project + what is specifically blocked
   - description: what broke, how long it has been blocked
   - impact: what stops next — include magnitude if possible
     GOOD: "Integration halted — payment API down, delivery may slip 2–3 days."
     GOOD: "Feature development stalled for 2 days — milestone at risk."
   - action: must directly solve the specific blocker in the title
     GOOD: "Investigate API logs or contact Stripe support today."
     BAD:  "Confirm delivery estimate." ← unrelated

3. PROJECT HEALTH — one entry per project. Assess based on signals this cycle:
   - Critical: active blocker + client pressure simultaneously
   - At Risk: unresolved decision OR escalating client pressure
   - Watch: upcoming deadline OR pending approval
   - Healthy: no blockers, no escalations, normal delivery cadence
   Fields: project, status (Healthy/Watch/At Risk/Critical), reason (1 short line)
   GOOD: {{"project": "Nova", "status": "At Risk", "reason": "Integration blocked + client follow-ups unanswered"}}
   GOOD: {{"project": "Orion", "status": "Watch", "reason": "Milestone review in 24 hours"}}
   GOOD: {{"project": "Atlas", "status": "Healthy", "reason": "Backend stable, no active blockers"}}

4. CHANGES — 3 to 5 items. Use correct type labels only:
   - new → appeared for first time
   - resolved → completed or fixed
   - progress → milestone hit, work moving forward
   - escalated → urgency increased or situation worsened
   - dependency → blocked waiting on external party
   NEVER use dependency for completed work. Completed work = progress or resolved.
   Ticker style — short, factual.
   GOOD: "Payment API returning 500 errors — Nova integration blocked."
   GOOD: "Data pipeline optimisation complete — Orion query time down 40%."
   BAD:  "Project Nova's blocker was detected due to third-party API issues."

5. SUMMARY — max 2 tight sentences. Name projects and specific tensions.
   GOOD: "Integration blocker and scope change creating critical pressure on Nova. Atlas and Vertex approvals pending ahead of back-to-back client deadlines."
   BAD:  "Multiple projects experiencing tensions."

6. STABLE SUMMARY — only list projects with ZERO decisions and ZERO risks this cycle.
   Never list a project as stable if it appears in decisions or risks above.
   Include specific reason why each is stable.
   GOOD: "Orion data pipeline optimised and on track — no blockers."
   If no projects are stable, state why briefly — name the active pressures.
GOOD: "All four projects carry active decisions or blockers this cycle."
BAD:  "No projects are currently stable."

7. DEDUPLICATION — if two signals share the same project AND produce the same decision action → merge into ONE card at the higher priority level.
   The merged title must reference both triggers.
   GOOD: "Project Nova — delivery unconfirmed + 3 client follow-ups (CRITICAL)"
   BAD: Two separate Nova cards with identical impact and action.

8. TONE — direct, confident, executive.
   Never use: "it appears", "it is recommended", "may potentially", "it was detected", "please note".

Respond ONLY with valid JSON. No markdown. No code fences. No text outside JSON.
{{
  "summary": "...",
  "decision_count": <int>,
  "risk_count": <int>,
  "decisions": [
    {{"title": "...", "description": "...", "impact": "...", "action": "...", "priority": "CRITICAL|HIGH|MEDIUM"}}
  ],
  "risks": [
    {{"title": "...", "description": "...", "impact": "...", "action": "..."}}
  ],
  "project_health": [
    {{"project": "...", "status": "Healthy|Watch|At Risk|Critical", "reason": "..."}}
  ],
  "changes": [
    {{"type": "new|resolved|progress|escalated|dependency", "description": "..."}}
  ],
  "stable_projects": ["ProjectName"],
  "stable_summary": "..."
}}
"""

def call_llm(prompt: str) -> dict:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return json.loads(raw)


def _fallback_digest() -> dict:
    return {
        "summary": "Digest generation encountered an issue. Raw signals are being collected.",
        "decision_count": 0,
        "risk_count": 0,
        "decisions": [],
        "risks": [],
        "changes": [],
        "stable_projects": [],
        "stable_summary": "Monitoring active — stability data loading."
    }


def generate_full_digest() -> dict:
    try:
        signals = get_recent_signals(40)
        health = get_recent_health()

        if not signals:
            logger.info("No signals yet — returning fallback digest")
            return _fallback_digest()

        prompt = build_prompt(signals, health)
        result = call_llm(prompt)
        logger.info(
            f"DIGEST generated: {result.get('decision_count', 0)} decisions, "
            f"{result.get('risk_count', 0)} risks"
        )
        return result

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed: {e}")
        return _fallback_digest()
    except Exception as e:
        logger.error(f"Digest generation failed: {e}")
        raise