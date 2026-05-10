from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date

from services import claude_service, supabase_service as db

router = APIRouter()


class Message(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


class ChatResponse(BaseModel):
    reply: str


class MorningBriefResponse(BaseModel):
    message: str


def _load_context() -> tuple[dict, list]:
    """Load settings + today's log from Supabase (best-effort)."""
    try:
        settings = db.get_settings()
    except Exception:
        settings = {}
    try:
        log = db.get_log_for_date(str(date.today())).data
    except Exception:
        log = []
    return settings, log


def _save_messages(messages: list[Message], reply: str):
    """Persist the last user message + assistant reply to chat_history."""
    try:
        last_user = next((m for m in reversed(messages) if m.role == "user"), None)
        client = db.get_client()
        rows = []
        if last_user:
            rows.append({"role": "user", "content": last_user.content})
        rows.append({"role": "assistant", "content": reply})
        client.table("chat_history").insert(rows).execute()
    except Exception:
        pass  # non-critical


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        settings, daily_log = _load_context()
        msgs = [{"role": m.role, "content": m.content} for m in req.messages]
        reply = claude_service.chat(msgs, settings, daily_log)
        _save_messages(req.messages, reply)
        return ChatResponse(reply=reply)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/morning-brief", response_model=MorningBriefResponse)
async def morning_brief():
    try:
        settings, _ = _load_context()
        try:
            block_count = len(db.get_schedule().data)
        except Exception:
            block_count = 11
        message = claude_service.morning_brief(settings, block_count)
        # save to history
        try:
            db.get_client().table("chat_history").insert(
                {"role": "assistant", "content": message}
            ).execute()
        except Exception:
            pass
        return MorningBriefResponse(message=message)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history(limit: int = 50):
    """Return recent chat history from Supabase."""
    try:
        result = db.get_client().table("chat_history") \
            .select("role, content, created_at") \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        # return in chronological order
        return list(reversed(result.data))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
