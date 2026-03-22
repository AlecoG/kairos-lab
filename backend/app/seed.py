from sqlalchemy.orm import Session

from .config import settings
from .models import Product, User
from .security import get_password_hash


DEFAULT_PRODUCTS = [
    {
        "id": "arcilla-texturizante-1",
        "name": "Arcilla Texturizante",
        "category": "Styling",
        "desc": "Textura seca para volumen y movimiento.",
        "price": "$$$",
        "image": "/assets/products/photos/cera-texturizante.jpg",
        "visible": True,
        "enabled": True,
        "stock_status": "disponible",
    },
    {
        "id": "shampoo-anticaspa-1",
        "name": "Shampoo Anticaspa",
        "category": "Cuidado",
        "desc": "Limpieza profunda y control de descamación.",
        "price": "$$$",
        "image": "/assets/products/photos/shampoo-anticaspa.jpg",
        "visible": True,
        "enabled": True,
        "stock_status": "disponible",
    },
    {
        "id": "aceite-barba-1",
        "name": "Aceite para Barba",
        "category": "Barba",
        "desc": "Suaviza, perfuma y ayuda a controlar el frizz.",
        "price": "$$$",
        "image": "/assets/products/photos/aceite-para-barba.jpg",
        "visible": True,
        "enabled": True,
        "stock_status": "disponible",
    },
]


def seed_admin_user(db: Session) -> None:
    exists = db.query(User).filter(User.username == settings.admin_username).first()
    if exists:
        return

    db.add(
        User(
            username=settings.admin_username,
            password_hash=get_password_hash(settings.admin_password),
            is_active=True,
        )
    )
    db.commit()


def seed_products(db: Session) -> None:
    if db.query(Product).first():
        return

    db.add_all([Product(**item) for item in DEFAULT_PRODUCTS])
    db.commit()
