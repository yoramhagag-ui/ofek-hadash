from fastapi import APIRouter, HTTPException
from services import supabase_service as db
from models.schemas import LogRequest, BlockCreate, BlockUpdate

router = APIRouter()


@router.get("/")
def get_schedule():
    try:
        result = db.get_schedule()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
def create_block(req: BlockCreate):
    try:
        result = db.get_client().table("daily_schedule").insert({
            "block_name":    req.block_name,
            "icon":          req.icon,
            "offset_mins":   req.offset_mins,
            "duration_mins": req.duration_mins,
            "category":      req.category,
            "color":         req.color,
            "is_active":     True,
        }).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{block_id}")
def update_block(block_id: str, req: BlockUpdate):
    try:
        update = {k: v for k, v in req.model_dump().items() if v is not None}
        result = db.get_client().table("daily_schedule").update(update).eq("id", block_id).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{block_id}")
def delete_block(block_id: str):
    try:
        db.get_client().table("daily_schedule").update({"is_active": False}).eq("id", block_id).execute()
        return {"deleted": block_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/today")
def get_today():
    from datetime import date
    try:
        result = db.get_log_for_date(str(date.today()))
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/log")
def log_completion(req: LogRequest):
    try:
        result = db.upsert_log(req.block_id, req.date, req.completed, req.score)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
