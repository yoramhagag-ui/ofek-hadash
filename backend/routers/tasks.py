from fastapi import APIRouter, HTTPException
from services import supabase_service as db
from models.schemas import TaskCreate, TaskToggle

router = APIRouter()


@router.get("/")
def get_tasks():
    try:
        return db.get_tasks().data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
def create_task(task: TaskCreate):
    try:
        result = db.create_task(task.title, task.due_date, task.due_time, task.recurrence)
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{task_id}")
def toggle_task(task_id: str, body: TaskToggle):
    try:
        result = db.toggle_task(task_id, body.completed)
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{task_id}")
def delete_task(task_id: str):
    try:
        db.delete_task(task_id)
        return {"deleted": task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
