# Dólar en Colombia — Panel exploratorio (últimos 6 meses)

Dashboard de **un solo vistazo para la junta directiva** sobre la TRM (USD/COP)
de los últimos 6 meses (17-mar-2026 → 15-sep-2026), con:

- **Indicadores clave (KPIs):** última TRM, variación del período, media, mediana,
  mínimo, máximo, volatilidad (diaria y anualizada) y caída máxima (drawdown).
- **Evolución:** línea diaria/semanal/mensual con media móvil de 7 días y
  variables de contexto superponibles (petróleo Brent, índice del dólar y tasa
  10a de EE.UU.) en nivel COP o en índice base 100.
- **Distribuciones:** histograma de la TRM con curva normal ajustada y diagrama
  de caja mes a mes.
- **Correlaciones:** matriz de correlación (Pearson/Spearman) sobre rendimientos
  diarios, dispersa de pares con recta de ajuste y correlación móvil (ventana
  de 10/20/30 días).
- **Oportunidades:** tres proyectos de modelado/análisis propuestos desde los
  datos (pronóstico, alertas de volatilidad, simulación Monte Carlo) en
  lenguaje de negocio.

**Diseño:** modo claro · acento `#2c95e6` · tipografías **Poppins** (títulos) y
**Open Sans** (cuerpo, Google Fonts) · **Apache ECharts 5** (vía CDN con
respaldo) · **responsive** para teléfono, tablet y PC/Mac.

## Cómo abrirlo

Opción A — doble clic en `index.html` (los datos están embebidos en
`data/datos.js`; solo los gráficos necesitan internet por la CDN de ECharts).

Opción B — servidor local:

```bash
python3 -m http.server 8080 --bind 0.0.0.0 --directory dashboard-dolar
# http://localhost:8080
```

## Filtros

| Filtro | Opciones |
|---|---|
| **Fecha (obligatorio)** | Chips rápidos (1 mes, 3 meses, 6 meses, mes actual) + rangos personalizados `desde`/`hasta` |
| Granularidad | Diaria · Semanal · Mensual |
| Escala | Nivel (COP) · Índice 100 (comparar movimientos) |
| Variables | Brent · Índice del dólar · Tasa 10a EE.UU. (activables) |
| Correlación | Pearson · Spearman · ventana móvil 10/20/30 días |
| Dispersa | pares de variables libres (X × Y) |

Todos los indicadores y gráficos se recalculan con la selección actual.

## Datos y fuentes

| Variable | Fuente | Código |
|---|---|---|
| TRM (USD/COP) | Superintendencia Financiera de Colombia vía datos.gov.co | mcec-87by |
| Petróleo Brent (USD/bbl) | FRED / EIA | DCOILBRENTEU |
| Índice del dólar (broad, EE.UU.) | FRED / BIS | DTWEXBGS |
| Tasa a 10 años EE.UU. (%) | FRED | DGS10 |

- Los CSV crudos viven en `data/raw/`; el dataset unificado se regenera con
  `python3 data/build_data.py` (produce `data/datos.json` y `data/datos.js`).
- Parrilla de fechas: días hábiles colombianos (fechas de vigencia de la TRM,
  incluyendo los sábados en que la SFC fija la tasa de fin de semana).
- Huecos de publicación de FRED (festivos en EE.UU.) rellenados con el último
  valor disponible (ffill).
- Correlaciones: **rendimientos logarítmicos diarios** sobre pares de días
  hábiles consecutivos (lun–vie); la correlación móvil usa ventana deslizante.
- "Volatilidad anualizada" = desvío estándar diario de log-returns × √252.

## Estructura

```
dashboard-dolar/
├── index.html          # estructura + fuentes + carga de ECharts (CDN con respaldo)
├── css/styles.css      # tema claro, tokens de color, responsive
├── js/app.js           # estado, filtros, estadística y construcción de gráficos
└── data/
    ├── build_data.py   # regenera el dataset desde data/raw/
    ├── raw/            # CSV crudos descargados (trm, brent, dxy, us10y)
    ├── datos.json      # dataset unificado (referencia)
    └── datos.js        # dataset embebido (lo carga index.html)
```

> Nota: panel de discusión para la junta; no es asesoría financiera ni
> recomendación de inversión.
