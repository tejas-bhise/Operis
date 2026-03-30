"""
System-wide constants for Operis.
Single source of truth for projects, event types, signal types,
priority scores, health thresholds, and rule-based keyword lists.
Never hardcode these values in any other module.
"""

# ─── Projects ──────────────────────────────────────────────────────────────────
PROJECTS = ["Project Atlas", "Project Nova", "Project Orion", "Project Vertex"]

# ─── Sources (simulated tool integrations) ────────────────────────────────────
SOURCES = ["slack", "gmail", "jira", "calendar", "github"]

# ─── Event Types ───────────────────────────────────────────────────────────────
EVENT_TYPES = [
    "task_completed",
    "milestone_completed",
    "client_followup",
    "approval_required",
    "deadline_approaching",
    "blocker_detected",
]

# Weighted distribution — progress events more frequent, blockers rare
EVENT_TYPE_WEIGHTS = [28, 16, 18, 16, 12, 10]

# ─── Signal Types ──────────────────────────────────────────────────────────────
SIGNAL_TYPES = ["progress", "risk", "decision_required", "deadline_risk", "blocker", "stable"]

# ─── Priority Scores (1 = low, 10 = critical) ─────────────────────────────────
PRIORITY_SCORES = {
    "blocker": 9,
    "risk": 8,
    "decision_required": 7,
    "deadline_risk": 6,
    "progress": 2,
    "stable": 1,
}

# ─── Health Score Config ───────────────────────────────────────────────────────
HEALTH_BASELINE = 85.0
HEALTH_PENALTIES = {
    "blocker": -15,
    "risk": -10,
    "decision_required": -8,
    "deadline_risk": -12,
}
HEALTH_BONUS = {
    "progress": 5,
}
HEALTH_HEALTHY_MIN = 80
HEALTH_WARNING_MIN = 60

HEALTH_STATUS_HEALTHY = "Healthy"
HEALTH_STATUS_WARNING = "Warning"
HEALTH_STATUS_AT_RISK = "At Risk"

# ─── Interval Options (label → minutes) ───────────────────────────────────────
INTERVAL_OPTIONS = {
    "30 minutes": 30,
    "1 hour": 60,
    "2 hours": 120,
    "3 hours": 180,
    "4 hours": 240,
}

# ─── Signal Detection Keywords (rule-based — do NOT move to LLM) ──────────────
BLOCKER_KEYWORDS = [
    "blocked", "blocker", "dependency issue", "integration error",
    "delay", "failed", "failure", "outage", "merge conflict",
    "authentication failure", "timeout",
]

DECISION_KEYWORDS = [
    "approval", "confirm", "sign off", "review required",
    "waiting confirmation", "pending approval", "authorization",
    "needs sign-off", "awaiting confirmation",
]

DEADLINE_KEYWORDS = [
    "deadline", "due", "scheduled", "24 hours", "tomorrow",
    "approaching", "overdue", "end of day", "eod", "by morning",
]

RISK_KEYWORDS = [
    "update", "status", "eta", "timeline", "follow up",
    "follow-up", "waiting", "no response", "escalat", "still waiting",
    "requesting clarification", "pending response",
]

PROGRESS_KEYWORDS = [
    "completed", "merged", "deployed", "closed", "finished",
    "done", "delivered", "released", "launched", "signed off",
    "handed off", "resolved",
]