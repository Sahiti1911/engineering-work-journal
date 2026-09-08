from pydantic import BaseModel


class EntryCreate(BaseModel):
    title: str
    body: str
    work_date: str
    tags: str | None = None


class EntryOut(BaseModel):
    id: int
    title: str
    body: str
    work_date: str
    tags: str | None
    created_at: str
    updated_at: str
