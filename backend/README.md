# Backend (FastAPI + SQLite)

## 1) Instalar dependencias
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 2) Variables de entorno
```bash
cp .env.example .env
```

## 3) Levantar API
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 4) Endpoints principales
- Health: `GET /health`
- Login: `POST /auth/login`
- Productos públicos: `GET /products`, `GET /products/{id}`
- Productos admin (token Bearer):
  - `POST /admin/products`
  - `PUT /admin/products/{id}`
  - `DELETE /admin/products/{id}`

## Auth
1. Haces login con usuario y contraseña.
2. Recibes `access_token` JWT.
3. Envías `Authorization: Bearer <token>` en endpoints admin.
