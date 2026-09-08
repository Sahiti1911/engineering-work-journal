from fastapi import APIRouter

from app import crud
from app.models import EntryCreate, EntryOut

router = APIRouter(prefix="/api/entries", tags=["entries"])


@router.get("", response_model=list[EntryOut])
def list_entries():
    return crud.list_entries()


@router.post("", response_model=EntryOut)
def create_entry(entry: EntryCreate):
    return crud.create_entry(entry)
