from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.core.enums import UserRole
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.services.categories import create_category, update_category

router = APIRouter(prefix="/categories", tags=["Categorias"])


@router.get("", response_model=list[CategoryRead])
def index(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)))


@router.post("", response_model=CategoryRead, status_code=201)
def store(
    payload: CategoryCreate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> Category:
    return create_category(db, payload)


@router.put("/{category_id}", response_model=CategoryRead)
def update(
    category_id: int,
    payload: CategoryUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> Category:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria nao encontrada.")
    return update_category(db, category, payload)


@router.delete("/{category_id}", status_code=204)
def destroy(
    category_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> None:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria nao encontrada.")
    category.is_active = False
    db.commit()
