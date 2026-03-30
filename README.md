# Operis — Operational Intelligence System

Cross-Tool Signal Detection, Risk Monitoring, and Action Recommendation for Founders.

## Quick Start

```bash
# 1. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — add GEMINI_API_KEY and DATABASE_URL

# 4. Start backend (Terminal 1)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. Start dashboard (Terminal 2)
streamlit run frontend/streamlit_app.py
```

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (`gemini-1.5-flash-latest`) |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `ENV` | `production` |

## Architecture
Event Generator (10–15s)
↓
Signal Detector — rule-based keyword classification
↓
Priority Calculator — deterministic scoring 1–10
↓
Health Engine — per-project score calculation
↓
Change Detector — delta from previous digest
↓
Gemini LLM — digest summary, actions, health text, change summary
↓
PostgreSQL — persisted digests, signals, health, cycles
↓
Streamlit Dashboard — auto-refreshes every 5 seconds

text

## Interval Window Logic

User-selected interval = **analysis time window only**.
Scheduler always runs every 30–45 seconds regardless of selected interval.

| Selected | Meaning |
|---|---|
| 30 minutes | Analyze signals from last 30 min |
| 4 hours | Analyze signals from last 4 hours |

## Deployment

- **Backend:** Render (set env vars in dashboard)
- **Database:** Neon PostgreSQL
- **Frontend:** Streamlit Cloud or same Render instance
