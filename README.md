# kairos-lab
Landing page para barbería.

## Datos actuales del negocio
- Horario: lunes a domingo, de 10:00 a 22:00.
- Dirección: Calle 21 / 8 y 10, Vedado, Havana, Cuba.

## Estructura de catálogo de productos
- `index.html`: muestra catálogo resumido y botón `Ver todos los productos`.
- `catalogo.html`: página dedicada al catálogo completo con buscador.
- `products-data.js`: fuente compartida de productos para ambas páginas.
- `app.js`: renderiza productos, filtro de búsqueda y acciones por WhatsApp.
- `assets/products/photos/`: carpeta para fotos reales de productos.

## Actualizar fotos del catálogo
1. Coloca las fotos en `assets/products/photos/`.
2. Usa los nombres definidos en `assets/products/photos/README.md`.
3. Si una foto no existe, la web mostrará una imagen de respaldo por categoría.

## Cómo incrustar o actualizar Google Maps (iframe)
1. Abre Google Maps y busca la dirección del local.
2. Haz clic en `Compartir` -> `Insertar un mapa`.
3. Copia el HTML del `iframe`.
4. Reemplaza el bloque `iframe` dentro de `index.html` en la sección `#ubicacion`.

Nota: también hay un botón con link directo a Google Maps en esa misma sección.

## Prompt para construir imagenes
Genera una fotografía profesional de producto estilo catálogo premium minimalista para tienda online de cuidado capilar masculino. Usa un fondo gris muy claro uniforme tipo lujo (#F5F5F5), completamente limpio y sin textura ni degradados. El producto debe estar perfectamente centrado (horizontal y verticalmente), con ángulo frontal recto y simétrico. Ajusta el encuadre para que el producto ocupe aproximadamente entre 55% y 65% del espacio total de la imagen, dejando suficiente margen alrededor para que no se corte dentro de una tarjeta de producto en e-commerce. Mantén proporciones reales sin deformar el envase. Utiliza iluminación de estudio suave y uniforme, con una sombra muy sutil y difusa debajo del producto para dar profundidad sin que sea dominante. Respeta completamente los colores originales, etiqueta y branding, sin añadir texto, efectos, elementos decorativos ni accesorios. La imagen debe estar en formato cuadrado 1:1, con resolución mínima de 1200x1200 px, alta nitidez y acabado limpio, elegante y consistente entre todos los productos para mantener uniformidad visual en el catálogo.