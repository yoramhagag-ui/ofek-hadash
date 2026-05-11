from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import schedule, tasks, progress, settings, tts, commander

app = FastAPI(title="אופק חדש API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schedule.router, prefix="/schedule", tags=["schedule"])
app.include_router(tasks.router,    prefix="/tasks",    tags=["tasks"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(tts.router,       prefix="/tts",       tags=["tts"])
app.include_router(commander.router, prefix="/commander", tags=["commander"])


@app.get("/health")
def health():
    return {"status": "ok", "app": "אופק חדש"}
