import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_ANON_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")
        _client = create_client(url, key)
    return _client


# ── schedule ──────────────────────────────────────────────────────────────────

def get_schedule():
    return get_client().table("daily_schedule") \
        .select("*") \
        .eq("is_active", True) \
        .order("offset_mins") \
        .execute()


# ── daily log ─────────────────────────────────────────────────────────────────

def upsert_log(block_id: str, date: str, completed: bool, score: int | None = None):
    return get_client().table("daily_log").upsert(
        {"block_id": block_id, "date": date, "completed": completed, "score": score},
        on_conflict="date,block_id",
    ).execute()


def get_log_for_date(date: str):
    return get_client().table("daily_log") \
        .select("*, daily_schedule(block_name, icon, offset_mins, duration_mins, category, color)") \
        .eq("date", date) \
        .execute()


def get_weekly_log():
    from datetime import date, timedelta
    today = date.today()
    week_ago = today - timedelta(days=6)
    return get_client().table("daily_log") \
        .select("date, completed, score") \
        .gte("date", str(week_ago)) \
        .lte("date", str(today)) \
        .execute()


# ── tasks ─────────────────────────────────────────────────────────────────────

def get_tasks():
    return get_client().table("tasks").select("*").order("created_at", desc=True).execute()


def create_task(title: str, due_date: str | None, due_time: str | None, recurrence: str):
    return get_client().table("tasks").insert({
        "title": title, "due_date": due_date, "due_time": due_time, "recurrence": recurrence,
    }).execute()


def toggle_task(task_id: str, completed: bool):
    return get_client().table("tasks").update({"completed": completed}).eq("id", task_id).execute()


def delete_task(task_id: str):
    return get_client().table("tasks").delete().eq("id", task_id).execute()


# ── cigarette log ──────────────────────────────────────────────────────────────

def log_cigarette(count_today: int):
    return get_client().table("cigarette_log").insert({"count_today": count_today}).execute()


def get_cigarette_today():
    from datetime import date
    today = str(date.today())
    result = get_client().table("cigarette_log") \
        .select("count_today") \
        .gte("logged_at", f"{today}T00:00:00") \
        .order("logged_at", desc=True) \
        .limit(1) \
        .execute()
    return result.data[0]["count_today"] if result.data else 0


# ── settings ──────────────────────────────────────────────────────────────────

def get_settings() -> dict:
    result = get_client().table("settings").select("*").execute()
    return {row["key"]: row["value"] for row in result.data}


def update_setting(key: str, value: str):
    return get_client().table("settings").upsert(
        {"key": key, "value": value}, on_conflict="key"
    ).execute()
