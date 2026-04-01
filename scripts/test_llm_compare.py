"""
Run: python scripts/test_llm_compare.py
Compares Groq vs Gemini digest output quality side by side.
"""

import os, json, time
from dotenv import load_dotenv
load_dotenv()

SAMPLE_SIGNALS = [
    {"project": "Nova",   "type": "client_followup", "description": "Client sent follow-up #3. No response for 8h.", "priority": 9},
    {"project": "Nova",   "type": "blocker",          "description": "Payment gateway unresolved. Blocking 4 engineers day 3.", "priority": 10},
    {"project": "Vertex", "type": "deadline_risk",    "description": "Demo in 18h. Sprint 72% complete. Sign-off pending.", "priority": 8},
    {"project": "Atlas",  "type": "approval_pending", "description": "Legal review pending 4 days. Deadline in 5 days.", "priority": 7},
    {"project": "Orion",  "type": "progress_update",  "description": "6 tasks merged. 9 commits. Pipeline green.", "priority": 3},
]

SAMPLE_HEALTH = [
    {"project": "Nova",   "status": "Critical", "summary": "Blocker + client pressure"},
    {"project": "Vertex", "status": "At Risk",  "summary": "Demo pressure + sign-off pending"},
    {"project": "Atlas",  "status": "Watch",    "summary": "Approval pending"},
    {"project": "Orion",  "status": "Healthy",  "summary": "Normal delivery cadence"},
]

PROMPT_TEMPLATE = """
You are the AI chief of staff for a portfolio of high-stakes software projects.
Your audience is founders and CEOs. They scan, not read.

HEALTH:
{health}

SIGNALS:
{signals}

Return ONLY valid JSON:
{{
  "summary": "2 tight sentences naming projects and tensions",
  "decision_count": <int>,
  "risk_count": <int>,
  "decisions": [{{"title":"...","description":"...","impact":"...","action":"...","priority":"CRITICAL|HIGH|MEDIUM"}}],
  "risks": [{{"title":"...","description":"...","impact":"...","action":"..."}}],
  "project_health": [{{"project":"...","status":"Healthy|Watch|At Risk|Critical","reason":"..."}}],
  "changes": [{{"type":"new|resolved|escalated|progress","description":"..."}}],
  "stable_summary": "..."
}}
"""

def build_prompt():
    signals_text = "\n".join([f"- [{s['type'].upper()}] {s['project']}: {s['description']} (priority={s['priority']})" for s in SAMPLE_SIGNALS])
    health_text  = "\n".join([f"- {h['project']}: {h['status']} — {h['summary']}" for h in SAMPLE_HEALTH])
    return PROMPT_TEMPLATE.format(signals=signals_text, health=health_text)


# ── GROQ ──────────────────────────────────────────────────────────
def test_groq():
    try:
        from groq import Groq
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        prompt = build_prompt()
        t0 = time.time()
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        elapsed = time.time() - t0
        raw = resp.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"): raw = raw[4:]
        result = json.loads(raw.strip())
        return result, elapsed, None
    except Exception as e:
        return None, 0, str(e)


# ── GEMINI ────────────────────────────────────────────────────────
def test_gemini():
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"))
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = build_prompt()
        t0 = time.time()
        resp = model.generate_content(prompt)
        elapsed = time.time() - t0
        raw = resp.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"): raw = raw[4:]
        result = json.loads(raw.strip())
        return result, elapsed, None
    except Exception as e:
        return None, 0, str(e)


# ── COMPARE ───────────────────────────────────────────────────────
def print_result(name, result, elapsed, error):
    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")
    if error:
        print(f"  ❌ ERROR: {error}")
        return
    print(f"  ⏱  Time     : {elapsed:.2f}s")
    print(f"  📋 Summary  : {result.get('summary','')}")
    print(f"  🔴 Decisions: {result.get('decision_count',0)}")
    print(f"  ⚠️  Risks    : {result.get('risk_count',0)}")
    print(f"\n  Decisions:")
    for d in result.get("decisions", []):
        print(f"    [{d.get('priority','?')}] {d.get('title','')}")
        print(f"           → {d.get('action','')}")
    print(f"\n  Risks:")
    for r in result.get("risks", []):
        print(f"    • {r.get('title','')}")
    print(f"\n  Health:")
    for h in result.get("project_health", []):
        print(f"    {h.get('project','')}: {h.get('status','')} — {h.get('reason','')}")
    print(f"\n  Stable: {result.get('stable_summary','')}")


if __name__ == "__main__":
    print("\n🔬 Testing Groq (llama-3.3-70b-versatile)...")
    g_result, g_time, g_err = test_groq()

    print("🔬 Testing Gemini (gemini-1.5-flash)...")
    m_result, m_time, m_err = test_gemini()

    print_result("GROQ  — llama-3.3-70b-versatile", g_result, g_time, g_err)
    print_result("GEMINI — gemini-1.5-flash",        m_result, m_time, m_err)

    print(f"\n{'='*60}")
    print("  WINNER ASSESSMENT")
    print(f"{'='*60}")
    if g_err and m_err:
        print("  Both failed — check API keys in .env")
    elif g_err:
        print("  ✅ Use GEMINI — Groq key missing or failed")
    elif m_err:
        print("  ✅ Use GROQ — Gemini key missing or failed")
    else:
        print(f"  Groq  speed : {g_time:.2f}s")
        print(f"  Gemini speed: {m_time:.2f}s")
        faster = "Groq" if g_time < m_time else "Gemini"
        print(f"  ⚡ {faster} was faster")
        print(f"  👁  Compare decision quality above and pick manually")