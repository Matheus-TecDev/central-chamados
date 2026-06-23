from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def create_category(db: Session, payload: CategoryCreate) -> Category:
    existing = db.scalar(select(Category).where(Category.name == payload.name.upper()))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Categoria ja cadastrada.")
    category = Category(name=payload.name.upper(), description=payload.description, is_active=payload.is_active)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category: Category, payload: CategoryUpdate) -> Category:
    values = payload.model_dump(exclude_unset=True)
    if "name" in values:
        values["name"] = values["name"].upper()
        existing = db.scalar(select(Category).where(Category.name == values["name"], Category.id != category.id))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Categoria ja cadastrada.")
    for field, value in values.items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category
