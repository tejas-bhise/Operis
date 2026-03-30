"""
Demo event generator for Operis.
Produces realistic human-text events simulating Slack, Gmail, Jira, Calendar, GitHub activity.
Hardcodes realistic EVENTS only — intelligence is never hardcoded.
"""

import random
from datetime import datetime, timezone

DEMO_EVENTS = [
    # client_followup
    {"project": "Project Nova",   "source": "slack",  "event_type": "client_followup",      "raw_text": "Client followed up three times today — no confirmed delivery date sent yet."},
    {"project": "Project Atlas",  "source": "email",  "event_type": "client_followup",      "raw_text": "Client email: 'Following up on ETA — can you confirm when we can expect the build?'"},
    {"project": "Project Vertex", "source": "slack",  "event_type": "client_followup",      "raw_text": "Client asking for sign-off confirmation before next sprint begins."},
    {"project": "Project Orion",  "source": "email",  "event_type": "client_followup",      "raw_text": "Client requesting status update before sprint planning tomorrow."},

    # scope_change
    {"project": "Project Nova",   "source": "email",  "event_type": "scope_change",         "raw_text": "Client requested 3 additional API endpoints after scope was frozen last week."},
    {"project": "Project Atlas",  "source": "slack",  "event_type": "scope_change",         "raw_text": "Budget change request submitted — vendor contract update requires founder confirmation."},
    {"project": "Project Vertex", "source": "jira",   "event_type": "scope_change",         "raw_text": "Scope expanded to include mobile-responsive redesign — timeline not yet adjusted."},

    # deadline_approaching
    {"project": "Project Atlas",  "source": "jira",   "event_type": "deadline_approaching", "raw_text": "Client presentation deadline tomorrow — final delivery and legal review still pending."},
    {"project": "Project Vertex", "source": "slack",  "event_type": "deadline_approaching", "raw_text": "Client demo scheduled tomorrow 4 PM — pre-demo environment not yet validated."},
    {"project": "Project Nova",   "source": "jira",   "event_type": "deadline_approaching", "raw_text": "Sprint ends in 48 hours — 3 tickets still open with no assignee."},
    {"project": "Project Orion",  "source": "jira",   "event_type": "deadline_approaching", "raw_text": "Milestone review with stakeholders in 24 hours — progress report not yet drafted."},

    # blocker
    {"project": "Project Nova",   "source": "slack",  "event_type": "blocker_detected",     "raw_text": "Payment API returning 500 errors — integration halted, no ETA from vendor."},
    {"project": "Project Orion",  "source": "jira",   "event_type": "blocker_detected",     "raw_text": "External data provider delayed — feature implementation stalled for 2 days."},
    {"project": "Project Atlas",  "source": "slack",  "event_type": "blocker_detected",     "raw_text": "Legal review blocking release — approval request sent 3 days ago, no response."},
    {"project": "Project Vertex", "source": "jira",   "event_type": "blocker_detected",     "raw_text": "Frontend blocked on design assets — handoff from design team overdue by 2 days."},

    # approval_required
    {"project": "Project Atlas",  "source": "email",  "event_type": "approval_required",    "raw_text": "Revised delivery estimate needs founder sign-off before sharing with client."},
    {"project": "Project Vertex", "source": "slack",  "event_type": "approval_required",    "raw_text": "Final feature list requires client approval before development begins next sprint."},
    {"project": "Project Nova",   "source": "email",  "event_type": "approval_required",    "raw_text": "Architecture decision pending — team waiting on technical lead approval to proceed."},
    {"project": "Project Orion",  "source": "jira",   "event_type": "approval_required",    "raw_text": "Revised project scope awaiting manager sign-off — team planning blocked."},

    # task_completed
    {"project": "Project Vertex", "source": "jira",   "event_type": "task_completed",       "raw_text": "Notification service merged and ready for integration testing."},
    {"project": "Project Atlas",  "source": "jira",   "event_type": "task_completed",       "raw_text": "Backend API deployed to staging — smoke tests passed."},
    {"project": "Project Nova",   "source": "jira",   "event_type": "task_completed",       "raw_text": "Auth module refactor complete — ready for QA review."},
    {"project": "Project Orion",  "source": "jira",   "event_type": "task_completed",       "raw_text": "Data pipeline optimisation complete — query time reduced by 40%."},

    # milestone_completed
    {"project": "Project Orion",  "source": "jira",   "event_type": "milestone_completed",  "raw_text": "All critical bugs resolved — build ready for staging deployment."},
    {"project": "Project Atlas",  "source": "jira",   "event_type": "milestone_completed",  "raw_text": "Security audit complete — all vulnerabilities resolved and signed off."},
    {"project": "Project Nova",   "source": "jira",   "event_type": "milestone_completed",  "raw_text": "MVP feature set complete — stakeholder demo scheduled for end of week."},
    {"project": "Project Vertex", "source": "jira",   "event_type": "milestone_completed",  "raw_text": "Design system handoff complete — frontend development can begin."},
]

EVENT_WEIGHTS = {
    "task_completed":       30,
    "milestone_completed":  15,
    "client_followup":      20,
    "approval_required":    15,
    "deadline_approaching": 12,
    "blocker_detected":      8,
}


def generate_event() -> dict:
    weighted_pool = []
    for event in DEMO_EVENTS:
        weight = EVENT_WEIGHTS.get(event["event_type"], 10)
        weighted_pool.extend([event] * weight)

    template = random.choice(weighted_pool)

    return {
        "source":     template["source"],
        "project":    template["project"],
        "event_type": template["event_type"],
        "raw_text":   template["raw_text"],      # ← exact DB column
        "created_at": datetime.now(timezone.utc),
    }