# Proyectos del repo

| Carpeta | Qué es |
|---|---|
| `index.html` (raíz) | Landing + catálogo Xiaomi (este README original) |
| [`dashboard-dolar/`](dashboard-dolar/) | **Panel exploratorio del dólar en Colombia (TRM, últimos 6 meses)** — KPIs, distribuciones, correlaciones y 3 oportunidades de modelado para la junta. Apache ECharts · Poppins/Open Sans · responsive. Ver su [README](dashboard-dolar/README.md). |

---

# Landing + catálogo Xiaomi (100 % en un archivo)

Página de venta de tecnología con foco en **Xiaomi / Redmi / POCO / Mijia** para Colombia:
landing de conversión + catálogo filtrable con carrito que **cierra por WhatsApp**.

- **Archivo:** `index.html` — sin framework, sin build, sin dependencias (salvo la fuente de Google, con respaldo del sistema).
- **Moneda:** pesos colombianos, formato `es-CO`.
- **Cierre:** WhatsApp (`wa.me`) con el pedido ya escrito, precios, cupón y trazabilidad de campaña.
- **Datos:** `CONFIG`, `PRODUCTS` y `COMBOS` al inicio del `<script>`.

Abre el archivo con doble clic, o sírvelo para ver todo funcionando:

```bash
python3 -m http.server 8000 --bind 0.0.0.0   # http://localhost:8000
```

---

## 1. Lo mínimo para que sea tuya (5 minutos)

Al inicio del `<script>` de `index.html` está `CONFIG`. Cambia:

```js
store: {
  name: "MiTienda Xiaomi",           // tu marca
  city: "Bogotá",
  whatsapp: "573001234567",           // ⚠️ SIN +, sin espacios, sin guiones
  whatsappVisible: "+57 300 123 4567",// como se muestra en la web
  email: "ventas@...", address: "...", hours: "..."
},
shipping: { freeFrom: 199000, cost: 12000, cod: 10000, eta: "24–72 horas hábiles…" },
cuotas: { sininteres: 3, max: 18, minMonto: 300000 },
sale:   { label: "Semana Xiaomi", end: null }   // end: "2026-09-13T23:59" fuerza fin de promo
```

Luego busca y reemplaza en el HTML estos textos de ejemplo:
`MiTienda Xiaomi`, `+57 300 123 4567`, `ventas@mitiendaxiaomi.co`, `Calle 100 # 15-20`,
`NIT 000.000.000-0`, los 4 testimonios y las 6 respuestas del FAQ.

> El **número de WhatsApp** también vive en un solo lugar (`CONFIG.store.whatsapp`): el botón flotante,
> el checkout, cada ficha y el formulario lo toman de ahí. No hay que editarlos uno por uno.

## 2. Tu catálogo

Cada producto es un objeto en `PRODUCTS`. Copia uno y edítalo:

```js
{
  id: "redmi-14c", sku: "R14C-256",          // id único, sin espacios
  cat: "tel", catName: "Smartphones",        // ver categorías abajo
  name: "Redmi 14C · 8/256 GB",
  price: 699000, was: 799000,                // was = precio anterior (para el % de descuento)
  rating: 4.6, reviews: 240,
  img: "assets/p-redmi14c.jpg",
  stock: 10,                                 // 0 = agotado → cambia el CTA a "Avísame"
  rec: 90,                                   // peso en el orden "Recomendados"
  specs: ["Batería 5.160 mAh", "Pantalla 6,88\"", "Huella lateral"],
  kw: "celular telefono gama entrada economico",   // sinónimos para el buscador
  short: "Una frase de venta, en español, sin tecnicismos.",
  table: { "Pantalla": "…", "Batería": "…", "Bandas Colombia": "…" },
  color: "Negro · Azul", box: "Caja, cargador, cable, funda"
}
```

Reglas útiles:

| Campo | Efecto en la página |
|---|---|
| `price` / `was` | Precio, **−%** en la etiqueta y "Ahorras $…" |
| `stock` | BARRA de stock, aviso "Quedan X", y si es 0 → CTA de aviso |
| `rec` | Posición en "Recomendados" (100 = primero) |
| `kw` | Búsqueda tolerante a acentos (escribe `audifonos` y encuentra "audífonos") |
| `cat` | Chip de categoría y filtro |

Categorías disponibles: `tel`, `wear`, `audio`, `tv`, `hogar`, `carga`.
Para **crear una nueva**, edita el arreglo `CATS` (nombre + icono) y usa esa clave en `cat`.

### Combos (`COMBOS`)
Cada combo referencia `id` de productos. Un clic los mete al carrito y **activa el cupón** indicado.
Si algún ítem del combo está agotado, el botón se desactiva solo.

### Cupones (`CONFIG.coupons`)
```js
XIAOMI10:  { type: "pct",  value: 10, min: 0, max: 400000, msg: "10% de descuento" }
AMIGO50:   { type: "flat", value: 50000, min: 200000, msg: "$50.000 de descuento" }
ENVIOGRATIS:{ type: "ship", value: 0, min: 0, msg: "Envío gratis" }
```
`min` es subtotal (o nº de productos si pones `items: true`); `max` topa el descuento en pesos.

## 3. Fotos

- Las de `assets/` son **renders de ejemplo** (no son tus productos). Reemplázalas.
- Formato recomendado: **cuadrado, 1200×1200 px**, fondo claro, producto centrado, `.jpg` al 85–90 % o `.webp`.
- Nómbralas igual y sube el reemplazo: no hay que tocar el HTML.
- Si una foto falta, la tarjeta **no se rompe**: muestra el nombre del producto sobre un patrón gris.
- Para cuadrar fotos rectangulares sin recortar el producto:

```bash
pip install pillow
python3 - <<'PY'
from PIL import Image
im = Image.open("assets/mi-foto.jpg").convert("RGB")
w, h = im.size; s = max(w, h); out = Image.new("RGB", (s, s), (233, 233, 233))
out.paste(im, ((s-w)//2, (s-h)//2)); out.save("assets/mi-foto.jpg", quality=88)
PY
```

## 4. Publicar (gratis, 2 minutos)

| Opción | Cómo |
|---|---|
| **Netlify Drop** | Entras a app.netlify.com/drop y arrastras la carpeta (con `index.html` + `assets/`) |
| **GitHub Pages** | Sube los dos elementos al repo → Settings → Pages → rama `main`, carpeta `root` |
| **cPanel / Hostinger** | Sube `index.html` y `assets/` a `public_html/` |
| **Dominio propio** | Apunta tu `.com.co` al hosting elegido; la página ya funciona en cualquier ruta |

## 5. Detrás de escena (por si quieres extender)

- **Carrito:** `localStorage` (`mtz.cart`, `mtz.saved`, `mtz.coupon`) → el pedido sobrevive al cierre del navegador.
- **Checkout:** no hay pasarela; `checkout()` arma el mensaje y abre `wa.me`. Si un día quieres pagos,
  reemplaza el `click` de `#checkout` por tu link de PayU / Mercado Pago / Wompi.
- **Ficha con enlace directo:** `tuweb.com/#p-xiaomi-15` abre la modal de ese producto.
  Perfecto para mandar referencias puntuales por WhatsApp o en pauta.
- **Trazabilidad:** si el anuncio llega con `?utm_source=meta&utm_campaign=sep` (o `fbclid`/`gclid`),
  ese origen se **adjunta al mensaje de WhatsApp** para que sepas de dónde vino cada pedido.
- **SEO local:** hay `title`, `meta description`, Open Graph y **JSON-LD** (schema.org `Store` + `Product`
  con precio, moneda, stock y rating) generado desde `PRODUCTS`, para que Google muestre el precio en el resultado.
- **Accesibilidad:** navegación por teclado, `aria-*`, foco visible, `Esc` cierra paneles,
  `"/"` enfoca el buscador, y respeta `prefers-reduced-motion`.

## 6. Checklist antes de pautar

- [ ] Número de WhatsApp probado desde un celular real.
- [ ] Precios, IVA y stock verificados (el stock dice "Quedan X": no inflar).
- [ ] Textos legales propios: garantía, cambios, habeas data, NIT.
- [ ] Fotos y descripciones **propias**.
- [ ] Borrar el aviso amarillo de "Versión de demostración" en el footer (está marcado con `⚠️ BORRA ESTE BLOQUE`).

## 7. Nota legal sobre la marca

Xiaomi, Redmi, POCO y Mi Home son **marcas registradas de Xiaomi Inc.** Puedes vender y describir sus
productos mencionando el nombre (uso informativo), pero **no** uses su logotipo, no copies sus fotos
oficiales ni te presentes como "distribuidor autorizado" si no lo eres. Esta plantilla usa un nombre
genérico de tienda, iconografía propia y renders hechos para este proyecto: cambia textos e imágenes por
material tuyo antes de publicar.
