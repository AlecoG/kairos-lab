from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import User
from .security import decode_access_token


auth_scheme = HTTPBearer(auto_error=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(auth_scheme),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
    )

    try:
        payload = decode_access_token(token)
        username = payload.get("sub")
    except Exception:
        raise unauthorized

    if not username:
        raise unauthorized

    user = db.query(User).filter(User.username == username, User.is_active.is_(True)).first()
    if not user:
        raise unauthorized

    return user
