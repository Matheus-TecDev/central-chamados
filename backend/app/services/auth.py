import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.repositories.users import get_by_email

logger = logging.getLogger(__name__)


def authenticate(db: Session, email: str, password: str) -> tuple[str, User]:
    user = get_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        logger.warning("Authentication failed", extra={"email": email})
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais invalidas.")
    if not user.is_active:
        logger.warning("Inactive user authentication blocked", extra={"user_id": user.id, "email": user.email})
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inativo.")
    token = create_access_token(str(user.id), {"role": user.role.value})
    logger.info("Authentication succeeded", extra={"user_id": user.id, "role": user.role.value})
    return token, user
