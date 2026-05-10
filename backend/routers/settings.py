from fastapi import APIRouter, HTTPException
from services import supabase_service as db
from models.schemas import SettingUpdate

router = APIRouter()


@router.get("/")
def get_settings():
    try:
        return db.get_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{key}")
def update_setting(key: str, body: SettingUpdate):
    try:
        db.update_setting(key, body.value)
        return {"key": key, "value": body.value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
