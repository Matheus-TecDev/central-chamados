from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_roles
from app.core.enums import UserRole
from app.models.user import User
from app.repositories.users import list_users
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.users import create_user, update_user

router = APIRouter(prefix="/users", tags=["Usuarios"])


@router.get("", response_model=list[UserRead])
def index(
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[User]:
    return list_users(db)


@router.post("", response_model=UserRead, status_code=201)
def store(
    payload: UserCreate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> User:
    return create_user(db, payload)


@router.get("/{user_id}", response_model=UserRead)
def show(
    user_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado.")
    return user


@router.put("/{user_id}", response_model=UserRead)
def update(
    user_id: int,
    payload: UserUpdate,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado.")
    return update_user(db, user, payload)


@router.delete("/{user_id}", status_code=204)
def destroy(
    user_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> None:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario nao encontrado.")
    user.is_active = False
    db.commit()
