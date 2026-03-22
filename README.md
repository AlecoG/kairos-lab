# kairos-lab
Landing page para barbería con frontend en Astro y backend en FastAPI.

## Estructura del proyecto
- `frontend/`: aplicación web (Astro + Tailwind).
- `backend/`: API (FastAPI + SQLite).

## Datos actuales del negocio
- Horario: lunes a domingo, de 10:00 a 22:00.
- Dirección: Calle 21 / 8 y 10, Vedado, Havana, Cuba.

## Estructura de catálogo de productos
- `frontend/src/pages/index.astro`: muestra catálogo resumido y botón `Ver todos los productos`.
- `frontend/src/pages/catalogo.astro`: página dedicada al catálogo completo con buscador.
- `frontend/src/layouts/BaseLayout.astro`: layout compartido para ambas páginas.
- `frontend/public/products-data.js`: fuente compartida de productos para ambas páginas.
- `frontend/public/app.js`: renderiza productos, filtro de búsqueda y acciones por WhatsApp.
- `frontend/public/assets/products/photos/`: carpeta para fotos reales de productos.

## Actualizar fotos del catálogo
1. Coloca las fotos en `frontend/public/assets/products/photos/`.
2. Usa los nombres definidos en `frontend/public/assets/products/photos/README.md`.
3. Si una foto no existe, la web mostrará una imagen de respaldo por categoría.

## Cómo incrustar o actualizar Google Maps (iframe)
1. Abre Google Maps y busca la dirección del local.
2. Haz clic en `Compartir` -> `Insertar un mapa`.
3. Copia el HTML del `iframe`.
4. Reemplaza el bloque `iframe` dentro de `frontend/src/pages/index.astro` en la sección `#ubicacion`.

Nota: también hay un botón con link directo a Google Maps en esa misma sección.

## Ejecutar frontend (Astro)
1. Ve al frontend con `cd frontend`.
2. Instala dependencias con `npm install`.
3. Ejecuta en local con `npm run dev`.
4. Genera build estático con `npm run build`.

## Admin de productos (login + panel)
- Login: `/admin/login/`
- Panel: `/admin/panel/`
- Credenciales demo:
  - Usuario: `admin`
  - Contraseña: `kairos123`
- El panel ahora persiste en la API (FastAPI) usando JWT.
- Funciones del panel:
  - Crear y eliminar productos.
  - Editar nombre, descripción, categoría, precio, visibilidad, habilitación y stock.
  - Subir imagen con preview.
  - Filtros por estado y buscador de productos.
  - Exportar e importar JSON de productos.

## Tailwind CSS
- Tailwind está configurado en:
  - `frontend/tailwind.config.cjs`
  - `frontend/postcss.config.cjs`
  - `frontend/src/styles/tailwind.css`
- `preflight` está desactivado para mantener control total del look sin reset global.

## Prompt para construir imagenes
Genera una fotografía profesional de producto estilo catálogo premium minimalista para tienda online de cuidado capilar masculino. Usa un fondo gris muy claro uniforme tipo lujo (#F5F5F5), completamente limpio y sin textura ni degradados. El producto debe estar perfectamente centrado (horizontal y verticalmente), con ángulo frontal recto y simétrico. Ajusta el encuadre para que el producto ocupe aproximadamente entre 55% y 65% del espacio total de la imagen, dejando suficiente margen alrededor para que no se corte dentro de una tarjeta de producto en e-commerce. Mantén proporciones reales sin deformar el envase. Utiliza iluminación de estudio suave y uniforme, con una sombra muy sutil y difusa debajo del producto para dar profundidad sin que sea dominante. Respeta completamente los colores originales, etiqueta y branding, sin añadir texto, efectos, elementos decorativos ni accesorios. La imagen debe estar en formato cuadrado 1:1, con resolución mínima de 1200x1200 px, alta nitidez y acabado limpio, elegante y consistente entre todos los productos para mantener uniformidad visual en el catálogo.

## Backend API (FastAPI + SQLite)
Frontend y backend están separados físicamente:
- Frontend (Astro): `frontend/`
- Backend (FastAPI): `backend/`

### Estructura sugerida
- `backend/app/main.py`: entrada de FastAPI, CORS y registro de rutas.
- `backend/app/models.py`: modelos SQLAlchemy (`User`, `Product`).
- `backend/app/routers/auth.py`: login y emisión de JWT.
- `backend/app/routers/products.py`: endpoints públicos y admin de productos.
- `backend/app/deps.py`: dependencias (`db`, usuario autenticado).
- `backend/app/security.py`: hash de contraseñas y JWT.
- `backend/app/seed.py`: usuario admin y productos iniciales.
- `backend/.env.example`: variables de entorno para local.

### Flujo de autenticación
1. `POST /auth/login` con `username` y `password`.
2. Respuesta con `access_token` JWT.
3. En endpoints admin, enviar `Authorization: Bearer <token>`.

### Endpoints base
- `GET /health`
- `GET /products`
- `GET /products/{id}`
- `POST /admin/products` (protegido)
- `PUT /admin/products/{id}` (protegido)
- `DELETE /admin/products/{id}` (protegido)

Ver guía rápida de arranque en `backend/README.md`.
