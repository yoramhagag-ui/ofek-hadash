import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from fastapi.background import BackgroundTasks
from pydantic import BaseModel
from services.tts_service import speak

router = APIRouter()


class TTSRequest(BaseModel):
    text: str
    voice_name: str = "hila"


def _cleanup(path: str):
    try:
        os.unlink(path)
    except OSError:
        pass


@router.post("/speak")
async def text_to_speech(req: TTSRequest, background_tasks: BackgroundTasks):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")
    try:
        output_path = await speak(req.text, req.voice_name)
        background_tasks.add_task(_cleanup, output_path)
        return FileResponse(output_path, media_type="audio/mpeg", filename="speech.mp3")
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/check")
async def check_tts():
    return {"configured": True, "voice": "he-IL-HilaNeural", "engine": "edge-tts"}
