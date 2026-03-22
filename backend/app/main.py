from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, SessionLocal, engine
from .routers.auth import router as auth_router
from .routers.products import admin_router as admin_products_router
from .routers.products import router as products_router
from .seed import seed_admin_user, seed_products


app = FastAPI(title=settings.app_name)

origins = [item.strip() for item in settings.cors_allow_origins.split(",") if item.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_admin_user(db)
        seed_products(db)
    finally:
        db.close()


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}


app.include_router(auth_router)
app.include_router(products_router)
app.include_router(admin_products_router)
