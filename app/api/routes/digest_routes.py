"""
digest_routes.py
GET /digest/latest  — accepts optional ?sample_id= query param
GET /digest/list    — recent digests with metadata
All data is parsed from the `content` JSON column.
"""

import json
import logging
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.digest import Digest

logger = logging.getLogger("operis.digest_routes")
router = APIRouter(prefix="/digest", tags=["Digest"])


def _parse_digest(digest: Digest) -> dict:
    """Parse a Digest row into a clean dict. Never raises — always returns something."""
    if digest is None:
        return {
            "status": "pending",
            "summary": "System initializing. First digest will be ready shortly.",
            "decisions": [],
            "risks": [],
            "changes": [],
            "project_health": [],
            "stable_summary": "",
            "suppressed_note": "",
            "sample_id": None,
            "digest_id": None,
            "created_at": None,
        }

    if not digest.content:
        return {
            "status": "empty",
            "summary": "Digest record exists but has no content yet.",
            "decisions": [],
            "risks": [],
            "changes": [],
            "project_health": [],
            "stable_summary": "",
            "suppressed_note": "",
            "sample_id": digest.sample_id,
            "digest_id": digest.id,
            "created_at": digest.created_at.isoformat() if digest.created_at else None,
        }

    try:
        data = json.loads(digest.content)
        # Ensure all expected keys exist with safe defaults
        data.setdefault("decisions", [])
        data.setdefault("risks", [])
        data.setdefault("changes", [])
        data.setdefault("project_health", [])
        data.setdefault("stable_summary", "")
        data.setdefault("suppressed_note", "")
        data.setdefault("summary", "")
        # Attach metadata
        data["digest_id"]  = digest.id
        data["created_at"] = digest.created_at.isoformat() if digest.created_at else None
        data["sample_id"]  = digest.sample_id
        return data
    except Exception as e:
        logger.error(f"Digest parse error for id={digest.id}: {e}")
        safe_raw = (digest.content or "")[:500]
        return {
            "error": "Digest format error",
            "raw": safe_raw,
            "digest_id": digest.id,
            "sample_id": digest.sample_id,
        }


@router.get("/latest")
def get_latest_digest(
    sample_id: str | None = Query(default=None, description="Optional dataset sample_id"),
    db: Session = Depends(get_db),
):
    """
    Returns the latest digest, optionally filtered by sample_id.
    Frontend passes ?sample_id=sample_03 to get the digest for that dataset.
    Falls back to globally latest if that sample hasn't been processed yet.
    """
    try:
        query = db.query(Digest).order_by(Digest.created_at.desc())

        if sample_id:
            filtered = query.filter(Digest.sample_id == sample_id).first()
            if filtered:
                return _parse_digest(filtered)
            logger.warning(f"No digest for sample_id={sample_id}, returning latest")

        latest = query.first()
        return _parse_digest(latest)  # handles None safely

    except Exception as e:
        logger.error(f"get_latest_digest error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Digest query failed: {str(e)}")


@router.get("/list")
def list_digests(
    limit: int = Query(default=10, le=50),
    db: Session = Depends(get_db),
):
    """Returns recent digests with metadata. Useful for evaluation."""
    try:
        digests = (
            db.query(Digest)
            .order_by(Digest.created_at.desc())
            .limit(limit)
            .all()
        )
        result = []
        for d in digests:
            preview = ""
            if d.content:
                try:
                    preview = json.loads(d.content).get("summary", "")[:120]
                except Exception:
                    preview = d.content[:120]
            result.append({
                "id":         d.id,
                "sample_id":  d.sample_id,
                "created_at": d.created_at.isoformat() if d.created_at else None,
                "preview":    preview,
            })
        return result
    except Exception as e:
        logger.error(f"list_digests error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Digest list failed: {str(e)}")