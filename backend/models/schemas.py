from pydantic import BaseModel
from typing import Optional


class LogRequest(BaseModel):
    block_id: str
    date: str
    completed: bool
    score: Optional[int] = None


class TaskCreate(BaseModel):
    title: str
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    recurrence: str = "once"


class TaskToggle(BaseModel):
    completed: bool


class CigaretteLog(BaseModel):
    count_today: int


class SettingUpdate(BaseModel):
    value: str


class BlockCreate(BaseModel):
    block_name: str
    icon: str = "📌"
    offset_mins: int
    duration_mins: int
    category: str = "learning"
    color: str = "#727783"


class BlockUpdate(BaseModel):
    block_name: Optional[str] = None
    icon: Optional[str] = None
    offset_mins: Optional[int] = None
    duration_mins: Optional[int] = None
    category: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
