"""
One-shot script to manually trigger a digest from existing Neon signals.
Run from project root: python3 scripts/generate_now.py
"""

import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.digest import Digest
from datetime import datetime, timezone

# NEW GEMINI SDK
from google import genai

# init client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODEL_NAME = "gemini-2.5-flash"

db = SessionLocal()

rows = db.execute(text(
   "SELECT project, signal_type, priority_score, reason FROM signals ORDER BY priority_score DESC, created_at DESC LIMIT 8"
)).fetchall()

print(f"Found {len(rows)} signals. Sending to Gemini...")

decisions, risks, progress, deadlines = [], [], [], []

for project, stype, score, reason in rows:
    entry = f"{reason} ({project})"

    if stype == "decision_required":
        decisions.append(entry)

    elif stype in ("client_risk", "blocker", "risk"):
        risks.append(entry)

    elif stype == "progress":
        progress.append(entry)

    elif stype == "deadline_risk":
        deadlines.append(entry)

def fmt(label, items):
    if not items:
        return ""
    return f"{label}:\n" + "\n".join(f"- {i}" for i in items)

signal_context = "\n\n".join(filter(None, [
    fmt("Decisions Required", decisions),
    fmt("Risks Detected", risks),
    fmt("Upcoming Deadlines", deadlines),
    fmt("Progress Updates", progress),
])) or "No active signals."

prompt = f"""You are an operational intelligence engine for startup founders and project managers.

Convert the structured signals below into a concise executive digest.

STRICT RULES:
- Professional, executive tone.
- Every point must reference a specific project.
- Do NOT use vague statements.
- Each insight: 1-2 sentences max.
- Actions must be immediately actionable.

Output ONLY valid JSON:
{{
  "summary": "2-3 sentence overall operational status.",
  "decisions": ["decision insight 1"],
  "risks": ["risk insight 1"],
  "progress": ["progress insight 1"],
  "actions": "Bullet list of 3-5 recommended actions.",
  "health_explanations": {{
    "Project Atlas": "1 sentence.",
    "Project Nova": "1 sentence.",
    "Project Orion": "1 sentence.",
    "Project Vertex": "1 sentence."
  }},
  "changes_summary": "1-2 sentence summary."
}}

--- SIGNALS ---
{signal_context}
--- END ---

Respond ONLY with JSON. No markdown fences.
"""

# call Gemini
response = client.models.generate_content(
    model=MODEL_NAME,
    contents=prompt
)

raw = response.text.strip()

# safety cleanup if model returns ```json ```
if raw.startswith("```"):
    raw = "\n".join(
        line for line in raw.split("\n")
        if not line.strip().startswith("```")
    ).strip()

parsed = json.loads(raw)

print("\n✅ Gemini responded:\n")
print(json.dumps(parsed, indent=2))

digest = Digest(
    summary=parsed.get("summary", ""),
    actions=parsed.get("actions", ""),
    health_report=parsed.get("health_explanations", {}),

    changes_summary=json.dumps({
        "decisions": parsed.get("decisions", []),
        "risks": parsed.get("risks", []),
        "progress": parsed.get("progress", [])
    }),

    risk_count=len(parsed.get("risks", [])),
    decision_count=len(parsed.get("decisions", [])),
    progress_count=len(parsed.get("progress", [])),

    interval_label="30 minutes",
    created_at=datetime.now(timezone.utc),
)

db.add(digest)
db.commit()
db.refresh(digest)

print(f"\n✅ Digest saved to Neon with ID: {digest.id}")

db.close()