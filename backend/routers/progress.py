from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services import supabase_service as db
from models.schemas import CigaretteLog
from datetime import date, timedelta
from collections import defaultdict

router = APIRouter()

DAY_NAMES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']


class ExerciseLog(BaseModel):
    type: str = "הליכון"
    duration_mins: int
    pain_level: Optional[int] = None
    log_date: Optional[str] = None   # defaults to today


# ── Weekly summary ─────────────────────────────────────────────────────────────

@router.get("/weekly")
def weekly_progress():
    try:
        log_result = db.get_weekly_log()

        cig_result = db.get_client().table("cigarette_log") \
            .select("logged_at, count_today") \
            .gte("logged_at", str(date.today() - timedelta(days=6))) \
            .execute()

        ex_result = db.get_client().table("exercise_log") \
            .select("date, duration_mins") \
            .gte("date", str(date.today() - timedelta(days=6))) \
            .execute()

        # completed-blocks score per day
        completed_per_day: dict[str, int] = defaultdict(int)
        total_per_day: dict[str, int] = defaultdict(int)
        for row in log_result.data:
            d = str(row["date"])
            total_per_day[d] += 1
            if row.get("completed"):
                completed_per_day[d] += 1

        # latest cigarette count per day
        cigs: dict[str, int] = {}
        for row in cig_result.data:
            d = row["logged_at"][:10]
            cigs[d] = max(cigs.get(d, 0), row["count_today"])

        ex: dict[str, int] = defaultdict(int)
        for row in ex_result.data:
            ex[str(row["date"])] += row.get("duration_mins", 0)

        result = []
        for i in range(6, -1, -1):
            d = str(date.today() - timedelta(days=i))
            weekday = (date.today() - timedelta(days=i)).weekday()
            total = total_per_day.get(d, 0)
            done  = completed_per_day.get(d, 0)
            score = round((done / total) * 100) if total > 0 else 0
            result.append({
                "day":           DAY_NAMES[weekday],
                "date":          d,
                "score":         score,
                "cigarettes":    cigs.get(d, 0),
                "exercise_mins": ex.get(d, 0),
                "completed":     done,
                "total":         total,
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Today summary ──────────────────────────────────────────────────────────────

@router.get("/today")
def today_summary():
    try:
        today_str = str(date.today())

        log = db.get_log_for_date(today_str).data
        total     = len(log)
        completed = sum(1 for r in log if r.get("completed"))
        score     = round((completed / total) * 100) if total else 0

        cigs = db.get_cigarette_today()

        ex = db.get_client().table("exercise_log") \
            .select("duration_mins, type") \
            .eq("date", today_str) \
            .execute()
        exercise_mins = sum(r.get("duration_mins", 0) for r in ex.data)

        return {
            "date":          today_str,
            "score":         score,
            "completed":     completed,
            "total":         total,
            "cigarettes":    cigs,
            "exercise_mins": exercise_mins,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Cigarettes ─────────────────────────────────────────────────────────────────

@router.post("/cigarettes")
def log_cigarettes(body: CigaretteLog):
    try:
        db.log_cigarette(body.count_today)
        return {"count_today": body.count_today}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cigarettes/today")
def get_cigarettes_today():
    try:
        return {"count": db.get_cigarette_today()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Exercise ───────────────────────────────────────────────────────────────────

@router.post("/exercise")
def log_exercise(body: ExerciseLog):
    try:
        log_date = body.log_date or str(date.today())
        result = db.get_client().table("exercise_log").insert({
            "date":          log_date,
            "type":          body.type,
            "duration_mins": body.duration_mins,
            "pain_level":    body.pain_level,
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/exercise/today")
def get_exercise_today():
    try:
        today_str = str(date.today())
        result = db.get_client().table("exercise_log") \
            .select("*") \
            .eq("date", today_str) \
            .order("created_at", desc=True) \
            .execute()
        total_mins = sum(r.get("duration_mins", 0) for r in result.data)
        return {"entries": result.data, "total_mins": total_mins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
