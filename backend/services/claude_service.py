import os
import anthropic
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

_client: anthropic.Anthropic | None = None

MODEL = "claude-sonnet-4-6"

# ── System prompt (cached) ────────────────────────────────────────────────────

SYSTEM_PROMPT = """את הסוכנת של אפליקציית "אופק חדש" – תוכנית שיקום אישית.
תפקידך: לנהל את השיקום של המשתמש בגישה אסרטיבית-חומלת.

אישיות:
- קול נשי, ישראלי, חם אבל ישיר
- מקסימום 2 משפטים בכל תגובה
- לא מתנצלת, לא מחמיאה לשווא
- מכירה בקושי אבל לא מאשרת ויתור
- תמיד מסיימת עם פעולה ברורה אחת

כללים דקדוקיים:
- תמיד בעברית
- לא יותר מ-2 משפטים
- תמיד פעולה אחת בסוף
- אין "כמובן" "בהחלט" "נהדר" – רק ישיר וכן"""


def get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        key = os.getenv("ANTHROPIC_API_KEY", "").strip()
        if not key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set in .env")
        _client = anthropic.Anthropic(api_key=key)
    return _client


def _context_block(settings: dict, daily_log: list) -> str:
    completed = sum(1 for r in daily_log if r.get("completed"))
    total = len(daily_log) or 1
    hour = datetime.now().strftime("%H:%M")
    score = round((completed / total) * 100)

    user_name = settings.get("user_name", "")
    name_line = f"- שם המשתמש: {user_name}\n" if user_name else ""

    # list completed block names
    done_names = []
    for r in daily_log:
        if r.get("completed"):
            sched = r.get("daily_schedule") or {}
            name = sched.get("block_name") if isinstance(sched, dict) else None
            if name:
                done_names.append(name)
    done_str = ", ".join(done_names) if done_names else "אף בלוק עדיין"

    return (
        f"\nהקשר נוכחי:\n"
        f"{name_line}"
        f"- שעה: {hour}\n"
        f"- הושלמו היום: {completed}/{total} בלוקים ({score}%)\n"
        f"- בלוקים שהושלמו: {done_str}\n"
        f"- שעת קימה: {settings.get('wake_hour', 5)}:{str(settings.get('wake_minute', '0')).zfill(2)}\n"
        f"- יעד סיגריות יומי: {settings.get('target_cigarettes', 'לא הוגדר')}\n"
    )


# ── Public API ─────────────────────────────────────────────────────────────────

def chat(messages: list[dict], settings: dict, daily_log: list) -> str:
    """
    Send a conversation to Claude and return the assistant reply.
    Uses prompt caching on the system prompt for efficiency.
    """
    context = _context_block(settings, daily_log)

    response = get_client().messages.create(
        model=MODEL,
        max_tokens=150,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},  # cache the static prompt
            },
            {
                "type": "text",
                "text": context,
            },
        ],
        messages=messages,
    )
    return response.content[0].text


def morning_brief(settings: dict, block_count: int) -> str:
    """
    Generate a short personalized morning message.
    """
    hour = int(settings.get("wake_hour", 5))
    name = settings.get("user_name", "")
    name_part = f" {name}" if name else ""

    response = get_client().messages.create(
        model=MODEL,
        max_tokens=100,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[
            {
                "role": "user",
                "content": (
                    f"צור ברכת בוקר קצרה ומעוררת עבור{name_part}. "
                    f"קם ב-{hour}:00, יש לו {block_count} בלוקים היום. "
                    f"פנה אליו בשמו אם יש. שני משפטים בלבד, מסיים עם פעולה ברורה אחת."
                ),
            }
        ],
    )
    return response.content[0].text
