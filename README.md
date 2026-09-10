# DEFRULE MUSIC — Tienda de instrumentos musicales (Bogotá)

Sitio multipágina (HTML + CSS + JS vanilla) en modo oscuro para una empresa de productos musicales:
guitarras eléctricas, percusión y accesorios. Cada producto muestra descripción,
especificaciones técnicas, precio con descuento y fotos, y un botón que abre un chat de
WhatsApp (+57 321 958 5712) con el producto de interés pre-escrito.

## Secciones
- `index.html` — Inicio (hero bento grid + destacados + vistos recientemente)
- `catalogo.html` — Catálogo filtrable (7 filtros)
- `nosotros.html` — Nosotros
- `contacto.html` — Contacto

## Diseño / UX
- Modo oscuro · acento `#fca903` · secundario `#0356fc`
- Fuentes Google: **Inter**, **Montserrat (Black 800/900)**, **Space Grotesk**
- Layout **bento grid** · barra de navegación superior única
- **GSAP** para transiciones entre páginas y animaciones de entrada/hover · tarjetas con efecto flotante y sombra
- **Lucide icons** en botones/tarjetas/componentes · **sin emojis**
- **IndexedDB** para persistencia (favoritos, vistas recientes, descuento de bienvenida)

## Filtros del catálogo (7)
1. Búsqueda de texto
2. Categoría (Todo / Guitarras / Percusión / Accesorios)
3. Marca
4. Rango de precio (COP)
5. Descuento
6. Ordenamiento (recomendados, precio ↑↓, descuento, rating)

## Modal de bienvenida
Botón de [uiverse.io/dexter-st/itchy-wolverine-84](https://uiverse.io/dexter-st/itchy-wolverine-84)
que "activa" un 10% de descuento en la primera compra (solo estético).

## WhatsApp
Cada producto tiene un botón con icono de WhatsApp que abre
`https://wa.me/573219585712?text=…` con un saludo corto + el nombre del producto.
Sin carrito de compras, sin pasarela de pagos, sin registro de usuarios.

## Precios
Los precios base están en USD (street price USA investigado en línea, sep/2026) y se convierten a COP
en runtime con `CONFIG.fx = 3116` (TRM sep-2026) y `CONFIG.importFactor = 1.35`
(arancel + IVA + margen de importación). Editables en `assets/js/data.js`.

## Estructura
```
.
├── index.html / catalogo.html / nosotros.html / contacto.html
└── assets/
    ├── css/styles.css
    ├── js/  data.js · db.js · main.js · catalog.js
    ├── vendor/  gsap.min.js · ScrollTrigger.min.js · lucide.min.js
    └── img/  (fotos de producto, 3 por producto)
```

## Correr en local

```bash
python3 -m http.server 8000 --bind 0.0.0.0
# http://localhost:8000
```

## Nota
El sitio anterior (demo Xiaomi) quedó archivado en `_legacy/` y es recuperable del historial de Git.
