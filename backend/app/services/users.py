from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.repositories.users import get_by_email
from app.schemas.user import UserCreate, UserUpdate


def create_user(db: Session, payload: UserCreate) -> User:
    if get_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail ja cadastrado.")
    user = User(
        name=payload.name,
        email=payload.email,
        role=payload.role,
        is_active=payload.is_active,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, payload: UserUpdate) -> User:
    values = payload.model_dump(exclude_unset=True)
    password = values.pop("password", None)
    if "email" in values and values["email"] != user.email and get_by_email(db, values["email"]):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail ja cadastrado.")
    for field, value in values.items():
        setattr(user, field, value)
    if password:
        user.hashed_password = get_password_hash(password)
    db.commit()
    db.refresh(user)
    return user
